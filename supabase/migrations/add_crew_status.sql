-- Add status tracking columns to crew_membership
ALTER TABLE public.crew_membership 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'offline',
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;

-- Add index for performance on large crew lists
CREATE INDEX IF NOT EXISTS idx_crew_membership_project_status 
ON public.crew_membership(project_id, status);
