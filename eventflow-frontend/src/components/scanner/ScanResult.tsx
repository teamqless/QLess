// ============================================================
// components/scanner/ScanResult.tsx — PHASE 4
// ============================================================
// Full-screen result overlay shown for 3 seconds after each scan.
//
// Props:
//   result:    ScanResponse | null
//   onDismiss: () => void
//
// success         → green overlay, ✓ Entry Granted, attendee name
// already_scanned → amber overlay, ⚠ Already Used, scanned_at time
// rejected        → red overlay, ✗ Not Approved
// invalid         → dark red overlay, ✗ Invalid QR Code

export default function ScanResult() {
  return null // TODO Phase 4
}

// ============================================================
// components/scanner/LiveCounter.tsx — PHASE 4
// ============================================================
// Live entry counter shown in scanner header.
// Polls GET /scanner/live/:eventId every 5 seconds via useLiveDashboard()
//
// Props:
//   eventId: string
//
// Shows:
//   - Large number: scanned_in count
//   - "of {total_approved} approved"
//   - Small progress bar
//   - Last scan time

export function LiveCounter() {
  return null // TODO Phase 4
}
