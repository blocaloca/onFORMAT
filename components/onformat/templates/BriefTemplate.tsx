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

    const inputStyle = "w-full bg-zinc-50 border border-zinc-200 rounded-md p-3 text-sm outline-none focus:ring-1 focus:ring-zinc-400 transition-all resize-none placeholder:text-zinc-400 font-sans text-zinc-900";
    const labelStyle = "block font-bold text-zinc-500 mb-2 text-[10px] uppercase tracking-widest";

    const renderField = (key: keyof BriefData, placeholder: string, minHeight: string = 'min-h-[60px]') => {
        let val = data[key];

        // Safety: Handle legacy object/array data to prevent React crash
        if (typeof val === 'object' && val !== null) {
            val = '';
        }

        const textVal = (val as string) || '';
        return (
            <div className="relative group/field">
                {!isPrinting && (
                    <textarea
                        className={`${inputStyle} ${minHeight} print:hidden`}
                        value={textVal}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={placeholder}
                    />
                )}
                <div className={`${isPrinting ? 'block' : 'hidden print:block'} ${minHeight} w-full text-sm font-sans leading-relaxed text-black whitespace-pre-wrap bg-zinc-50 border border-zinc-200 rounded-md p-3`}>
                    {textVal || "—"}
                </div>
            </div>
        );
    };

    const pages = [
        {
            title: "Creative Brief",
            sections: [
                { label: 'Vision', field: 'product', placeholder: 'Vision Summary...', minHeight: 'min-h-[80px]' },
                { label: 'Objective', field: 'objective', placeholder: 'Primary goal...', minHeight: 'min-h-[60px]' },
                { label: 'Target Audience', field: 'targetAudience', placeholder: 'Who are we talking to?', minHeight: 'min-h-[80px]' },
                { label: 'Tone & Style', field: 'tone', placeholder: 'Adjectives describing the feel...', minHeight: 'min-h-[80px]' },
                { label: 'Key Message', field: 'keyMessage', placeholder: 'The one thing to remember...', minHeight: 'min-h-[80px]' },
            ]
        },
        {
            title: "Creative Brief",
            sections: [
                { label: 'Narrative / Creative Approach', field: 'narrative', placeholder: 'Describe the story in detail...', minHeight: 'min-h-[220px]' },
                { label: 'Talent / Casting', field: 'talent', placeholder: 'Key roles, demographic...', minHeight: 'min-h-[100px]' },
                { label: 'Location / Setting', field: 'location', placeholder: 'Where is this taking place?', minHeight: 'min-h-[100px]' },
                { label: 'Deliverables', field: 'deliverables', placeholder: 'Required assets...', minHeight: 'min-h-[100px]' },
            ]
        }
    ];

    // --- EDITOR VIEW ---
    if (!isPrinting) {
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
                        <div className="space-y-6">
                            {pages[0].sections.map(s => (
                                <section key={s.field}>
                                    <label className={labelStyle}>{s.label}</label>
                                    {renderField(s.field as keyof BriefData, s.placeholder, s.minHeight)}
                                </section>
                            ))}
                            <div className="border-b border-zinc-100 my-4" />
                            {pages[1].sections.map(s => (
                                <section key={s.field}>
                                    <label className={labelStyle}>{s.label}</label>
                                    {renderField(s.field as keyof BriefData, s.placeholder, s.minHeight)}
                                </section>
                            ))}
                        </div>
                    </div>
                </DocumentLayout>
            </div>
        );
    }

    // --- PRINTING VIEW (PAGINATED) ---
    return (
        <div className="flex flex-col gap-8">
            {pages.map((page, idx) => {
                const isExecutionPage = idx === 1;
                const narrativeText = data.narrative || '';
                const CHAR_LIMIT = 1800;

                // Only split narrative if it's the execution page and text is long
                if (isExecutionPage && narrativeText.length > CHAR_LIMIT) {
                    const pages_split = [];
                    let remaining = narrativeText;
                    while (remaining.length > 0) {
                        if (remaining.length <= CHAR_LIMIT) {
                            pages_split.push(remaining);
                            break;
                        }
                        let breakIdx = remaining.lastIndexOf('\n', CHAR_LIMIT);
                        if (breakIdx === -1 || breakIdx < CHAR_LIMIT * 0.5) breakIdx = remaining.lastIndexOf(' ', CHAR_LIMIT);
                        if (breakIdx === -1) breakIdx = CHAR_LIMIT;
                        pages_split.push(remaining.substring(0, breakIdx));
                        remaining = remaining.substring(breakIdx).trim();
                    }

                    return pages_split.map((chunk, chunkIdx) => (
                        <DocumentLayout
                            key={`exec-${chunkIdx}`}
                            title={page.title}
                            hideHeader={false}
                            metadata={metadata}
                            plain={plain}
                            orientation={orientation}
                            isPrinting={isPrinting}
                            subtitle={chunkIdx > 0 ? `(Cont. ${chunkIdx})` : ``}
                        >
                            <div className="space-y-6 h-full flex flex-col">
                                <div className="space-y-6">
                                    {chunkIdx === 0 ? (
                                        // First execution page: Narrative (part 1) + Talent/Location/Deliverables
                                        <>
                                            <section>
                                                <label className={labelStyle}>Narrative / Creative Approach</label>
                                                <div className="text-sm font-sans leading-relaxed text-black whitespace-pre-wrap bg-zinc-50 border border-zinc-200 rounded-md p-3 min-h-[220px]">
                                                    {chunk}
                                                </div>
                                            </section>
                                            <section>
                                                <label className={labelStyle}>Talent / Casting</label>
                                                {renderField('talent', '...', 'min-h-[100px]')}
                                            </section>
                                            <section>
                                                <label className={labelStyle}>Location / Setting</label>
                                                {renderField('location', '...', 'min-h-[100px]')}
                                            </section>
                                            <section>
                                                <label className={labelStyle}>Deliverables</label>
                                                {renderField('deliverables', '...', 'min-h-[100px]')}
                                            </section>
                                        </>
                                    ) : (
                                        // Continuation pages: Only Narrative
                                        <section>
                                            <label className={labelStyle}>Narrative / Creative Approach (Cont.)</label>
                                            <div className="text-sm font-sans leading-relaxed text-black whitespace-pre-wrap bg-zinc-50 border border-zinc-200 rounded-md p-3 min-h-[500px]">
                                                {chunk}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </div>
                        </DocumentLayout>
                    ));
                }

                return (
                    <DocumentLayout
                        key={idx}
                        title={page.title}
                        hideHeader={false}
                        metadata={metadata}
                        plain={plain}
                        orientation={orientation}
                        isPrinting={isPrinting}
                        subtitle={""}
                    >
                        <div className="space-y-6 h-full flex flex-col">
                            <div className="space-y-6">
                                {page.sections.map(s => (
                                    <section key={s.field}>
                                        <label className={labelStyle}>{s.label}</label>
                                        {renderField(s.field as keyof BriefData, s.placeholder, s.minHeight)}
                                    </section>
                                ))}
                            </div>
                        </div>
                    </DocumentLayout>
                );
            })}
        </div>
    );
};
