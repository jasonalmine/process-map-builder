import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create Supabase client (only if configured)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Database types
export interface SharedDiagram {
  id: string;
  short_code: string;
  name: string;
  nodes: unknown[];
  edges: unknown[];
  mermaid_code?: string;
  created_at: string;
  expires_at?: string;
  view_count: number;
}
