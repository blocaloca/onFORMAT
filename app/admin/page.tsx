import React, { Suspense } from 'react';
export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { fetchAdminUsers, fetchFeedback } from './actions';
import { Ban, CheckCircle, Crown, Eye, Lock, Shield, Sparkles, User, Inbox, Check, Bug, Lightbulb, MessageSquare, ChevronLeft, Trash2 } from 'lucide-react';
import { UserActions } from './AdminActions';
import { isFounder } from '@/lib/permissions';
import AnnouncementEditor from '@/components/admin/AnnouncementEditor';
import Link from 'next/link';

export default async function AdminPage() {
  // 1. Auth Check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // STRICT FOUNDER CHECK
  // Only unconditional access for the founder
  if (!isFounder(user.email)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 text-zinc-900 gap-4">
        <Lock size={48} className="text-zinc-300" />
        <h1 className="text-xl font-bold uppercase tracking-widest">Access Denied</h1>
        <p className="text-sm text-zinc-500">This area is restricted to the founder only.</p>
      </div>
    );
  }

  // 2. Fetch Data
  const users = await fetchAdminUsers();
  const feedback = await fetchFeedback();

  // 3. Render Helper (Robust Name Sanitizer)
  const renderName = (u: any) => {
    try {
      const name = u.full_name;
      if (!name) return 'Anonymous User';

      // If it's a string starting with {, it's likely a JSON dump
      if (typeof name === 'string' && name.trim().startsWith('{')) {
        return 'Invalid Name (JSON)';
      }

      // If it's weirdly an object
      if (typeof name === 'object') {
        return 'Invalid Name (Object)';
      }

      return name;
    } catch (e) {
      return 'Render Error';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-8 py-6 sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield className="text-black" size={24} />
          <h1 className="text-xl font-black uppercase tracking-widest">Founder Control</h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
          <span className="flex items-center gap-1.5"><User size={12} /> {users.length} Users</span>
          <span className="w-px h-4 bg-zinc-200"></span>
          <span className="flex items-center gap-1.5 text-blue-600"><Inbox size={12} /> {feedback.filter((f: any) => f.status === 'new').length} New Msgs</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12 space-y-12">
        <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 text-xs tracking-widest uppercase flex items-center gap-2 mb-8"><ChevronLeft size={14} /> BACK TO PROJECTS</Link>

        {/* Announcement Editor */}
        <AnnouncementEditor user={user} />

        {/* Feedback Inbox Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Inbox size={20} className="text-zinc-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Feedback Inbox</h2>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
            {feedback.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs uppercase tracking-widest">No messages yet</div>
            ) : (
              <table className="w-full text-left table-auto">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[10%]">Type</th>
                    <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[50%]">Message</th>
                    <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[20%]">User</th>
                    <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[10%] text-center">Date</th>
                    <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[10%] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {feedback.map((msg: any) => (
                    <tr key={msg.id} className={`group transition-colors ${msg.status === 'new' ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'bg-white hover:bg-zinc-50'}`}>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${msg.type === 'bug' ? 'bg-red-100 text-red-700' :
                          msg.type === 'feature' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'
                          } ${msg.status === 'read' ? 'opacity-50' : ''}`}>
                          {msg.type === 'bug' ? <Bug size={10} /> : msg.type === 'feature' ? <Lightbulb size={10} /> : <MessageSquare size={10} />}
                          {msg.type}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-zinc-700 font-medium leading-relaxed">{msg.message}</p>
                        {msg.context && Object.keys(msg.context).length > 0 && (
                          <div className="mt-1 text-[9px] font-mono text-zinc-400 truncate max-w-md">
                            {JSON.stringify(msg.context)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-900">{msg.user_email || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[10px] text-zinc-400 font-mono">{new Date(msg.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-4 justify-end items-center">
                          {/* MARK READ FORM */}
                          {msg.status !== 'read' && (
                            <form method="POST" action="/api/admin/feedback">
                              <input type="hidden" name="action" value="read" />
                              <input type="hidden" name="id" value={msg.id} />
                              <button type="submit" className="text-blue-500 hover:text-blue-700 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                <Check size={10} /> Mark Read
                              </button>
                            </form>
                          )}
                          {msg.status === 'read' && (
                            <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle size={10} /> Read
                            </span>
                          )}

                          {/* DELETE FORM */}
                          <form method="POST" action="/api/admin/feedback">
                            <input type="hidden" name="action" value="delete" />
                            <input type="hidden" name="id" value={msg.id} />
                            <button type="submit" className="text-zinc-400 hover:text-red-500 transition-colors p-1" title="Delete Report">
                              <Trash2 size={12} />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* User Management Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-zinc-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">User Management</h2>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left table-fixed min-w-[800px]">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[35%]">User</th>
                    <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[15%]">Plan</th>
                    <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[15%] text-center">Projects</th>
                    <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[15%] text-center">Joined</th>
                    <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[20%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {users.map((u: any) => {
                    const tierLabel = u.manual_pro_override ? 'Founder Override' : (u.tier || 'Scout');

                    return (
                      <tr key={u.id} className="group hover:bg-zinc-50 transition-colors">
                        {/* User Info */}
                        <td className="px-6 py-4 overflow-hidden">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-zinc-200 relative mb-safe">
                              {u.avatar_url ? (
                                <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <User size={14} className="text-zinc-400" />
                              )}
                            </div>
                            <div className="overflow-hidden min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-zinc-900 truncate" title={u.full_name}>{renderName(u)}</span>
                                {u.email === 'casteelio@gmail.com' && (
                                  <span className="flex-shrink-0 px-1.5 py-0.5 bg-black text-white text-[9px] font-bold uppercase tracking-wider rounded-sm">You</span>
                                )}
                                {u.is_admin && u.email !== 'casteelio@gmail.com' && (
                                  <span className="flex-shrink-0 px-1.5 py-0.5 bg-zinc-200 text-zinc-600 text-[9px] font-bold uppercase tracking-wider rounded-sm">Admin</span>
                                )}
                              </div>
                              <div className="text-xs font-mono text-zinc-400 truncate" title={u.email}>{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Plan Status */}
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${u.manual_pro_override
                            ? 'bg-amber-100 text-amber-700'
                            : u.tier === 'pro'
                              ? 'bg-black text-white'
                              : 'bg-zinc-100 text-zinc-500'
                            }`}>
                            {u.manual_pro_override && <Crown size={10} fill="currentColor" />}
                            {tierLabel}
                          </div>
                        </td>

                        {/* Projects */}
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs font-mono font-bold">{u.project_count}</span>
                        </td>

                        {/* Joined */}
                        <td className="px-6 py-4 text-center">
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(u.created_at).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end w-full">
                            <UserActions user={u} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}