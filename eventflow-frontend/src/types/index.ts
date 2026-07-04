// ============================================================
// types/index.ts — All shared TypeScript types for EventFlow
// ============================================================

export type Plan = 'free' | 'pro' | 'institution'

export interface Club {
  id: string
  name: string
  email: string
  college?: string
  phone?: string
  logo_url?: string
  plan: Plan
  smtp_host?: string
  smtp_from_name?: string
  smtp_from_email?: string
  created_at: string
}

export type FieldType = 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox' | 'file'

export interface FormField {
  id: string
  label: string
  type: FieldType
  required: boolean
  placeholder?: string
  options?: string[]   // for 'select' type
}

export type EventStatus = 'draft' | 'published' | 'closed' | 'completed'

export interface Event {
  id: string
  club_id: string
  title: string
  description?: string
  venue?: string
  event_date?: string
  registration_deadline?: string
  banner_url?: string
  theme_color: string
  capacity?: number
  entry_fee: number
  registration_type: 'native' | 'sheet'
  sheet_url?: string
  sheet_column_map?: Record<string, string>
  form_fields: FormField[]
  status: EventStatus
  slug: string
  created_at: string
  updated_at: string
}

export interface EventStats {
  total: number
  approved: number
  scanned: number
  pending: number
}

export type RegistrationStatus = 'pending' | 'approved' | 'rejected'
export type PaymentStatus = 'pending' | 'paid' | 'free'

export interface Registration {
  id: string
  event_id: string
  club_id: string
  form_data: Record<string, string>
  attendee_name: string
  attendee_email?: string
  payment_screenshot_url?: string
  payment_status: PaymentStatus
  status: RegistrationStatus
  approved_at?: string
  rejection_reason?: string
  created_at: string
  qr_codes?: QRCode[]
}

export interface QRCode {
  id: string
  registration_id: string
  event_id: string
  token: string
  qr_image_url?: string
  email_sent: boolean
  email_sent_at?: string
  scanned_at?: string
  scanned_by?: string
}

export interface Volunteer {
  id: string
  club_id: string
  event_id?: string
  name: string
  access_code: string
  is_active: boolean
  created_at: string
}

export type ScanResult = 'success' | 'already_scanned' | 'invalid' | 'rejected'

export interface ScanResponse {
  result: ScanResult
  message: string
  attendee?: {
    name: string
    email?: string
    form_data?: Record<string, string>
  }
  scanned_at?: string
}

export interface DashboardStats {
  total_events: number
  live_events: number
  total_registrations: number
  pending_approvals: number
}

export interface AuthResponse {
  token: string
  club: Club
  message: string
}
