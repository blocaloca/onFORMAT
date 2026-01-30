import React from 'react';
import { View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { DataGrid } from '../PdfComponents';
import { globalStyles, COLORS } from '../PdfTheme';

interface PdfCallSheetProps {
    data: any;
}

const styles = StyleSheet.create({
    vitalsContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate,
        paddingBottom: 10
    },
    vitalBox: {
        flex: 1,
        paddingRight: 10
    },
    bigTime: {
        fontSize: 48,
        fontWeight: 900,
        color: COLORS.obsidian,
        letterSpacing: -2,
        lineHeight: 1
    }
});

const renderPlaceholder = (value: any, placeholder: string) => {
    if (value) return <Text style={globalStyles.text}>{value}</Text>;
    return <Text style={[globalStyles.text, { color: COLORS.mutedText, fontStyle: 'italic' }]}>{placeholder}</Text>;
};

export const PdfCallSheet = ({ data }: PdfCallSheetProps) => {
    if (!data || Object.keys(data).length === 0) {
        return (
            <View style={globalStyles.inputBox}>
                <Text style={[globalStyles.text, { color: COLORS.mutedText, fontStyle: 'italic' }]}>
                    Loading production data...
                </Text>
            </View>
        );
    }

    // Columns for the schedule
    const scheduleColumns = [
        { header: 'TIME', accessor: 'time', width: '15%' },
        { header: 'EPISODE/SCENE', accessor: 'type', width: '15%' },
        { header: 'DESCRIPTION', accessor: 'description', width: '50%' },
        { header: 'LOCATION', accessor: 'location', width: '20%' }
    ];

    return (
        <View>
            {/* Vitals Row */}
            <View style={styles.vitalsContainer}>
                <View style={styles.vitalBox}>
                    <Text style={globalStyles.label}>GENERAL CALL</Text>
                    <Text style={styles.bigTime}>{data.crewCall || '00:00'}</Text>
                </View>

                {/* Weather & Hospital Container */}
                <View style={[styles.vitalBox, { flex: 2, flexDirection: 'row' }]}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={globalStyles.label}>WEATHER</Text>
                        <Text style={globalStyles.h2}>{data.weather || '-'}</Text>
                        <Text style={[globalStyles.text, { fontSize: 8 }]}>{data.sunriseSunset || ''}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={globalStyles.label}>NEAREST HOSPITAL</Text>
                        <Text style={[globalStyles.text, { fontSize: 8 }]}>{data.nearestHospital || 'No hospital data'}</Text>
                    </View>
                </View>

                {/* QR Code Slot */}
                <View style={{ width: 60, alignItems: 'center' }}>
                    <Text style={[globalStyles.label, { textAlign: 'center', marginBottom: 2 }]}>GET ONSET</Text>
                    <Image
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://onformat.io"
                        style={{ width: 48, height: 48, backgroundColor: '#F0F0F0' }}
                    />
                </View>
            </View>

            {/* Notes */}
            <View style={{ marginBottom: 20 }}>
                <Text style={globalStyles.label}>NOTES</Text>
                <View style={globalStyles.inputBox}>
                    {renderPlaceholder(data.notes, "General notes and instructions...")}
                </View>
            </View>

            {/* Schedule Grid */}
            <Text style={[globalStyles.h2, { marginBottom: 5 }]}>SHOOTING SCHEDULE</Text>
            <DataGrid
                columns={scheduleColumns}
                data={data.events || []}
            />
        </View>
    );
};
