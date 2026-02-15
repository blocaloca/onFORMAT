import { ThemeProvider } from '@/components/ThemeProvider';

export default function ProjectLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider>
            {children}
        </ThemeProvider>
    );
}
