/* eslint-disable @typescript-eslint/no-explicit-any, jsx-a11y/alt-text */
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { globalPDFStyles, COLORS } from '../globalPDFStyles';

interface PdfCreativeBriefProps {
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

export const PdfCreativeBrief = ({ data }: PdfCreativeBriefProps) => {
    if (!data) return null; // Should be handled by parent content renderer

    // Handle Array structure (WorkspaceEditor saves brief as [{...}])
    const briefData = Array.isArray(data) ? data[0] : data;

    if (!briefData || Object.keys(briefData).length === 0) {
        return (
            <View style={globalPDFStyles.inputBox}>
                <Text style={[globalPDFStyles.text, { color: COLORS.mutedText, fontStyle: 'italic' }]}>
                    No Creative Brief data found.
                </Text>
            </View>
        );
    }

    return (
        <View>
            <Text style={[globalPDFStyles.h2, { marginBottom: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.slate, paddingBottom: 6 }]}>
                PROJECT OVERVIEW
            </Text>

            {renderField("SUBJECT / PRODUCT", briefData.product, "Describe the product or subject...")}
            {renderField("OBJECTIVE", briefData.objective, "What is the main goal?")}
            {renderField("TARGET AUDIENCE", briefData.targetAudience, "Who is this for?")}
            {renderField("TONE & STYLE", briefData.tone, "Visual style and tone...")}
            {renderField("KEY MESSAGE", briefData.keyMessage, "Core takeaway...")}
            {renderField("NARRATIVE / STORY", briefData.narrative, "Story outline...")}
            {renderField("TALENT / CHARACTERS", briefData.talent, "Cast requirements...")}
            {renderField("LOCATIONS", briefData.location, "Setting/Location details...")}
            {renderField("DELIVERABLES", briefData.deliverables, "List of final assets...")}
        </View>
    );
};
