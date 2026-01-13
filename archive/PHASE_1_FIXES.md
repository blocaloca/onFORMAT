# Phase 1: Critical Database Fixes

## 🎯 Overview

These fixes resolve the 3 CRITICAL issues that prevent core functionality:

1. **C1: Stage Constraint Mismatch** - Commercial Video template fails
2. **C2: Messages Table Missing** - AI chat history crashes
3. **C3: Custom Template Validation** - Fixed by C1

---

## 📋 Prerequisites

- Access to your Supabase Dashboard
- Project: `https://gueonsvxovkhmucjhbht.supabase.co`
- Admin access to SQL Editor

---

## 🔧 Instructions

### Step 1: Apply Stage Constraint Fix

**File:** `supabase/migrations/fix_stage_constraint.sql`

1. Open Supabase Dashboard
2. Navigate to: **SQL Editor** → **New Query**
3. Copy and paste the contents of `fix_stage_constraint.sql`
4. Click **Run**
5. ✅ Verify: "Success. No rows returned"

**What this does:**
- Removes restrictive CHECK constraint that only allowed 5 specific stage names
- Allows any non-empty stage ID (pre-production, production, post-production, etc.)
- Enables Commercial Video and Brand Campaign templates to work

---

### Step 2: Create Messages Table

**File:** `supabase/migrations/create_messages_table.sql`

1. In Supabase SQL Editor, create another **New Query**
2. Copy and paste the contents of `create_messages_table.sql`
3. Click **Run**
4. ✅ Verify: "Success. No rows returned"

**What this does:**
- Creates `messages` table for AI chat history
- Adds proper indexes for performance
- Sets up Row Level Security policies
- Enables chat persistence across page reloads

---

## ✅ Verification Tests

### Test 1: Commercial Video Template (Previously Broken)

1. Go to Dashboard (http://localhost:3000/dashboard)
2. Click "New Project"
3. Select **"Commercial Video"** template
4. Name it "Test Commercial Video"
5. Create project
6. ✅ **EXPECTED:** Project created successfully with documents in stages:
   - Pre-Production
   - Production
   - Post-Production
   - Delivery
7. ❌ **IF FAILS:** Check browser console for errors

---

### Test 2: AI Chat Message Persistence

1. Open any project
2. Open any document
3. Open AI Assistant panel
4. Send a test message: "Hello, test message"
5. Wait for AI response
6. **Refresh the page** (F5)
7. ✅ **EXPECTED:** Chat history is preserved
8. ❌ **IF FAILS:** Check console for "messages table" errors

---

### Test 3: Custom Template with Any Stage Names

1. Dashboard → "Create Custom Template"
2. Add a stage called "Brainstorm" (not in original constraint)
3. Add some documents to that stage
4. Save template
5. Create project from custom template
6. ✅ **EXPECTED:** Project created with "Brainstorm" stage
7. ❌ **IF FAILS:** Check console for CHECK constraint errors

---

## 🐛 Troubleshooting

### Error: "relation 'messages' already exists"
- ✅ **Good!** Table already created, skip Step 2
- Verify with: `SELECT * FROM messages LIMIT 1;`

### Error: "constraint 'documents_stage_check' does not exist"
- ✅ **Good!** Already removed, skip Step 1
- Verify with: `SELECT * FROM documents WHERE stage = 'pre-production' LIMIT 1;`

### Error: "permission denied for table messages"
- ❌ RLS policies not applied correctly
- Re-run `create_messages_table.sql` from Step 2

### Documents not creating for Commercial Video
- Check server logs: Look for `🚨` emoji debug logs in terminal
- Check database: `SELECT * FROM documents WHERE project_id = 'YOUR_PROJECT_ID';`
- Verify stage names: `SELECT DISTINCT stage FROM documents;`

---

## 📊 Expected Results After Fixes

### Templates That Should Now Work

| Template | Status Before | Status After | Documents Created |
|----------|---------------|--------------|-------------------|
| Commercial Photography | ✅ Working | ✅ Working | ~12 docs |
| Commercial Video | ❌ **BROKEN** | ✅ **FIXED** | ~16 docs |
| Social Media Content | ✅ Working | ✅ Working | ~10 docs |
| Brand Campaign | ❌ **BROKEN** | ✅ **FIXED** | ~14 docs |
| Custom Templates | ⚠️ Partial | ✅ **FIXED** | Any |

### AI Chat

| Feature | Status Before | Status After |
|---------|---------------|--------------|
| Send messages | ✅ Working | ✅ Working |
| Receive responses | ✅ Working | ✅ Working |
| Message history | ❌ **CRASHES** | ✅ **FIXED** |
| Persistence | ❌ None | ✅ **FIXED** |

---

## 🎯 What's Fixed

- ✅ **C1:** Stage constraint removed - all templates work
- ✅ **C2:** Messages table created - chat history persists
- ✅ **C3:** Custom templates validated - any stage names work

---

## 🚀 Next Steps

After verifying all tests pass:

1. ✅ Mark Phase 1 complete
2. 🎯 Proceed to **Phase 2: Core Feature Completion**
   - Implement "Add to Form" feature
   - Connect AI parsers to chat
   - Add form validation

---

## 📝 Notes

- These migrations are **idempotent** (safe to run multiple times)
- Existing data is preserved
- No downtime required
- Reversible if needed (see rollback section below)

---

## 🔄 Rollback (If Needed)

If you need to revert these changes:

```sql
-- Rollback Stage Constraint (restore original)
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_stage_check;
ALTER TABLE documents ADD CONSTRAINT documents_stage_check
  CHECK (stage IN ('concept', 'develop', 'plan', 'execute', 'wrap'));

-- Rollback Messages Table (delete table)
DROP TABLE IF EXISTS messages CASCADE;
```

**⚠️ WARNING:** Rollback will:
- Break Commercial Video and Brand Campaign templates again
- Delete all chat history
- Break AI chat functionality

---

## 📞 Support

If you encounter issues:

1. Check browser console (F12) for errors
2. Check server terminal for `🚨` debug logs
3. Verify Supabase connection in `.env.local`
4. Check RLS policies are enabled: `SELECT * FROM pg_policies WHERE tablename = 'messages';`

---

## ✨ Success Indicators

You'll know Phase 1 is complete when:

1. ✅ All 4 built-in templates create projects successfully
2. ✅ Documents pre-populate in correct stages
3. ✅ AI chat messages persist across page reloads
4. ✅ Custom templates work with any stage names
5. ✅ No console errors during project creation
6. ✅ No "CHECK constraint" errors in logs

**Ready to verify? Run the tests above and report results!**
