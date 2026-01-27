export type EventType =
    | 'SHOOT_DAY'
    | 'SCOUT'
    | 'PRE_PRO_GENERAL'
    | 'POST_DEADLINE'
    | 'MEETING'
    | 'GENERIC_BLOCK';

export type EventStatus = 'PLANNED' | 'CONFIRMED' | 'COMPLETED' | 'CONFLICT';

export interface ProductionEvent {
    id: string;
    projectId: string;
    projectName: string;
    projectColor?: string; // Hex code or tailwind class reference

    title: string;
    startDate: string; // ISO Date String YYYY-MM-DD
    endDate: string;   // ISO Date String YYYY-MM-DD

    type: EventType;
    status: EventStatus;

    // Metadata for "Deep Linking"
    linkedDocument?: {
        phase: string;
        toolKey: string;
        contextId?: string; // e.g., "Day 1"
    };

    description?: string;
}

export interface GridRow {
    id: string; // Project ID
    label: string; // Project Name
    events: ProductionEvent[];
    meta: {
        client: string;
        producer: string;
    };
}

// Logic Layer Inputs
export interface ProjectSourceData {
    id: string;
    name: string;
    data: any; // Raw JSON blob from Supabase
}
