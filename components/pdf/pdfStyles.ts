import { StyleSheet } from '@react-pdf/renderer';

export const colors = {
    text: '#111827', // gray-900
    textMuted: '#6B7280', // gray-500
    border: '#E5E7EB', // gray-200
    primary: '#111827', // dark branded
    accent: '#9333ea', // purple-600 (keeping consistent with app)
};

export const styles = StyleSheet.create({
    // Global Page Layout
    page: {
        paddingTop: 54, // ~0.75 inch safe margin
        paddingBottom: 54,
        paddingLeft: 54,
        paddingRight: 54,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: colors.text,
        backgroundColor: '#FFFFFF',
    },

    // Typography
    header: {
        fontSize: 11,
        fontWeight: 600,
        marginBottom: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 20,
    },
    text: {
        fontSize: 9,
        lineHeight: 1.4,
    },

    // Tables / Grids
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingVertical: 6,
        alignItems: 'center',
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.text, // Darker border for header
        backgroundColor: '#F9FAFB',
        paddingVertical: 8,
        marginTop: 10,
    },
    tableHeaderCell: {
        fontSize: 9,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Utility
    flexRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 10,
    },
    footerText: {
        fontSize: 8,
        color: colors.textMuted,
    }
});
