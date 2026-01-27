import { ProductionEvent, ProjectSourceData, GridRow, EventType } from './types';

/**
 * pure function to parse date string (MM/DD/YYYY) to ISO (YYYY-MM-DD)
 */
function normalizeDate(dateStr: string): string | null {
    if (!dateStr) return null;
    try {
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;

        const m = parts[0].padStart(2, '0');
        const d = parts[1].padStart(2, '0');
        const y = parts[2];

        // Direct string mapping to avoid timezone shifts
        return `${y}-${m}-${d}`;
    } catch {
        return null;
    }
}

/**
 * Extracts events from a single Project's data blob
 */
export function parseProjectEvents(project: ProjectSourceData): ProductionEvent[] {
    const events: ProductionEvent[] = [];
    const { id, name, data } = project;
    const phases = data?.phases || {};

    // 1. Parse SCHEDULE (Production Phase)
    // Structure: phases.ON_SET.drafts.schedule -> JSON string -> Array of { date: "MM/DD/YYYY" }
    const scheduleDraft = phases.ON_SET?.drafts?.schedule;
    if (scheduleDraft) {
        try {
            const days = JSON.parse(scheduleDraft);
            if (Array.isArray(days)) {
                days.forEach((day: any, index: number) => {
                    if (day.date) {
                        const isoDate = normalizeDate(day.date);
                        if (isoDate) {
                            events.push({
                                id: `evt-${id}-shoot-${index}`,
                                projectId: id,
                                projectName: name,
                                projectColor: data.color || 'blue', // Default
                                title: `Shoot Day ${index + 1}`,
                                startDate: isoDate,
                                endDate: isoDate,
                                type: 'SHOOT_DAY',
                                status: 'CONFIRMED',
                                linkedDocument: {
                                    phase: 'ON_SET',
                                    toolKey: 'schedule',
                                    contextId: `Day ${index + 1}`
                                },
                                description: `General Call: ${day.callTime || 'TBD'}`
                            });
                        }
                    }
                });
            }
        } catch (e) {
            console.warn(`Failed to parse schedule for project ${name}`, e);
        }
    }

    // 2. Parse DELIVERABLES (Post Phase) for Deadlines
    const deliverablesDraft = phases.POST?.drafts?.['deliverables-licensing'];
    if (deliverablesDraft) {
        try {
            let data = JSON.parse(deliverablesDraft);
            // Handle Version Stack (Array) - DraftEditor puts active version at index 0 usually,
            // or we might need to find the one with items. 
            // Consistent with other parsers: take index 0 if array.
            if (Array.isArray(data)) {
                data = data.length > 0 ? data[0] : {};
            }

            if (data && data.items && Array.isArray(data.items)) {
                data.items.forEach((item: any, index: number) => {
                    // Check for ISO Date (YYYY-MM-DD) from type="date" input
                    if (item.dueDate && item.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        events.push({
                            id: `evt-${id}-del-dead-${index}`,
                            projectId: id,
                            projectName: name,
                            projectColor: data.color || 'blue',
                            title: item.fileNumber ? `DUE: ${item.fileNumber}` : `Deadline`,
                            startDate: item.dueDate,
                            endDate: item.dueDate,
                            type: 'POST_DEADLINE', // Must match EventType in types.ts (it does)
                            status: 'PLANNED',
                            linkedDocument: {
                                phase: 'POST',
                                toolKey: 'deliverables-licensing'
                            },
                            description: item.description || 'Deliverable Due'
                        });
                    }
                });
            }
        } catch (e) {
            console.warn(`Failed to parse deliverables for project ${name}`, e);
        }
    }

    // 3. Parse OTHER DATES (Coming soon: Scout Dates, etc.)

    return events;
}

/**
 * Transforms raw Supabase projects into Render-Ready Rows
 */
export function buildGridRows(projects: ProjectSourceData[]): GridRow[] {
    return projects.map(p => {
        const events = parseProjectEvents(p);

        // Only include rows if they have events? Or always include active projects?
        // Producer usually wants to see all ACTIVE projects.
        // Assuming filtered by "Active" (non-archived) before calling this.

        return {
            id: p.id,
            label: p.name,
            events: events,
            meta: {
                client: p.data?.clientName || '',
                producer: p.data?.producer || ''
            }
        };
    });
}

/**
 * Clash Detection Logic
 */
export function detectClashes(rows: GridRow[]): Set<string> {
    const dateMap = new Map<string, string[]>();

    rows.forEach(row => {
        row.events.forEach(event => {
            // Using startDate as the key (YYYY-MM-DD)
            const date = event.startDate;
            if (date) {
                if (!dateMap.has(date)) {
                    dateMap.set(date, []);
                }
                dateMap.get(date)?.push(event.id);
            }
        });
    });

    const clashingIds = new Set<string>();
    dateMap.forEach((ids) => {
        if (ids.length > 1) {
            ids.forEach(id => clashingIds.add(id));
        }
    });

    return clashingIds;
}
