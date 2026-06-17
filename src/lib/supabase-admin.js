import { createClient } from '@supabase/supabase-js'

const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY

let _admin = null
export function getSupabaseAdmin() {
  if (!_admin) {
    _admin = createClient(supabaseUrl(), serviceRoleKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return _admin
}
