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
    termsAccepted: boolean;
}

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

    const sigPad = useRef<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize defaults
    React.useEffect(() => {
        if (!data.productionCompany) {
            onUpdate({
                productionCompany: 'CREATIVE OS PRODUCTIONS',
                shootDate: new Date().toISOString().split('T')[0],
                termsAccepted: false
            });
        }
    }, []);

    const updateField = (field: keyof TalentReleaseData, value: any) => {
        onUpdate({ [field]: value });
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
                alert('Failed to save signature. Please try again.');
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

                {/* Header Info */}
                <div className="border-b-2 border-black pb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Production Company / Producer</label>
                            <input
                                value={data.productionCompany || ''}
                                onChange={e => updateField('productionCompany', e.target.value)}
                                className="font-bold text-sm bg-transparent outline-none w-full placeholder:text-zinc-300"
                                placeholder="PRODUCER NAME"
                                disabled={isLocked}
                            />
                        </div>
                        <div className="text-right">
                            <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Date</label>
                            <input
                                type="date"
                                value={data.shootDate || ''}
                                onChange={e => updateField('shootDate', e.target.value)}
                                className="font-mono font-bold text-sm bg-transparent outline-none text-right"
                                disabled={isLocked}
                            />
                        </div>
                    </div>
                </div>

                {/* Legal Text */}
                <div className="flex-1 overflow-y-auto text-justify leading-relaxed opacity-80 text-[10px] space-y-3 pr-2">
                    <p>
                        I, the undersigned, hereby grant permission to <strong>{data.productionCompany || 'THE PRODUCER'}</strong> and its agents, successors, assigns, and licensees (collectively, the "Producer"), to photograph, film, and record my likeness, voice, and performance (the "Materials") in connection with the production currently known as <strong>{metadata?.projectName || 'THE PROJECT'}</strong>.
                    </p>
                    <p>
                        1. <strong>Usage Rights:</strong> I grant Producer the irrevocable, perpetual, worldwide right to use, reproduce, modify, distribute, and display the Materials in any media now known or hereafter created, including but not limited to television, theatrical, digital, streaming, and social media platforms, for any purpose, including advertising, promotion, and trade.
                    </p>
                    <p>
                        2. <strong>Compensation:</strong> I acknowledge that I have received all agreed-upon compensation (if any) and that no further payment is due.
                    </p>
                    <p>
                        3. <strong>Waiver:</strong> I waive any right to inspect or approve the finished product or any advertising copy or printed matter that may be used in connection therewith. I release Producer from any liability associated with the use of the Materials, including claims for invasion of privacy or right of publicity.
                    </p>
                    <p>
                        I represent that I am over 18 years of age and have the right to enter into this agreement. If under 18, a parent or guardian must sign below.
                    </p>
                </div>

                {/* Talent Details */}
                <div className="border-t border-black pt-6 bg-zinc-50 p-4 rounded-sm border border-zinc-100">
                    <div className="grid grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Talent Name</label>
                            <input
                                value={data.talentName || ''}
                                onChange={e => updateField('talentName', e.target.value)}
                                className="w-full bg-white border border-zinc-200 p-2 rounded text-sm font-bold"
                                placeholder="Full Name"
                                disabled={isLocked || !!data.signatureUrl}
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Role / Character</label>
                            <input
                                value={data.role || ''}
                                onChange={e => updateField('role', e.target.value)}
                                className="w-full bg-white border border-zinc-200 p-2 rounded text-sm"
                                placeholder="e.g. Hero, Extra"
                                disabled={isLocked || !!data.signatureUrl}
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Email</label>
                            <input
                                value={data.email || ''}
                                onChange={e => updateField('email', e.target.value)}
                                className="w-full bg-white border border-zinc-200 p-2 rounded text-sm"
                                placeholder="email@example.com"
                                disabled={isLocked || !!data.signatureUrl}
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Phone</label>
                            <input
                                value={data.phone || ''}
                                onChange={e => updateField('phone', e.target.value)}
                                className="w-full bg-white border border-zinc-200 p-2 rounded text-sm"
                                placeholder="(555) 555-5555"
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
