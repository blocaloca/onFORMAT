import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { globalStyles, COLORS } from '../PdfTheme';

interface Slide {
    id: string;
    title: string;
    content: string;
    category?: string;
    layout?: string;
    modules?: {
        image1?: string;
        image2?: string;
    };
}

interface PdfLookbookProps {
    data: any;
}

const styles = StyleSheet.create({
    slideContainer: {
        marginBottom: 24,
        borderBottomWidth: 1,
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
    if (!data || Object.keys(data).length === 0) {
        return (
            <View style={globalStyles.inputBox}>
                <Text style={[globalStyles.text, { color: COLORS.mutedText, fontStyle: 'italic' }]}>
                    Loading production data...
                </Text>
            </View>
        );
    }

    // Content is unwrapped by the Factory
    const slides: Slide[] = data?.slides || [];

    if (!slides || slides.length === 0) {
        return (
            <View style={globalStyles.inputBox}>
                <Text style={[globalStyles.text, { color: COLORS.mutedText, fontStyle: 'italic' }]}>
                    No lookbook slides found.
                </Text>
            </View>
        );
    }

    return (
        <View>
            {slides.map((slide, index) => (
                <View key={slide.id || index} style={styles.slideContainer} wrap={false}>
                    {/* Header: Title + Category */}
                    <View style={styles.slideHeader}>
                        <Text style={styles.slideTitle}>{slide.title || 'Untitled Slide'}</Text>
                        <Text style={styles.slideCategory}>{slide.category || 'General'}</Text>
                    </View>

                    {/* Content Body */}
                    <View style={styles.contentBox}>
                        <Text style={globalStyles.text}>
                            {slide.content || (
                                <Text style={{ color: COLORS.mutedText, fontStyle: 'italic' }}>No content...</Text>
                            )}
                        </Text>
                    </View>

                    {/* TODO: Image Handling (if URLs are valid) */}
                    {/* 
                    {slide.modules?.image1 && (
                         <Image src={slide.modules.image1} style={{ marginTop: 8, height: 100, objectFit: 'cover' }} />
                    )} 
                    */}
                </View>
            ))}
        </View>
    );
};
