// ============================================================
// components/events/FormBuilder.tsx — PHASE 2
// ============================================================
// Drag-and-drop form field builder used in EventCreate Step 2
//
// Props:
//   fields: FormField[]
//   onChange: (fields: FormField[]) => void
//
// Features:
// - "Add Field" button with type selector dropdown
//   (text, email, phone, number, textarea, select, checkbox, file)
// - Each field row: drag handle, label input, type badge, required toggle, delete button
// - For 'select' type: show options input (comma-separated or add one by one)
// - Reorder by drag (use @dnd-kit/core or simple up/down arrows)
// - Validation: at least 1 field required
//
// Note: Name + Email are auto-added by backend if missing,
// but show them as locked default fields in the UI

export default function FormBuilder() {
  return null // TODO Phase 2
}
