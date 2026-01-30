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
    // Safety Check
    if (!data || Object.keys(data).length === 0) {
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
            {renderField("LOGLINE", data.logline, "Short summary...")}
            {renderField("THEME", data.theme, "Core theme...")}
            {renderField("VISUAL STYLE", data.visualStyle, "Visual approach...")}
            {renderField("NOTES", data.notes, "Additional notes...")}
        </View>
    );
};
