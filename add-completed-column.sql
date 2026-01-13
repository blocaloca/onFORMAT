-- Add completed column to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
