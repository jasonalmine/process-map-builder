import { supabase, isSupabaseConfigured, SharedDiagram } from './supabase';
import { Node, Edge } from '@xyflow/react';
import { ProcessNodeData } from '@/types/flow';

// Generate a short random code (6 characters)
function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Simple hash function for password (client-side, server should use bcrypt)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface ShareOptions {
  isPrivate?: boolean;
  password?: string;
}

export interface ShareResult {
  success: boolean;
  shortCode?: string;
  url?: string;
  error?: string;
}

export interface LoadResult {
  success: boolean;
  diagram?: SharedDiagram;
  requiresPassword?: boolean;
  error?: string;
}

// Share a diagram and get a short link
export async function shareDiagram(
  nodes: Node<ProcessNodeData>[],
  edges: Edge[],
  name?: string,
  mermaidCode?: string,
  options?: ShareOptions
): Promise<ShareResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const shortCode = generateShortCode();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Hash password if provided
    let passwordHash: string | null = null;
    if (options?.password) {
      passwordHash = await hashPassword(options.password);
    }

    const { error } = await supabase
      .from('shared_diagrams')
      .insert({
        short_code: shortCode,
        name: name || 'Untitled Diagram',
        nodes: nodes,
        edges: edges,
        mermaid_code: mermaidCode || null,
        view_count: 0,
        user_id: user?.id || null,
        is_private: options?.isPrivate || false,
        password_hash: passwordHash,
      });

    if (error) {
      // If short code collision, try again
      if (error.code === '23505') {
        return shareDiagram(nodes, edges, name, mermaidCode, options);
      }
      throw error;
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    return {
      success: true,
      shortCode,
      url: `${baseUrl}/s/${shortCode}`,
    };
  } catch (error) {
    console.error('Error sharing diagram:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share diagram'
    };
  }
}

// Check if a shared diagram requires a password
export async function checkShareAccess(shortCode: string): Promise<{ requiresPassword: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { requiresPassword: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('shared_diagrams')
      .select('password_hash, is_private')
      .eq('short_code', shortCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { requiresPassword: false, error: 'Diagram not found' };
      }
      throw error;
    }

    return {
      requiresPassword: !!data.password_hash,
    };
  } catch (error) {
    console.error('Error checking share access:', error);
    return {
      requiresPassword: false,
      error: error instanceof Error ? error.message : 'Failed to check access'
    };
  }
}

// Load a shared diagram by short code
export async function loadSharedDiagram(shortCode: string, password?: string): Promise<LoadResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Get the diagram
    const { data, error } = await supabase
      .from('shared_diagrams')
      .select('*')
      .eq('short_code', shortCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Diagram not found' };
      }
      throw error;
    }

    // Check if password is required
    if (data.password_hash) {
      if (!password) {
        return {
          success: false,
          requiresPassword: true,
          error: 'Password required',
        };
      }

      // Verify password
      const providedHash = await hashPassword(password);
      if (providedHash !== data.password_hash) {
        return {
          success: false,
          requiresPassword: true,
          error: 'Incorrect password',
        };
      }
    }

    // Increment view count (fire and forget)
    supabase
      .from('shared_diagrams')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('short_code', shortCode)
      .then(() => {});

    return {
      success: true,
      diagram: data as SharedDiagram,
    };
  } catch (error) {
    console.error('Error loading shared diagram:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load diagram'
    };
  }
}

// Get user's shared diagrams
export async function getUserSharedDiagrams(): Promise<{ success: boolean; diagrams: SharedDiagram[]; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, diagrams: [], error: 'Supabase not configured' };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, diagrams: [], error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('shared_diagrams')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return {
      success: true,
      diagrams: (data || []) as SharedDiagram[],
    };
  } catch (error) {
    console.error('Error fetching user shares:', error);
    return {
      success: false,
      diagrams: [],
      error: error instanceof Error ? error.message : 'Failed to fetch shares'
    };
  }
}

// Delete a shared diagram (only if user owns it)
export async function deleteSharedDiagram(shortCode: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Get current user to ensure they own this shared diagram
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error, count } = await supabase
      .from('shared_diagrams')
      .delete()
      .eq('short_code', shortCode)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    // If no rows were deleted, user doesn't own this share
    if (count === 0) {
      return { success: false, error: 'You do not have permission to delete this share' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting share:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete share'
    };
  }
}

// Check if Supabase sharing is available
export function isSharingAvailable(): boolean {
  return isSupabaseConfigured;
}
