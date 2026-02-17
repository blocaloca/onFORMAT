import React from 'react';
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { getPDFTheme } from './PdfTheme';
import { PdfHeader, PdfFooter, PdfThemeType } from './PdfComponents';

// --- Types ---
interface FactoryProps {
    items: any[]; // Playlist items
    phases: any;  // Global data store
    coverSettings: any;
    brandSettings?: any; // New Injection Point
}

// --- Universal Unwrapper (Factory Version - Returns Array) ---
const getStackForTool = (toolId: string, phases: any) => {
    if (!phases) return [];

    let foundData: any = null;
    const priorityOrder = ['POST', 'ON_SET', 'PRE_PRODUCTION', 'DEVELOPMENT'];

    for (const phaseKey of priorityOrder) {
        // @ts-ignore
        const phase = phases[phaseKey] || phases[phaseKey.toLowerCase()];
        if (phase?.drafts?.[toolId]) {
            foundData = phase.drafts[toolId];
            break;
        }
    }

    // Fallback Search
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
const CoverPage = ({ settings, theme }: { settings: any, theme: PdfThemeType }) => (
    <Page size="LETTER" orientation={settings.orientation || 'portrait'} style={[theme.globalStyles.page, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{ marginBottom: 40, alignItems: 'center' }}>
            {/* Optional Logo */}
            {theme.logo && (
                <Image
                    src={theme.logo}
                    style={{ width: 64, height: 64, marginBottom: 24, objectFit: 'contain' }}
                />
            )}

            <Text style={{ fontSize: 48, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', color: theme.COLORS.charcoal }}>
                {settings.title}
            </Text>
            <View style={{ width: 60, height: 4, backgroundColor: theme.COLORS.emerald, marginVertical: 24 }} />
            <Text style={{ fontSize: 14, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 3, color: theme.COLORS.charcoal, textAlign: 'center' }}>
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
const ContentRenderer = ({ toolId, data, theme }: { toolId: string, data: any, theme: PdfThemeType }) => {

    // 1. Specific Templates
    if (toolId === 'call-sheet') {
        return <PdfCallSheet data={data} theme={theme} />;
    }
    if (toolId === 'brief') {
        return <PdfCreativeBrief data={data} theme={theme} />;
    }
    if (toolId === 'directors-treatment') {
        return <PdfDirectorsTreatment data={data} theme={theme} />;
    }
    if (toolId === 'lookbook') {
        return <PdfLookbook data={data} theme={theme} />;
    }
    if (toolId === 'project-vision') {
        return <PdfProjectVision data={data} theme={theme} />;
    }

    // 2. Fallback for unmapped tools (Simple Dump)
    if (data && Object.keys(data).length > 0) {
        return (
            <View>
                <View style={[theme.globalStyles.inputBox, { marginBottom: 20 }]}>
                    <Text style={[theme.globalStyles.text, { fontSize: 14, fontWeight: 'bold' }]}>
                        {toolId.toUpperCase().replace(/-/g, ' ')}
                    </Text>
                </View>

                {Object.keys(data).map(key => {
                    const val = data[key];
                    if (typeof val === 'object') return null; // Skip nested for legacy dump
                    return (
                        <View key={key} style={{ marginBottom: 16 }} wrap={false}>
                            <Text style={[theme.globalStyles.label, { marginBottom: 4 }]}>{key.toUpperCase()}</Text>
                            <View style={theme.globalStyles.inputBox}>
                                <Text style={theme.globalStyles.text}>{String(val)}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    }

    // 3. Fallback / Empty Data
    return (
        <View style={theme.globalStyles.inputBox}>
            <Text style={[theme.globalStyles.text, { color: theme.COLORS.mutedText, fontStyle: 'italic' }]}>
                Content placeholder (No data found, or template not implemented for {toolId})
            </Text>
        </View>
    );
};

// --- Main Document ---
export const GlobalPdfDocument = ({ items, phases, coverSettings, brandSettings }: FactoryProps) => {
    // GENERATE THEME ONCE
    const theme = getPDFTheme(brandSettings);

    return (
        <Document>
            {/* Cover Page */}
            {coverSettings.showCover && <CoverPage settings={coverSettings} theme={theme} />}

            {/* Document Playlist */}
            {items.map(item => {
                // Fetch Stack
                const stack = getStackForTool(item.id, phases);

                // Determine Indices
                // @ts-ignore
                let indices = item.selectedVersions;
                if (!indices || indices.length === 0) {
                    if (Array.isArray(stack) && stack.length > 0) {
                        indices = [stack.length - 1];
                    } else {
                        indices = [0];
                    }
                }

                // Render Pages
                // @ts-ignore
                return indices.sort((a, b) => a - b).map((idx) => {
                    const data = stack && stack[idx] ? stack[idx] : {};
                    const uniqueKey = `${item.id}-${idx}`;

                    console.log("PDF Generating:", { toolId: item.id, index: idx, dataKeys: Object.keys(data) });

                    return (
                        <Page
                            key={uniqueKey}
                            size="LETTER"
                            orientation={item.orientation}
                            style={theme.globalStyles.page}
                            wrap
                        >
                            <PdfHeader
                                title={item.label.toUpperCase()}
                                projectName={coverSettings.title}
                                date={coverSettings.date}
                                theme={theme}
                            />

                            <ContentRenderer toolId={item.id} data={data} theme={theme} />

                            <PdfFooter theme={theme} />
                        </Page>
                    );
                });
            })}
        </Document>
    );
};
