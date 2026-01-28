import React, { useEffect } from 'react';
import { DocumentLayout } from './DocumentLayout';

interface BriefData {
    projectName: string;
    client: string;
    projectType: string;
    product: string; // Vision
    objective: string;
    targetAudience: string;
    keyMessage: string;
    tone: string;
    narrative: string; // New
    talent: string;    // New
    location: string;  // New
    deliverables: string; // Changed from array to string
}

export const BriefTemplate = ({ data, onUpdate, persona, isPrinting, plain, orientation, metadata }: {
    data: Partial<BriefData>;
    onUpdate?: (d: Partial<BriefData>) => void;
    persona?: string;
    isPrinting?: boolean;
    plain?: boolean;
    orientation?: 'portrait' | 'landscape';
    metadata?: any;
}) => {

    // Migration Effect for Legacy Deliverables (Array -> String)
    useEffect(() => {
        if (Array.isArray(data.deliverables)) {
            const list = data.deliverables as any[];
            const text = list.map(i => i.item ? `- ${i.item} (${i.usage || ''})` : '').join('\n');
            onUpdate?.({ deliverables: text });
        }
    }, [data.deliverables, onUpdate]);

    const handleChange = (field: keyof BriefData, value: string) => {
        onUpdate?.({ [field]: value });
    };

    const inputStyle = "w-full bg-zinc-50 border border-zinc-200 p-3 text-xs outline-none focus:border-black resize-none placeholder-zinc-300 min-h-[60px] font-sans";
    const labelStyle = "block font-bold text-zinc-500 mb-2 text-[10px] uppercase tracking-widest";

    const renderField = (key: keyof BriefData, placeholder: string, minHeight: string = 'min-h-[60px]') => {
        let val = data[key];

        // Safety: Handle legacy object/array data to prevent React crash
        // The migration useEffect will convert this to string shortly
        if (typeof val === 'object' && val !== null) {
            val = '';
        }

        const textVal = (val as string) || '';
        return (
            <>
                <textarea
                    className={`${inputStyle} ${minHeight} ${isPrinting ? 'hidden' : 'print:hidden'}`}
                    value={textVal}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={placeholder}
                />
                <div className={`${isPrinting ? 'block' : 'hidden print:block'} w-full text-xs leading-relaxed text-black whitespace-pre-wrap bg-zinc-50 border border-zinc-200 p-3 rounded-sm min-h-[40px]`}>
                    {textVal || "—"}
                </div>
            </>
        );
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Page 1: Strategy & Core Identity */}
            <DocumentLayout
                title="Creative Brief"
                hideHeader={false}
                metadata={metadata}
                plain={plain}
                orientation={orientation}
            >
                <div className="space-y-6 h-full flex flex-col">
                    <section>
                        <label className={labelStyle}>Vision</label>
                        {renderField('product', 'Vision Summary... (Auto-filled from Project Vision)', 'min-h-[80px]')}
                    </section>

                    <section>
                        <label className={labelStyle}>Objective</label>
                        {renderField('objective', 'What is the primary goal of this project?', 'min-h-[60px]')}
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section>
                            <label className={labelStyle}>Target Audience</label>
                            {renderField('targetAudience', 'Who are we talking to?', 'min-h-[80px]')}
                        </section>

                        <section>
                            <label className={labelStyle}>Tone & Style</label>
                            {renderField('tone', 'Adjectives describing the feel...', 'min-h-[80px]')}
                        </section>
                    </div>

                    <section className="flex-1">
                        <label className={labelStyle}>Key Message</label>
                        {renderField('keyMessage', 'The one thing the audience should remember...', 'min-h-[80px]')}
                    </section>
                </div>
            </DocumentLayout>

            {/* Page 2: Execution & Logistics */}
            <DocumentLayout
                title="Creative Brief"
                subtitle="Execution Plan"
                hideHeader={false} // Show header on second page too for professionalism
                metadata={undefined} // Hide redundant metadata block if preferred, or keep
                plain={plain}
                orientation={orientation}
            >
                <div className="space-y-6 h-full flex flex-col">
                    <section className="flex-1">
                        <label className={labelStyle}>Narrative / Creative Approach</label>
                        {renderField('narrative', 'Describe the story, concept, or creative execution in detail...', 'min-h-[180px] h-[90%]')}
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section>
                            <label className={labelStyle}>Talent / Casting</label>
                            {renderField('talent', 'Key roles, demographic, look...', 'min-h-[100px]')}
                        </section>

                        <section>
                            <label className={labelStyle}>Location / Setting</label>
                            {renderField('location', 'Where is this taking place? Studio, outdoor, specific spots...', 'min-h-[100px]')}
                        </section>
                    </div>

                    <section>
                        <label className={labelStyle}>Deliverables</label>
                        {renderField('deliverables', 'List required assets, formats, and aspect ratios...', 'min-h-[100px]')}
                    </section>
                </div>
            </DocumentLayout>
        </div>
    );
};
