import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role key
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Types for our database schema
export interface User {
  uid: string;
  identity: {
    name: string;
    email: string;
    phone_e164: string;
  };
  profile?: {
    street1?: string;
    city: string;
    state: string;
    zip: string;
    gender: 'male' | 'female';
    age: number;
  };
  links: {
    public_url: string;
    profile_url: string;
  };
  tokens: {
    profile_token: string;
  };
  pass?: {
    serial?: string;
    last_generated_at?: string;
  };
  meta: {
    tier: string;
    created_at: string;
    last_seen_at: string;
  };
}
