import { useState } from 'react'
import type { FormField, FieldType } from '@/types'
// Inline ID generator — no uuid package needed
const uuidv4 = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

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

  return (
    <div className="space-y-6">
      {/* Default locked fields */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Default Fields (always included)
        </div>
        <div className="space-y-2">
          {DEFAULT_FIELDS.map(f => (
            <div key={f.id} className="flex flex-wrap items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl opacity-70">
              <span className="text-sm text-gray-500 cursor-not-allowed">⊟</span>
              <span className="flex-1 text-sm font-medium text-gray-300 min-w-[120px]">{f.label}</span>
              <span className="badge badge-free text-[11px]">{f.type}</span>
              <span className="badge badge-published text-[11px]">required</span>
              <span className="text-[11px] text-gray-500 font-medium tracking-wide">locked</span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom fields */}
      {value.length > 0 && (
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            Custom Fields
          </div>
          <div className="space-y-2">
            {value.map((field, i) => (
              <div key={field.id} className="flex flex-col">
                {/* Collapsed row */}
                <div 
                  className={`
                    flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 cursor-pointer transition-colors
                    ${editingId === field.id ? 'bg-indigo-500/10 border-indigo-500/50 rounded-t-xl border-t border-x' : 'bg-white/5 border-white/10 rounded-xl border hover:bg-white/10'}
                  `}
                  onClick={() => setEditingId(editingId === field.id ? null : field.id)}
                >
                  {/* Reorder arrows */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button type="button" onClick={e => { e.stopPropagation(); moveUp(i) }}
                      className="text-[10px] text-gray-500 hover:text-gray-300 p-0.5 leading-none transition-colors">▲</button>
                    <button type="button" onClick={e => { e.stopPropagation(); moveDown(i) }}
                      className="text-[10px] text-gray-500 hover:text-gray-300 p-0.5 leading-none transition-colors">▼</button>
                  </div>

                  <span className="flex-1 text-sm font-medium text-gray-200 min-w-[120px] truncate">{field.label}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="badge badge-free text-[11px]">{field.type}</span>
                    {field.required && <span className="badge badge-published text-[11px]">required</span>}
                    <button type="button" onClick={e => { e.stopPropagation(); remove(field.id) }}
                      className="text-lg text-gray-500 hover:text-red-400 p-1 leading-none transition-colors"
                      title="Remove field">×</button>
                  </div>
                </div>

                {/* Expanded editor */}
                {editingId === field.id && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-indigo-500/5 border border-indigo-500/50 border-t-0 rounded-b-xl backdrop-blur-sm">
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
                    <div className="flex items-center pt-2 sm:pt-6">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input type="checkbox" checked={field.required}
                          onChange={e => update(field.id, { required: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500/30 bg-black/40" />
                        <span className="text-sm font-medium text-gray-200">Required field</span>
                      </label>
                    </div>
                    {field.type === 'select' && (
                      <div className="sm:col-span-2">
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
        </div>
      )}

      <button type="button" onClick={add} className="btn btn-ghost w-full justify-center border-dashed border-2 border-white/10 hover:border-white/20 py-3">
        + Add Custom Field
      </button>
    </div>
  )
}
