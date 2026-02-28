/* eslint-disable @typescript-eslint/no-explicit-any, jsx-a11y/alt-text */
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { globalPDFStyles, COLORS } from '../globalPDFStyles';

interface PdfProjectVisionProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            <Text style={globalPDFStyles.label}>{label}</Text>
            <View style={globalPDFStyles.inputBox}>
                {value ? (
                    <Text style={globalPDFStyles.text}>{value}</Text>
                ) : (
                    <Text style={[globalPDFStyles.text, { color: COLORS.mutedText, fontStyle: 'italic' }]}>
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
            <View style={globalPDFStyles.inputBox}>
                <Text style={[globalPDFStyles.text, { color: COLORS.mutedText, fontStyle: 'italic' }]}>
                    Loading production data...
                </Text>
            </View>
        );
    }

    return (
        <View>
            <Text style={[globalPDFStyles.h2, { marginBottom: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.slate, paddingBottom: 6 }]}>
                VISION SUMMARY
            </Text>
            {renderField("LOGLINE", data.logline, "Short summary...")}
            {renderField("THEME", data.theme, "Core theme...")}
            {renderField("VISUAL STYLE", data.visualStyle, "Visual approach...")}
            {renderField("NOTES", data.notes, "Additional notes...")}
        </View>
    );
};
