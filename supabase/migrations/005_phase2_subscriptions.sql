-- ==================================================
-- MIGRATION: 005_PHASE2_SUBSCRIPTIONS.sql
-- DESCRIPTION: Creates subscription tables and admin controls
-- ==================================================

-- 1. Create Subscriptions Table
-- This table will be the source of truth for app logic, synced via Stripe Webhooks
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid')),
    price_id TEXT,
    tier TEXT NOT NULL DEFAULT 'scout' CHECK (tier IN ('scout', 'pro', 'studio', 'enterprise')),
    currency TEXT,
    interval TEXT,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Subscription RLS Policies
-- Users can read their OWN subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
FOR SELECT USING (auth.uid() = user_id);

-- Only Service Role (Stripe Webhook) or Founder can write
CREATE POLICY "Service Role manages subscriptions" ON public.subscriptions
FOR ALL USING (
    (auth.jwt() ->> 'email') = 'casteelio@gmail.com' -- Founder Override
    OR
    auth.role() = 'service_role'
);

-- 3. Create 'profiles' enhancements for Beta/Admin flags if not exists
-- We'll add columns to the profiles table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_beta_user') THEN
        ALTER TABLE public.profiles ADD COLUMN is_beta_user BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add founder override column for manual granting of pro status without stripe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'manual_pro_override') THEN
        ALTER TABLE public.profiles ADD COLUMN manual_pro_override BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 4. Admin Dashboard Access Policy
-- We'll rely on the is_admin flag or specific email check in the application layer middleware, 
-- but let's Create a secure function to check admin status for RLS policies if needed.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email') = 'casteelio@gmail.com'
         OR EXISTS (
           SELECT 1 FROM public.profiles
           WHERE id = auth.uid() AND is_admin = TRUE
         );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Updated Projects Policy to respect Plan Limits (Enforcement Layer)
-- We will implement the enforcement logic in the application layer (API Route),
-- but we can add a Database Function to check limits for convenience.

CREATE OR REPLACE FUNCTION public.check_project_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    sub_tier TEXT;
    is_override BOOLEAN;
BEGIN
    -- Get current project count
    SELECT COUNT(*) INTO current_count FROM public.projects WHERE user_id = user_uuid;
    
    -- Get Subscription Tier (Default to scout)
    SELECT tier INTO sub_tier FROM public.subscriptions WHERE user_id = user_uuid AND status = 'active' LIMIT 1;
    sub_tier := COALESCE(sub_tier, 'scout');
    
    -- Get Override Status
    SELECT manual_pro_override INTO is_override FROM public.profiles WHERE id = user_uuid;
    is_override := COALESCE(is_override, FALSE);

    -- Logic: 
    -- If Override is TRUE -> UNLIMITED
    -- If Tier is 'pro' or 'studio' -> UNLIMITED
    -- If Tier is 'scout' -> LIMIT 1
    
    IF is_override OR sub_tier IN ('pro', 'studio', 'enterprise') THEN
        RETURN TRUE;
    ELSE
        RETURN current_count < 1;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

