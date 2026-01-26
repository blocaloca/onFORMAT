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
    const sigPad = useRef<any>(null);
    const [isSaving, setIsSaving] = useState(false);

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
        onUpdate({ signatureUrl: undefined, signedAt: undefined });
    };

    const saveSignature = async () => {
        if (sigPad.current?.isEmpty()) return;

        setIsSaving(true);
        try {
            // 1. Get Base64
            const dataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');

            // 2. Convert to Blob
            const res = await fetch(dataUrl);
            const blob = await res.blob();

            // 3. Upload to Supabase Storage
            const fileName = `signatures/talent-${Date.now()}.png`;
            const { data: uploadData, error } = await supabase.storage
                .from('documents') // Ensure this bucket exists or use 'public'
                .upload(fileName, blob);

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
                            value={localData.productionCompany || ''}
                            onChange={e => handleChange('productionCompany', e.target.value)}
                            onBlur={() => handleBlur('productionCompany')}
                            className="font-bold text-xs bg-transparent outline-none w-full placeholder:text-zinc-300 uppercase tracking-wide"
                            placeholder="PRODUCER NAME"
                            disabled={isLocked}
                        />
                    </div>

                    {/* Toggle Pills - Centered or aligned */}
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
                            value={localData.shootDate || ''}
                            onChange={e => {
                                handleChange('shootDate', e.target.value);
                                onUpdate({ shootDate: e.target.value });
                            }}
                            className="font-mono font-bold text-xs bg-transparent outline-none text-right"
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
                                onChange={e => handleChange(data.isCustom ? 'customLegalText' : 'standardLegalText', e.target.value)}
                                onBlur={() => handleBlur(data.isCustom ? 'customLegalText' : 'standardLegalText')}
                            />
                        )}
                    </div>
                </div>

                {/* Talent Details - Compact Row */}
                <div className="border-t border-black pt-4 mb-4 shrink-0">
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <label className="block text-[8px] font-bold uppercase text-zinc-400 mb-1">Talent Name</label>
                            <input
                                value={localData.talentName || ''}
                                onChange={e => handleChange('talentName', e.target.value)}
                                onBlur={() => handleBlur('talentName')}
                                className="w-full bg-zinc-50 border-b border-zinc-200 p-1 text-xs font-bold focus:border-black outline-none transition-colors"
                                placeholder="Full Name"
                                disabled={isLocked || !!data.signatureUrl}
                            />
                        </div>
                        <div>
                            <label className="block text-[8px] font-bold uppercase text-zinc-400 mb-1">Role</label>
                            <input
                                value={localData.role || ''}
                                onChange={e => handleChange('role', e.target.value)}
                                onBlur={() => handleBlur('role')}
                                className="w-full bg-zinc-50 border-b border-zinc-200 p-1 text-xs focus:border-black outline-none transition-colors"
                                placeholder="Role"
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
                    <label className="block text-[10px] font-bold uppercase text-center mb-2 tracking-widest text-zinc-500">Signature</label>

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
