/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { MasterPDFDocument } from './MasterPDFDocument';
import { FileDown, Loader2 } from 'lucide-react';

interface PDFExportButtonProps {
    document: any;
    project: any;
    className?: string;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({ document, project, className }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <button disabled className={`opacity-50 cursor-wait ${className}`}>
                Loading PDF Engine...
            </button>
        );
    }

    const fileName = `${project?.name || 'Project'}_${document?.title || 'Document'}.pdf`.replace(/\s+/g, '_');

    return (
        <PDFDownloadLink
            document={<MasterPDFDocument document={document} project={project || { name: 'Untitled Project', id: '0' }} />}
            fileName={fileName}
            className={className}
        >
            {({ blob, url, loading, error }) => (
                <div className="flex items-center gap-2">
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <FileDown className="h-4 w-4" />}
                    <span>{loading ? 'Preparing PDF...' : 'Download PDF'}</span>
                </div>
            )}
        </PDFDownloadLink>
    );
};
