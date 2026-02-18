/* eslint-disable @typescript-eslint/no-explicit-any, jsx-a11y/alt-text */
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfThemeType } from '../PdfComponents';

interface PdfCreativeBriefProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const PdfCreativeBrief = ({ data, theme }: PdfCreativeBriefProps) => {
    if (!data) return null; // Should be handled by parent content renderer

    // Handle Array structure (WorkspaceEditor saves brief as [{...}])
    const briefData = Array.isArray(data) ? data[0] : data;

    if (!briefData || Object.keys(briefData).length === 0) {
        return (
            <View style={theme.globalStyles.inputBox}>
                <Text style={[theme.globalStyles.text, { color: theme.COLORS.mutedText, fontStyle: 'italic' }]}>
                    No Creative Brief data found.
                </Text>
            </View>
        );
    }

    return (
        <View>
            <Text style={[theme.globalStyles.h2, { marginBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.COLORS.slate, paddingBottom: 6 }]}>
                PROJECT OVERVIEW
            </Text>

            {renderField("SUBJECT / PRODUCT", briefData.product, theme, "Describe the product or subject...")}
            {renderField("OBJECTIVE", briefData.objective, theme, "What is the main goal?")}
            {renderField("TARGET AUDIENCE", briefData.targetAudience, theme, "Who is this for?")}
            {renderField("TONE & STYLE", briefData.tone, theme, "Visual style and tone...")}
            {renderField("KEY MESSAGE", briefData.keyMessage, theme, "Core takeaway...")}
            {renderField("NARRATIVE / STORY", briefData.narrative, theme, "Story outline...")}
            {renderField("TALENT / CHARACTERS", briefData.talent, theme, "Cast requirements...")}
            {renderField("LOCATIONS", briefData.location, theme, "Setting/Location details...")}
            {renderField("DELIVERABLES", briefData.deliverables, theme, "List of final assets...")}
        </View>
    );
};
