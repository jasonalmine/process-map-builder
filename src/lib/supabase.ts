import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create Supabase browser client (only if configured)
export const supabase = isSupabaseConfigured
  ? createBrowserClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Helper to get supabase client with type safety
export function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  }
  return supabase;
}

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
  user_id?: string;
  is_private?: boolean;
  password_hash?: string;
}

export interface UserDiagram {
  id: string;
  user_id: string;
  name: string;
  nodes: unknown[];
  edges: unknown[];
  mermaid_code?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}
