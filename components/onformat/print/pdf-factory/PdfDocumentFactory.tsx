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

// --- Helper to extract data ---
const getDataForTool = (toolId: string, phases: any) => {
    if (!phases) return null;
    for (const phase of Object.values(phases)) {
        if ((phase as any).drafts && (phase as any).drafts[toolId]) {
            return (phase as any).drafts[toolId]; // This is often a JSON string or object
        }
    }
    return null;
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
        {/* <Image src="https://onformat.io/logo-dark.png" style={{ width: 80, height: 20, position: 'absolute', bottom: 40, opacity: 0.5 }} /> */}
    </Page>
);

import { PdfCallSheet } from './templates/PdfCallSheet';

// --- Content Renderer Swouter ---
const ContentRenderer = ({ toolId, data }: { toolId: string, data: any }) => {

    // 1. Specific Templates
    if (toolId === 'call-sheet') {
        return <PdfCallSheet data={data} />;
    }

    // 2. Text Content (Brief, Script, Treatment usually strings or simple objects)
    if (typeof data === 'string') {
        const isLongText = data.length > 100;
        return (
            <View style={globalStyles.inputBox}>
                <Text style={globalStyles.text}>{data}</Text>
            </View>
        );
    }

    // 2. Object Content (complex tools)
    if (typeof data === 'object') {
        // Fallback: Dump keys/values
        return (
            <View>
                {Object.keys(data).map(key => (
                    <View key={key} style={{ marginBottom: 16 }} wrap={false}>
                        <Text style={[globalStyles.label, { marginBottom: 4 }]}>{key.toUpperCase()}</Text>
                        <View style={globalStyles.inputBox}>
                            <Text style={globalStyles.text}>{JSON.stringify(data[key]).slice(0, 500)}</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    // 3. Fallback / Empty Data
    return (
        <View style={globalStyles.inputBox}>
            <Text style={[globalStyles.text, { color: COLORS.mutedText, fontStyle: 'italic' }]}>
                Content placeholder (No data found for {toolId})
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
