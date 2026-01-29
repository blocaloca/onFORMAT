import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { styles, colors } from './pdfStyles';

interface CoverPageProps {
    projectName: string;
    documentTitle: string;
    date?: string;
    author?: string;
    client?: string;
    version?: string;
}

export const CoverPage: React.FC<CoverPageProps> = ({
    projectName,
    documentTitle,
    date = new Date().toLocaleDateString(),
    author,
    client,
    version
}) => {
    return (
        <Page size="A4" style={[styles.page, { justifyContent: 'center', alignItems: 'center' }]}>

            {/* Decorative Top Border/Element */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, backgroundColor: colors.text }} />

            <View style={{ width: '100%', alignItems: 'center', marginBottom: 60 }}>
                <Text style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
                    {projectName}
                </Text>
                <Text style={{ fontSize: 32, fontWeight: 700, textAlign: 'center' }}>
                    {documentTitle}
                </Text>
            </View>

            <View style={{ width: '80%', flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 40 }}>
                {client && (
                    <View style={{ width: '50%', marginBottom: 20 }}>
                        <Text style={{ fontSize: 8, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>Prepared For</Text>
                        <Text style={{ fontSize: 11, fontWeight: 600 }}>{client}</Text>
                    </View>
                )}

                {author && (
                    <View style={{ width: '50%', marginBottom: 20 }}>
                        <Text style={{ fontSize: 8, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>Prepared By</Text>
                        <Text style={{ fontSize: 11, fontWeight: 600 }}>{author}</Text>
                    </View>
                )}

                <View style={{ width: '50%', marginBottom: 20 }}>
                    <Text style={{ fontSize: 8, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>Date</Text>
                    <Text style={{ fontSize: 11 }}>{date}</Text>
                </View>

                {version && (
                    <View style={{ width: '50%', marginBottom: 20 }}>
                        <Text style={{ fontSize: 8, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>Version</Text>
                        <Text style={{ fontSize: 11 }}>{version}</Text>
                    </View>
                )}
            </View>

            {/* Decorative Bottom Element */}
            <View style={{ position: 'absolute', bottom: 40, alignItems: 'center' }}>
                <Text style={{ fontSize: 8, color: colors.textMuted }}>Generated via onFORMAT Print Room</Text>
            </View>
        </Page>
    );
};
