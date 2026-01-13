# 🔧 FIX: "column document_id does not exist" Error

## 🎯 What Happened

You got this error when running `create_messages_table.sql`:

```
ERROR: 42703: column "document_id" does not exist
```

## 🔍 Root Cause

The **documents table doesn't exist in your Supabase database yet!**

The messages table is trying to create a foreign key reference to `documents(id)`, but the documents table was never created.

---

## ✅ SOLUTION: Run Migrations in Correct Order

You need to run the migrations in this specific order:

### **STEP 1: Check Current Database Status** (Optional but Recommended)

Run this diagnostic script first to see what's in your database:

**File:** `supabase/migrations/check_database_status.sql`

1. Open Supabase Dashboard → SQL Editor → New Query
2. Copy/paste entire contents of `check_database_status.sql`
3. Click "Run"
4. Review the output - it will tell you:
   - ✅ Which tables exist
   - ❌ Which tables are missing
   - What constraints are active

---

### **STEP 2: Create Documents Table** (If Missing)

**File:** `supabase/migrations/create_documents_table.sql`

1. SQL Editor → New Query
2. Copy/paste entire contents of `create_documents_table.sql`
3. Click "Run"
4. ✅ Verify: "Success. No rows returned"

**What this does:**
- Creates `documents` table for storing project documents
- Adds proper indexes and constraints
- Sets up RLS policies
- Creates the `update_updated_at_column()` trigger function

---

### **STEP 3: Fix Stage Constraint**

**File:** `supabase/migrations/fix_stage_constraint.sql`

1. SQL Editor → New Query
2. Copy/paste entire contents
3. Click "Run"
4. ✅ Verify: "Success. No rows returned"

**What this does:**
- Removes restrictive stage CHECK constraint
- Allows any stage names (pre-production, production, etc.)

---

### **STEP 4: Create Messages Table** (Use V2!)

**File:** `supabase/migrations/create_messages_table_v2.sql` ← **Use V2!**

1. SQL Editor → New Query
2. Copy/paste entire contents of **V2** (not the original)
3. Click "Run"
4. ✅ Verify: "Success. No rows returned"

**Why V2?**
- V2 is safer - it checks if documents table exists first
- Won't fail if documents table is missing
- Adds foreign key constraint only if documents table is found
- Better error handling

---

## 🎯 CORRECT ORDER SUMMARY

```
1. check_database_status.sql     (diagnostic - optional)
2. create_documents_table.sql    (if documents table missing)
3. fix_stage_constraint.sql      (removes restrictive constraint)
4. create_messages_table_v2.sql  (creates messages table - SAFE VERSION)
5. verify_phase1.sql             (verify everything worked)
```

---

## 🐛 Troubleshooting

### "Table 'documents' already exists"
✅ **Good!** Skip step 2, documents table is already there. Continue to step 3.

### "Function 'update_updated_at_column' does not exist"
❌ You need to create it. Run this SQL:

```sql
-- Create the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Then continue with the migrations.

### "Constraint 'documents_stage_check' does not exist"
✅ **Good!** Skip step 3, constraint already removed.

### "Table 'messages' already exists"
✅ **Good!** Skip step 4, messages table is already created.

---

## ✅ After Running All Migrations

Run the verification script to confirm everything worked:

**File:** `supabase/migrations/verify_phase1.sql`

1. SQL Editor → New Query
2. Copy/paste entire contents
3. Click "Run"
4. ✅ All checks should show "✅ PASS"

---

## 🧪 Test After Fixes

### Test 1: Commercial Video Template
```
1. Dashboard → New Project
2. Select "Commercial Video"
3. Create project
4. ✅ Should work without errors
5. ✅ Documents appear in stages:
   - Pre-Production
   - Production
   - Post-Production
   - Delivery
```

### Test 2: AI Chat Persistence
```
1. Open any project/document
2. Send AI message
3. Refresh page
4. ✅ Message history preserved
```

---

## 📝 Files You Need

All files are in `supabase/migrations/`:

- ✅ `check_database_status.sql` - Diagnostic
- ✅ `create_documents_table.sql` - Create documents table
- ✅ `fix_stage_constraint.sql` - Fix stage constraint
- ✅ `create_messages_table_v2.sql` - **Use this version!**
- ✅ `verify_phase1.sql` - Verification

---

## 🚀 Quick Start (TL;DR)

If you want to just fix it quickly:

1. Run `check_database_status.sql` - see what's missing
2. Run `create_documents_table.sql` - if documents table missing
3. Run `fix_stage_constraint.sql` - remove old constraint
4. Run `create_messages_table_v2.sql` - **V2 version!**
5. Run `verify_phase1.sql` - check everything worked
6. Test creating a Commercial Video project

---

## ✨ Success = No Errors

You'll know it worked when:

- ✅ No SQL errors
- ✅ Verification script shows all "✅ PASS"
- ✅ Commercial Video template creates projects
- ✅ AI chat messages persist

**Report back after running the migrations in order!**
