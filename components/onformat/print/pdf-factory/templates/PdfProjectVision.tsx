import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { globalStyles, COLORS } from '../PdfTheme';

interface PdfProjectVisionProps {
    data: any;
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 16
    }
});

const renderField = (label: string, value: string, placeholder: string = "Data not provided") => {
    return (
        <View style={styles.section} wrap={false}>
            <Text style={globalStyles.label}>{label}</Text>
            <View style={globalStyles.inputBox}>
                {value ? (
                    <Text style={globalStyles.text}>{value}</Text>
                ) : (
                    <Text style={[globalStyles.text, { color: COLORS.mutedText, fontStyle: 'italic' }]}>
                        {placeholder}
                    </Text>
                )}
            </View>
        </View>
    );
};

export const PdfProjectVision = ({ data }: PdfProjectVisionProps) => {
    // Data is unwrapped by the Factory
    const visionData = data;

    if (!visionData || Object.keys(visionData).length === 0) {
        return (
            <View style={globalStyles.inputBox}>
                <Text style={[globalStyles.text, { color: COLORS.mutedText, fontStyle: 'italic' }]}>
                    Loading production data...
                </Text>
            </View>
        );
    }

    return (
        <View>
            <Text style={[globalStyles.h2, { marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.slate, paddingBottom: 6 }]}>
                VISION SUMMARY
            </Text>

            {/* Depending on Project Vision Structure. Assuming simple fields or 'content' */}
            {/* If Vision is just 'title' and 'content' */}
            {renderField("LOGLINE", visionData.logline, "Short summary...")}
            {renderField("THEME", visionData.theme, "Core theme...")}
            {renderField("VISUAL STYLE", visionData.visualStyle, "Visual approach...")}
            {renderField("NOTES", visionData.notes, "Additional notes...")}
        </View>
    );
};
