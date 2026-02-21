import { useState, useEffect } from 'react';
import { getClient } from '@/lib/supabase';

interface TrialStatus {
    isLocked: boolean;
    daysLeft: number;
    isLoading: boolean;
}

export function useTrialStatus() {
    const [status, setStatus] = useState<TrialStatus>({
        isLocked: false,
        daysLeft: 14,
        isLoading: true,
    });
    const supabase = getClient();

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setStatus(prev => ({ ...prev, isLoading: false }));
                    return;
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('plan_tier, trial_ends_at')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    const now = new Date();
                    const trialEndsAt = new Date(profile.trial_ends_at || now);

                    const timeDiff = trialEndsAt.getTime() - now.getTime();
                    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

                    const isLocked = now > trialEndsAt && profile.plan_tier === 'FREE_TRIAL';

                    setStatus({
                        isLocked,
                        daysLeft: Math.max(0, daysLeft),
                        isLoading: false,
                    });
                } else {
                    setStatus(prev => ({ ...prev, isLoading: false }));
                }
            } catch (err) {
                console.error("Error fetching trial status:", err);
                setStatus(prev => ({ ...prev, isLoading: false }));
            }
        };

        fetchStatus();
    }, []);

    return status;
}
