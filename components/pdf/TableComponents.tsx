import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, colors } from './pdfStyles';

export interface ColumnDefinition<T> {
    header: string;
    width: string; // e.g. "10%"
    accessor?: keyof T; // Key to access data
    render?: (item: T) => React.ReactNode; // Custom renderer
    align?: 'left' | 'right' | 'center';
}

interface TableProps<T> {
    data: T[];
    columns: ColumnDefinition<T>[];
}

export function Table<T>({ data, columns }: TableProps<T>) {
    return (
        <View style={{ width: '100%' }}>
            {/* Table Header - Fixed to repeat on new pages */}
            <View style={styles.tableHeader} fixed>
                {columns.map((col, index) => (
                    <View
                        key={index}
                        style={{
                            width: col.width,
                            paddingHorizontal: 4,
                            alignItems: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start'
                        }}
                    >
                        <Text style={styles.tableHeaderCell}>{col.header}</Text>
                    </View>
                ))}
            </View>

            {/* Table Body */}
            {data.map((item, rowIndex) => (
                <View key={rowIndex} style={styles.tableRow} wrap={false}>
                    {/* wrap={false} prevents a single row from splitting across pages if possible, 
               though standard rows usually fit. If a row is huge, we might want it to split.
               For now, keeping rows intact is cleaner. */}
                    {columns.map((col, colIndex) => {
                        const cellContent = col.render
                            ? col.render(item)
                            : col.accessor
                                ? String(item[col.accessor] || '')
                                : '';

                        return (
                            <View
                                key={colIndex}
                                style={{
                                    width: col.width,
                                    paddingHorizontal: 4,
                                    alignItems: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start'
                                }}
                            >
                                {/* Check if content is a ReactNode (View/Text) or string */}
                                {React.isValidElement(cellContent) ? (
                                    cellContent
                                ) : (
                                    <Text style={styles.text}>{cellContent}</Text>
                                )}
                            </View>
                        );
                    })}
                </View>
            ))}

            {data.length === 0 && (
                <View style={[styles.tableRow, { justifyContent: 'center', paddingVertical: 20 }]}>
                    <Text style={{ fontStyle: 'italic', color: colors.textMuted }}>No data available</Text>
                </View>
            )}
        </View>
    );
}
