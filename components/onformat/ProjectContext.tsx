import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Define the shape of activeProject
export interface ActiveProject {
    name: string;
    owner_name: string;
    created_at?: string;
    data: {
        phases: any;
    };
}

interface ProjectContextType {
    activeProject: ActiveProject | null;
    getToolData: (toolId: string) => any;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error("useProject must be used within a ProjectProvider");
    }
    return context;
};

interface ProjectProviderProps {
    children: React.ReactNode;
    phases: any;
    projectMetadata: {
        name?: string;
        producer?: string;
        created_at?: string;
    };
}

export const ProjectProvider = ({ children, phases, projectMetadata }: ProjectProviderProps) => {
    const activeProject = useMemo(() => {
        return {
            name: projectMetadata.name || 'Untitled Project',
            owner_name: projectMetadata.producer || 'Unknown Producer',
            created_at: projectMetadata.created_at || new Date().toISOString(),
            data: { phases }
        };
    }, [phases, projectMetadata]);

    // Universal Unwrapper
    // Searches all phases for the toolId and extracts the data
    const getToolData = useMemo(() => {
        return (toolId: string) => {
            if (!activeProject?.data?.phases) return {};

            let foundData: any = null;
            const phasesData = activeProject.data.phases;

            // Search Strategy: Iterate all phases to find the tool draft
            // Order: DEVELOPMENT -> PRE_PRODUCTION -> ON_SET -> POST (implicit order of keys)
            for (const phaseKey of Object.keys(phasesData)) {
                const phase = phasesData[phaseKey];
                if (phase?.drafts?.[toolId]) {
                    foundData = phase.drafts[toolId];
                    break;
                }
            }

            // Extract & Parse
            let result = {};
            try {
                if (foundData) {
                    const parsed = typeof foundData === 'string' ? JSON.parse(foundData) : foundData;
                    // Array Extraction: If array, take first item
                    result = Array.isArray(parsed) ? (parsed[0] || {}) : (parsed || {});
                }
            } catch (e) {
                console.error(`[ProjectContext] Error parsing data for ${toolId}`, e);
            }

            // Console Proof: Handshake Verification (Log only if data exists to avoid spam, or log empty as 'Empty')
            if (Object.keys(result).length > 0) {
                console.log(`[PrintRoom] Injecting data for [${toolId}]:`, result);
            } else {
                console.log(`[PrintRoom] Injecting data for [${toolId}]: Empty`);
            }

            return result;
        };
    }, [activeProject]);

    return (
        <ProjectContext.Provider value={{ activeProject, getToolData }}>
            {children}
        </ProjectContext.Provider>
    );
};
