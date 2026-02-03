export interface PrintItem {
    id: string; // usually toolKey
    toolKey: string;
    label: string;
    isSelected: boolean;
    orientation: 'portrait' | 'landscape';
    pageCountEstimate: number;
    selectedVersions?: number[];
}
