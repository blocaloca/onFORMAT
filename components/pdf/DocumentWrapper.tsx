import React, { ReactNode } from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles } from './pdfStyles';

interface DocumentWrapperProps {
    children: ReactNode;
    metadata?: {
        title?: string;
        author?: string;
        subject?: string;
        keywords?: string;
    };
}

export const DocumentWrapper: React.FC<DocumentWrapperProps> = ({ children, metadata }) => {
    return (
        <Document
            title={metadata?.title}
            author={metadata?.author}
            subject={metadata?.subject}
            keywords={metadata?.keywords}
        >
            {/* 
        This is a wrapper for the entire PDF generation process. 
        Note: The actual 'pages' are usually defined by the children (e.g., CoverPage then ContentPage).
        However, if the child is just content, we might wrap it in a default Page.
        
        To support the architecture where Children provides Pages (like CoverPage), 
        DocumentWrapper mostly acts as the <Document> container. 
        
        BUT, the requirement says "It must handle automatic page numbering... and timestamp".
        This implies shared layout logic. 
        
        If we want global headers/footers, we usually put them inside a <Page>.
        Let's assume this wrapper renders the MAIN content page(s).
        But if we have a CoverPage, that's a separate Layout.
        
        Strategy: The children should be the content that flows. 
        We will wrap children in a <Page> that has the footer fixed.
      */}
            {children}
        </Document>
    );
};

// A standard page layout that includes the footer
interface PageLayoutProps {
    children: ReactNode;
    orientation?: 'portrait' | 'landscape';
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, orientation = 'portrait' }) => {
    const generatedDate = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return (
        <Page size="LETTER" style={styles.page} orientation={orientation}>
            {children}

            {/* Footer - Fixed on all pages */}
            <View style={styles.footer} fixed>
                <Text style={styles.footerText}>Generated on {generatedDate}</Text>
                <Text
                    style={styles.footerText}
                    render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                />
            </View>
        </Page>
    );
};
