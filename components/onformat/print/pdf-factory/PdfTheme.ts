import { StyleSheet, Font } from '@react-pdf/renderer';

// --- 1. Font Registration ---
// Registering Inter from Google Fonts CDN for consistency
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf', fontWeight: 400 }, // Regular
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.ttf', fontWeight: 700 }, // Bold
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuWaXAZ9hjp-Ek-_EeA.ttf', fontWeight: 900 }, // Black
    ]
});

// --- 2. Color Palette ---
export const COLORS = {
    obsidian: '#111827', // Main Text (Charcoal)
    charcoal: '#111827', // Alias
    slate: '#E5E7EB',    // Borders
    lightGrey: '#F9FAF7', // Updated "Tactical" Input Background
    mutedText: '#6B7280', // Gray-500
    placeholder: '#9CA3AF', // Gray-400
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
        fontFamily: 'Inter', // Tactical Luxury Font
        fontSize: 9,
        color: COLORS.obsidian,
        backgroundColor: COLORS.white,
    },
    // Typography
    h1: {
        fontSize: 18,
        fontWeight: 900,
        textTransform: 'uppercase',
        marginBottom: 4,
        letterSpacing: -0.5
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
        fontSize: 9,
        lineHeight: 1.4,
        color: COLORS.obsidian
    },
    label: {
        fontSize: 7,
        textTransform: 'uppercase',
        color: COLORS.mutedText,
        fontWeight: 700,
        marginBottom: 2,
        letterSpacing: 0.5
    },
    // UI Elements
    inputBox: { // Tactical Field Look
        backgroundColor: '#F9FAF7', // Very subtle off-white
        borderWidth: 0.5,
        borderColor: COLORS.slate,
        padding: 6,
        marginBottom: 12,
        minHeight: 24,
        borderRadius: 2
    },
    placeholder: {
        color: '#9CA3AF',
        fontStyle: 'italic'
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
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.slate
    }
});
