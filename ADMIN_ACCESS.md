# 🛠️ Admin Dev Center Access Guide

## Quick Access

**URL:** `http://localhost:3000/admin/dev-center`

**Requirements:**
- Must be logged in
- Email must be: `casteelio@gmail.com`

---

## Step-by-Step Access

### 1. Login to Application
```
http://localhost:3000
```
- Click "Sign In" or go to dashboard
- Login with: `casteelio@gmail.com`

### 2. Navigate to Admin Area
**Option A - Direct Link:**
```
http://localhost:3000/admin
```

**Option B - Dev Center:**
```
http://localhost:3000/admin/dev-center
```

### 3. What You'll See

**Admin Landing Page (`/admin`):**
- Welcome message
- Button to Dev Center
- Button back to Dashboard

**Dev Center (`/admin/dev-center`):**
- System status dashboard
- Database health checks
- Table record counts
- Environment variable checks
- API key validation
- Document form audit
- Quick action buttons

---

## Troubleshooting

### Issue: 404 Error

**Causes:**
1. Not logged in
2. Logged in with wrong email
3. Server needs restart

**Solutions:**

**Check Login:**
```javascript
// Open browser console on any page
const { data } = await supabase.auth.getUser()
console.log('Current user:', data.user?.email)
```

**Expected Output:**
```
Current user: casteelio@gmail.com
```

**If not logged in:**
1. Go to `/dashboard`
2. Click "Sign In"
3. Login with `casteelio@gmail.com`

**If logged in with wrong email:**
1. Sign out
2. Sign in with `casteelio@gmail.com`

---

### Issue: 500 Error

**Solution:** Restart dev server
```bash
# Kill old server
lsof -ti:3000 | xargs kill -9

# Start fresh
npm run dev
```

---

## Security

**Who Can Access:**
- ✅ `casteelio@gmail.com` only
- ❌ All other users redirected to dashboard/404

**Auth Check:**
```typescript
const { data: { user } } = await supabase.auth.getUser()

if (!user || user.email !== 'casteelio@gmail.com') {
  router.push('/dashboard')  // Redirect
  return
}
```

---

## Routes

| URL | Access | Purpose |
|-----|--------|---------|
| `/admin` | Admin only | Admin landing page |
| `/admin/dev-center` | Admin only | Dev tools & diagnostics |
| `/dashboard` | All users | Main dashboard |

---

## Dev Center Features

### System Status
- 🟢 Database connection
- 📊 Table counts (projects, documents, messages)
- 🔑 API key validation (Anthropic, OpenAI)
- 📋 Environment variables check

### Quick Actions
- 🔍 Run full audit
- 📄 Create test project
- 🗄️ Open Supabase dashboard
- 🔄 Reload/clear cache

### Document Forms Audit
- Shows all document types
- ✅ Specialized forms
- 🟡 Generic forms
- Missing configurations

---

## Next Steps

1. **Login** as `casteelio@gmail.com`
2. **Navigate** to `http://localhost:3000/admin`
3. **Click** "Dev Center"
4. **Run** system audit
5. **Check** results

---

## Expected Behavior

**When Logged In as Admin:**
- `/admin` → Shows admin landing page
- `/admin/dev-center` → Shows dev tools

**When Not Admin:**
- `/admin` → Redirects to `/dashboard`
- `/admin/dev-center` → Redirects to `/dashboard`

---

## API Testing from Dev Center

Once in Dev Center, you can:

1. **Test Anthropic API**
   - Enter test message
   - Click "Test Claude"
   - See response

2. **Test OpenAI API** (if configured)
   - Select OpenAI provider
   - Enter test message
   - Click "Test GPT-4"
   - See response

3. **Check Provider Fallback**
   - Disable one API key in `.env.local`
   - Test - should auto-fallback to other provider

---

## Summary

**Access Flow:**
```
User logs in as casteelio@gmail.com
    ↓
Navigate to /admin
    ↓
Shows admin landing page
    ↓
Click "Dev Center"
    ↓
/admin/dev-center loads
    ↓
Run system audit
    ↓
See diagnostics
```

**If Not Admin:**
```
User logs in with other email
    ↓
Navigate to /admin
    ↓
Redirected to /dashboard (access denied)
```

---

## Current Status

✅ Admin routes created
✅ Auth protection working
✅ Dev center page exists
✅ System audit ready
✅ Server running on port 3000

**Ready to use - just login as admin!**
