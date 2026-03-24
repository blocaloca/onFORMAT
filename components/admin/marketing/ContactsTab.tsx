'use client';

import React, { useState, useEffect } from 'react';
import { getClient } from '@/lib/supabase';
import { Plus, Search, Filter, X, Edit2, Loader2, Calendar } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export function ContactsTab() {
    const supabase = getClient();
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStage, setFilterStage] = useState('all');
    const [filterPersona, setFilterPersona] = useState('all');
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<any>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Form
    const [form, setForm] = useState({
        name: '',
        email: '',
        company: '',
        persona: 'photographer',
        tier_interest: 'solo',
        stage: 'lead',
        notes: ''
    });

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('marketing_contacts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error && data) setContacts(data);
        setLoading(false);
    };

    const handleUpdateStage = async (id: string, newStage: string) => {
        // Optimistic
        setContacts(prev => prev.map(c => c.id === id ? { ...c, stage: newStage } : c));
        await supabase.from('marketing_contacts').update({ stage: newStage }).eq('id', id);
    };

    const handleOpenEdit = (c: any) => {
        setForm({
            name: c.name || '',
            email: c.email || '',
            company: c.company || '',
            persona: c.persona || 'photographer',
            tier_interest: c.tier_interest || 'solo',
            stage: c.stage || 'lead',
            notes: c.notes || ''
        });
        setEditingContact(c);
        setIsModalOpen(true);
    };

    const handleOpenAdd = () => {
        setForm({
            name: '', email: '', company: '', persona: 'photographer', tier_interest: 'solo', stage: 'lead', notes: ''
        });
        setEditingContact(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        if (editingContact) {
            await supabase.from('marketing_contacts').update(form).eq('id', editingContact.id);
        } else {
            await supabase.from('marketing_contacts').insert([form]);
        }

        setFormLoading(false);
        setIsModalOpen(false);
        fetchContacts();
    };

    const displayContacts = contacts.filter((c: any) => {
        if (filterStage !== 'all' && c.stage !== filterStage) return false;
        if (filterPersona !== 'all' && c.persona !== filterPersona) return false;
        if (search && !c.name?.toLowerCase().includes(search.toLowerCase()) && !c.company?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <div className="relative max-w-xs w-full">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search contacts..." 
                            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-400 transition-colors"
                        />
                    </div>
                    <select 
                        value={filterStage}
                        onChange={(e) => setFilterStage(e.target.value)}
                        className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-600 focus:outline-none"
                    >
                        <option value="all">All Stages</option>
                        <option value="lead">Lead</option>
                        <option value="invited">Invited</option>
                        <option value="waitlist">Waitlist</option>
                        <option value="beta">Beta</option>
                        <option value="converted">Converted</option>
                        <option value="archived">Archived</option>
                    </select>
                    <select 
                        value={filterPersona}
                        onChange={(e) => setFilterPersona(e.target.value)}
                        className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-600 focus:outline-none"
                    >
                        <option value="all">All Personas</option>
                        <option value="photographer">Photographer</option>
                        <option value="producer">Producer</option>
                        <option value="agency">Agency</option>
                        <option value="press">Press</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <button onClick={handleOpenAdd} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all">
                    <Plus size={14} /> Add Contact
                </button>
            </div>

            {/* Data Table */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <table className="w-full text-left table-fixed">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[30%]">Contact</th>
                            <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[20%]">Persona</th>
                            <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[15%]">Tier</th>
                            <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[25%] text-center">Stage</th>
                            <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[10%] text-right">Edit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 min-h-[200px]">
                        {loading && (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-zinc-400">
                                    <Loader2 className="animate-spin inline-block mx-auto mb-2" />
                                    <p className="text-[10px] uppercase tracking-widest">Loading Contacts...</p>
                                </td>
                            </tr>
                        )}
                        {!loading && displayContacts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-zinc-400">
                                    <p className="text-[10px] uppercase tracking-widest">No Contacts Found</p>
                                </td>
                            </tr>
                        )}
                        {!loading && displayContacts.map((c) => (
                            <tr key={c.id} className="hover:bg-zinc-50 transition-colors group">
                                <td className="px-6 py-4 truncate">
                                    <div className="font-bold text-sm text-zinc-900 truncate">{c.name}</div>
                                    <div className="text-xs text-zinc-400 truncate">{c.email || c.company || 'No email provided'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700">
                                        {c.persona}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                        {c.tier_interest || '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <select 
                                        value={c.stage}
                                        onChange={(e) => handleUpdateStage(c.id, e.target.value)}
                                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded cursor-pointer outline-none border-none ${
                                            c.stage === 'lead' ? 'bg-zinc-100 text-zinc-600' :
                                            c.stage === 'invited' ? 'bg-blue-100 text-blue-700' :
                                            c.stage === 'beta' ? 'bg-amber-100 text-amber-700' :
                                            c.stage === 'waitlist' ? 'bg-orange-100 text-orange-700' :
                                            c.stage === 'converted' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-zinc-100 text-zinc-400'
                                        }`}
                                    >
                                        <option value="lead">LEAD</option>
                                        <option value="invited">INVITED</option>
                                        <option value="beta">BETA</option>
                                        <option value="waitlist">WAITLIST</option>
                                        <option value="converted">CONVERTED</option>
                                        <option value="archived">ARCHIVED</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleOpenEdit(c)} className="text-zinc-300 hover:text-zinc-600 transition-colors p-1">
                                        <Edit2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Slide-over Dialog */}
            <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in" />
                    <Dialog.Content className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 border-l border-zinc-200 animate-in slide-in-from-right duration-300 flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                            <Dialog.Title className="text-sm font-black uppercase tracking-widest text-zinc-900">
                                {editingContact ? 'Edit Contact' : 'New Contact'}
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="p-2 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors">
                                    <X size={16} />
                                </button>
                            </Dialog.Close>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Full Name</label>
                                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-zinc-400" placeholder="John Doe" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Email</label>
                                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-zinc-400" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Company</label>
                                    <input value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-zinc-400" placeholder="Studio LLC" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Persona</label>
                                    <select value={form.persona} onChange={e => setForm({...form, persona: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-600 focus:outline-none focus:border-zinc-400">
                                        <option value="photographer">Photographer</option>
                                        <option value="producer">Producer</option>
                                        <option value="agency">Agency</option>
                                        <option value="press">Press</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Tier Interest</label>
                                    <select value={form.tier_interest} onChange={e => setForm({...form, tier_interest: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-600 focus:outline-none focus:border-zinc-400">
                                        <option value="solo">Solo</option>
                                        <option value="pro">Pro</option>
                                        <option value="studio">Studio</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Stage</label>
                                <select value={form.stage} onChange={e => setForm({...form, stage: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-600 focus:outline-none focus:border-zinc-400">
                                    <option value="lead">Lead</option>
                                    <option value="invited">Invited</option>
                                    <option value="waitlist">Waitlist</option>
                                    <option value="beta">Beta</option>
                                    <option value="converted">Converted</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Admin Notes</label>
                                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-zinc-400 min-h-[120px] resize-none" placeholder="Context..." />
                            </div>

                        </form>
                        
                        <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-3">
                            <Dialog.Close asChild>
                                <button className="flex-1 px-4 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
                                    Cancel
                                </button>
                            </Dialog.Close>
                            <button onClick={handleSubmit} disabled={formLoading} className="flex-1 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-zinc-900/20 disabled:opacity-50 flex items-center justify-center gap-2">
                                {formLoading ? <Loader2 size={14} className="animate-spin" /> : (editingContact ? 'Update' : 'Create')}
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </div>
    );
}
