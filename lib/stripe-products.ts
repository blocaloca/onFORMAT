export const STRIPE_PLANS = {
    free: { // Maps to Solo/Free Trial default
        id: 'price_1SowpyC1rh6o9AP0vhmFIQ0f', // Add real Solo ID when ready
        name: 'Solo',
        price: '$19',
        maxProjects: 3,
        features: [
            '3 Active Projects',
            'Unlimited Archives',
            'Standard Print Room',
            'onSET Mobile Access'
        ]
    },
    pro: {
        id: 'price_1T0VXAC1rh6o9AP033es5olH',
        name: 'Pro',
        price: '$49',
        maxProjects: Infinity,
        features: [
            'Unlimited Active Projects',
            'Custom Studio Branding',
            'Multi-Unit Logic',
            'Offline Mobile Mode',
            'AI Liaison'
        ]
    },
    studio: {
        id: 'price_1SowsKC1rh6o9AP08wa04r4r',
        name: 'Studio',
        price: '$129',
        maxProjects: Infinity,
        features: [
            'Everything in PRO',
            '3 Producer Seats',
            'Multi-Seat Collab',
            'Global Templates',
            'Priority Support'
        ]
    }
};
