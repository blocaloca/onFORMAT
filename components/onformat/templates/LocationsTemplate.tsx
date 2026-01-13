import React, { useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { Trash2, Plus, MapPin, Phone, DollarSign, FileText } from 'lucide-react';

interface LocationPage {
    id: string;
    mainImage: string;
    smallImage1: string;
    smallImage2: string;
    name: string;
    address: string;
    contact: string;
    rate: string;
    permit: string;
    notes: string;
}

interface LocationTemplateData {
    locations: LocationPage[]; // Renamed from items to avoid confusion, or keep items?
    // Project state often uses "items". Let's stick to "items" but change the type.
    items: LocationPage[];
}

interface LocationTemplateProps {
    data: Partial<LocationTemplateData>;
    onUpdate: (data: Partial<LocationTemplateData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    metadata?: any;
    orientation?: 'portrait' | 'landscape';
    isPrinting?: boolean;
}

export const LocationsTemplate = ({ data, onUpdate, isLocked = false, plain, metadata, orientation = 'portrait', isPrinting }: LocationTemplateProps) => {

    const items = (data.items || []) as LocationPage[];

    // Migration Logic: Convert old image-based items to Location Pages
    React.useEffect(() => {
        const rawItems = data.items || [];
        if (rawItems.length > 0 && !(rawItems[0] as any).mainImage && (rawItems[0] as any).url) {
            // Detected old format
            const convertedItems: LocationPage[] = rawItems.map((old: any, idx) => ({
                id: old.id || `loc-${Date.now()}-${idx}`,
                mainImage: old.url || '',
                smallImage1: '',
                smallImage2: '',
                name: old.caption ? old.caption.split('\n')[0] : 'Location Name',
                address: '',
                contact: '',
                rate: '',
                permit: '',
                notes: old.caption || ''
            }));
            onUpdate({ items: convertedItems });
        }
    }, [data.items]); // Run once per data change

    const handleAddLocation = () => {
        const newLocation: LocationPage = {
            id: crypto.randomUUID(),
            mainImage: '',
            smallImage1: '',
            smallImage2: '',
            name: '',
            address: '',
            contact: '',
            rate: '',
            permit: '',
            notes: ''
        };
        onUpdate({ items: [...items, newLocation] });
    };

    const updateLocation = (index: number, field: keyof LocationPage, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        onUpdate({ items: newItems });
    };

    const deleteLocation = (index: number) => {
        if (confirm('Delete this location page?')) {
            const newItems = items.filter((_, i) => i !== index);
            onUpdate({ items: newItems });
        }
    };

    // Helper for rendering input fields
    // Helper for rendering input fields
    const renderField = (label: string, icon: any, value: string, field: keyof LocationPage, index: number, placeholder: string) => (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            {isPrinting ? (
                <div className="w-full text-sm font-medium text-zinc-700 border-b border-zinc-100 py-1 min-h-[1.75rem] flex items-center">
                    {value || '-'}
                </div>
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => updateLocation(index, field, e.target.value)}
                    placeholder={placeholder}
                    disabled={isLocked}
                    className="w-full text-sm font-medium text-zinc-700 bg-transparent border-b border-zinc-200 focus:border-black outline-none py-1 placeholder:text-zinc-200 transition-colors"
                />
            )}
        </div>
    );

    // Ensure at least one page exists
    React.useEffect(() => {
        if (items.length === 0 && !isLocked) {
            const newLocation: LocationPage = {
                id: crypto.randomUUID(),
                mainImage: '',
                smallImage1: '',
                smallImage2: '',
                name: '',
                address: '',
                contact: '',
                rate: '',
                permit: '',
                notes: ''
            };
            onUpdate({ items: [newLocation] });
        }
    }, [items.length]);

    const displayItems = items.length > 0 ? items : [];

    return (
        <>
            {displayItems.map((loc, index) => {
                const isPortrait = orientation === 'portrait';

                // Content Components to reduce duplication
                const renderDetailsSection = () => (
                    <div className="flex-1 flex flex-col gap-5 mt-2">
                        {isPrinting ? (
                            <div className="w-full text-2xl font-black uppercase tracking-tight text-black py-1 leading-none">
                                {loc.name || 'Location Name'}
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={loc.name}
                                onChange={(e) => updateLocation(index, 'name', e.target.value)}
                                placeholder="LOCATION NAME"
                                disabled={isLocked}
                                className="w-full text-2xl font-black uppercase tracking-tight text-black bg-transparent border-none outline-none placeholder:text-zinc-200"
                            />
                        )}

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            {renderField('Address', <MapPin size={12} />, loc.address, 'address', index, '123 Example St')}
                            {renderField('Contacts', <Phone size={12} />, loc.contact, 'contact', index, 'Name / Phone')}
                            {renderField('Day Rate', <DollarSign size={12} />, loc.rate, 'rate', index, '$1,500 / day')}
                            {renderField('Permit', <FileText size={12} />, loc.permit, 'permit', index, 'Permit #123...')}
                        </div>

                        <div className="flex-1 flex flex-col gap-2 min-h-[0px] overflow-hidden">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Notes & Logistics</span>
                            {isPrinting ? (
                                <div className="w-full h-full p-3 text-sm leading-relaxed text-zinc-600 border border-zinc-100 bg-zinc-50/30 whitespace-pre-wrap">
                                    {loc.notes}
                                </div>
                            ) : (
                                <textarea
                                    value={loc.notes}
                                    onChange={(e) => updateLocation(index, 'notes', e.target.value)}
                                    placeholder="Logistics, parking, power..."
                                    disabled={isLocked}
                                    className="w-full h-full bg-zinc-50/50 p-3 text-sm leading-relaxed text-zinc-600 resize-none border border-transparent focus:border-zinc-200 outline-none rounded-sm placeholder:text-zinc-300"
                                />
                            )}
                        </div>
                    </div>
                );

                const renderDeleteButton = () => (
                    !isLocked ? (
                        <button
                            onClick={() => deleteLocation(index)}
                            className="absolute top-0 right-0 p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10 print-hidden"
                            title="Delete Page"
                        >
                            <Trash2 size={16} />
                        </button>
                    ) : null
                );

                return (
                    <DocumentLayout
                        key={loc.id || index}
                        title="Locations"
                        hideHeader={false}
                        plain={plain}
                        metadata={metadata}
                        orientation={orientation}
                        subtitle={displayItems.length > 1 ? `Location ${index + 1}` : ''}
                    >
                        <div className="h-full relative group">
                            {renderDeleteButton()}

                            {isPortrait ? (
                                /* PORTRAIT LAYOUT: Vertical Stack */
                                <div className="flex flex-col gap-6 h-full">
                                    <div className="w-full aspect-[2.35/1] bg-zinc-50 border border-zinc-100 relative overflow-hidden rounded-sm">
                                        <ImageUploader
                                            currentUrl={loc.mainImage}
                                            onUpload={(url) => updateLocation(index, 'mainImage', url)}
                                            className="w-full h-full object-cover"
                                            isLocked={isLocked}
                                            placeholder={<div className="text-zinc-300 flex flex-col items-center gap-2"><Plus size={24} /><span className="text-xs font-bold uppercase tracking-widest">Main View</span></div>}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="w-full aspect-video bg-zinc-50 border border-zinc-100 relative overflow-hidden rounded-sm">
                                            <ImageUploader
                                                currentUrl={loc.smallImage1}
                                                onUpload={(url) => updateLocation(index, 'smallImage1', url)}
                                                className="w-full h-full object-cover"
                                                isLocked={isLocked}
                                                placeholder={<div className="text-zinc-200 text-xs font-bold uppercase tracking-widest">+ Detail</div>}
                                            />
                                        </div>
                                        <div className="w-full aspect-video bg-zinc-50 border border-zinc-100 relative overflow-hidden rounded-sm">
                                            <ImageUploader
                                                currentUrl={loc.smallImage2}
                                                onUpload={(url) => updateLocation(index, 'smallImage2', url)}
                                                className="w-full h-full object-cover"
                                                isLocked={isLocked}
                                                placeholder={<div className="text-zinc-200 text-xs font-bold uppercase tracking-widest">+ Detail</div>}
                                            />
                                        </div>
                                    </div>
                                    {renderDetailsSection()}
                                </div>
                            ) : (
                                /* LANDSCAPE LAYOUT: Two Column */
                                <div className="grid grid-cols-12 gap-8 h-full">
                                    {/* Left: Main Image + Details */}
                                    <div className="col-span-8 flex flex-col gap-6 h-full">
                                        <div className="w-full bg-zinc-50 border border-zinc-100 relative overflow-hidden rounded-sm h-[60%]">
                                            <ImageUploader
                                                currentUrl={loc.mainImage}
                                                onUpload={(url) => updateLocation(index, 'mainImage', url)}
                                                className="w-full h-full object-cover"
                                                isLocked={isLocked}
                                                placeholder={<div className="text-zinc-300 flex flex-col items-center gap-2"><Plus size={24} /><span className="text-xs font-bold uppercase tracking-widest">Main View</span></div>}
                                            />
                                        </div>
                                        {/* In Landscape, Details fit below Main Image */}
                                        <div className="flex-1 relative">
                                            {renderDetailsSection()}
                                        </div>
                                    </div>

                                    {/* Right: Stacked Small Images */}
                                    <div className="col-span-4 flex flex-col gap-4 h-full">
                                        <div className="w-full aspect-video bg-zinc-50 border border-zinc-100 relative overflow-hidden rounded-sm">
                                            <ImageUploader
                                                currentUrl={loc.smallImage1}
                                                onUpload={(url) => updateLocation(index, 'smallImage1', url)}
                                                className="w-full h-full object-cover"
                                                isLocked={isLocked}
                                                placeholder={<div className="text-zinc-200 text-xs font-bold uppercase tracking-widest">+ Detail</div>}
                                            />
                                        </div>
                                        <div className="w-full aspect-video bg-zinc-50 border border-zinc-100 relative overflow-hidden rounded-sm">
                                            <ImageUploader
                                                currentUrl={loc.smallImage2}
                                                onUpload={(url) => updateLocation(index, 'smallImage2', url)}
                                                className="w-full h-full object-cover"
                                                isLocked={isLocked}
                                                placeholder={<div className="text-zinc-200 text-xs font-bold uppercase tracking-widest">+ Detail</div>}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DocumentLayout>
                );
            })}

            {/* Add Location Button (Appears after last page) */}
            {!isLocked && (
                <div className="max-w-md mx-auto py-8 text-center print-hidden">
                    <button
                        onClick={handleAddLocation}
                        className="flex items-center justify-center gap-2 w-full border border-dashed border-zinc-300 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:border-black transition-colors rounded-sm"
                    >
                        <Plus size={14} /> <span>Add Location</span>
                    </button>
                </div>
            )}
        </>
    );
};
