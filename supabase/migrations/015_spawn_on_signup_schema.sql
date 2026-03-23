-- Migration: Add template and lock flags to projects
-- Aligned with "Spawn-on-Signup" requirements

-- 1. Add is_template and permission_lock columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS permission_lock TEXT DEFAULT 'none';

-- 2. Add comment for clarity
COMMENT ON COLUMN projects.is_template IS 'Identifies if this project serves as a template or was spawned from one';
COMMENT ON COLUMN projects.permission_lock IS 'Enforces read-only or other restrictions: none, read_only';

-- 3. Update RLS (optional, we can also handle this in the app logic for more granularity)
-- But for now, let's ensure that if permission_lock is 'read_only', only Founder can update?
-- Actually, the requirement says "Users should be able to view all reactive data but cannot edit or delete core project documents."
-- This might be better handled in the application layer (WorkspaceEditor etc.)
