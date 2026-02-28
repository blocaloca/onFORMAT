/* eslint-disable @typescript-eslint/no-explicit-any, jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { PdfHeader, PdfFooter } from './PdfComponents';
import { globalPDFStyles, COLORS } from './globalPDFStyles';

// --- Types ---
interface FactoryProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: any[]; // Playlist items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    phases: any;  // Global data store
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    coverSettings: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    brandSettings?: any; // New Injection Point
}

// --- Universal Unwrapper (Factory Version - Returns Array) ---
const getStackForTool = (toolId: string, phases: any) => {
    if (!phases) return [];

    let foundData: any = null;
    const priorityOrder = ['POST', 'ON_SET', 'PRE_PRODUCTION', 'DEVELOPMENT'];

    for (const phaseKey of priorityOrder) {
        const phase = phases[phaseKey] || phases[phaseKey.toLowerCase()];
        if (phase?.drafts?.[toolId]) {
            foundData = phase.drafts[toolId];
            break;
        }
    }

    // Fallback Search
    if (!foundData) {
        for (const phase of Object.values(phases)) {
            // @ts-expect-error: Intentionally loose typing for legacy phase structure
            if (phase?.drafts?.[toolId]) {
                // @ts-expect-error: Intentionally loose typing for legacy phase structure
                foundData = phase.drafts[toolId];
                break;
            }
        }
    }

    if (!foundData) return [];

    try {
        const parsed = typeof foundData === 'string' ? JSON.parse(foundData) : foundData;
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
        console.error(`Error parsing PDF data for ${toolId}`, e);
        return [];
    }
};

// --- Cover Page Component ---
const CoverPage = ({ settings, logo }: { settings: any, logo?: string }) => (
    <Page size="LETTER" orientation={settings.orientation || 'portrait'} style={[globalPDFStyles.page, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{ marginBottom: 40, alignItems: 'center' }}>
            {/* Optional Logo */}
            {logo && (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image
                    src={logo}
                    style={{ width: 64, height: 64, marginBottom: 24, objectFit: 'contain' }}
                />
            )}

            <Text style={{ fontSize: 48, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', color: COLORS.charcoal }}>
                {settings.title}
            </Text>
            <View style={{ width: 60, height: 4, backgroundColor: COLORS.emerald, marginVertical: 24 }} />
            <Text style={{ fontSize: 14, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 3, color: COLORS.charcoal, textAlign: 'center' }}>
                {settings.subtitle}
            </Text>
        </View>

        <View style={{ position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, fontFamily: 'Inter', color: '#9CA3AF', letterSpacing: 2 }}>
                {settings.date}
            </Text>
        </View>
    </Page>
);

import { PdfCallSheet } from './templates/PdfCallSheet';
import { PdfCreativeBrief } from './templates/PdfCreativeBrief';
import { PdfDirectorsTreatment } from './templates/PdfDirectorsTreatment';
import { PdfLookbook } from './templates/PdfLookbook';
import { PdfProjectVision } from './templates/PdfProjectVision';

// --- Content Renderer Swouter ---
const ContentRenderer = ({ toolId, data }: { toolId: string, data: any }) => {

    // 1. Specific Templates
    if (toolId === 'call-sheet') {
        return <PdfCallSheet data={data} />;
    }
    if (toolId === 'brief') {
        return <PdfCreativeBrief data={data} />;
    }
    if (toolId === 'directors-treatment') {
        return <PdfDirectorsTreatment data={data} />;
    }
    if (toolId === 'lookbook') {
        return <PdfLookbook data={data} />;
    }
    if (toolId === 'project-vision') {
        return <PdfProjectVision data={data} />;
    }

    // 2. Fallback for unmapped tools (Simple Dump)
    if (data && Object.keys(data).length > 0) {
        return (
            <View>
                <View style={[globalPDFStyles.inputBox, { marginBottom: 20 }]}>
                    <Text style={[globalPDFStyles.text, { fontSize: 14, fontWeight: 'bold' }]}>
                        {toolId.toUpperCase().replace(/-/g, ' ')}
                    </Text>
                </View>

                {Object.keys(data).map(key => {
                    const val = data[key];
                    if (typeof val === 'object') return null; // Skip nested for legacy dump
                    return (
                        <View key={key} style={{ marginBottom: 16 }} wrap={false}>
                            <Text style={[globalPDFStyles.label, { marginBottom: 4 }]}>{key.toUpperCase()}</Text>
                            <View style={globalPDFStyles.inputBox}>
                                <Text style={globalPDFStyles.text}>{String(val)}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    }

    // 3. Fallback / Empty Data
    return (
        <View style={globalPDFStyles.inputBox}>
            <Text style={[globalPDFStyles.text, { color: COLORS.mutedText, fontStyle: 'italic' }]}>
                Content placeholder (No data found, or template not implemented for {toolId})
            </Text>
        </View>
    );
};

// --- Main Document ---
export const GlobalPdfDocument = ({ items, phases, coverSettings, brandSettings }: FactoryProps) => {

    return (
        <Document>
            {/* Cover Page */}
            {coverSettings.showCover && <CoverPage settings={coverSettings} logo={brandSettings?.logo_url} />}

            {/* Document Playlist */}
            {items.map(item => {
                // Fetch Stack
                const stack = getStackForTool(item.id, phases);

                // Determine Indices

                let indices = item.selectedVersions;
                if (!indices || indices.length === 0) {
                    if (Array.isArray(stack) && stack.length > 0) {
                        indices = [stack.length - 1];
                    } else {
                        indices = [0];
                    }
                }

                // Render Pages
                // @ts-expect-error: Sorting indices mixed types
                return indices.sort((a, b) => a - b).map((idx) => {
                    const data = stack && stack[idx] ? stack[idx] : {};
                    const uniqueKey = `${item.id}-${idx}`;

                    console.log("PDF Generating:", { toolId: item.id, index: idx, dataKeys: Object.keys(data) });

                    return (
                        <Page
                            key={uniqueKey}
                            size="LETTER"
                            orientation={item.orientation}
                            style={globalPDFStyles.page}
                            wrap
                        >
                            <PdfHeader
                                title={item.label.toUpperCase()}
                                projectName={coverSettings.title}
                                date={coverSettings.date}
                                status={Object.keys(data).length > 0 ? 'Ready' : 'Empty'}
                            />

                            <ContentRenderer toolId={item.id} data={data} />

                            <PdfFooter />
                        </Page>
                    );
                });
            })}
        </Document>
    );
};
