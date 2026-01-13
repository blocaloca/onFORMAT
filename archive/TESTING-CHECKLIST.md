# Testing Checklist - All Features

## ✅ Pre-Testing Setup

### 1. Database Setup
Run this SQL in Supabase SQL Editor:
```sql
ALTER TABLE documents ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
```

### 2. Storage Bucket Setup
1. Go to Supabase Dashboard → Storage
2. Create new bucket:
   - Name: `project-images`
   - Public: ✅ **ENABLED**
3. Add storage policies (see `SUPABASE-STORAGE-SETUP.md`)

### 3. Start Application
```bash
npm run dev
```
Server running at: http://localhost:3002

---

## Feature Tests

### TEST 1: Image Upload (MoodBoardForm) 🖼️

**Steps:**
1. Login to the app
2. Create or open a project
3. Find or create a "Mood Board" document
4. Click to edit the mood board
5. Click the upload zone or drag & drop an image
6. Upload a PNG/JPG/WebP file (under 5MB)

**Expected Results:**
- ✅ Upload shows progress
- ✅ Image appears in grid below
- ✅ Image has delete button on hover
- ✅ Can upload multiple images
- ✅ Console shows: "📤 Uploading to bucket" and "✅ Uploaded successfully"

**If Bucket Error Occurs:**
- Error message should say: "Storage bucket 'project-images' not found. Please create it..."
- Follow setup instructions above

---

### TEST 2: Document Export - PDF 📄

**Steps:**
1. Open any document (Brief or Budget works best)
2. Add some content to the document
3. Click "Save"
4. Click "📤 Export" dropdown
5. Select "Export as PDF"

**Expected Results:**
- ✅ PDF downloads automatically
- ✅ File name matches document title
- ✅ PDF contains document content formatted correctly
- ✅ Budget shows table with line items and totals
- ✅ Brief shows labeled sections

---

### TEST 3: Document Export - DOCX 📝

**Steps:**
1. Open a Budget document with line items
2. Click "📤 Export" dropdown
3. Select "Export as DOCX"

**Expected Results:**
- ✅ DOCX file downloads
- ✅ Can open in Microsoft Word or Google Docs
- ✅ Table formatting preserved
- ✅ Bold headers visible

---

### TEST 4: Document Export - Excel 📊

**Steps:**
1. Open a Budget document
2. Click "📤 Export" dropdown
3. Select "Export as Excel"

**Expected Results:**
- ✅ XLSX file downloads
- ✅ Opens in Excel/Google Sheets
- ✅ Columns: Category, Description, Amount
- ✅ Amount column formatted as currency
- ✅ Total row is bold

---

### TEST 5: Mark Document Complete ✓

**Steps:**
1. Open any document
2. Look for "Mark Complete" button in header (next to Save)
3. Click the checkbox button

**Expected Results:**
- ✅ Button changes to green background
- ✅ Text changes to "✓ Complete"
- ✅ Checkbox is checked
- ✅ Clicking again unchecks it
- ✅ State persists after page refresh

**Check Database:**
```sql
SELECT id, title, completed FROM documents WHERE completed = true;
```

---

### TEST 6: Director - Create Project with Minimal Documents 🎬

**Steps:**
1. Go to Dashboard
2. Click "Open Director" button
3. Have a conversation about a project:
   - Example: "I want to shoot a fashion campaign in Miami"
   - Answer Director's questions about budget, deliverables, etc.
4. Wait for Director to propose project with "PROJECT:" format
5. Review the preview
6. Edit project name if desired
7. Click "Create Projects"

**Expected Results:**
- ✅ Projects created successfully
- ✅ Success message appears with project links
- ✅ **Only 2-3 documents created** (not full template):
  - Brief (with deliverables filled)
  - Budget (with line items breakdown)
  - 1 project-specific doc (Shot Book for photo, Treatment for video)
- ✅ Can click project links to view
- ✅ Brief has "Created by Director AI" note
- ✅ Budget shows 50% production, 30% talent, 20% equipment breakdown

**Check Console Logs:**
```
🎬 DIRECTOR API: Received project creation request
📦 Request data: { userId: '...', projectCount: 1 }
✅ Using user ID from frontend: ...
🔨 Creating project: "..."
✅ Template found: Commercial Photography
✅ Project created with ID: ...
✅ Created 3 essential documents (only populated ones)
🎉 Successfully created 1 project(s)
```

---

### TEST 7: View Created Project Documents

**Steps:**
1. After Director creates project, go to Dashboard
2. Click on the newly created project
3. View the document list

**Expected Results:**
- ✅ See exactly 2-3 documents (not 10+)
- ✅ Brief document exists
- ✅ Budget document exists
- ✅ Optional: Shot Book (photo) or Treatment (video)
- ✅ Open Brief → see deliverables from conversation
- ✅ Open Budget → see 3 line items with breakdown

---

### TEST 8: Complete Document Shows in Project List

**Steps:**
1. Open a document and mark it complete
2. Go back to project view
3. Look at document list

**Expected Results:**
- ✅ Completed document has green checkmark (✓) indicator
- ✅ Can distinguish completed vs incomplete documents
- ✅ Clicking document shows it's still marked complete

---

## Error Testing

### Error Test 1: Upload Without Bucket
**Steps:**
1. Don't create the storage bucket
2. Try to upload an image

**Expected:**
- ✅ Clear error message with instructions
- ✅ Console shows helpful message

### Error Test 2: Export Empty Document
**Steps:**
1. Create new document with no content
2. Try to export as PDF

**Expected:**
- ✅ PDF generates (may be mostly empty)
- ✅ No crashes

### Error Test 3: Director Without User
**Steps:**
1. Clear localStorage
2. Try to access /director

**Expected:**
- ✅ Redirects to /login
- ✅ No errors in console

---

## Performance Tests

### Performance Test 1: Upload Multiple Images
**Steps:**
1. Upload 5 images at once to mood board

**Expected:**
- ✅ All 5 upload successfully
- ✅ Progress shown for each
- ✅ No memory leaks
- ✅ All images display in grid

### Performance Test 2: Export Large Budget
**Steps:**
1. Create budget with 20+ line items
2. Export as Excel

**Expected:**
- ✅ All rows exported
- ✅ File downloads successfully
- ✅ Opens correctly in Excel

---

## Integration Tests

### Integration Test 1: Complete Workflow
**Steps:**
1. Director creates project
2. Open Brief document
3. Mark as complete
4. Export as PDF
5. Upload mood board images
6. Export budget as Excel

**Expected:**
- ✅ All features work together
- ✅ No conflicts between features
- ✅ Data persists correctly

---

## Browser Console Checks

**Look for these logs when testing:**

✅ Upload: `📤 Uploading to bucket "project-images"`
✅ Upload Success: `✅ Uploaded successfully: https://...`
✅ Project Creation: `🎬 DIRECTOR API: Received project creation request`
✅ Documents Created: `✅ Created 3 essential documents`

**Should NOT see:**
❌ Any `undefined` errors
❌ Module not found errors
❌ TypeScript errors
❌ Failed to fetch errors (except if services are down)

---

## Success Criteria

All tests passing means:
- ✅ Image uploads work in all relevant documents
- ✅ All 3 export formats work (PDF, DOCX, Excel)
- ✅ Complete button works and persists
- ✅ Director creates minimal, populated documents
- ✅ No TypeScript or build errors
- ✅ No runtime errors in production build
- ✅ All features work in both dev and production modes

---

## If Tests Fail

### Image Upload Fails
1. Check Supabase Storage bucket exists
2. Check bucket is public
3. Check storage policies are set
4. See `SUPABASE-STORAGE-SETUP.md`

### Export Fails
1. Check console for specific error
2. Verify jspdf, docx, exceljs are installed
3. Try `npm install --legacy-peer-deps` if needed

### Complete Button Not Persisting
1. Run the SQL migration to add `completed` column
2. Check Supabase connection
3. Check browser network tab for failed requests

### Director Creates Too Many Documents
1. Check `/app/api/director/create-projects/route.ts`
2. Should only push 2-3 documents to `documentsToCreate` array
3. Check console logs for document count

---

## Quick Test Command

For automated testing (future):
```bash
npm run test  # When tests are added
```

For manual testing:
- Use this checklist
- Test each feature thoroughly
- Report any issues with browser console output
