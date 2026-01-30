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
            if (!activeProject?.data?.phases) {
                console.warn("[ProjectContext] No phases data found");
                return {};
            }

            let foundData: any = null;
            let foundPhase: string | null = null;
            const phasesData = activeProject.data.phases;

            // Debug Phases Structure
            // console.log("[ProjectContext] Phases Available:", Object.keys(phasesData));

            // Search Strategy: Reverse Priority (POST -> ON_SET -> PRE_PRODUCTION -> DEVELOPMENT)
            const searchOrder = ['POST', 'ON_SET', 'PRE_PRODUCTION', 'DEVELOPMENT'];

            for (const phaseKey of searchOrder) {
                const phase = phasesData[phaseKey];
                if (phase?.drafts?.[toolId]) {
                    foundData = phase.drafts[toolId];
                    foundPhase = phaseKey;
                    break;
                }
            }

            // Fallback: Check ALL keys if not found (handling casing or custom keys)
            if (!foundData) {
                for (const key of Object.keys(phasesData)) {
                    const phase = phasesData[key];
                    if (phase?.drafts?.[toolId]) {
                        foundData = phase.drafts[toolId];
                        foundPhase = key;
                        console.warn(`[ProjectContext] Found data via fallback search in phase: [${key}]`);
                        break;
                    }
                }
            }

            // Extract & Parse
            let result = {};
            try {
                if (foundData) {
                    const parsed = typeof foundData === 'string' ? JSON.parse(foundData) : foundData;
                    // Array Extraction: If array, take the LAST item (most recent save)
                    result = Array.isArray(parsed) ? (parsed[parsed.length - 1] || {}) : (parsed || {});

                    if (foundPhase) {
                        console.log(`[PrintRoom] Connected: toolId [${toolId}] from phase [${foundPhase}]`);
                    }
                }
            } catch (e) {
                console.error(`[ProjectContext] Error parsing data for ${toolId}`, e);
            }

            // Console Proof was requested in Phase 1 Logging, handling via foundPhase check above.

            return result;
        };
    }, [activeProject]);

    return (
        <ProjectContext.Provider value={{ activeProject, getToolData }}>
            {children}
        </ProjectContext.Provider>
    );
};
