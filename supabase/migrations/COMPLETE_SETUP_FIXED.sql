-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPLETE DATABASE SETUP - FIXED VERSION
-- ═══════════════════════════════════════════════════════════════════════════════
-- This version handles the case where messages table already exists
-- but is missing the document_id column
-- ═══════════════════════════════════════════════════════════════════════════════

-- STEP 1: Create update_updated_at_column function (if it doesn't exist)
DO $$
BEGIN
  RAISE NOTICE '═══ STEP 1: Creating trigger function ═══';
END $$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- STEP 2: Create documents table (if it doesn't exist)
DO $$
BEGIN
  RAISE NOTICE '═══ STEP 2: Creating documents table ═══';
END $$;

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  stage TEXT NOT NULL,  -- No CHECK constraint initially
  content JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in-progress', 'review', 'approved', 'archived')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for documents table (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_stage ON documents(stage);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- Add updated_at trigger to documents (drop first if exists)
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Add comments
COMMENT ON TABLE documents IS 'Document storage for projects with stage-based workflow';
COMMENT ON COLUMN documents.stage IS 'Workflow stage - can be any non-empty string';

-- STEP 3: Fix stage constraint (remove restrictive check)
DO $$
BEGIN
  RAISE NOTICE '═══ STEP 3: Fixing stage constraint ═══';
END $$;

-- Drop the old restrictive constraint if it exists
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_stage_check;

-- Add flexible constraint (just ensure stage is not empty)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'documents_stage_check'
  ) THEN
    ALTER TABLE documents ADD CONSTRAINT documents_stage_check
      CHECK (stage IS NOT NULL AND stage != '');
    RAISE NOTICE '✅ Added flexible stage constraint';
  ELSE
    RAISE NOTICE '⚠️ Stage constraint already exists';
  END IF;
END $$;

-- STEP 4: Create/Fix messages table
DO $$
BEGIN
  RAISE NOTICE '═══ STEP 4: Creating/fixing messages table ═══';
END $$;

-- If messages table exists but is broken, drop it and recreate
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    -- Check if document_id column exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'messages' AND column_name = 'document_id'
    ) THEN
      RAISE NOTICE '⚠️ Messages table exists but is missing document_id column - recreating';
      DROP TABLE messages CASCADE;
    ELSE
      RAISE NOTICE '✅ Messages table exists with correct schema';
    END IF;
  END IF;
END $$;

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for messages table (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_document_id ON messages(document_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Add updated_at trigger to messages (drop first if exists)
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicates
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- Create RLS policies for messages
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE messages IS 'AI chat message history for projects and documents';
COMMENT ON COLUMN messages.project_id IS 'Optional: Project this message belongs to';
COMMENT ON COLUMN messages.document_id IS 'Optional: Document this message belongs to';
COMMENT ON COLUMN messages.user_id IS 'User who owns this message';
COMMENT ON COLUMN messages.role IS 'Message role: user, assistant, or system';
COMMENT ON COLUMN messages.content IS 'Message text content';
COMMENT ON COLUMN messages.metadata IS 'Additional metadata (AI settings, context, etc.)';

-- FINAL STEP: Verification
DO $$
DECLARE
  docs_exists boolean;
  msgs_exists boolean;
  doc_id_exists boolean;
  stage_constraint_flexible boolean;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE '        SETUP VERIFICATION';
  RAISE NOTICE '═══════════════════════════════════════';

  -- Check documents table
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents')
  INTO docs_exists;

  IF docs_exists THEN
    RAISE NOTICE '✅ Documents table exists';
  ELSE
    RAISE NOTICE '❌ Documents table missing';
  END IF;

  -- Check messages table
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages')
  INTO msgs_exists;

  IF msgs_exists THEN
    RAISE NOTICE '✅ Messages table exists';
  ELSE
    RAISE NOTICE '❌ Messages table missing';
  END IF;

  -- Check document_id column in messages
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'document_id'
  ) INTO doc_id_exists;

  IF doc_id_exists THEN
    RAISE NOTICE '✅ Messages.document_id column exists';
  ELSE
    RAISE NOTICE '❌ Messages.document_id column missing';
  END IF;

  -- Check stage constraint
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'documents_stage_check'
    AND pg_get_constraintdef(oid) LIKE '%IS NOT NULL%'
  ) INTO stage_constraint_flexible;

  IF stage_constraint_flexible THEN
    RAISE NOTICE '✅ Stage constraint is flexible';
  ELSE
    RAISE NOTICE '⚠️ Stage constraint may be restrictive';
  END IF;

  RAISE NOTICE '═══════════════════════════════════════';

  IF docs_exists AND msgs_exists AND doc_id_exists THEN
    RAISE NOTICE '✅ SETUP COMPLETE!';
    RAISE NOTICE 'Next: Test creating a Commercial Video project';
  ELSE
    RAISE NOTICE '⚠️ SETUP INCOMPLETE - check errors above';
  END IF;

  RAISE NOTICE '═══════════════════════════════════════';
END $$;
