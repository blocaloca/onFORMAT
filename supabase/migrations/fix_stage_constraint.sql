-- FIX C1: Remove restrictive CHECK constraint on documents.stage
-- This allows any stage ID to be used by templates (pre-production, production, etc.)
-- instead of only: develop, plan, execute, wrap

-- Remove the old constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_stage_check;

-- Add a looser constraint that just ensures stage is not empty
ALTER TABLE documents ADD CONSTRAINT documents_stage_check
  CHECK (stage IS NOT NULL AND stage != '');

-- Comment explaining the change
COMMENT ON COLUMN documents.stage IS 'Workflow stage - can be any non-empty string to support flexible template definitions';
