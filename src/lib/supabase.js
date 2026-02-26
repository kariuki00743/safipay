import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables. Please check your .env file.')
  throw new Error('Missing required Supabase configuration')
}

if (!import.meta.env.VITE_BACKEND_URL) {
  console.warn('⚠️ VITE_BACKEND_URL not set. Backend API calls will fail.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)