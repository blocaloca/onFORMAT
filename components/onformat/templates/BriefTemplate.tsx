/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/alt-text */
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

    const inputStyle = "w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 text-sm outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/20 transition-all resize-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 font-sans text-zinc-900 dark:text-white";
    const labelStyle = "block font-bold text-zinc-500 dark:text-zinc-400 mb-2 text-[10px] uppercase tracking-widest";

    const renderField = (key: keyof BriefData, placeholder: string, minHeight: string = 'min-h-[60px]') => {
        let val = data[key];

        // Safety: Handle legacy object/array data to prevent React crash
        if (typeof val === 'object' && val !== null) {
            val = '';
        }

        const textVal = (val as string) || '';
        return (
            <div className="relative group/field">
                <textarea
                    className={`${inputStyle} ${minHeight} print:hidden`}
                    value={textVal}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={placeholder}
                />
                <div className={`${isPrinting ? 'block' : 'hidden print:block'} ${minHeight} w-full text-sm font-sans leading-relaxed text-black dark:text-white whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md p-3`}>
                    {textVal || "—"}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8">
            <DocumentLayout
                title="Creative Brief"
                hideHeader={false}
                metadata={metadata}
                plain={plain}
                orientation={orientation}
                isPrinting={isPrinting}
            >
                <div className="space-y-6 h-full flex flex-col">
                    {/* Strategy Section */}
                    <div className="space-y-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
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

                        <section>
                            <label className={labelStyle}>Key Message</label>
                            {renderField('keyMessage', 'The one thing the audience should remember...', 'min-h-[80px]')}
                        </section>
                    </div>

                    {/* Execution Section */}
                    <div className="space-y-6 pt-2">


                        <section>
                            <label className={labelStyle}>Narrative / Creative Approach</label>
                            {renderField('narrative', 'Describe the story, concept, or creative execution in detail...', 'min-h-[180px]')}
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
                </div>
            </DocumentLayout>
        </div>
    );
};
