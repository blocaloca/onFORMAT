'use client';
import React, { createContext, useContext, useMemo } from 'react';

interface ProjectDataContextType {
    data: any;
    userEmail: string | null;
    isOwner: boolean;
    isDelegate: boolean;
    canEditMobile: boolean;
    me: any;
}

const ProjectDataContext = createContext<ProjectDataContextType | undefined>(undefined);

export const ProjectDataProvider = ({ children, data, userEmail }: { children: React.ReactNode, data: any, userEmail: string | null }) => {
    const me = useMemo(() => {
        const crew = data?.docs?.['crew-list']?.crew || [];
        return crew.find((c: any) => c.email?.toLowerCase() === userEmail?.toLowerCase());
    }, [data, userEmail]);

    const isOwner = data?._role === 'Owner';
    const isDelegate = !!(me?.onSetGroups?.includes('D') || me?.permissions?.canEditMobile);

    const value = {
        data,
        userEmail,
        isOwner,
        isDelegate,
        canEditMobile: isOwner || isDelegate,
        me
    };

    return (
        <ProjectDataContext.Provider value={value}>
            {children}
        </ProjectDataContext.Provider>
    );
};

export const useProjectData = () => {
    const context = useContext(ProjectDataContext);
    if (context === undefined) {
        // Fallback for parts of the app not yet wrapped
        return {
            data: null,
            userEmail: null,
            isOwner: false,
            isDelegate: false,
            canEditMobile: false,
            me: null
        };
    }
    return context;
};
