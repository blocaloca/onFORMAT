import React, { createContext, useContext, useMemo } from 'react';

// Define the shape of activeProject
export interface ActiveProject {
    name: string;
    owner_name: string;
    created_at?: string;
    data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        phases: any;
    };
}

interface ProjectContextType {
    activeProject: ActiveProject | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getToolData: (toolId: string) => any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Score a parsed data object by how much meaningful content it has.
    // Arrays count by length (more items = richer), strings count as 1 each.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scoreData = (data: any): number => {
        if (!data || typeof data !== 'object') return 0;
        let score = 0;
        for (const val of Object.values(data)) {
            if (val === null || val === undefined || val === '') continue;
            if (Array.isArray(val)) score += val.length;
            else if (typeof val === 'string' && val.trim()) score += 1;
            else if (typeof val === 'number') score += 1;
            else if (typeof val === 'object') score += Object.keys(val as object).length;
        }
        return score;
    };

    // Universal Unwrapper — picks the phase with the richest data for the tool.
    // Tie-breaks by phase priority (POST > ON_SET > PRE_PRODUCTION > DEVELOPMENT)
    // so that when scores are equal, later-phase data wins.
    const getToolData = useMemo(() => {
        return (toolId: string) => {
            if (!activeProject?.data?.phases) return {};

            const phases = activeProject.data.phases;
            const priorityOrder = ['POST', 'ON_SET', 'PRE_PRODUCTION', 'DEVELOPMENT'];
            const allPhaseKeys = [
                ...priorityOrder,
                ...Object.keys(phases).filter(k => !priorityOrder.includes(k))
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let bestResult: any = {};
            let bestScore = -1;

            for (const phaseKey of allPhaseKeys) {
                const phase = phases[phaseKey] || phases[phaseKey.toLowerCase()];
                if (!phase?.drafts?.[toolId]) continue;
                try {
                    const parsed = typeof phase.drafts[toolId] === 'string'
                        ? JSON.parse(phase.drafts[toolId])
                        : phase.drafts[toolId];
                    const data = Array.isArray(parsed) ? (parsed[parsed.length - 1] || {}) : (parsed || {});
                    const score = scoreData(data);
                    if (score > bestScore) {
                        bestScore = score;
                        bestResult = data;
                    }
                } catch (e) {
                    console.error(`[ProjectContext] Error parsing data for ${toolId} in ${phaseKey}`, e);
                }
            }

            return bestResult;
        };
    }, [activeProject]);

    // Stack/Array Unwrapper — picks the phase whose stack has the highest total richness score.
    const getToolStack = useMemo(() => {
        return (toolId: string) => {
            if (!activeProject?.data?.phases) return [];

            const phases = activeProject.data.phases;
            const priorityOrder = ['POST', 'ON_SET', 'PRE_PRODUCTION', 'DEVELOPMENT'];
            const allPhaseKeys = [
                ...priorityOrder,
                ...Object.keys(phases).filter(k => !priorityOrder.includes(k))
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let bestStack: any[] = [];
            let bestScore = -1;

            for (const phaseKey of allPhaseKeys) {
                const phase = phases[phaseKey] || phases[phaseKey.toLowerCase()];
                if (!phase?.drafts?.[toolId]) continue;
                try {
                    const parsed = typeof phase.drafts[toolId] === 'string'
                        ? JSON.parse(phase.drafts[toolId])
                        : phase.drafts[toolId];
                    const stack: any[] = Array.isArray(parsed) ? parsed : [parsed];
                    const score = stack.reduce((sum, item) => sum + scoreData(item), 0);
                    if (score > bestScore) {
                        bestScore = score;
                        bestStack = stack;
                    }
                } catch { }
            }

            return bestStack;
        };
    }, [activeProject]);

    return (
        <ProjectContext.Provider value={{ activeProject, getToolData, getToolStack }}>
            {children}
        </ProjectContext.Provider>
    );
};
