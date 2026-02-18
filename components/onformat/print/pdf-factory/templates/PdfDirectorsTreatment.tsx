/* eslint-disable @typescript-eslint/no-explicit-any, jsx-a11y/alt-text */
import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { PdfThemeType } from '../PdfComponents';

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

interface PdfDirectorsTreatmentProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    theme: PdfThemeType;
}

const getStyles = (theme: PdfThemeType) => StyleSheet.create({
    slideContainer: {
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.COLORS.slate
    },
    slideHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    slideTitle: {
        fontSize: 14,
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
        borderLeftColor: theme.COLORS.charcoal,
        minHeight: 50
    },
    // Layouts
    splitLayout: {
        flexDirection: 'row',
        gap: 16
    },
    column: {
        flex: 1
    },
    imageContainer: {
        gap: 8
    },
    image: {
        width: '100%',
        height: 150,
        objectFit: 'cover',
        backgroundColor: '#eee'
    },
    heroImage: {
        width: '100%',
        height: 300,
        objectFit: 'contain',
        marginBottom: 12,
        backgroundColor: '#000'
    }
});

export const PdfDirectorsTreatment = ({ data, theme }: PdfDirectorsTreatmentProps) => {
    const styles = getStyles(theme);

    // Handle potential array wrapper or direct object
    const rawv = Array.isArray(data) ? data[0] : data;
    let slides: Slide[] = rawv?.slides || [];

    // Migration Check: If no slides, try legacy 'scenes'
    if (slides.length === 0 && rawv?.scenes && Array.isArray(rawv.scenes)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        slides = rawv.scenes.map((scene: any) => ({
            id: scene.id,
            title: scene.description || scene.slug || 'Untitled Scene',
            content: scene.content || '',
            category: scene.type === 'Narrative' ? 'Story/Narrative' : 'Visual',
            layout: 'Split', // Default legacy look
            modules: {
                image1: scene.image || '', // Map legacy image
                image2: scene.image2 || ''
            }
        }));
    }

    if (!slides || slides.length === 0) {
        return (
            <View style={theme.globalStyles.inputBox}>
                <Text style={[theme.globalStyles.text, { color: theme.COLORS.mutedText, fontStyle: 'italic' }]}>
                    No treatment slides found.
                </Text>
            </View>
        );
    }

    return (
        <View>
            {slides.map((slide, index) => {
                const layout = slide.layout || 'Text'; // Default to Text

                return (
                    <View key={slide.id || index} style={styles.slideContainer} wrap={false}>
                        {/* Header */}
                        <View style={styles.slideHeader}>
                            <Text style={styles.slideTitle}>{slide.title || 'Untitled Slide'}</Text>
                            <Text style={styles.slideCategory}>{slide.category || 'General'}</Text>
                        </View>

                        {/* --- Layout: TEXT --- */}
                        {layout === 'Text' && (
                            <View style={styles.contentBox}>
                                <Text style={theme.globalStyles.text}>
                                    {slide.content || 'No content...'}
                                </Text>
                            </View>
                        )}

                        {/* --- Layout: IMAGE (Hero) --- */}
                        {layout === 'Image' && (
                            <View>
                                {slide.modules?.image1 ? (
                                    <Image src={slide.modules.image1} style={styles.heroImage} />
                                ) : (
                                    <View style={[styles.heroImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }]}>
                                        <Text style={{ fontSize: 8, color: '#999' }}>NO IMAGE SELECTED</Text>
                                    </View>
                                )}
                                <View style={styles.contentBox}>
                                    <Text style={theme.globalStyles.text}>
                                        {slide.content || 'No caption...'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* --- Layout: SPLIT --- */}
                        {layout === 'Split' && (
                            <View style={styles.splitLayout}>
                                {/* Left: Images */}
                                <View style={[styles.column, styles.imageContainer]}>
                                    {slide.modules?.image1 ? (
                                        <Image src={slide.modules.image1} style={styles.image} />
                                    ) : (
                                        <View style={[styles.image, { alignItems: 'center', justifyContent: 'center' }]}>
                                            <Text style={{ fontSize: 8, color: '#999' }}>NO IMAGE</Text>
                                        </View>
                                    )}

                                    {slide.modules?.image2 ? (
                                        <Image src={slide.modules.image2} style={styles.image} />
                                    ) : (
                                        <View style={[styles.image, { alignItems: 'center', justifyContent: 'center' }]}>
                                            <Text style={{ fontSize: 8, color: '#999' }}>NO IMAGE</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Right: Text */}
                                <View style={styles.column}>
                                    <View style={[styles.contentBox, { height: '100%' }]}>
                                        <Text style={theme.globalStyles.text}>
                                            {slide.content || 'No description...'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
};
