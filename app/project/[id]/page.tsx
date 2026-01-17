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

  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [userSubscription, setUserSubscription] = useState<{ status: string; tier: string } | undefined>(undefined);

  const [userRole, setUserRole] = useState<string | undefined>(undefined);

  const fetchProject = async () => {
    setLoading(true);

    // 1. Get User & Profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email);
      const { data: profile } = await supabase.from('profiles').select('subscription_status, subscription_tier').eq('id', user.id).single();
      if (profile) {
        setUserSubscription({
          status: profile.subscription_status || 'inactive',
          tier: profile.subscription_tier || 'basic'
        });
      }

      // 1b. Get Crew Role
      const { data: crew } = await supabase.from('crew_membership').select('role').eq('project_id', id).eq('user_email', user.email).single();
      if (crew) setUserRole(crew.role);
    }

    // 2. Get Project
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      if (data.data) setInitialState(data.data);
      if (data.name) setProjectName(data.name);
      // Fallback: If user is owner, give them 'Owner' role effectively
      if (user && data.owner_id === user.id) setUserRole('Owner');
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
      userSubscription={userSubscription}
      userEmail={userEmail}
      userRole={userRole}
    />
  );
}
