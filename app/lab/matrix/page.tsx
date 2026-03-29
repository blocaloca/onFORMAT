'use client';
import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, 
    Users, 
    FileText, 
    Eye, 
    Edit3, 
    Plus, 
    X, 
    Smartphone, 
    Lock,
    Unlock,
    Activity,
    ChevronRight,
    Search
} from 'lucide-react';

// --- TYPES FOR THE SANDBOX ---
interface RoleAccess {
    id: string;
    name: string;
    icon: string;
    color: string;
}

interface DocumentType {
    id: string;
    name: string;
    isSensitive: boolean;
}

const DOCUMENT_TYPES: DocumentType[] = [
    { id: 'schedule', name: 'Schedule', isSensitive: false },
    { id: 'call_sheet', name: 'Call Sheet', isSensitive: false },
    { id: 'dit_log', name: 'DIT Log', isSensitive: true },
    { id: 'shot_list', name: 'Shot List', isSensitive: false },
    { id: 'script_notes', name: 'Script Notes', isSensitive: false },
    { id: 'client_selects', name: 'Client Selects', isSensitive: true },
    { id: 'lookbook', name: 'Lookbook', isSensitive: false },
    { id: 'budget', name: 'Budget / Rates', isSensitive: true }
];

const INITIAL_ROLES: RoleAccess[] = [
    { id: 'producer', name: 'Producer', icon: '👑', color: 'emerald' },
    { id: 'dit', name: 'DIT', icon: '💾', color: 'blue' },
    { id: 'scripty', name: 'Script Supervisor', icon: '✍️', color: 'pink' },
    { id: 'dp', name: 'Director of Photo', icon: '🎥', color: 'amber' },
    { id: 'client', name: 'Client / Agency', icon: '💼', color: 'zinc' }
];

export default function MatrixLab() {
    const [roles, setRoles] = useState<RoleAccess[]>(INITIAL_ROLES);
    const [matrix, setMatrix] = useState<Record<string, Record<string, 'none' | 'view' | 'edit'>>>({
        producer: { schedule: 'edit', call_sheet: 'edit', dit_log: 'edit', shot_list: 'edit', script_notes: 'edit', client_selects: 'edit', lookbook: 'edit', budget: 'edit' },
        dit: { schedule: 'view', call_sheet: 'view', dit_log: 'edit', shot_list: 'view', budget: 'none' },
        scripty: { schedule: 'view', call_sheet: 'view', shot_list: 'view', script_notes: 'edit' },
        client: { call_sheet: 'view', client_selects: 'view' }
    });
    
    const [simulatedUserRole, setSimulatedUserRole] = useState<string>('dit');
    const [newRoleName, setNewRoleName] = useState('');

    const toggleAccess = (roleId: string, docId: string) => {
        setMatrix(prev => {
            const current = (prev[roleId] && prev[roleId][docId]) || 'none';
            const nextMap: Record<string, 'none' | 'view' | 'edit'> = { 'none': 'view', 'view': 'edit', 'edit': 'none' };
            const next = nextMap[current];

            return {
                ...prev,
                [roleId]: {
                    ...(prev[roleId] || {}),
                    [docId]: next
                }
            };
        });
    };

    const addRole = () => {
        if (!newRoleName) return;
        const id = newRoleName.toLowerCase().replace(/\s+/g, '_');
        setRoles([...roles, { id, name: newRoleName, icon: '👤', color: 'zinc' }]);
        setNewRoleName('');
    };

    const getDocAccess = (roleId: string, docId: string) => (matrix[roleId] && matrix[roleId][docId]) || 'none';

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 p-8 sm:p-12">
            
            {/* LAB HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500 rounded-lg text-white shadow-lg shadow-emerald-500/20">
                            <ShieldCheck size={20} />
                        </div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">OnSet Matrix Lab</h1>
                    </div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Document Access Perimeter Sandbox</p>
                </div>
                
                <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-2 pl-3">
                        <Users size={16} className="text-zinc-400" />
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Simulate Role:</span>
                    </div>
                    <select 
                        value={simulatedUserRole}
                        onChange={(e) => setSimulatedUserRole(e.target.value)}
                        className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl text-xs font-black uppercase tracking-wider px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    >
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                
                {/* COLUMN 1 & 2: THE MATRIX SWITCHBOARD */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm overflow-hidden animate-in fade-in slide-in-from-left-4">
                        
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-black uppercase tracking-tight">Access Control Matrix</h2>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Tap cells to cycle permission: None → View → Edit</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">None</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest">View</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20" />
                                    <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Edit</span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50/50 dark:bg-zinc-800/20">
                                        <th className="p-6 text-left border-b border-zinc-100 dark:border-zinc-800">
                                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Document Silo</span>
                                        </th>
                                        {roles.map(role => (
                                            <th key={role.id} className="p-6 text-center border-b border-zinc-100 dark:border-zinc-800 min-w-[120px]">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-sm scale-125 mb-1">{role.icon}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{role.name}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {DOCUMENT_TYPES.map(doc => (
                                        <tr key={doc.id} className="group hover:bg-emerald-500/[0.02] transition-colors">
                                            <td className="p-6 border-b border-zinc-50 dark:border-zinc-800/50">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${doc.isSensitive ? 'text-amber-500 bg-amber-500/10' : 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50'}`}>
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-black uppercase tracking-tight block">{doc.name}</span>
                                                        {doc.isSensitive && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <Lock size={8} className="text-amber-500" />
                                                                <span className="text-[8px] font-black uppercase text-amber-500/70 tracking-widest">Tier 1 Sensitive</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            {roles.map(role => {
                                                const access = getDocAccess(role.id, doc.id);
                                                return (
                                                    <td key={role.id} className="p-2 border-b border-zinc-50 dark:border-zinc-800/50 text-center">
                                                        <button 
                                                            onClick={() => toggleAccess(role.id, doc.id)}
                                                            className={`w-16 h-10 mx-auto rounded-xl flex items-center justify-center transition-all active:scale-95 border-2
                                                                ${access === 'edit' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                                                                  access === 'view' ? 'bg-white dark:bg-zinc-900 border-blue-500/40 text-blue-500 shadow-sm' : 
                                                                  'bg-zinc-50 dark:bg-zinc-800/40 border-transparent text-zinc-300 dark:text-zinc-600'}`}
                                                        >
                                                            {access === 'edit' ? <Edit3 size={16} strokeWidth={3} /> : access === 'view' ? <Eye size={16} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Add Role Control */}
                    <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-900 p-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
                        <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-full text-zinc-400">
                            <Plus size={20} />
                        </div>
                        <input 
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            placeholder="Add Production Role (e.g. Hair/Makeup)..."
                            className="flex-1 bg-transparent outline-none text-xs font-black uppercase tracking-widest placeholder:text-zinc-400"
                        />
                        <button 
                            onClick={addRole}
                            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                        >
                            Create Role
                        </button>
                    </div>
                </div>

                {/* COLUMN 3: PERIMETER SIMULATOR (MOBILE PREVIEW) */}
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    
                    <div className="bg-zinc-900 rounded-[3rem] p-4 shadow-2xl relative border-[6px] border-zinc-800 h-[680px] w-full max-w-[320px] mx-auto overflow-hidden">
                        {/* Dynamic SIM Status */}
                        <div className="flex justify-between items-center px-4 pt-1 mb-8">
                            <div className="flex items-center gap-1">
                                <Activity size={12} className="text-emerald-500" />
                                <span className="text-[7px] font-black text-zinc-500 uppercase">Uplink 5G_Secure</span>
                            </div>
                            <span className="text-[10px] font-black text-white/50">{new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')}</span>
                        </div>

                        {/* Mobile HUD */}
                        <div className="px-6 space-y-6">
                            <div>
                                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Simulated Session</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-full text-xl shadow-xl">
                                        {roles.find(r => r.id === simulatedUserRole)?.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white uppercase">{roles.find(r => r.id === simulatedUserRole)?.name}</p>
                                        <p className="text-[8px] font-black text-emerald-500/70 uppercase tracking-widest">Active Perimeter</p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-zinc-800 w-full" />

                            <div>
                                <h4 className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">Authorized Silos</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {DOCUMENT_TYPES.map(doc => {
                                        const access = getDocAccess(simulatedUserRole, doc.id);
                                        if (access === 'none') return null;

                                        return (
                                            <div key={doc.id} className="bg-zinc-800/50 p-3 rounded-2xl border border-white/5 flex flex-col gap-2 transition-all animate-in zoom-in-95">
                                                <div className="flex justify-between items-start">
                                                    <FileText size={16} className={doc.isSensitive ? 'text-amber-500' : 'text-zinc-400'} />
                                                    {access === 'edit' ? <Edit3 size={10} className="text-emerald-500" /> : <Eye size={10} className="text-blue-500" />}
                                                </div>
                                                <span className="text-[9px] font-black uppercase tracking-tight text-white leading-tight">{doc.name}</span>
                                            </div>
                                        );
                                    })}
                                    
                                    {/* Empty State */}
                                    {Object.values(matrix[simulatedUserRole] || {}).every(v => v === 'none') && (
                                        <div className="col-span-2 py-12 text-center text-zinc-700 space-y-3">
                                            <Lock size={24} className="mx-auto opacity-20" />
                                            <p className="text-[8px] font-black uppercase tracking-widest">No silos authorized for this perimeter.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Bar Simulation */}
                        <div className="absolute bottom-8 inset-x-0 px-8 flex justify-around">
                            {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-zinc-800" />)}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 space-y-4 max-w-[320px] mx-auto">
                        <div className="flex items-center gap-3">
                            <Activity size={18} className="text-emerald-500" />
                            <h4 className="text-xs font-black uppercase">Security Insight</h4>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-medium leading-relaxed uppercase tracking-tighter">
                            The current role <span className="text-white font-black">"{roles.find(r => r.id === simulatedUserRole)?.name}"</span> has access to <span className="text-emerald-500 font-black">{Object.values(matrix[simulatedUserRole] || {}).filter(v => v !== 'none').length}</span> total document silos.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
