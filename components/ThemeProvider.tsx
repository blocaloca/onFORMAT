'use client';
// Mobile Polish Update - RETRY 2 - 10:47 AM

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');

    const pathname = usePathname();

    useEffect(() => {
        // Exception: OnSET Mobile is ALWAYS Dark Mode
        if (pathname?.startsWith('/onset')) {
            setThemeState('dark');
            document.documentElement.classList.add('dark');
            // We don't save to localStorage to avoid flipping the desktop app preference
        } else {
            // FORCE LIGHT MODE (Machined Glass Pivot) for main app
            setThemeState('light');
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [pathname]);

    const setTheme = (newTheme: Theme) => {
        // Enforce Light Mode override unless on mobile path
        if (pathname?.startsWith('/onset')) {
            setThemeState('dark');
            document.documentElement.classList.add('dark');
            return;
        }

        const forcedTheme = 'light';
        setThemeState(forcedTheme);
        localStorage.setItem('theme', forcedTheme);
        document.documentElement.classList.remove('dark');
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
