/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { DocumentWrapper, PageLayout } from './DocumentWrapper';
import { CoverPage } from './CoverPage';
import { ReportHeader } from './ReportHeader';
import { Table, ColumnDefinition } from './TableComponents';
import { styles } from './pdfStyles';

// Types (Mirrored from application logic)
interface DocumentData {
    id: string;
    type: string;
    title: string;
    stage: string;
    content: any;
    created_at: string;
}

interface ProjectData {
    name: string;
    id: string;
}

interface MasterPDFProps {
    document: DocumentData;
    project: ProjectData;
    userName?: string;
}

export const MasterPDFDocument: React.FC<MasterPDFProps> = ({ document, project, userName }) => {
    // 1. Determine Columns based on Document Type
    const getColumns = (): ColumnDefinition<any>[] => {
        switch (document.type) {
            case 'budget':
                return [
                    { header: 'Category', width: '20%', accessor: 'category' },
                    { header: 'Description', width: '60%', accessor: 'description' },
                    {
                        header: 'Amount',
                        width: '20%',
                        align: 'right',
                        render: (item: any) => `$${Number(item.amount || 0).toLocaleString()}`
                    }
                ];

            case 'shot-list':
                return [
                    { header: '#', width: '5%', accessor: 'shotNumber', align: 'center' },
                    { header: 'Size', width: '15%', accessor: 'size' },
                    { header: 'Angle', width: '15%', accessor: 'angle' },
                    { header: 'Description', width: '50%', accessor: 'description' },
                    { header: 'Movement', width: '15%', accessor: 'movement' }
                ];

            case 'call-sheet':
                // Assuming crew list structure
                return [
                    { header: 'Position', width: '30%', accessor: 'position' },
                    { header: 'Name', width: '40%', accessor: 'name' },
                    { header: 'Call Time', width: '30%', accessor: 'callTime' }
                ];

            case 'av-script':
                return [
                    { header: 'Scene', width: '10%', align: 'center', render: (row: any) => row.scene || '—' },
                    { header: 'Duration', width: '10%', align: 'center', render: (row: any) => row.time || '—' },
                    { header: 'Visual', width: '40%', accessor: 'visual' },
                    { header: 'Audio', width: '40%', accessor: 'audio' }
                ];

            default:
                // Generic fallback - try to find common keys or array
                return [
                    { header: 'Content', width: '100%', render: (item) => JSON.stringify(item) }
                ];
        }
    };

    // 2. Extract Data Rows
    const getData = (): any[] => {
        const c = document.content;
        if (!c) return [];

        // Budget
        if (document.type === 'budget' && c.lineItems) return c.lineItems;

        // Shot List
        if (document.type === 'shot-list' && Array.isArray(c)) return c;
        if (document.type === 'shot-list' && c.shots) return c.shots;

        // Call Sheet (Complex logic usually, extracting simplified list for now)
        if (document.type === 'call-sheet') {
            // Combine crew and talent?
            const crew = c.crew || [];
            const talent = c.talent || [];
            return [...talent, ...crew];
        }

        // AV Script
        if (document.type === 'av-script' && c.rows) return c.rows;

        // Generic List
        if (Array.isArray(c)) return c;
        if (c.items) return c.items;

        return [];
    };

    const tableData = getData();
    const columns = getColumns();

    // 3. Render
    return (
        <DocumentWrapper
            metadata={{
                title: document.title,
                author: userName || 'Creative OS',
                subject: `${project.name} - ${document.type}`
            }}
        >
            {/* Cover Page */}
            <CoverPage
                projectName={project.name}
                documentTitle={document.title}
                client="" // In strict architecture, this would come from Project metadata
                author={userName}
                version="1.0" // TODO: Add versioning
            />

            {/* Main Content Page(s) */}
            <PageLayout>
                <ReportHeader
                    projectName={project.name}
                    phase={document.stage || 'PRODUCTION'}
                    documentTitle={document.title.toUpperCase()}
                    subTitle={document.type.toUpperCase()}
                />

                {/* Dynamic Table from JSON Data */}
                <Table data={tableData} columns={columns} />

                {/* Footer Totals for Budget */}
                {document.type === 'budget' && document.content?.total > 0 && (
                    <View style={{ marginTop: 20, alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#000', paddingTop: 10 }}>
                        <Text style={{ fontSize: 11, fontWeight: 700 }}>
                            TOTAL: ${Number(document.content.total).toLocaleString()}
                        </Text>
                    </View>
                )}
            </PageLayout>
        </DocumentWrapper>
    );
};
