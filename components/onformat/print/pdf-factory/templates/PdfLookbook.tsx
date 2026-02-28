/* eslint-disable @typescript-eslint/no-explicit-any, jsx-a11y/alt-text */
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { globalPDFStyles, COLORS } from '../globalPDFStyles';

interface Slide {
    id: string;
    title: string;
    content: string;
    category?: string;
}

interface PdfLookbookProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
}

const styles = StyleSheet.create({
    slideContainer: {
        marginBottom: 24,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.slate,
        paddingBottom: 16
    },
    slideHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    slideTitle: {
        fontSize: 12,
        fontWeight: 900,
        color: COLORS.charcoal,
        textTransform: 'uppercase'
    },
    slideCategory: {
        fontSize: 8,
        color: COLORS.mutedText,
        textTransform: 'uppercase',
        fontWeight: 700
    },
    contentBox: {
        backgroundColor: COLORS.lightGrey,
        padding: 12,
        borderLeftWidth: 2,
        borderLeftColor: COLORS.charcoal
    }
});

export const PdfLookbook = ({ data }: PdfLookbookProps) => {

    // Safety Check: Loading State
    if (!data || Object.keys(data).length === 0) {
        return (
            <View style={globalPDFStyles.inputBox}>
                <Text style={[globalPDFStyles.text, { color: COLORS.mutedText, fontStyle: 'italic' }]}>
                    Loading production data...
                </Text>
            </View>
        );
    }

    const slides: Slide[] = data?.slides || [];

    if (!slides || slides.length === 0) {
        return (
            <View style={globalPDFStyles.inputBox}>
                <Text style={[globalPDFStyles.text, { color: COLORS.mutedText, fontStyle: 'italic' }]}>
                    No lookbook slides found.
                </Text>
            </View>
        );
    }

    return (
        <View>
            {slides.map((slide, index) => (
                <View key={slide.id || index} style={styles.slideContainer} wrap={false}>
                    <View style={styles.slideHeader}>
                        <Text style={styles.slideTitle}>{slide.title || 'Untitled Slide'}</Text>
                        <Text style={styles.slideCategory}>{slide.category || 'General'}</Text>
                    </View>
                    <View style={styles.contentBox}>
                        <Text style={globalPDFStyles.text}>
                            {slide.content || (
                                <Text style={{ color: COLORS.mutedText, fontStyle: 'italic' }}>No content...</Text>
                            )}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
};
