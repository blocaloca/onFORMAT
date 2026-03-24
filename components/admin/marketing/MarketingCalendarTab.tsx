'use client';

import React, { useState, useEffect } from 'react';
import { getClient } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Calendar as CalendarIcon, List as ListIcon, Link as LinkIcon } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export function MarketingCalendarTab() {
    const supabase = getClient();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);

    const [form, setForm] = useState({
        title: '',
        description: '',
        post_date: '',
        channel: 'instagram',
        campaign_phase: 'phase_1',
        status: 'idea',
        asset_url: ''
    });

    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    const fetchEvents = async () => {
        setLoading(true);
        // We can just fetch all for now, or filter by month to be highly efficient.
        // For standard dashboards, fetching 3 months window is good. We'll fetch all ordered.
        const { data } = await supabase
            .from('marketing_calendar')
            .select('*')
            .order('post_date', { ascending: true });
            
        if (data) setEvents(data);
        setLoading(false);
    };

    const handleMonthChange = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const handleOpenAdd = (dateStr?: string) => {
        // Use provided date string or today
        const defaultDate = dateStr || new Date().toISOString().split('T')[0];
        setForm({
            title: '', description: '', post_date: defaultDate, channel: 'instagram', campaign_phase: 'phase_1', status: 'idea', asset_url: ''
        });
        setEditingEvent(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (evt: any) => {
        setForm({
            title: evt.title || '',
            description: evt.description || '',
            post_date: evt.post_date || '',
            channel: evt.channel || 'instagram',
            campaign_phase: evt.campaign_phase || 'phase_1',
            status: evt.status || 'idea',
            asset_url: evt.asset_url || ''
        });
        setEditingEvent(evt);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        const payload = { ...form };

        if (editingEvent) {
            await supabase.from('marketing_calendar').update(payload).eq('id', editingEvent.id);
        } else {
            await supabase.from('marketing_calendar').insert([payload]);
        }

        setFormLoading(false);
        setIsModalOpen(false);
        fetchEvents();
    };

    const handleDelete = async () => {
        if (!editingEvent) return;
        if (!window.confirm('Delete this event?')) return;
        setFormLoading(true);
        await supabase.from('marketing_calendar').delete().eq('id', editingEvent.id);
        setFormLoading(false);
        setIsModalOpen(false);
        fetchEvents();
    };

    // Calendar Math computation
    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1).getDay();
        const numDays = new Date(year, month + 1, 0).getDate();
        
        const grid = [];
        // Empty padded cells
        for (let i = 0; i < firstDay; i++) {
            grid.push(null);
        }
        // Actual days
        for (let i = 1; i <= numDays; i++) {
            grid.push(new Date(year, month, i));
        }
        return grid;
    };

    const gridDays = getDaysInMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const getChannelColor = (channel: string) => {
        switch(channel) {
            case 'instagram': return 'bg-pink-100 text-pink-700 border-pink-200';
            case 'linkedin': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'email': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'press': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in h-full">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4">
                <div className="flex items-center gap-4">
                    <div className="flex bg-zinc-100 p-1 rounded-lg">
                        <button onClick={() => setViewMode('calendar')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                            <CalendarIcon size={16} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                            <ListIcon size={16} />
                        </button>
                    </div>

                    {viewMode === 'calendar' && (
                        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg overflow-hidden">
                            <button onClick={() => handleMonthChange(-1)} className="px-2 py-1.5 hover:bg-zinc-50 text-zinc-500 transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-black text-zinc-900 w-32 text-center uppercase tracking-widest">{monthName}</span>
                            <button onClick={() => handleMonthChange(1)} className="px-2 py-1.5 hover:bg-zinc-50 text-zinc-500 transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
                
                <button onClick={() => handleOpenAdd()} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all">
                    <Plus size={14} /> New Post
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-zinc-400 min-h-[400px]">
                    <Loader2 className="animate-spin text-zinc-400" />
                </div>
            ) : (
                <>
                    {/* CALENDAR VIEW */}
                    {viewMode === 'calendar' && (
                        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[600px]">
                            {/* Days of Week */}
                            <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div key={d} className="px-2 py-3 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                        {d}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Grid Cells */}
                            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                                {gridDays.map((dateObj, i) => {
                                    if (!dateObj) return <div key={`empty-${i}`} className="border-r border-b border-zinc-100/50 bg-zinc-50/30 p-2 min-h-[100px]" />;
                                    
                                    // Parse local perfectly (bypassing timezone bleeding issues by strictly slicing YYYY-MM-DD)
                                    // Note: local formatting can be tricky, let's pad manually.
                                    const y = dateObj.getFullYear();
                                    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                                    const d = String(dateObj.getDate()).padStart(2, '0');
                                    const dateStr = `${y}-${m}-${d}`;
                                    
                                    const dayEvents = events.filter(ev => ev.post_date === dateStr);
                                    const isToday = new Date().toISOString().split('T')[0] === dateStr;

                                    return (
                                        <div 
                                            key={i} 
                                            className={`border-r border-b border-zinc-200 min-h-[120px] p-2 hover:bg-zinc-50/50 transition-colors cursor-pointer group flex flex-col ${isToday ? 'bg-blue-50/20' : ''}`}
                                            onClick={(e) => {
                                                // If we didn't click on an event chip itself
                                                if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'DIV') {
                                                    handleOpenAdd(dateStr);
                                                }
                                            }}
                                        >
                                            <div className="flex justify-between items-start mb-2 pointer-events-none">
                                                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-zinc-500 group-hover:text-zinc-900 group-hover:bg-zinc-100'}`}>
                                                    {dateObj.getDate()}
                                                </span>
                                            </div>
                                            
                                            <div className="flex flex-col gap-1 overflow-y-auto w-full">
                                                {dayEvents.map(ev => (
                                                    <button 
                                                        key={ev.id} 
                                                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(ev); }}
                                                        className={`text-left px-1.5 py-1 rounded text-[9px] font-bold truncate border ${getChannelColor(ev.channel)} hover:opacity-80 transition-opacity w-full block`}
                                                        title={ev.title}
                                                    >
                                                        {ev.title}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* LIST VIEW */}
                    {viewMode === 'list' && (
                        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left table-auto">
                                <thead className="bg-zinc-50 border-b border-zinc-200">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[15%]">Date</th>
                                        <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[30%]">Title</th>
                                        <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[15%]">Channel</th>
                                        <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[15%]">Phase</th>
                                        <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[15%]">Status</th>
                                        <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 w-[10%] text-right">Edit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {events.length === 0 && (
                                        <tr><td colSpan={6} className="py-12 text-center text-zinc-400 text-[10px] uppercase font-bold tracking-widest border-dashed">No events planned</td></tr>
                                    )}
                                    {events.map((ev) => (
                                        <tr key={ev.id} className="hover:bg-zinc-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-mono font-bold text-zinc-600">
                                                    {new Date(ev.post_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-sm text-zinc-900">{ev.title}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${getChannelColor(ev.channel)}`}>
                                                    {ev.channel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                                {ev.campaign_phase.replace('_', ' ')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 bg-zinc-100 px-2 py-1 rounded">
                                                    {ev.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleOpenEdit(ev)} className="text-blue-500 hover:text-blue-700 text-xs font-bold uppercase tracking-widest transition-colors">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Slide-over Dialog */}
            <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in" />
                    <Dialog.Content className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 border-l border-zinc-200 animate-in slide-in-from-right duration-300 flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                            <Dialog.Title className="text-sm font-black uppercase tracking-widest text-zinc-900">
                                {editingEvent ? 'Marketing Event' : 'New Calendar Entry'}
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="p-2 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors">
                                    <X size={16} />
                                </button>
                            </Dialog.Close>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Title / Concept</label>
                                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-zinc-400" placeholder="e.g. Testimonial Video Post" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Post Date</label>
                                    <input required type="date" value={form.post_date} onChange={e => setForm({...form, post_date: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-zinc-400 text-zinc-600" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Channel</label>
                                    <select value={form.channel} onChange={e => setForm({...form, channel: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-600 focus:outline-none focus:border-zinc-400">
                                        <option value="instagram">Instagram</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="email">Email</option>
                                        <option value="press">Press / PR</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Campaign Phase</label>
                                    <select value={form.campaign_phase} onChange={e => setForm({...form, campaign_phase: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-600 focus:outline-none focus:border-zinc-400">
                                        <option value="phase_1">Phase 1</option>
                                        <option value="phase_2">Phase 2</option>
                                        <option value="ongoing">Ongoing</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Status</label>
                                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-600 focus:outline-none focus:border-zinc-400">
                                        <option value="idea">Idea / Brainstorm</option>
                                        <option value="draft">Drafting Assets</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block flex justify-between">
                                    <span>Plan Details / Content</span>
                                    <span className="font-normal normal-case text-zinc-300">(Optional)</span>
                                </label>
                                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-zinc-400 min-h-[140px] resize-y leading-relaxed" placeholder="Discuss the concept, hook, CTA..." />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block flex justify-between">
                                    <span>Figma / Google Drive URL</span>
                                </label>
                                <div className="relative relative flex items-center">
                                    <LinkIcon size={14} className="absolute left-3 text-zinc-400" />
                                    <input value={form.asset_url} onChange={e => setForm({...form, asset_url: e.target.value})} className="w-full border border-zinc-200 rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-zinc-400" placeholder="https://" />
                                </div>
                            </div>

                        </form>
                        
                        <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-3">
                            <button onClick={handleDelete} type="button" className={`flex-none px-4 py-3 border border-red-200 bg-white hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${!editingEvent ? 'hidden' : ''}`}>
                                Delete
                            </button>
                            <button onClick={handleSubmit} disabled={formLoading} className="flex-1 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-zinc-900/20 disabled:opacity-50 flex items-center justify-center gap-2">
                                {formLoading ? <Loader2 size={14} className="animate-spin" /> : (editingEvent ? 'Save Event' : 'Add to Calendar')}
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </div>
    );
}
