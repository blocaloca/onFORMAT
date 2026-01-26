import React, { useRef, useState } from 'react';
import { DocumentLayout } from './DocumentLayout';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from '@/lib/supabase';
import { Trash2, Save, Download } from 'lucide-react';

interface TalentReleaseData {
    productionCompany: string;
    talentName: string;
    role: string;
    shootDate: string;
    email: string;
    phone: string;
    signatureUrl?: string; // Stored URL after upload
    signedAt?: string;
    isCustom?: boolean;
    customLegalText?: string;
    standardLegalText?: string; // Editable standard text
    termsAccepted?: boolean;
    address?: string;
}

const DEFAULT_STANDARD_TEXT = `I, the undersigned, hereby grant permission to THE PRODUCER and its agents, successors, assigns, and licensees (collectively, the "Producer"), to photograph, film, and record my likeness, voice, and performance (the "Materials") in connection with the production currently known as THE PROJECT.

1. Usage Rights: I grant Producer the irrevocable, perpetual, worldwide right to use, reproduce, modify, distribute, and display the Materials in any media now known or hereafter created, including but not limited to television, theatrical, digital, streaming, and social media platforms, for any purpose, including advertising, promotion, and trade.

2. Compensation: I acknowledge that I have received all agreed-upon compensation (if any) and that no further payment is due.

3. Waiver: I waive any right to inspect or approve the finished product or any advertising copy or printed matter that may be used in connection therewith. I release Producer from any liability associated with the use of the Materials, including claims for invasion of privacy or right of publicity.

I represent that I am over 18 years of age and have the right to enter into this agreement. If under 18, a parent or guardian must sign below.`;

interface TalentReleaseTemplateProps {
    data: Partial<TalentReleaseData>;
    onUpdate: (data: Partial<TalentReleaseData>) => void;
    isLocked?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
    isPrinting?: boolean;
}

export const TalentReleaseTemplate = ({ data, onUpdate, isLocked = false, plain, orientation, metadata, isPrinting = false }: TalentReleaseTemplateProps) => {

    const [localData, setLocalData] = useState(data);
    const sigPad = useRef<any>(null); // Kept for type compatibility if needed, though we removed usage? No, I see ref usage removed.
    const [isSaving, setIsSaving] = useState(false);
    const [typedName, setTypedName] = useState('');

    // Sync local state when props change (externally)
    React.useEffect(() => {
        setLocalData(data);
    }, [data.talentName, data.role, data.email, data.phone, data.productionCompany, data.shootDate, data.customLegalText, data.standardLegalText, data.isCustom]);

    // Initialize defaults
    React.useEffect(() => {
        if (!data.productionCompany) {
            onUpdate({
                productionCompany: 'CREATIVE OS PRODUCTIONS',
                shootDate: new Date().toISOString().split('T')[0],
                termsAccepted: false,
                isCustom: false,
                customLegalText: ''
            });
        }
    }, []);

    const handleBlur = (field: keyof TalentReleaseData) => {
        if (localData[field] !== data[field]) {
            onUpdate({ [field]: localData[field] });
        }
    };

    const handleChange = (field: keyof TalentReleaseData, value: any) => {
        setLocalData(prev => ({ ...prev, [field]: value }));
    };

    const toggleCustomLegal = () => {
        if (isLocked) return;
        const newVal = !data.isCustom;
        onUpdate({ isCustom: newVal });
    };

    const clearSignature = () => {
        sigPad.current?.clear();
        setTypedName('');
        onUpdate({ signatureUrl: undefined, signedAt: undefined });
    };

    const updateField = (field: keyof TalentReleaseData, value: any) => {
        onUpdate({ [field]: value });
    };

    // Helper to convert base64 dataURL to Blob directly
    const dataURLToBlob = (dataURL: string) => {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    const saveSignature = async () => {
        if (!typedName.trim()) {
            alert("Please type your name to sign.");
            return;
        }

        setIsSaving(true);
        try {
            // Generate image from typed name
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, 400, 100);
                ctx.font = 'italic bold 48px "Style Script", cursive, sans-serif';
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(typedName, 200, 50);
            }
            const dataUrl = canvas.toDataURL('image/png');
            const blob = dataURLToBlob(dataUrl);

            // 3. Upload to Supabase Storage
            const fileName = `signatures/talent-${Date.now()}.png`;
            const { data: uploadData, error } = await supabase.storage
                .from('documents')
                .upload(fileName, blob, { upsert: true, contentType: 'image/png' });

            if (error) {
                console.error('Upload Error', error);
                if (error.message?.includes("Bucket not found") || error.message?.toLowerCase().includes("row not found")) {
                    alert("Configuration Error: The 'documents' storage bucket is missing. Please run the 'create_documents_bucket.sql' migration.");
                } else {
                    alert(`Failed to save signature: ${error.message}`);
                }
                return;
            }

            // 4. Get Public URL
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
            title="Talent Release Form"
            hideHeader={false}
            plain={plain}
            orientation={orientation}
            metadata={metadata}
        >
            <div className={`space-y-6 text-xs font-sans h-full flex flex-col max-w-2xl mx-auto ${isPrinting ? 'text-black' : 'text-zinc-800'}`}>

                {/* Compact Header & Controls */}
                <div className="flex items-end justify-between border-b-2 border-black pb-2 mb-4 shrink-0">
                    <div className="flex-1 max-w-[50%]">
                        <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Producer / Production Company</label>
                        <input
                            value={data.productionCompany || ''}
                            onChange={e => updateField('productionCompany', e.target.value)}
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
                        <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Date</label>
                        <input
                            type="date"
                            value={data.shootDate || ''}
                            onChange={e => updateField('shootDate', e.target.value)}
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
                                {data.isCustom ? (data.customLegalText || "No custom terms provided.") : (localData.standardLegalText || DEFAULT_STANDARD_TEXT)}
                            </p>
                        ) : (
                            <textarea
                                className="w-full h-full bg-transparent text-[10px] leading-relaxed resize-none outline-none placeholder:text-zinc-300 font-serif text-justify"
                                placeholder={data.isCustom ? "Paste custom release text here..." : "Edit standard release text..."}
                                value={data.isCustom ? (localData.customLegalText || '') : (localData.standardLegalText || DEFAULT_STANDARD_TEXT)}
                                onChange={e => updateField(data.isCustom ? 'customLegalText' : 'standardLegalText', e.target.value)}
                            />
                        )}
                    </div>
                </div>

                {/* Talent Details */}
                <div className="border-t border-black pt-4 mb-4 shrink-0">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="col-span-1">
                            <label className="block text-[8px] font-bold uppercase text-zinc-400 mb-1">Talent Name</label>
                            <input
                                value={data.talentName || ''}
                                onChange={e => updateField('talentName', e.target.value)}
                                className="w-full bg-zinc-50 border-b border-zinc-200 p-1 text-xs font-bold focus:border-black outline-none transition-colors"
                                placeholder="Full Name"
                                disabled={isLocked || !!data.signatureUrl}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[8px] font-bold uppercase text-zinc-400 mb-1">Role / Character</label>
                            <input
                                value={data.role || ''}
                                onChange={e => updateField('role', e.target.value)}
                                className="w-full bg-zinc-50 border-b border-zinc-200 p-1 text-xs focus:border-black outline-none transition-colors"
                                placeholder="Role"
                                disabled={isLocked || !!data.signatureUrl}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[8px] font-bold uppercase text-zinc-400 mb-1">Address / Contact</label>
                            <input
                                value={data.address || ''}
                                onChange={e => updateField('address', e.target.value)}
                                className="w-full bg-zinc-50 border-b border-zinc-200 p-1 text-xs focus:border-black outline-none transition-colors"
                                placeholder="Address or Email"
                                disabled={isLocked || !!data.signatureUrl}
                            />
                        </div>
                    </div>
                </div>

                {/* Signature Section */}
                <div className="border-t-2 border-black pt-4">
                    <label className="block text-[10px] font-bold uppercase text-center mb-2 tracking-widest text-zinc-500">Talent Signature</label>

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
                            <div className="border border-zinc-300 rounded bg-white shadow-sm overflow-hidden w-full max-w-[400px] p-4 flex flex-col items-center">
                                <label className="text-[9px] uppercase font-bold text-zinc-400 mb-2 w-full text-center">Type Name to Sign</label>
                                <input
                                    value={typedName}
                                    onChange={e => setTypedName(e.target.value)}
                                    className="w-full text-center font-bold text-lg bg-zinc-50 border-b-2 border-zinc-200 outline-none focus:border-emerald-500 transition-colors py-2 mb-2 font-mono"
                                    placeholder="Type Full Name"
                                />
                                <p className="text-[9px] text-zinc-400 text-center max-w-xs">
                                    By typing your name, you acknowledge this as your legal electronic signature.
                                </p>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => setTypedName('')}
                                    className="flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-400 hover:text-black px-3 py-1 bg-zinc-100 rounded"
                                >
                                    Clear
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
