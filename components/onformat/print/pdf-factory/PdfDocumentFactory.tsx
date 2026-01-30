import React from 'react';
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { globalStyles, COLORS } from './PdfTheme';
import { PdfHeader, PdfFooter } from './PdfComponents';

// --- Types ---
interface FactoryProps {
    items: any[]; // Playlist items
    phases: any;  // Global data store
    coverSettings: any;
}

// --- Universal Unwrapper (Factory Version) ---
const getDataForTool = (toolId: string, phases: any) => {
    if (!phases) return {};

    let foundData: any = null;
    const priorityOrder = ['POST', 'ON_SET', 'PRE_PRODUCTION', 'DEVELOPMENT'];

    // 1. Priority Search
    for (const phaseKey of priorityOrder) {
        // @ts-ignore
        const phase = phases[phaseKey] || phases[phaseKey.toLowerCase()];
        if (phase?.drafts?.[toolId]) {
            foundData = phase.drafts[toolId];
            break;
        }
    }

    // 2. Fallback Search
    if (!foundData) {
        for (const phase of Object.values(phases)) {
            // @ts-ignore
            if (phase?.drafts?.[toolId]) {
                // @ts-ignore
                foundData = phase.drafts[toolId];
                break;
            }
        }
    }

    if (!foundData) return {};

    // 3. Parse & Extract
    try {
        const parsed = typeof foundData === 'string' ? JSON.parse(foundData) : foundData;
        // Array Extraction Rule (Last Item = Most Recent)
        const data = Array.isArray(parsed) ? (parsed[parsed.length - 1] || {}) : (parsed || {});
        return data;

    } catch (e) {
        console.error(`Error parsing PDF data for ${toolId}`, e);
        return {};
    }
};

// --- Cover Page Component ---
const CoverPage = ({ settings }: { settings: any }) => (
    <Page size="LETTER" orientation={settings.orientation || 'portrait'} style={[globalStyles.page, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{ marginBottom: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', color: COLORS.charcoal }}>
                {settings.title}
            </Text>
            <View style={{ width: 60, height: 4, backgroundColor: COLORS.charcoal, marginVertical: 24 }} />
            <Text style={{ fontSize: 14, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 3, color: COLORS.charcoal, textAlign: 'center' }}>
                {settings.subtitle}
            </Text>
        </View>

        <View style={{ position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica', color: '#9CA3AF', letterSpacing: 2 }}>
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
                <View style={[globalStyles.inputBox, { marginBottom: 20 }]}>
                    <Text style={[globalStyles.text, { fontSize: 14, fontWeight: 'bold' }]}>
                        {toolId.toUpperCase().replace(/-/g, ' ')}
                    </Text>
                </View>

                {Object.keys(data).map(key => {
                    const val = data[key];
                    if (typeof val === 'object') return null; // Skip nested for legacy dump
                    return (
                        <View key={key} style={{ marginBottom: 16 }} wrap={false}>
                            <Text style={[globalStyles.label, { marginBottom: 4 }]}>{key.toUpperCase()}</Text>
                            <View style={globalStyles.inputBox}>
                                <Text style={globalStyles.text}>{String(val)}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    }

    // 3. Fallback / Empty Data
    return (
        <View style={globalStyles.inputBox}>
            <Text style={[globalStyles.text, { color: COLORS.mutedText, fontStyle: 'italic' }]}>
                Content placeholder (No data found, or template not implemented for {toolId})
            </Text>
        </View>
    );
};

// --- Main Document ---
export const GlobalPdfDocument = ({ items, phases, coverSettings }: FactoryProps) => {
    return (
        <Document>
            {/* Cover Page */}
            {coverSettings.showCover && <CoverPage settings={coverSettings} />}

            {/* Document Playlist */}
            {items.filter(item => item.isSelected).map((item, index) => {
                const rawData = getDataForTool(item.id, phases);
                let data = rawData;

                // Try to parse if string
                if (typeof rawData === 'string' && (rawData.startsWith('{') || rawData.startsWith('['))) {
                    try { data = JSON.parse(rawData); } catch (e) { }
                }

                console.log("PDF Data Received:", { toolId: item.id, data });

                return (
                    <Page
                        key={item.id}
                        size="LETTER"
                        orientation={item.orientation}
                        style={globalStyles.page}
                        wrap
                    >
                        <PdfHeader
                            title={item.label.toUpperCase()} // "CREATIVE BRIEF"
                            projectName={coverSettings.title} // "PROJECT NAME"
                            date={coverSettings.date}
                        // producer={/* TODO: Pass from Dashboard */}
                        />

                        <ContentRenderer toolId={item.id} data={data} />

                        <PdfFooter />
                    </Page>
                );
            })}
        </Document>
    );
};
