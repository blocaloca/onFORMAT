
/**
 * FOUNDER ACCESS CONTROL
 * 
 * Defines the super-user "Founder" who bypasses all subscription and access checks.
 */

const FOUNDER_EMAILS = ['casteelio@gmail.com'];

export const isFounder = (email?: string | null): boolean => {
    if (!email) return false;
    const founders = ['casteelio@gmail.com', 'davidcasteel@gmail.com'];
    return founders.includes(email.toLowerCase());
};

/**
 * Checks if a user has PRO level access (either via subscription or manual override).
 */
export const isPro = (user: { email?: string | null, subscription_tier?: string, subscription_status?: string, manual_pro_override?: boolean }) => {
    if (isFounder(user.email)) return true;
    if (user.manual_pro_override) return true;
    
    const isActive = user.subscription_status === 'active' || user.subscription_status === 'trialing';
    return (user.subscription_tier === 'pro' || user.subscription_tier === 'studio') && isActive;
};

/**
 * Checks if a user has access to a specific feature.
 * If user is a Founder or Pro Override, they always have access.
 */
export const hasAccess = (user: { email?: string | null, subscription_status?: string, manual_pro_override?: boolean }, featureRequiredTier: 'basic' | 'pro' | 'enterprise' = 'basic') => {
    if (isFounder(user.email)) return true;
    if (user.manual_pro_override) return true;

    // Normal Subscription Logic
    if (user.subscription_status === 'active' || user.subscription_status === 'trial' || user.subscription_status === 'trialing') return true;

    return false;
};
