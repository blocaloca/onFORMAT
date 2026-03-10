-- SQL Migration to remove the old product_type constraint without destroying data

-- First, find the name of the constraint on the projects table that restricts product_type
-- Often Supabase auto-generates this name, e.g., 'projects_product_type_check'
-- This script will attempt to drop the known constraint if you named it explicitly,
-- or you can replace "projects_product_type_check" with the actual constraint name found in your Supabase dashboard.

ALTER TABLE IF EXISTS public.projects 
DROP CONSTRAINT IF EXISTS projects_product_type_check;

-- Note: The column remains 'TEXT NOT NULL' so no data is lost.
