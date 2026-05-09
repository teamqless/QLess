import { useState } from 'react'
import type { FormField, FieldType } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text',     label: 'Text' },
  { value: 'email',    label: 'Email' },
  { value: 'phone',    label: 'Phone' },
  { value: 'number',   label: 'Number' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'select',   label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'file',     label: 'File Upload' },
]

const DEFAULT_FIELDS: FormField[] = [
  { id: 'attendee_name',  label: 'Full Name',     type: 'text',  required: true,  placeholder: 'Your full name' },
  { id: 'attendee_email', label: 'Email Address', type: 'email', required: true,  placeholder: 'your@email.com' },
]

interface Props {
  value:    FormField[]
  onChange: (fields: FormField[]) => void
}

export default function FormBuilder({ value, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const add = () => {
    const newField: FormField = {
      id:       uuidv4().slice(0, 8),
      label:    'New Field',
      type:     'text',
      required: false,
    }
    onChange([...value, newField])
    setEditingId(newField.id)
  }

  const update = (id: string, patch: Partial<FormField>) => {
    onChange(value.map(f => f.id === id ? { ...f, ...patch } : f))
  }

  const remove = (id: string) => {
    onChange(value.filter(f => f.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const moveUp   = (i: number) => { if (i === 0) return; const a = [...value]; [a[i-1], a[i]] = [a[i], a[i-1]]; onChange(a) }
  const moveDown = (i: number) => { if (i === value.length - 1) return; const a = [...value]; [a[i], a[i+1]] = [a[i+1], a[i]]; onChange(a) }

  const isDefault = (id: string) => DEFAULT_FIELDS.some(f => f.id === id)

  return (
    <div>
      {/* Default locked fields */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Default Fields (always included)
        </div>
        {DEFAULT_FIELDS.map(f => (
          <div key={f.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', background: 'var(--surface-2)',
            border: '1px solid var(--border)', borderRadius: 8, marginBottom: 6,
            opacity: 0.7,
          }}>
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>⊟</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-2)' }}>{f.label}</span>
            <span className="badge badge-free" style={{ fontSize: 11 }}>{f.type}</span>
            <span className="badge badge-published" style={{ fontSize: 11 }}>required</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>locked</span>
          </div>
        ))}
      </div>

      {/* Custom fields */}
      {value.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Custom Fields
          </div>
          {value.map((field, i) => (
            <div key={field.id} style={{ marginBottom: 6 }}>
              {/* Collapsed row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: editingId === field.id ? '#faf9ff' : 'var(--surface)',
                border: `1px solid ${editingId === field.id ? 'var(--brand-light)' : 'var(--border)'}`,
                borderRadius: editingId === field.id ? '8px 8px 0 0' : 8,
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
                onClick={() => setEditingId(editingId === field.id ? null : field.id)}
              >
                {/* Reorder arrows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <button onClick={e => { e.stopPropagation(); moveUp(i) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--text-3)', lineHeight: 1, padding: '1px 2px' }}>▲</button>
                  <button onClick={e => { e.stopPropagation(); moveDown(i) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--text-3)', lineHeight: 1, padding: '1px 2px' }}>▼</button>
                </div>

                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{field.label}</span>
                <span className="badge badge-free" style={{ fontSize: 11 }}>{field.type}</span>
                {field.required && <span className="badge badge-published" style={{ fontSize: 11 }}>required</span>}

                <button onClick={e => { e.stopPropagation(); remove(field.id) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-3)', lineHeight: 1, padding: '0 2px' }}
                  title="Remove field">×</button>
              </div>

              {/* Expanded editor */}
              {editingId === field.id && (
                <div style={{
                  border: '1px solid var(--brand-light)',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  padding: '14px',
                  background: '#faf9ff',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}>
                  <div>
                    <label className="label">Field Label</label>
                    <input className="input" value={field.label}
                      onChange={e => update(field.id, { label: e.target.value })}
                      placeholder="e.g. Roll Number" />
                  </div>
                  <div>
                    <label className="label">Field Type</label>
                    <select className="input" value={field.type}
                      onChange={e => update(field.id, { type: e.target.value as FieldType })}>
                      {FIELD_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Placeholder</label>
                    <input className="input" value={field.placeholder || ''}
                      onChange={e => update(field.id, { placeholder: e.target.value })}
                      placeholder="Hint text shown in the field" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: 20 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input type="checkbox" checked={field.required}
                        onChange={e => update(field.id, { required: e.target.checked })}
                        style={{ width: 16, height: 16, accentColor: 'var(--brand)' }} />
                      <span style={{ fontWeight: 500, color: 'var(--text-1)' }}>Required field</span>
                    </label>
                  </div>
                  {field.type === 'select' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="label">Options (one per line)</label>
                      <textarea className="input" rows={3}
                        value={(field.options || []).join('\n')}
                        onChange={e => update(field.id, { options: e.target.value.split('\n').filter(Boolean) })}
                        placeholder={'Option A\nOption B\nOption C'} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button type="button" onClick={add} className="btn btn-ghost"
        style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}>
        + Add Field
      </button>
    </div>
  )
}
