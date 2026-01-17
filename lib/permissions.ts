
/**
 * FOUNDER ACCESS CONTROL
 * 
 * Defines the super-user "Founder" who bypasses all subscription and access checks.
 */

const FOUNDER_EMAILS = ['casteelio@gmail.com'];

export const isFounder = (email?: string | null): boolean => {
    if (!email) return false;
    return FOUNDER_EMAILS.includes(email.toLowerCase());
};

/**
 * Checks if a user has access to a specific feature.
 * If user is a Founder, they always have access.
 */
export const hasAccess = (user: { email?: string | null, subscription_status?: string }, featureRequiredTier: 'basic' | 'pro' | 'enterprise' = 'basic') => {
    if (isFounder(user.email)) return true;

    // Normal Subscription Logic (Placeholder)
    if (user.subscription_status === 'active') return true;

    return false;
};
