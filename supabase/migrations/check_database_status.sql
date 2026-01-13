-- DIAGNOSTIC: Check what tables and constraints exist in your database
-- Run this FIRST to understand the current state

-- Check 1: What tables exist?
SELECT
  '═══ TABLES IN DATABASE ═══' as info;

SELECT
  table_name,
  CASE
    WHEN table_name IN ('projects', 'documents', 'profiles', 'messages')
    THEN '✅ Expected table'
    ELSE '📋 Other table'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check 2: Does documents table exist?
SELECT
  '═══ DOCUMENTS TABLE STATUS ═══' as info;

SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents')
    THEN '✅ Documents table EXISTS'
    ELSE '❌ Documents table DOES NOT EXIST - need to create it first!'
  END as result;

-- Check 3: If documents exists, what are its columns?
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
    RAISE NOTICE '═══ DOCUMENTS TABLE COLUMNS ═══';
  END IF;
END $$;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'documents'
ORDER BY ordinal_position;

-- Check 4: What constraints exist on documents table?
SELECT
  '═══ DOCUMENTS TABLE CONSTRAINTS ═══' as info;

SELECT
  conname as constraint_name,
  contype as constraint_type,
  CASE contype
    WHEN 'c' THEN 'CHECK'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'u' THEN 'UNIQUE'
  END as type_description
FROM pg_constraint
WHERE conrelid = 'documents'::regclass
ORDER BY conname;

-- Check 5: Does the stage constraint exist?
SELECT
  '═══ STAGE CONSTRAINT STATUS ═══' as info;

SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'documents_stage_check'
    )
    THEN '⚠️ Stage constraint EXISTS (may be restrictive)'
    ELSE '✅ No stage constraint (flexible)'
  END as result;

-- Check 6: Does messages table already exist?
SELECT
  '═══ MESSAGES TABLE STATUS ═══' as info;

SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages')
    THEN '⚠️ Messages table ALREADY EXISTS'
    ELSE '✅ Messages table does not exist (ready to create)'
  END as result;

-- Check 7: Does the update_updated_at_column function exist?
SELECT
  '═══ TRIGGER FUNCTION STATUS ═══' as info;

SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column')
    THEN '✅ update_updated_at_column function EXISTS'
    ELSE '❌ update_updated_at_column function MISSING - triggers will fail!'
  END as result;

-- Check 8: Sample stage values (if documents table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
    RAISE NOTICE '═══ CURRENT STAGE VALUES IN USE ═══';
  END IF;
END $$;

SELECT
  stage,
  COUNT(*) as count
FROM documents
GROUP BY stage
ORDER BY count DESC;

-- Final summary
SELECT
  '═══════════════════════════════════════' as separator,
  'DIAGNOSTIC COMPLETE' as status,
  'Review results above to determine next steps' as next_step;
