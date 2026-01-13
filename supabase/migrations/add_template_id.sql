-- Add template_id column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS template_id TEXT;

-- Make product_type nullable (for backwards compatibility)
ALTER TABLE projects
ALTER COLUMN product_type DROP NOT NULL;

-- Migrate existing projects from product_type to template_id
UPDATE projects
SET template_id = CASE
  WHEN product_type = 'LuxPixPro' THEN 'commercial-video'
  WHEN product_type = 'GenStudioPro' THEN 'social-content'
  WHEN product_type = 'ArtMind' THEN 'brand-campaign'
  ELSE NULL
END
WHERE template_id IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_template_id ON projects(template_id);

-- Add comment to explain the columns
COMMENT ON COLUMN projects.product_type IS 'Legacy field - use template_id instead';
COMMENT ON COLUMN projects.template_id IS 'Template identifier: commercial-video, commercial-photography, social-content, or brand-campaign';
