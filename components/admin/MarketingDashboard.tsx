'use client';

import React, { useState, useEffect } from 'react';
import { getClient } from '@/lib/supabase';
import { Users, Mail, Calendar, Search, Filter, Plus, ChevronRight, Check } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { ContactsTab } from './marketing/ContactsTab';
import { OutreachTab } from './marketing/OutreachTab';
import { MarketingCalendarTab } from './marketing/MarketingCalendarTab';

type Tab = 'contacts' | 'outreach' | 'calendar';

export default function MarketingDashboard() {
    const supabase = getClient();
    const [activeTab, setActiveTab] = useState<Tab>('contacts');

    return (
        <section className="mt-12 border-t border-zinc-200 pt-12 animate-in fade-in pb-20">
            <div className="flex items-center gap-2 mb-6">
                <Users size={20} className="text-blue-500" />
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900">Marketing Pipeline</h2>
            </div>

            {/* Main Wrapper */}
            <div className="bg-white rounded-[20px] shadow-sm border border-zinc-200 overflow-hidden flex flex-col min-h-[600px]">
                
                {/* Tabs Wrapper */}
                <div className="flex border-b border-zinc-200 bg-zinc-50/50 px-6 pt-4 gap-6">
                    <button 
                        onClick={() => setActiveTab('contacts')}
                        className={`pb-4 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 border-b-2 ${activeTab === 'contacts' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
                    >
                        <Users size={14} /> Contacts & Funnel
                    </button>
                    <button 
                        onClick={() => setActiveTab('outreach')}
                        className={`pb-4 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 border-b-2 ${activeTab === 'outreach' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
                    >
                        <Mail size={14} /> Outreach Sequence
                    </button>
                    <button 
                        onClick={() => setActiveTab('calendar')}
                        className={`pb-4 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 border-b-2 ${activeTab === 'calendar' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
                    >
                        <Calendar size={14} /> Planner
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6 flex-1 bg-white">
                    {activeTab === 'contacts' && (
                        <ContactsTab />
                    )}
                    {activeTab === 'outreach' && (
                        <OutreachTab />
                    )}
                    {activeTab === 'calendar' && (
                        <MarketingCalendarTab />
                    )}
                </div>
            </div>
        </section>
    );
}
