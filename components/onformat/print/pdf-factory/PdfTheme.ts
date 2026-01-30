import { Font, StyleSheet } from '@react-pdf/renderer';

// --- 1. Font Registration ---
// Attempting to register Inter with reliable TTF sources.
// If these fail, React-PDF usually falls back or errors.
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@5.0.19/latin-400-normal.ttf', fontWeight: 400 },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@5.0.19/latin-700-normal.ttf', fontWeight: 700 }, // Bold
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@5.0.19/latin-900-normal.ttf', fontWeight: 900 }  // Black
    ]
});

// --- 2. Color Palette ---
export const COLORS = {
    obsidian: '#111827', // Main Text (Charcoal)
    charcoal: '#111827', // Alias
    slate: '#E5E7EB',    // Borders
    lightGrey: '#F9FAF7', // Updated "Tactical" Input Background
    mutedText: '#6B7280', // Gray-500
    emerald: '#059669',  // Accents
    white: '#FFFFFF'
};

// --- 3. Layout Constants ---
export const LAYOUT = {
    padding: 40, // 40pt safe zone
    headerHeight: 40,
    footerHeight: 30,
};

// --- 4. Global Styles ---
export const globalStyles = StyleSheet.create({
    page: {
        paddingTop: LAYOUT.padding,
        paddingBottom: LAYOUT.padding,
        paddingLeft: LAYOUT.padding,
        paddingRight: LAYOUT.padding,
        fontFamily: 'Inter', // Switching back to Inter
        fontSize: 9,
        color: COLORS.obsidian,
        backgroundColor: COLORS.white,
    },
    // Typography
    h1: {
        fontSize: 24,
        fontWeight: 900,
        textTransform: 'uppercase',
        marginBottom: 0,
        letterSpacing: -1
    },
    h2: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 6,
        color: COLORS.obsidian,
        letterSpacing: 0.5
    },
    text: {
        fontSize: 10,
        lineHeight: 1.5,
        color: COLORS.obsidian
    },
    label: {
        fontSize: 7,
        textTransform: 'uppercase',
        color: COLORS.mutedText,
        fontWeight: 700,
        marginBottom: 4,
        letterSpacing: 0.5
    },
    // UI Elements
    inputBox: {
        backgroundColor: COLORS.lightGrey,
        borderWidth: 1,
        borderColor: COLORS.slate,
        padding: 10,
        marginBottom: 16,
        minHeight: 40
    },
    // Utility
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    col: {
        flexDirection: 'column'
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate
    }
});
