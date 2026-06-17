import { createClient } from '@supabase/supabase-js'

const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let _client = null
export function getSupabase() {
  if (!_client) {
    _client = createClient(supabaseUrl(), supabaseAnonKey())
  }
  return _client
}
