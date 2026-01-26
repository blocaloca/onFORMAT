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
    termsAccepted: boolean;
}

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

    // Initialize defaults
    useEffect(() => {
        if (!data.productionCompany) {
            onUpdate({
                productionCompany: 'CREATIVE OS PRODUCTIONS',
                shootDates: new Date().toISOString().split('T')[0],
                termsAccepted: false
            });
        }
    }, []);

    const updateField = (field: keyof PropertyReleaseData, value: any) => {
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

                {/* Header Info */}
                <div className="border-b-2 border-black pb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Production Company</label>
                            <input
                                value={data.productionCompany || ''}
                                onChange={e => updateField('productionCompany', e.target.value)}
                                className="font-bold text-sm bg-transparent outline-none w-full placeholder:text-zinc-300"
                                placeholder="PRODUCER NAME"
                                disabled={isLocked}
                            />
                        </div>
                        <div className="text-right">
                            <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Shoot Dates</label>
                            <input
                                value={data.shootDates || ''}
                                onChange={e => updateField('shootDates', e.target.value)}
                                className="font-mono font-bold text-sm bg-transparent outline-none text-right placeholder:text-zinc-300"
                                placeholder="YYYY-MM-DD"
                                disabled={isLocked}
                            />
                        </div>
                    </div>
                </div>

                {/* Legal Text */}
                <div className="flex-1 overflow-y-auto text-justify leading-relaxed opacity-80 text-[10px] space-y-3 pr-2">
                    <p>
                        I, the undersigned owner or authorized agent of the property listed below (the "Property"), hereby grant permission to <strong>{data.productionCompany || 'THE PRODUCER'}</strong> (the "Producer") to enter upon and use the Property for the purpose of photographing, filming, and recording in connection with the production currently known as <strong>{metadata?.projectName || 'THE PROJECT'}</strong>.
                    </p>
                    <p>
                        1. <strong>Access and Use:</strong> Producer may bring necessary personnel, equipment, and props onto the Property. Producer agrees to leave the Property in substantially the same condition as found, reasonable wear and tear excepted.
                    </p>
                    <p>
                        2. <strong>Rights:</strong> I grant Producer the right to photograph, film, and record the Property and to use such recordings in any media worldwide, in perpetuity. I waive any right to inspect or approve the finished content.
                    </p>
                    <p>
                        3. <strong>Warranty:</strong> I warrant that I have the full right and authority to enter into this agreement and grant the rights herein.
                    </p>
                    <p>
                        4. <strong>Compensation:</strong> {data.compensation ? `Agreed compensation: ${data.compensation}` : 'I acknowledge that I have received good and valuable consideration, receipt of which is hereby acknowledged.'}
                    </p>
                </div>

                {/* Property Details */}
                <div className="border-t border-black pt-6 bg-zinc-50 p-4 rounded-sm border border-zinc-100">
                    <div className="grid grid-cols-2 gap-6 mb-4">
                        <div className="col-span-2">
                            <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Property Address</label>
                            <input
                                value={data.address || ''}
                                onChange={e => updateField('address', e.target.value)}
                                className="w-full bg-white border border-zinc-200 p-2 rounded text-sm font-bold"
                                placeholder="123 Location St, City, State"
                                disabled={isLocked || !!data.signatureUrl}
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Owner / Agent Name</label>
                            <input
                                value={data.ownerName || ''}
                                onChange={e => updateField('ownerName', e.target.value)}
                                className="w-full bg-white border border-zinc-200 p-2 rounded text-sm"
                                placeholder="Full Name"
                                disabled={isLocked || !!data.signatureUrl}
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Compensation (Optional)</label>
                            <input
                                value={data.compensation || ''}
                                onChange={e => updateField('compensation', e.target.value)}
                                className="w-full bg-white border border-zinc-200 p-2 rounded text-sm"
                                placeholder="$ Amount or Terms"
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
