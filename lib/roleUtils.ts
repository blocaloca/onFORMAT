export const PRODUCTION_ROLES = [
    'Producer', 'Director', 'Director of Photography', '1st AD', '2nd AD',
    'UPM / Line Producer', 'Production Coordinator', 'Script Supervisor',
    'Gaffer', 'Key Grip', 'Sound Mixer', 'DIT', 'Media Manager',
    'Production Designer', 'Art Director', 'Stylist / Wardrobe', 'Makeup Artist', 'HMU (Hair & Makeup)',
    'Editor', 'Location Manager', 'PA (Production Assistant)',
    'General Crew', 'Other'
];

export function deriveMobileRoleId(roleName: string): string {
    if (!roleName) return 'crew';
    const r = roleName.toLowerCase().trim();
    
    if (r.includes('dit') || r.includes('media')) return 'dit';
    if (r.includes('producer') || r.includes('coordinator')) return 'producer';
    if (r === 'director') return 'director';
    if (r.includes('supervisor') || r === 'scripty') return 'scripty';
    if (r.includes('photography') || r === 'dp') return 'dp';
    if (r.includes('ad') || r.includes('assistant director')) return 'ad';
    if (r.includes('gaffer') || r.includes('electric')) return 'electric';
    if (r.includes('grip')) return 'grip';
    if (r.includes('sound') || r.includes('mixer')) return 'sound';
    if (r.includes('makeup') || r.includes('hmu')) return 'hmu';
    if (r.includes('art') || r.includes('designer') || r.includes('prop')) return 'art';
    if (r.includes('stylist') || r.includes('wardrobe')) return 'wardrobe';
    if (r.includes('editor')) return 'editor';
    if (r.includes('location')) return 'locations';
    if (r.includes('client') || r.includes('agency')) return 'client';
    if (r.includes('pa (production') || r === 'pa' || r.includes('production assistant')) return 'pa';
    
    // Default or explicitly mapping "General Crew" / undefined entries
    return 'crew';
}
