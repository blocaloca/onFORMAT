import React, { useRef, useState, useEffect } from 'react';
import { DocumentLayout } from './DocumentLayout';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from '@/lib/supabase';
import { Trash2, Save } from 'lucide-react';

interface PropertyReleaseData {
    productionCompany: string;
    propertyName: string;
    address: string;
    ownerName: string;
    shootDates: string;
    compensation: string;
    email: string;
    phone: string;
    signatureUrl?: string;
    signedAt?: string;
    termsAccepted?: boolean;
    isCustom?: boolean;
    customLegalText?: string;
    standardLegalText?: string;
}

const DEFAULT_PROPERTY_TEXT = `I, the undersigned owner or authorized agent of the property listed below (the "Property"), hereby grant permission to THE PRODUCER (the "Producer") to enter upon and use the Property for the purpose of photographing, filming, and recording in connection with the production currently known as THE PROJECT.

1. Access and Use: Producer may bring necessary personnel, equipment, and props onto the Property. Producer agrees to leave the Property in substantially the same condition as found, reasonable wear and tear excepted.

2. Rights: I grant Producer the right to photograph, film, and record the Property and to use such recordings in any media worldwide, in perpetuity. I waive any right to inspect or approve the finished content.

3. Warranty: I warrant that I have the full right and authority to enter into this agreement and grant the rights herein.

4. Compensation: I acknowledge that I have received good and valuable consideration, receipt of which is hereby acknowledged.`;

interface PropertyReleaseTemplateProps {
    data: Partial<PropertyReleaseData>;
    onUpdate: (data: Partial<PropertyReleaseData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

export const PropertyReleaseTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting = false }: PropertyReleaseTemplateProps) => {

    const sigPad = useRef<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [localData, setLocalData] = useState(data);

    // Sync local state
    useEffect(() => {
        setLocalData(data);
    }, [data.productionCompany, data.propertyName, data.address, data.ownerName, data.shootDates, data.compensation, data.email, data.phone, data.customLegalText, data.standardLegalText, data.isCustom]);

    // Initialize defaults
    useEffect(() => {
        if (!data.productionCompany) {
            onUpdate({
                productionCompany: 'CREATIVE OS PRODUCTIONS',
                shootDates: new Date().toISOString().split('T')[0],
                termsAccepted: false,
                isCustom: false,
                standardLegalText: DEFAULT_PROPERTY_TEXT
            });
        }
    }, []);

    const handleBlur = (field: keyof PropertyReleaseData) => {
        if (localData[field] !== data[field]) {
            onUpdate({ [field]: localData[field] });
        }
    };

    const handleChange = (field: keyof PropertyReleaseData, value: any) => {
        setLocalData(prev => ({ ...prev, [field]: value }));
    };

    // ... Signature logic kept as is but updateField removed since we use handleChange/handleBlur now ...
    const clearSignature = () => {
        sigPad.current?.clear();
        onUpdate({ signatureUrl: undefined, signedAt: undefined });
    };

    const saveSignature = async () => {
        if (sigPad.current?.isEmpty()) return;

        setIsSaving(true);
        try {
            const dataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const fileName = `signatures/property-${Date.now()}.png`;

            const { error } = await supabase.storage
                .from('documents')
                .upload(fileName, blob);

            if (error) {
                console.error('Upload Error', error);
                alert('Failed to save signature. Please try again.');
                return;
            }

            const { data: list } = supabase.storage.from('documents').getPublicUrl(fileName);

            onUpdate({
                signatureUrl: list.publicUrl,
                signedAt: new Date().toISOString()
            });

        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DocumentLayout
            title="Location / Property Release"
            hideHeader={false}
            plain={plain}
            orientation={orientation}
            metadata={metadata}
        >
            <div className={`space-y-6 text-xs font-sans h-full flex flex-col max-w-2xl mx-auto ${isPrinting ? 'text-black' : 'text-zinc-800'}`}>

                {/* Compact Header & Controls */}
                <div className="flex items-end justify-between border-b-2 border-black pb-2 mb-4 shrink-0">
                    <div className="flex-1 max-w-[50%]">
                        <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Production Company</label>
                        <input
                            value={localData.productionCompany || ''}
                            onChange={e => handleChange('productionCompany', e.target.value)}
                            onBlur={() => handleBlur('productionCompany')}
                            className="font-bold text-xs bg-transparent outline-none w-full placeholder:text-zinc-300 uppercase tracking-wide"
                            placeholder="PRODUCER NAME"
                            disabled={isLocked}
                        />
                    </div>

                    {/* Toggle Pills */}
                    {!isPrinting && !isLocked && (
                        <div className="flex gap-1 mx-4">
                            <button
                                onClick={() => onUpdate({ isCustom: false })}
                                className={`text-[8px] font-bold uppercase px-2 py-1 rounded-sm border transition-all ${!data.isCustom ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300'}`}
                            >
                                Standard
                            </button>
                            <button
                                onClick={() => onUpdate({ isCustom: true })}
                                className={`text-[8px] font-bold uppercase px-2 py-1 rounded-sm border transition-all ${data.isCustom ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300'}`}
                            >
                                Custom
                            </button>
                        </div>
                    )}

                    <div className="flex-1 text-right">
                        <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Shoot Dates</label>
                        <input
                            value={localData.shootDates || ''}
                            onChange={e => handleChange('shootDates', e.target.value)}
                            onBlur={() => handleBlur('shootDates')}
                            className="font-mono font-bold text-xs bg-transparent outline-none text-right"
                            placeholder="YYYY-MM-DD"
                            disabled={isLocked}
                        />
                    </div>
                </div>

                {/* Legal Text - Maximized Space */}
                <div className="flex-1 relative min-h-0 mb-4 border border-zinc-100 rounded bg-zinc-50/50 p-4">
                    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                        {isLocked || isPrinting ? (
                            <p className="whitespace-pre-wrap text-justify leading-relaxed opacity-90 text-[10px] font-serif">
                                {data.isCustom ? (data.customLegalText || "No custom terms provided.") : (localData.standardLegalText || DEFAULT_PROPERTY_TEXT)}
                            </p>
                        ) : (
                            <textarea
                                className="w-full h-full bg-transparent text-[10px] leading-relaxed resize-none outline-none placeholder:text-zinc-300 font-serif text-justify"
                                placeholder={data.isCustom ? "Paste custom release text here..." : "Edit standard release text..."}
                                value={data.isCustom ? (localData.customLegalText || '') : (localData.standardLegalText || DEFAULT_PROPERTY_TEXT)}
                                onChange={e => handleChange(data.isCustom ? 'customLegalText' : 'standardLegalText', e.target.value)}
                                onBlur={() => handleBlur(data.isCustom ? 'customLegalText' : 'standardLegalText')}
                            />
                        )}
                    </div>
                </div>

                {/* Property Details - Compact Row */}
                <div className="border-t border-black pt-4 mb-4 shrink-0">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="col-span-2">
                            <label className="block text-[8px] font-bold uppercase text-zinc-400 mb-1">Property Address</label>
                            <input
                                value={localData.address || ''}
                                onChange={e => handleChange('address', e.target.value)}
                                onBlur={() => handleBlur('address')}
                                className="w-full bg-zinc-50 border-b border-zinc-200 p-1 text-xs font-bold focus:border-black outline-none transition-colors"
                                placeholder="123 Location St, City, State"
                                disabled={isLocked || !!data.signatureUrl}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <label className="block text-[8px] font-bold uppercase text-zinc-400 mb-1">Owner Name</label>
                            <input
                                value={localData.ownerName || ''}
                                onChange={e => handleChange('ownerName', e.target.value)}
                                onBlur={() => handleBlur('ownerName')}
                                className="w-full bg-zinc-50 border-b border-zinc-200 p-1 text-xs focus:border-black outline-none transition-colors"
                                placeholder="Full Name"
                                disabled={isLocked || !!data.signatureUrl}
                            />
                        </div>
                        <div>
                            <label className="block text-[8px] font-bold uppercase text-zinc-400 mb-1">Compensation</label>
                            <input
                                value={localData.compensation || ''}
                                onChange={e => handleChange('compensation', e.target.value)}
                                onBlur={() => handleBlur('compensation')}
                                className="w-full bg-zinc-50 border-b border-zinc-200 p-1 text-xs focus:border-black outline-none transition-colors"
                                placeholder="$ Amount"
                                disabled={isLocked || !!data.signatureUrl}
                            />
                        </div>
                        <div>
                            <label className="block text-[8px] font-bold uppercase text-zinc-400 mb-1">Email</label>
                            <input
                                value={localData.email || ''}
                                onChange={e => handleChange('email', e.target.value)}
                                onBlur={() => handleBlur('email')}
                                className="w-full bg-zinc-50 border-b border-zinc-200 p-1 text-xs focus:border-black outline-none transition-colors"
                                placeholder="Email"
                                disabled={isLocked || !!data.signatureUrl}
                            />
                        </div>
                        <div>
                            <label className="block text-[8px] font-bold uppercase text-zinc-400 mb-1">Phone</label>
                            <input
                                value={localData.phone || ''}
                                onChange={e => handleChange('phone', e.target.value)}
                                onBlur={() => handleBlur('phone')}
                                className="w-full bg-zinc-50 border-b border-zinc-200 p-1 text-xs focus:border-black outline-none transition-colors"
                                placeholder="Phone"
                                disabled={isLocked || !!data.signatureUrl}
                            />
                        </div>
                    </div>
                </div>

                {/* Signature Section */}
                <div className="border-t-2 border-black pt-4">
                    <label className="block text-[10px] font-bold uppercase text-center mb-2 tracking-widest text-zinc-500">Owner Signature</label>

                    {data.signatureUrl ? (
                        <div className="flex flex-col items-center">
                            <img src={data.signatureUrl} alt="Signature" className="h-24 w-auto object-contain border-b border-zinc-300 pb-2" />
                            <p className="text-[9px] font-mono text-zinc-400 mt-1">Signed at: {new Date(data.signedAt!).toLocaleString()}</p>

                            {!isLocked && !isPrinting && (
                                <button
                                    onClick={clearSignature}
                                    className="mt-4 text-xs text-red-500 underline hover:text-red-600"
                                >
                                    Clear & Re-sign
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={`flex flex-col items-center gap-2 ${isPrinting ? 'hidden' : 'block'}`}>
                            <div className="border border-zinc-300 rounded bg-white shadow-sm overflow-hidden w-full max-w-[400px]">
                                <SignatureCanvas
                                    ref={sigPad}
                                    penColor="black"
                                    canvasProps={{
                                        width: 400,
                                        height: 150,
                                        className: 'sigCanvas cursor-crosshair'
                                    }}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => sigPad.current?.clear()}
                                    className="flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-400 hover:text-black px-3 py-1 bg-zinc-100 rounded"
                                >
                                    <Trash2 size={12} /> Clear
                                </button>
                                <button
                                    onClick={saveSignature}
                                    disabled={isSaving}
                                    className="flex items-center gap-1 text-[10px] font-bold uppercase text-white bg-black hover:bg-zinc-800 px-4 py-1 rounded transition-colors"
                                >
                                    {isSaving ? 'Saving...' : <><Save size={12} /> Sign & Lock</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Print Placeholder for blank signature */}
                    {!data.signatureUrl && isPrinting && (
                        <div className="border-b border-black h-24 w-full mt-4" />
                    )}
                </div>

            </div>
        </DocumentLayout>
    );
};
