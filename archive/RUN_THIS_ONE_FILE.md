# 🚀 SIMPLE FIX - Run ONE File

## ❌ Error You Got

```
column "document_id" does not exist
```

## ✅ Solution - Run ONE SQL File

Instead of running multiple files in order, I've created **ONE complete file** that does everything safely.

---

## 📋 Instructions (3 Steps)

### 1. Open Supabase Dashboard

- Go to: https://supabase.com/dashboard
- Select your project
- Click **SQL Editor** (left sidebar)

### 2. Run the Complete Setup Script

- Click **"New Query"**
- Open this file on your computer:
  ```
  supabase/migrations/COMPLETE_SETUP.sql
  ```
- Copy the ENTIRE contents
- Paste into SQL Editor
- Click **"Run"** (bottom right)

### 3. Check the Output

You should see messages like:

```
✅ Documents table exists
✅ Messages table exists
✅ Stage constraint is flexible
✅ SETUP COMPLETE!
```

---

## ✅ That's It!

After running that ONE file, everything should work:

- ✅ Documents table created (if missing)
- ✅ Messages table created (if missing)
- ✅ Stage constraint fixed
- ✅ All indexes and policies set up
- ✅ Commercial Video template will work
- ✅ AI chat history will persist

---

## 🧪 Test It

After running the script, test:

1. **Commercial Video Template**
   - Dashboard → New Project → Commercial Video
   - Should create successfully ✅

2. **AI Chat**
   - Open any document
   - Send AI message
   - Refresh page
   - Message history preserved ✅

---

## 🐛 If It Still Fails

The script is **safe to run multiple times**. If you get an error:

1. Copy the exact error message
2. Share it with me
3. I'll create a targeted fix

---

## 📝 What This Script Does

- ✅ Creates trigger function (if missing)
- ✅ Creates documents table (if missing)
- ✅ Removes restrictive stage constraint
- ✅ Creates messages table (if missing)
- ✅ Adds all indexes
- ✅ Sets up RLS policies
- ✅ Verifies everything worked

**It's ALL-IN-ONE and safe to run!**

---

## 🎯 File Location

```
/supabase/migrations/COMPLETE_SETUP.sql
```

**Just run this ONE file in Supabase SQL Editor.**

That's it!
