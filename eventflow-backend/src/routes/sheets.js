const express  = require('express')
const supabase = require('../lib/supabase')
const { requireAuth } = require('../middleware/auth')
const { generateQRCode } = require('../services/qr')
const { sendQREmail }    = require('../services/email')

const router = express.Router()

// ─── Helper: fetch Google Sheet as CSV (public sheets only) ──────────────────
// Converts Sheet URL to CSV export URL — works for any public Google Sheet

const sheetUrlToCSV = (url) => {
  // Handle both /d/SHEET_ID/edit and /d/SHEET_ID/pub formats
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/)
  if (!match) throw new Error('Invalid Google Sheets URL')
  const sheetId = match[1]
  // gid param for specific sheet tab
  const gidMatch = url.match(/gid=(\d+)/)
  const gid = gidMatch ? gidMatch[1] : '0'
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
}

// ─── Helper: parse CSV text into rows ────────────────────────────────────────

const parseCSV = (text) => {
  const lines = text.trim().split('\n')
  if (lines.length < 2) throw new Error('Sheet has no data rows')

  // Parse header row — handle quoted commas
  const parseRow = (line) => {
    const result = []
    let current  = ''
    let inQuotes = false
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue }
      if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; continue }
      current += ch
    }
    result.push(current.trim())
    return result
  }

  const headers = parseRow(lines[0])
  const rows    = lines.slice(1).map(parseRow).filter(r => r.some(cell => cell !== ''))

  return { headers, rows }
}

// ─── POST /sheets/preview — fetch sheet columns + first 5 rows ───────────────

router.post('/preview', requireAuth, async (req, res) => {
  try {
    const { sheet_url } = req.body

    if (!sheet_url) {
      return res.status(400).json({ error: 'sheet_url is required' })
    }

    let csvUrl
    try {
      csvUrl = sheetUrlToCSV(sheet_url)
    } catch (e) {
      return res.status(400).json({ error: 'Invalid Google Sheets URL. Make sure it is a valid Google Sheets link.' })
    }

    // Fetch the sheet
    let response
    try {
      response = await fetch(csvUrl, {
        headers: { 'User-Agent': 'EventFlow/1.0' },
        signal: AbortSignal.timeout(10000),
      })
    } catch (e) {
      return res.status(400).json({
        error: 'Could not fetch the sheet. Make sure the sheet is set to "Anyone with the link can view".',
      })
    }

    if (!response.ok) {
      return res.status(400).json({
        error: 'Could not access the sheet. Make sure sharing is set to "Anyone with the link can view".',
      })
    }

    const text = await response.text()

    let parsed
    try {
      parsed = parseCSV(text)
    } catch (e) {
      return res.status(400).json({ error: e.message })
    }

    const { headers, rows } = parsed

    return res.json({
      headers,
      preview_rows: rows.slice(0, 5),
      total_rows:   rows.length,
      csv_url:      csvUrl,
    })
  } catch (err) {
    console.error('Sheet preview error:', err)
    return res.status(500).json({ error: 'Failed to fetch sheet. ' + err.message })
  }
})

// ─── POST /sheets/import — import rows, send QR codes ─────────────────────────

router.post('/import', requireAuth, async (req, res) => {
  try {
    const {
      sheet_url,
      event_id,
      column_map,      // { name: 'Full Name', email: 'Email Address', ... }
      send_qr,         // boolean — send QR immediately on import
    } = req.body

    if (!sheet_url || !event_id || !column_map?.email) {
      return res.status(400).json({
        error: 'sheet_url, event_id, and column_map.email are required',
      })
    }

    // Verify event belongs to this club
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('*, clubs(name, logo_url, smtp_host, smtp_user, smtp_pass, smtp_from_name, smtp_from_email)')
      .eq('id', event_id)
      .eq('club_id', req.club.clubId)
      .single()

    if (eventErr || !event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    // Fetch sheet
    const csvUrl = sheetUrlToCSV(sheet_url)
    const response = await fetch(csvUrl, {
      headers: { 'User-Agent': 'EventFlow/1.0' },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      return res.status(400).json({ error: 'Could not access sheet. Check sharing settings.' })
    }

    const text   = await response.text()
    const { headers, rows } = parseCSV(text)

    // Find column indexes from mapping
    const emailCol = headers.indexOf(column_map.email)
    const nameCol  = column_map.name ? headers.indexOf(column_map.name) : -1

    if (emailCol === -1) {
      return res.status(400).json({
        error: `Column "${column_map.email}" not found in sheet. Available columns: ${headers.join(', ')}`,
      })
    }

    const results = {
      imported:  0,
      skipped:   0,
      failed:    0,
      errors:    [],
    }

    // Process each row
    for (const row of rows) {
      const email = row[emailCol]?.trim()
      const name  = nameCol >= 0 ? row[nameCol]?.trim() : 'Attendee'

      if (!email || !email.includes('@')) {
        results.skipped++
        continue
      }

      // Build form_data from all mapped columns
      const form_data = { attendee_email: email, attendee_name: name || 'Attendee' }
      Object.entries(column_map).forEach(([key, colName]) => {
        const idx = headers.indexOf(colName)
        if (idx >= 0) form_data[key] = row[idx]?.trim() || ''
      })

      try {
        // Check for duplicate
        const { data: existing } = await supabase
          .from('registrations')
          .select('id')
          .eq('event_id', event_id)
          .eq('attendee_email', email)
          .single()

        if (existing) {
          results.skipped++
          continue
        }

        // Create approved registration
        const { data: registration, error: regErr } = await supabase
          .from('registrations')
          .insert({
            event_id,
            club_id:        req.club.clubId,
            form_data,
            attendee_name:  name || 'Attendee',
            attendee_email: email,
            payment_status: 'free',
            status:         'approved',
            approved_at:    new Date().toISOString(),
          })
          .select()
          .single()

        if (regErr) {
          results.failed++
          results.errors.push(`${email}: ${regErr.message}`)
          continue
        }

        // Generate QR and send email if requested
        if (send_qr) {
          try {
            const qrCode = await generateQRCode(registration.id, event_id)
            await sendQREmail({ registration, event, qrCode })
          } catch (qrErr) {
            // Don't fail the import if QR send fails — registration is saved
            results.errors.push(`${email}: QR send failed — ${qrErr.message}`)
          }
        }

        results.imported++
      } catch (rowErr) {
        results.failed++
        results.errors.push(`${email}: ${rowErr.message}`)
      }
    }

    return res.json({
      message:  `Import complete: ${results.imported} imported, ${results.skipped} skipped (duplicates/invalid), ${results.failed} failed`,
      results,
    })
  } catch (err) {
    console.error('Sheet import error:', err)
    return res.status(500).json({ error: 'Import failed: ' + err.message })
  }
})

// ─── POST /sheets/sync — re-fetch sheet and add only new rows ────────────────

router.post('/sync', requireAuth, async (req, res) => {
  try {
    const { sheet_url, event_id, column_map, send_qr } = req.body

    if (!sheet_url || !event_id || !column_map?.email) {
      return res.status(400).json({ error: 'sheet_url, event_id, and column_map.email are required' })
    }

    const { data: event } = await supabase
      .from('events')
      .select('*, clubs(*)')
      .eq('id', event_id)
      .eq('club_id', req.club.clubId)
      .single()

    if (!event) return res.status(404).json({ error: 'Event not found' })

    const csvUrl   = sheetUrlToCSV(sheet_url)
    const response = await fetch(csvUrl, { signal: AbortSignal.timeout(15000) })
    if (!response.ok) return res.status(400).json({ error: 'Could not access sheet' })

    const { headers, rows } = parseCSV(await response.text())
    const emailCol = headers.indexOf(column_map.email)
    const nameCol  = column_map.name ? headers.indexOf(column_map.name) : -1

    if (emailCol === -1) {
      return res.status(400).json({ error: `Column "${column_map.email}" not found` })
    }

    // Get all existing emails for this event
    const { data: existing } = await supabase
      .from('registrations')
      .select('attendee_email')
      .eq('event_id', event_id)

    const existingEmails = new Set((existing || []).map((r) => r.attendee_email?.toLowerCase()))

    let newCount = 0
    for (const row of rows) {
      const email = row[emailCol]?.trim()
      if (!email || !email.includes('@') || existingEmails.has(email.toLowerCase())) continue

      const name = nameCol >= 0 ? row[nameCol]?.trim() : 'Attendee'
      const form_data = { attendee_email: email, attendee_name: name }
      Object.entries(column_map).forEach(([key, colName]) => {
        const idx = headers.indexOf(colName)
        if (idx >= 0) form_data[key] = row[idx]?.trim() || ''
      })

      const { data: reg } = await supabase
        .from('registrations')
        .insert({ event_id, club_id: req.club.clubId, form_data, attendee_name: name, attendee_email: email, payment_status: 'free', status: 'approved', approved_at: new Date().toISOString() })
        .select()
        .single()

      if (reg && send_qr) {
        try {
          const qrCode = await generateQRCode(reg.id, event_id)
          await sendQREmail({ registration: reg, event, qrCode })
        } catch {}
      }
      if (reg) newCount++
    }

    return res.json({ message: `Sync complete: ${newCount} new registrations added`, new_count: newCount })
  } catch (err) {
    return res.status(500).json({ error: 'Sync failed: ' + err.message })
  }
})

module.exports = router
