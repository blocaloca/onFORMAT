import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfThemeType } from '../PdfComponents';

interface Slide {
    id: string;
    title: string;
    content: string;
    category?: string;
}

interface PdfLookbookProps {
    data: any;
    theme: PdfThemeType;
}

const getStyles = (theme: PdfThemeType) => StyleSheet.create({
    slideContainer: {
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.COLORS.slate,
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
        color: theme.COLORS.charcoal,
        textTransform: 'uppercase'
    },
    slideCategory: {
        fontSize: 8,
        color: theme.COLORS.mutedText,
        textTransform: 'uppercase',
        fontWeight: 700
    },
    contentBox: {
        backgroundColor: theme.COLORS.lightGrey,
        padding: 12,
        borderLeftWidth: 2,
        borderLeftColor: theme.COLORS.charcoal
    }
});

export const PdfLookbook = ({ data, theme }: PdfLookbookProps) => {
    const styles = getStyles(theme);

    // Safety Check: Loading State
    if (!data || Object.keys(data).length === 0) {
        return (
            <View style={theme.globalStyles.inputBox}>
                <Text style={[theme.globalStyles.text, { color: theme.COLORS.mutedText, fontStyle: 'italic' }]}>
                    Loading production data...
                </Text>
            </View>
        );
    }

    const slides: Slide[] = data?.slides || [];

    if (!slides || slides.length === 0) {
        return (
            <View style={theme.globalStyles.inputBox}>
                <Text style={[theme.globalStyles.text, { color: theme.COLORS.mutedText, fontStyle: 'italic' }]}>
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
                        <Text style={theme.globalStyles.text}>
                            {slide.content || (
                                <Text style={{ color: theme.COLORS.mutedText, fontStyle: 'italic' }}>No content...</Text>
                            )}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
};
