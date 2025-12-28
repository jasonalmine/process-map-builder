import { supabase, UserDiagram } from './supabase';
import { Node, Edge } from '@xyflow/react';

export interface CloudDiagram {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  mermaidCode?: string;
  createdAt: string;
  updatedAt: string;
}

// Convert database diagram to app format
function toCloudDiagram(dbDiagram: UserDiagram): CloudDiagram {
  return {
    id: dbDiagram.id,
    name: dbDiagram.name,
    nodes: dbDiagram.nodes as Node[],
    edges: dbDiagram.edges as Edge[],
    mermaidCode: dbDiagram.mermaid_code || undefined,
    createdAt: dbDiagram.created_at,
    updatedAt: dbDiagram.updated_at,
  };
}

export async function fetchUserDiagrams(): Promise<{ success: boolean; diagrams: CloudDiagram[]; error?: string }> {
  if (!supabase) {
    return { success: false, diagrams: [], error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('user_diagrams')
    .select('*')
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching diagrams:', error);
    return { success: false, diagrams: [], error: error.message };
  }

  return {
    success: true,
    diagrams: (data || []).map(toCloudDiagram),
  };
}

export async function saveDiagramToCloud(
  name: string,
  nodes: Node[],
  edges: Edge[],
  mermaidCode?: string
): Promise<{ success: boolean; diagram?: CloudDiagram; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('user_diagrams')
    .insert({
      user_id: user.id,
      name,
      nodes,
      edges,
      mermaid_code: mermaidCode || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving diagram:', error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    diagram: toCloudDiagram(data),
  };
}

export async function updateDiagramInCloud(
  id: string,
  updates: {
    name?: string;
    nodes?: Node[];
    edges?: Edge[];
    mermaidCode?: string;
  }
): Promise<{ success: boolean; diagram?: CloudDiagram; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.nodes !== undefined) updateData.nodes = updates.nodes;
  if (updates.edges !== undefined) updateData.edges = updates.edges;
  if (updates.mermaidCode !== undefined) updateData.mermaid_code = updates.mermaidCode;

  const { data, error } = await supabase
    .from('user_diagrams')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating diagram:', error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    diagram: toCloudDiagram(data),
  };
}

export async function deleteDiagramFromCloud(id: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  // Soft delete
  const { error } = await supabase
    .from('user_diagrams')
    .update({ is_deleted: true })
    .eq('id', id);

  if (error) {
    console.error('Error deleting diagram:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getDiagramById(id: string): Promise<{ success: boolean; diagram?: CloudDiagram; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('user_diagrams')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) {
    console.error('Error fetching diagram:', error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    diagram: toCloudDiagram(data),
  };
}
