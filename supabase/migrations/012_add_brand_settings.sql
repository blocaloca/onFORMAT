-- ==================================================
-- MIGRATION: 012_add_brand_settings.sql
-- DESCRIPTION: Adds brand_settings JSONB column to projects table for PDF customization
-- ==================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'brand_settings') THEN
        ALTER TABLE public.projects ADD COLUMN brand_settings JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;
