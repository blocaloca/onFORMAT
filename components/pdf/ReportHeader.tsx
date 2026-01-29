import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, colors } from './pdfStyles';

interface ReportHeaderProps {
    projectName: string;
    phase: string;
    documentTitle: string;
    subTitle?: string;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
    projectName,
    phase,
    documentTitle,
    subTitle
}) => {
    return (
        <View style={{ marginBottom: 20 }} fixed>
            <View style={styles.flexRow}>
                <View>
                    <Text style={[styles.header, { textTransform: 'uppercase', color: colors.text }]}>
                        {projectName}
                    </Text>
                    <Text style={{ fontSize: 9, color: '#6B7280' }}>{phase}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.header, { fontWeight: 700 }]}>{documentTitle}</Text>
                    {subTitle && <Text style={{ fontSize: 9, color: '#6B7280' }}>{subTitle}</Text>}
                </View>
            </View>
            {/* Divider line handled by next element or we can add one here */}
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#111827', marginTop: 8 }} />
        </View>
    );
};
