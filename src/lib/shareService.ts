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

export interface ShareResult {
  success: boolean;
  shortCode?: string;
  url?: string;
  error?: string;
}

export interface LoadResult {
  success: boolean;
  diagram?: SharedDiagram;
  error?: string;
}

// Share a diagram and get a short link
export async function shareDiagram(
  nodes: Node<ProcessNodeData>[],
  edges: Edge[],
  name?: string,
  mermaidCode?: string
): Promise<ShareResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const shortCode = generateShortCode();

    const { error } = await supabase
      .from('shared_diagrams')
      .insert({
        short_code: shortCode,
        name: name || 'Untitled Diagram',
        nodes: nodes,
        edges: edges,
        mermaid_code: mermaidCode || null,
        view_count: 0,
      });

    if (error) {
      // If short code collision, try again
      if (error.code === '23505') {
        return shareDiagram(nodes, edges, name, mermaidCode);
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

// Load a shared diagram by short code
export async function loadSharedDiagram(shortCode: string): Promise<LoadResult> {
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

// Check if Supabase sharing is available
export function isSharingAvailable(): boolean {
  return isSupabaseConfigured;
}
