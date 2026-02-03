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
    getToolStack: (toolId: string) => any[];
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
            const phases = activeProject.data.phases;

            // Search Priority: POST > ON_SET > PRE_PRODUCTION > DEVELOPMENT
            const priorityOrder = ['POST', 'ON_SET', 'PRE_PRODUCTION', 'DEVELOPMENT'];

            // 1. Priority Search
            for (const phaseKey of priorityOrder) {
                // Try exact casing first, then fallback to lowercase match if custom keys exist
                const phase = phases[phaseKey] || phases[phaseKey.toLowerCase()];
                if (phase?.drafts?.[toolId]) {
                    foundData = phase.drafts[toolId];
                    break;
                }
            }

            // 2. Fallback Search (if not found in priority phases)
            if (!foundData) {
                for (const key of Object.keys(phases)) {
                    if (phases[key]?.drafts?.[toolId]) {
                        foundData = phases[key].drafts[toolId];
                        break;
                    }
                }
            }

            // Extract & Parse
            let result = {};
            try {
                if (foundData) {
                    const parsed = typeof foundData === 'string' ? JSON.parse(foundData) : foundData;
                    // Array Extraction: Take LAST item (Most Recent Save)
                    result = Array.isArray(parsed) ? (parsed[parsed.length - 1] || {}) : (parsed || {});
                }
            } catch (e) {
                console.error(`[ProjectContext] Error parsing data for ${toolId}`, e);
            }

            return result;
        };
    }, [activeProject]);

    // Stack/Array Unwrapper (Returns all Versions/Days)
    const getToolStack = useMemo(() => {
        return (toolId: string) => {
            if (!activeProject?.data?.phases) return [];

            let foundData: any = null;
            const phases = activeProject.data.phases;
            const priorityOrder = ['POST', 'ON_SET', 'PRE_PRODUCTION', 'DEVELOPMENT'];

            for (const phaseKey of priorityOrder) {
                const phase = phases[phaseKey] || phases[phaseKey.toLowerCase()];
                if (phase?.drafts?.[toolId]) {
                    foundData = phase.drafts[toolId];
                    break;
                }
            }

            if (!foundData) {
                for (const key of Object.keys(phases)) {
                    if (phases[key]?.drafts?.[toolId]) {
                        foundData = phases[key].drafts[toolId];
                        break;
                    }
                }
            }

            let result: any[] = [];
            try {
                if (foundData) {
                    const parsed = typeof foundData === 'string' ? JSON.parse(foundData) : foundData;
                    result = Array.isArray(parsed) ? parsed : [parsed];
                }
            } catch (e) { }
            return result;
        };
    }, [activeProject]);

    return (
        <ProjectContext.Provider value={{ activeProject, getToolData, getToolStack }}>
            {children}
        </ProjectContext.Provider>
    );
};
