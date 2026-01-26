import React, { useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { TalentReleaseTemplate } from './TalentReleaseTemplate';
import { PropertyReleaseTemplate } from './PropertyReleaseTemplate';
import { Plus, User, MapPin, ChevronRight, FileText, CheckCircle, Clock, ArrowLeft, Trash2 } from 'lucide-react';

interface ReleaseItem {
    id: string;
    type: 'talent' | 'property';
    name: string; // Talent Name or Property Owner
    description: string; // Role or Address
    status: 'draft' | 'signed';
    dateCreated: string;
    data: any; // The full release data object
}

interface ReleasesManagerData {
    releases: ReleaseItem[];
}

interface ReleasesManagerTemplateProps {
    data: Partial<ReleasesManagerData>;
    onUpdate: (data: Partial<ReleasesManagerData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
}

export const ReleasesManagerTemplate = ({
    data,
    onUpdate,
    isLocked = false,
    plain,
    orientation,
    metadata
}: ReleasesManagerTemplateProps) => {

    const [view, setView] = useState<'list' | 'detail'>('list');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'talent' | 'property'>('talent');

    // Ensure data structure
    const releases = data.releases || [];

    const handleCreate = () => {
        const id = `rev-${Date.now()}`;
        const newRelease: ReleaseItem = {
            id,
            type: activeTab,
            name: '',
            description: '',
            status: 'draft',
            dateCreated: new Date().toISOString(),
            data: {
                // Initial empty data for the specific template
                productionCompany: metadata?.producer || 'CREATIVE OS PRODUCTIONS',
                shootDate: new Date().toISOString().split('T')[0]
            }
        };

        const updatedReleases = [...releases, newRelease];
        onUpdate({ releases: updatedReleases });

        // Auto-open
        setActiveId(id);
        setView('detail');
    };

    const handleItemUpdate = (releaseId: string, itemData: any) => {
        const updatedReleases = releases.map(r => {
            if (r.id === releaseId) {
                // Extract summary info from itemData to update the list view
                const name = r.type === 'talent' ? itemData.talentName : itemData.ownerName;
                const description = r.type === 'talent' ? itemData.role : itemData.address;
                const status = itemData.signatureUrl ? 'signed' : 'draft';

                return {
                    ...r,
                    name: name || r.name,
                    description: description || r.description,
                    status: status as 'draft' | 'signed',
                    data: { ...r.data, ...itemData }
                };
            }
            return r;
        });

        onUpdate({ releases: updatedReleases });
    };

    // Filter Detail View
    if (view === 'detail' && activeId) {
        const activeItem = releases.find(r => r.id === activeId);

        if (!activeItem) {
            setView('list'); // Error fallback
            return <div />;
        }

        const CommonProps = {
            isLocked,
            plain,
            orientation,
            metadata: { ...metadata, backAction: () => setView('list') }
        };

        const BackButton = (
            <button
                onClick={() => setView('list')}
                className="absolute top-4 left-4 z-50 flex items-center gap-1 text-xs font-bold uppercase text-zinc-500 hover:text-black bg-white/80 px-2 py-1 rounded backdrop-blur-sm shadow-sm"
            >
                <ArrowLeft size={12} /> Back to List
            </button>
        );

        if (activeItem.type === 'talent') {
            return (
                <div className="relative h-full">
                    {BackButton}
                    <TalentReleaseTemplate
                        data={activeItem.data}
                        onUpdate={(d) => handleItemUpdate(activeItem.id, d)}
                        {...CommonProps}
                    />
                </div>
            );
        } else {
            return (
                <div className="relative h-full">
                    {BackButton}
                    <PropertyReleaseTemplate
                        data={activeItem.data}
                        onUpdate={(d) => handleItemUpdate(activeItem.id, d)}
                        {...CommonProps}
                    />
                </div>
            );
        }
    }

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this release? This cannot be undone.')) {
            const updatedReleases = releases.filter(r => r.id !== id);
            onUpdate({ releases: updatedReleases });
        }
    };

    // List View
    const filteredReleases = releases.filter(r => r.type === activeTab);

    return (
        <DocumentLayout
            title="Releases Manager"
            hideHeader={false}
            plain={plain}
            orientation={orientation}
            metadata={metadata}
        >
            <div className="h-full flex flex-col">

                {/* Tabs */}
                <div className="flex items-center gap-4 mb-6 border-b border-zinc-200 pb-2">
                    <button
                        onClick={() => setActiveTab('talent')}
                        className={`text-xs font-bold uppercase tracking-wider pb-1 flex items-center gap-2 transition-colors ${activeTab === 'talent' ? 'text-black border-b-2 border-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        <User size={14} /> Talent
                    </button>
                    <button
                        onClick={() => setActiveTab('property')}
                        className={`text-xs font-bold uppercase tracking-wider pb-1 flex items-center gap-2 transition-colors ${activeTab === 'property' ? 'text-black border-b-2 border-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        <MapPin size={14} /> Property
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto space-y-2">
                    {filteredReleases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-zinc-400 border-2 border-dashed border-zinc-100 rounded-lg">
                            <p className="text-xs font-medium">No {activeTab} releases yet.</p>
                            <button
                                onClick={handleCreate}
                                className="mt-2 text-xs font-bold uppercase text-blue-600 hover:underline"
                            >
                                + Create First Release
                            </button>
                        </div>
                    ) : (
                        filteredReleases.map(item => (
                            <div
                                key={item.id}
                                onClick={() => { setActiveId(item.id); setView('detail'); }}
                                className="group flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-lg shadow-sm hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer relative"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.status === 'signed' ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-400'}`}>
                                        {item.status === 'signed' ? <CheckCircle size={16} /> : <FileText size={16} />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-800 leading-none mb-1">
                                            {item.name || '(Untitled)'}
                                        </h4>
                                        <p className="text-[10px] text-zinc-500 font-mono uppercase">
                                            {item.description || 'No Role/Address'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${item.status === 'signed' ? 'bg-green-100 text-green-700' : 'bg-yellow-50 text-yellow-600'}`}>
                                            {item.status}
                                        </span>
                                        <div className="text-[9px] text-zinc-400 mt-0.5 flex items-center justify-end gap-1">
                                            <Clock size={8} /> {new Date(item.dateCreated).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {!isLocked && (
                                        <button
                                            onClick={(e) => handleDelete(e, item.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-zinc-100 rounded text-zinc-400 hover:text-red-500 transition-all"
                                            title="Delete Release"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}

                                    <ChevronRight size={16} className="text-zinc-300 group-hover:text-black" />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Action */}
                <div className="pt-4 mt-4 border-t border-zinc-100 flex justify-start">
                    <button
                        onClick={handleCreate}
                        disabled={isLocked}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-50 px-3 py-2 rounded-sm transition-colors border border-transparent hover:border-zinc-200"
                    >
                        <Plus size={10} /> Add {activeTab} Release
                    </button>
                </div>

            </div>
        </DocumentLayout>
    );
};
