-- Add is_online column to crew_membership table
ALTER TABLE crew_membership ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- Enable replication for crew_membership (Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE crew_membership;
