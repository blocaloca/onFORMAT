import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfThemeType } from '../PdfComponents';

interface PdfProjectVisionProps {
    data: any;
    theme: PdfThemeType;
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 16
    }
});

const renderField = (label: string, value: string, theme: PdfThemeType, placeholder: string = "Data not provided") => {
    return (
        <View style={styles.section} wrap={false}>
            <Text style={theme.globalStyles.label}>{label}</Text>
            <View style={theme.globalStyles.inputBox}>
                {value ? (
                    <Text style={theme.globalStyles.text}>{value}</Text>
                ) : (
                    <Text style={[theme.globalStyles.text, { color: theme.COLORS.mutedText, fontStyle: 'italic' }]}>
                        {placeholder}
                    </Text>
                )}
            </View>
        </View>
    );
};

export const PdfProjectVision = ({ data, theme }: PdfProjectVisionProps) => {
    // Safety Check
    if (!data || Object.keys(data).length === 0) {
        return (
            <View style={theme.globalStyles.inputBox}>
                <Text style={[theme.globalStyles.text, { color: theme.COLORS.mutedText, fontStyle: 'italic' }]}>
                    Loading production data...
                </Text>
            </View>
        );
    }

    return (
        <View>
            <Text style={[theme.globalStyles.h2, { marginBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.COLORS.slate, paddingBottom: 6 }]}>
                VISION SUMMARY
            </Text>
            {renderField("LOGLINE", data.logline, theme, "Short summary...")}
            {renderField("THEME", data.theme, theme, "Core theme...")}
            {renderField("VISUAL STYLE", data.visualStyle, theme, "Visual approach...")}
            {renderField("NOTES", data.notes, theme, "Additional notes...")}
        </View>
    );
};
