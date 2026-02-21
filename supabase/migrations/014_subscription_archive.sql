-- Phase 1: Subscription Schema Updates
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'FREE_TRIAL',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '14 days');

-- Phase 1: Project Archive Vault Updates
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
