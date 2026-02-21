-- Add is_demo boolean flag to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- Allow public read access to demo projects (optional, depending on requirements, but useful for showcases)
-- (Leave commented out unless explicitly requested, but Good practice to have)
-- CREATE POLICY "Anyone can view demo projects"
--   ON projects FOR SELECT
--   USING (is_demo = true);
