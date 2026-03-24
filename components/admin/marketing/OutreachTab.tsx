'use client';

import React, { useState, useEffect } from 'react';
import { getClient } from '@/lib/supabase';
import { Plus, X, Search, Loader2, Send, Clock, Edit2, Play } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export function OutreachTab() {
    const supabase = getClient();
    const [outreach, setOutreach] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editingSeq, setEditingSeq] = useState<any>(null);

    const [form, setForm] = useState({
        contact_id: '',
        subject: '',
        body: '',
        status: 'draft',
        channel: 'email'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // Fetch outreach with linked contact info
        const { data: outreachData } = await supabase
            .from('outreach_sequences')
            .select('*, contact:marketing_contacts(name, email, company)')
            .order('created_at', { ascending: false });

        // Fetch contacts for the dropdown
        const { data: contactsData } = await supabase
            .from('marketing_contacts')
            .select('id, name, company')
            .order('name');

        if (outreachData) setOutreach(outreachData);
        if (contactsData) setContacts(contactsData);
        setLoading(false);
    };

    const handleOpenAdd = () => {
        setForm({ contact_id: contacts[0]?.id || '', subject: '', body: '', status: 'draft', channel: 'email' });
        setEditingSeq(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (seq: any) => {
        setForm({
            contact_id: seq.contact_id || '',
            subject: seq.subject || '',
            body: seq.body || '',
            status: seq.status || 'draft',
            channel: seq.channel || 'email'
        });
        setEditingSeq(seq);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        const payload = { ...form };

        if (editingSeq) {
            await supabase.from('outreach_sequences').update(payload).eq('id', editingSeq.id);
        } else {
            await supabase.from('outreach_sequences').insert([payload]);
        }

        setFormLoading(false);
        setIsModalOpen(false);
        fetchData();
    };

    const handleMarkSent = async (id: string) => {
        // Optimistic update
        setOutreach(prev => prev.map(o => o.id === id ? { ...o, status: 'sent', send_date: new Date().toISOString() } : o));
        
        await supabase
            .from('outreach_sequences')
            .update({ status: 'sent', send_date: new Date().toISOString() })
            .eq('id', id);
    };

    const filtered = outreach.filter(o => {
        return o.subject?.toLowerCase().includes(search.toLowerCase()) || 
               o.contact?.name?.toLowerCase().includes(search.toLowerCase());
    });

    const renderColumn = (statusKey: string, title: string, count: number) => {
        const items = filtered.filter(o => o.status === statusKey);
        
        return (
            <div className="flex-1 min-w-[320px] bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col h-full max-h-[600px]">
                <div className="px-4 py-3 border-b border-zinc-200 flex justify-between items-center bg-white rounded-t-xl shrink-0">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">{title}</h3>
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">{count}</span>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-3">
                    {items.map(seq => (
                        <div key={seq.id} className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow group relative">
                            {/* Actions overlay */}
                            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {seq.status !== 'sent' && (
                                    <button onClick={() => handleMarkSent(seq.id)} title="Mark as Sent" className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors">
                                        <Send size={12} />
                                    </button>
                                )}
                                <button onClick={() => handleOpenEdit(seq)} title="Edit Sequence" className="p-1.5 bg-zinc-50 text-zinc-600 rounded-md hover:bg-zinc-100 transition-colors">
                                    <Edit2 size={12} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${seq.channel === 'email' ? 'bg-blue-100 text-blue-700' : seq.channel === 'linkedin' ? 'bg-indigo-100 text-indigo-700' : 'bg-pink-100 text-pink-700'}`}>
                                    {seq.channel}
                                </span>
                                {seq.status === 'sent' && seq.send_date && (
                                    <span className="text-[9px] font-mono text-zinc-400 border border-zinc-200 px-1.5 py-0.5 rounded">
                                        {new Date(seq.send_date).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            
                            <h4 className="font-bold text-sm text-zinc-900 leading-tight mb-1 pr-14 truncate">{seq.subject || 'No Subject'}</h4>
                            <p className="text-[11px] font-bold text-zinc-500 mb-3 block">
                                To: {seq.contact?.name || 'Unknown Contact'} {seq.contact?.company ? `(${seq.contact.company})` : ''}
                            </p>
                            
                            {seq.body && (
                                <div className="text-xs text-zinc-600 max-h-16 overflow-hidden relative leading-relaxed bg-zinc-50 p-2 rounded border border-zinc-100">
                                    <div className="whitespace-pre-wrap">{seq.body}</div>
                                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-50 to-transparent pointer-events-none"></div>
                                </div>
                            )}
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="h-full min-h-[100px] flex items-center justify-center text-zinc-400 text-[10px] font-bold uppercase tracking-widest border-2 border-dashed border-zinc-200 rounded-xl">
                            Empty
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in h-full flex-1">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative max-w-xs w-full">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search campaigns or contacts..." 
                        className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-400 transition-colors"
                    />
                </div>
                
                <button onClick={handleOpenAdd} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all">
                    <Plus size={14} /> Draft Sequence
                </button>
            </div>

            {/* Kanban / Multi-Column View */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center text-zinc-400 min-h-[400px]">
                    <Loader2 className="animate-spin text-zinc-400" />
                </div>
            ) : (
                <div className="flex gap-6 overflow-x-auto pb-4 items-stretch min-h-[500px]">
                    {renderColumn('draft', 'Drafting', filtered.filter(f => f.status === 'draft').length)}
                    {renderColumn('scheduled', 'Scheduled / Ready', filtered.filter(f => f.status === 'scheduled').length)}
                    {renderColumn('sent', 'Sent / Completed', filtered.filter(f => f.status === 'sent').length)}
                </div>
            )}

            {/* Slide-over Dialog */}
            <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in" />
                    <Dialog.Content className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 border-l border-zinc-200 animate-in slide-in-from-right duration-300 flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                            <Dialog.Title className="text-sm font-black uppercase tracking-widest text-zinc-900">
                                {editingSeq ? 'Edit Setup' : 'New Sequence Setup'}
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="p-2 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors">
                                    <X size={16} />
                                </button>
                            </Dialog.Close>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            {/* Contact Linking */}
                            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2 block">Linked Contact</label>
                                <select 
                                    required 
                                    value={form.contact_id} 
                                    onChange={e => setForm({...form, contact_id: e.target.value})} 
                                    className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm font-bold text-zinc-800 focus:outline-none focus:border-blue-400 bg-white"
                                >
                                    <option value="" disabled>Select a contact...</option>
                                    {contacts.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                                    ))}
                                </select>
                                {contacts.length === 0 && <p className="text-[10px] text-zinc-400 mt-2">You must create a contact in the Contacts tab first.</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Delivery Channel</label>
                                    <select value={form.channel} onChange={e => setForm({...form, channel: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-600 focus:outline-none focus:border-zinc-400">
                                        <option value="email">Email</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Status</label>
                                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-600 focus:outline-none focus:border-zinc-400">
                                        <option value="draft">Drafting</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="sent">Sent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Subject Line / Hook</label>
                                <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-zinc-400" placeholder="e.g. Quick intro!" />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block flex justify-between">
                                    <span>Copy / Message Body</span>
                                    <span className="font-normal normal-case text-zinc-300 tracking-normal">(Paste copy here)</span>
                                </label>
                                <textarea required value={form.body} onChange={e => setForm({...form, body: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-zinc-400 min-h-[240px] resize-y leading-relaxed" placeholder="Write your pitch..." />
                            </div>

                        </form>
                        
                        <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-3">
                            <Dialog.Close asChild>
                                <button type="button" className="flex-1 px-4 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
                                    Cancel
                                </button>
                            </Dialog.Close>
                            <button onClick={handleSubmit} disabled={formLoading || !form.contact_id} className="flex-1 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-zinc-900/20 disabled:opacity-50 flex items-center justify-center gap-2">
                                {formLoading ? <Loader2 size={14} className="animate-spin" /> : (editingSeq ? 'Save Changes' : 'Create Setup')}
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
