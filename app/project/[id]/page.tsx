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
      setProjectName(data.name || 'Untitled');

      // IDENTITY ALIGNMENT: Strict user_id check
      const isOwner = user && data.user_id === user.id;

      // FOUNDER GUARDRAIL: Restrict automatic access unless Owner or explicitly supported
      const isFounder = user?.email === 'casteelio@gmail.com';
      const isSupportAccess = data.data?.supportAccess === true; // JSON flag

      if (isOwner) {
        setUserRole('Owner');
      } else if (isFounder) {
        // Founder Logic: Only grant access if Support Access is ON, otherwise standard Crew check
        if (isSupportAccess) {
          console.log("Creation OS Support Access Active");
          setUserRole('Admin'); // or specific Support role
        } else {
          // Treat as normal user, let crew logic handle it below
          // Do NOT automatically set Owner/Admin
        }
      }
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
