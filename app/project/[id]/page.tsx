'use client';
import { WorkspaceEditor, WorkspaceState } from '@/components/onformat/WorkspaceEditor';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const [initialState, setInitialState] = useState<WorkspaceState | undefined>(undefined);
  const [projectName, setProjectName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      if (data.data) setInitialState(data.data);
      if (data.name) setProjectName(data.name);
    }
    setLoading(false);
  };

  const handleSave = async (state: WorkspaceState) => {
    // Debounce or just save
    await supabase
      .from('projects')
      .update({
        data: state,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-zinc-900 text-zinc-400 text-xs font-mono uppercase animate-pulse">Loading Workspace...</div>;
  }

  return (
    <WorkspaceEditor
      projectId={id}
      projectName={projectName}
      initialState={initialState}
      onSave={handleSave}
    />
  );
}
