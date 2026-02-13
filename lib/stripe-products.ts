export const STRIPE_PLANS = {
    free: {
        id: 'price_1SowpyC1rh6o9AP0vhmFIQ0f',
        name: 'Scout',
        price: 'Free',
        maxProjects: 1,
        features: [
            '1 Active Project',
            'Basic Templates',
            'Standard PDF Exports'
        ]
    },
    pro: {
        id: 'price_1T0VXAC1rh6o9AP033es5olH',
        name: 'Pro',
        price: '$15',
        maxProjects: 5,
        features: [
            '5 Active Projects',
            'Advanced AI Tools & Generation',
            'Custom Branding on PDFs',
            'Priority Support'
        ]
    },
    studio: {
        id: 'price_1SowsKC1rh6o9AP08wa04r4r',
        name: 'Studio',
        price: '$29',
        maxProjects: Infinity,
        features: [
            'Unlimited Projects',
            'All Pro Features',
            'Team Collaboration (Coming Soon)',
            'White-Label Client View'
        ]
    }
};
