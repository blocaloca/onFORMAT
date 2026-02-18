'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');

    useEffect(() => {
        // FORCE LIGHT MODE (Machined Glass Pivot)
        setThemeState('light');
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }, []);

    const setTheme = (newTheme: Theme) => {
        // Enforce Light Mode override
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
