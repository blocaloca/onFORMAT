-- VERIFICATION SCRIPT FOR PHASE 1 FIXES
-- Run this after applying the migration files to verify everything is set up correctly

-- Check 1: Verify documents table stage constraint is flexible
SELECT
  'CHECK 1: Stage Constraint' as test,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'documents_stage_check'
      AND consrc LIKE '%stage IS NOT NULL%'
    )
    THEN '✅ PASS - Flexible constraint in place'
    ELSE '❌ FAIL - Old restrictive constraint still exists'
  END as result;

-- Check 2: Verify messages table exists
SELECT
  'CHECK 2: Messages Table' as test,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages')
    THEN '✅ PASS - Messages table exists'
    ELSE '❌ FAIL - Messages table not found'
  END as result;

-- Check 3: Verify messages table has correct columns
SELECT
  'CHECK 3: Messages Columns' as test,
  CASE
    WHEN (
      SELECT COUNT(*) FROM information_schema.columns
      WHERE table_name = 'messages'
      AND column_name IN ('id', 'project_id', 'document_id', 'user_id', 'role', 'content', 'metadata', 'created_at')
    ) = 8
    THEN '✅ PASS - All required columns present'
    ELSE '❌ FAIL - Missing columns in messages table'
  END as result;

-- Check 4: Verify RLS is enabled on messages table
SELECT
  'CHECK 4: Messages RLS' as test,
  CASE
    WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'messages')
    THEN '✅ PASS - RLS enabled on messages table'
    ELSE '❌ FAIL - RLS not enabled'
  END as result;

-- Check 5: Verify messages RLS policies exist
SELECT
  'CHECK 5: Messages Policies' as test,
  CASE
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'messages') >= 4
    THEN '✅ PASS - RLS policies created'
    ELSE '❌ FAIL - Missing RLS policies'
  END as result;

-- Check 6: Verify indexes exist on messages table
SELECT
  'CHECK 6: Messages Indexes' as test,
  CASE
    WHEN (
      SELECT COUNT(*) FROM pg_indexes
      WHERE tablename = 'messages'
      AND indexname LIKE 'idx_messages_%'
    ) >= 3
    THEN '✅ PASS - Indexes created'
    ELSE '❌ FAIL - Missing indexes'
  END as result;

-- Summary: Show all stage values currently in documents table (if any)
SELECT
  'BONUS: Current Stages' as info,
  STRING_AGG(DISTINCT stage, ', ') as stages_in_use
FROM documents;

-- Summary: Count messages (if any)
SELECT
  'BONUS: Message Count' as info,
  COUNT(*)::text as total_messages
FROM messages;

-- Final result
SELECT
  '═══════════════════════════════════════' as separator,
  'PHASE 1 VERIFICATION COMPLETE' as status,
  'If all checks show ✅ PASS, you are ready to test!' as next_step;
