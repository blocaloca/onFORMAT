import { StyleSheet } from '@react-pdf/renderer';

// --- 1. Font Registration ---
// Using standard PDF fonts (Helvetica) for maximum stability.
// External font fetches were causing "Unknown font format" crashes.
// To use Inter, we must bundle the TTF files locally in the project.

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
        fontFamily: 'Helvetica', // Standard, Crash-Proof
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
