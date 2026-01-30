export interface PrintItem {
    id: string; // usually toolKey
    toolKey: string;
    label: string;
    isSelected: boolean;
    orientation: 'portrait' | 'landscape';
    pageCountEstimate: number;
}

export const TOOL_TYPES: Record<string, { label: string, defaultOrient: 'portrait' | 'landscape' }> = {
    // Development
    'project-vision': { label: 'Project Vision', defaultOrient: 'portrait' },
    'brief': { label: 'Creative Brief', defaultOrient: 'landscape' },
    'directors-treatment': { label: 'Director\'s Treatment', defaultOrient: 'landscape' },
    'lookbook': { label: 'Lookbook', defaultOrient: 'landscape' },
    'storyboard': { label: 'Storyboard', defaultOrient: 'landscape' },
    'av-script': { label: 'AV Script', defaultOrient: 'portrait' },

    // Pre-Production
    'shot-scene-book': { label: 'Shot List', defaultOrient: 'landscape' },
    'budget': { label: 'Budget', defaultOrient: 'landscape' },
    'schedule': { label: 'Production Schedule', defaultOrient: 'landscape' },
    'crew-list': { label: 'Crew List', defaultOrient: 'portrait' },
    'locations-sets': { label: 'Locations', defaultOrient: 'landscape' },
    'casting-talent': { label: 'Talent', defaultOrient: 'portrait' },
    'wardrobe-styling': { label: 'Wardrobe', defaultOrient: 'portrait' },
    'props-list': { label: 'Props', defaultOrient: 'portrait' },

    // On-Set
    'call-sheet': { label: 'Call Sheet', defaultOrient: 'landscape' },
    'dit-log': { label: 'DIT Log', defaultOrient: 'landscape' },
    'sound-report': { label: 'Sound Report', defaultOrient: 'portrait' },
    'camera-report': { label: 'Camera Report', defaultOrient: 'landscape' },
    'on-set-notes': { label: 'On-Set Notes', defaultOrient: 'portrait' },
    'script-notes': { label: 'Script Notes', defaultOrient: 'landscape' },

    // Post
    'budget-actual': { label: 'Actuals', defaultOrient: 'landscape' },
    'deliverables-licensing': { label: 'Deliverables', defaultOrient: 'portrait' },
    'client-selects': { label: 'Client Selects', defaultOrient: 'landscape' },
    'archive-log': { label: 'Archive Log', defaultOrient: 'portrait' },
};
