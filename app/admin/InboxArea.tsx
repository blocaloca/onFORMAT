'use client';

import React, { useState } from 'react';
import { Inbox, Sparkles, Bug, Lightbulb, MessageSquare, Trash2, CheckCircle, Check, User } from 'lucide-react';
import { FeedbackActions, BetaRequestActions } from './AdminActions';

export default function InboxArea({ feedback, betaRequests }: { feedback: any[], betaRequests: any[] }) {
    const [activeTab, setActiveTab] = useState<'feedback' | 'beta'>('feedback');

    const newFeedbackCount = feedback.filter(f => f.status === 'new').length;
    const pendingBetaCount = betaRequests.filter(r => r.status === 'pending').length;

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex bg-zinc-100 p-1 rounded-xl shadow-inner border border-zinc-200">
                    <button 
                        onClick={() => setActiveTab('feedback')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'feedback' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                        <Inbox size={14} /> 
                        Feedback 
                        {newFeedbackCount > 0 && <span className="ml-2 px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-[9px]">{newFeedbackCount}</span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('beta')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'beta' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                        <Sparkles size={14} /> 
                        Beta Requests 
                        {pendingBetaCount > 0 && <span className="ml-2 px-1.5 py-0.5 bg-orange-500 text-white rounded-full text-[9px]">{pendingBetaCount}</span>}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden min-h-[400px]">
                {activeTab === 'feedback' ? (
                    feedback.length === 0 ? (
                        <div className="p-20 text-center text-zinc-400 text-[10px] font-bold uppercase tracking-widest">No messages yet</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto">
                          <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[10%]">Type</th>
                              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[50%]">Message</th>
                              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[20%]">User</th>
                              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[10%] text-center">Date</th>
                              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[10%] text-right">Action</th>
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
                                  {msg.context && (
                                    <div className="mt-1 text-[9px] font-mono text-zinc-400 truncate max-w-sm">
                                      {JSON.stringify(msg.context)}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-xs font-bold text-zinc-900">{msg.user_email || 'Unknown'}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="text-[10px] text-zinc-400 font-mono">{new Date(msg.created_at).toLocaleDateString()}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <FeedbackActions message={msg} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                ) : (
                    betaRequests.length === 0 ? (
                        <div className="p-20 text-center text-zinc-400 text-[10px] font-bold uppercase tracking-widest">No applications yet</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left table-fixed min-w-[800px]">
                                <thead className="bg-zinc-50 border-b border-zinc-200">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[20%]">Pioneer</th>
                                        <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[15%]">Role</th>
                                        <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[30%]">Projects & Vision</th>
                                        <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[10%] text-center">Status</th>
                                        <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[25%] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {betaRequests.map((req: any) => (
                                        <tr key={req.id} className="group hover:bg-zinc-50 transition-colors">
                                            <td className="px-6 py-4 overflow-hidden">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-zinc-900 truncate">{req.full_name}</span>
                                                    <span className="text-xs font-mono text-zinc-400 truncate">{req.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="inline-flex px-2 py-1 rounded bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-wider">
                                                    {req.role}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2" title={req.project_types}>
                                                    {req.project_types}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${req.status === 'pending' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <BetaRequestActions request={req} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>
        </section>
    );
}
