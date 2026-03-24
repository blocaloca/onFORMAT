import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { isFounder } from '@/lib/permissions';

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
                    .select('subscription_tier, subscription_status, created_at, manual_pro_override')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    // 1. Founder / Admin bypass / Manual Pro Override
                    if (isFounder(user.email) || profile.manual_pro_override) {
                        setStatus({
                            isLocked: false,
                            daysLeft: 999, // Infinite
                            isLoading: false,
                        });
                        return;
                    }

                    const statusVal = profile.subscription_status || 'trial';
                    const createdAt = new Date(profile.created_at || new Date());
                    const trialEndsAt = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
                    const now = new Date();

                    const timeDiff = trialEndsAt.getTime() - now.getTime();
                    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

                    const isLocked = now > trialEndsAt && statusVal === 'trial';

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
