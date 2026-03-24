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
        } else {
            // Read from local storage or default to light
            const savedTheme = (localStorage.getItem('theme') as Theme) || 'light';
            setThemeState(savedTheme);
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [pathname]);

    const setTheme = (newTheme: Theme) => {
        // Enforce always-dark on mobile
        if (pathname?.startsWith('/onset')) {
            setThemeState('dark');
            document.documentElement.classList.add('dark');
            return;
        }

        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
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
