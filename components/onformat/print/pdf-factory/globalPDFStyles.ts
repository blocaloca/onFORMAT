import { StyleSheet, Font } from '@react-pdf/renderer';

// --- 1. Font Registration ---
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff' },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyDAZ9hjp-Ek-_EeA.woff', fontWeight: 700 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff', fontWeight: 900 }
    ]
});

// --- 2. Color Logic ---
export const COLORS = {
    obsidian: '#111827', // Main Text (Charcoal)
    charcoal: '#111827', // Alias
    slate: '#E5E7EB',    // Borders
    lightGrey: '#F9FAF7', // Updated "Tactical" Input Background
    mutedText: '#6B7280', // Gray-500
    white: '#FFFFFF',
    emerald: '#059669',   // Used for status "Ready"
    red: '#DC2626'        // Used for status "Empty"
};

// --- 3. Spacing Logic ---
export const LAYOUT = {
    padding: 40, // 40pt safe zone
    headerHeight: 40,
    footerHeight: 30,
};

// --- 4. Global Typography & Shapes ---
export const globalPDFStyles = StyleSheet.create({
    page: {
        paddingTop: LAYOUT.padding,
        paddingBottom: LAYOUT.padding,
        paddingLeft: LAYOUT.padding,
        paddingRight: LAYOUT.padding,
        fontFamily: 'Inter',
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
        borderWidth: 0.5,
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
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.slate
    }
});
