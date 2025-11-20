import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

// Check if we have real Supabase credentials
const hasRealSupabase = supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' && 
                       supabaseAnonKey && supabaseAnonKey !== 'your-anon-key-here' &&
                       supabaseServiceKey && supabaseServiceKey !== 'your-service-key-here'

// Mock Supabase clients for development without real database
const mockClient = {
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        order: () => ({ data: [], error: null }),
        range: () => ({ data: [], error: null })
      }),
      order: () => ({ data: [], error: null }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null })
        })
      }),
      update: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null })
        })
      }),
      delete: () => ({ error: null })
    }),
    insert: () => ({ error: null }),
    update: () => ({ error: null }),
    delete: () => ({ error: null })
  })
}

// Client for frontend/public operations
export const supabase = hasRealSupabase ? createClient(supabaseUrl!, supabaseAnonKey!) : mockClient as any

// Client for server-side operations with elevated privileges
export const supabaseAdmin = hasRealSupabase ? createClient(supabaseUrl!, supabaseServiceKey!) : mockClient as any