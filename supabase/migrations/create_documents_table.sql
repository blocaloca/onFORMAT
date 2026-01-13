-- Create documents table for project document management
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('concept', 'develop', 'plan', 'execute', 'wrap')),
  content JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in-progress', 'review', 'approved', 'archived')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster project queries
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);

-- Create index for stage filtering
CREATE INDEX IF NOT EXISTS idx_documents_stage ON documents(stage);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE documents IS 'Document storage for projects with stage-based workflow';
COMMENT ON COLUMN documents.project_id IS 'Foreign key to projects table';
COMMENT ON COLUMN documents.type IS 'Document type (e.g., brief, script, shot-list)';
COMMENT ON COLUMN documents.title IS 'Document title/name';
COMMENT ON COLUMN documents.stage IS 'Workflow stage: concept, develop, plan, execute, or wrap';
COMMENT ON COLUMN documents.content IS 'Document content stored as JSONB';
COMMENT ON COLUMN documents.status IS 'Document status: draft, in-progress, review, approved, or archived';
COMMENT ON COLUMN documents.progress IS 'Completion percentage (0-100)';
COMMENT ON COLUMN documents.metadata IS 'Additional metadata stored as JSONB';
