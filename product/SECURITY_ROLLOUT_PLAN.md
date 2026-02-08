# Security Rollout Plan: From "Open" to "Fort Knox"

This document outlines the step-by-step method to secure the OnFormat application without causing data loss or access disputes. We follow the **"Lock, Test, Expand"** methodology.

## Phase 1: Data Integrity Audit (Pre-Lockdown)
**Goal:** Ensure every record has a valid Owner so that when we turn on security, nothing "disappears."

1.  **Audit Scripts:**
    *   Check for `projects` with `user_id = NULL`.
    *   Check for `projects` where `user_id` does NOT match any known `auth.users` ID.
    *   Check for `profiles` missing for active users.
2.  **Remediation:**
    *   Run "Adoption Scripts" (like the one we used) to assign orphaned data to the Founder.
    *   Ensure all active users have rows in the `profiles` table.

## Phase 2: Basic Isolation (The "My Stuff" Rule)
**Goal:** Prevent users from seeing each other's data, strictly based on ownership. No sharing yet.

1.  **Action:** Enable RLS on `projects` and `profiles`.
2.  **Policy (Projects):** `SELECT * FROM projects WHERE user_id = auth.uid()`
    *   *Note: This is non-recursive and instant.*
3.  **Test:**
    *   Log in as Founder -> See Founder Projects.
    *   Log in as New User -> See Empty Dashboard. (Success!)
    *   New User Create Project -> Success. Visible to New User.
    *   Founder Refresh -> Founder ONLY sees Founder projects.

## Phase 3: Collaborative Access (The "Crew" Rule)
**Goal:** Allow users to see projects they are invited to. **This is where the Recursion Crash happened last time.**

1.  **Action:** Enable RLS on `crew_membership`.
2.  **Policy (Crew):** users can view rows where `user_id = auth.uid()` OR `user_email = auth.email()`.
3.  **Policy Update (Projects):**
    *   Update `projects` policy to: `user_id = auth.uid() OR id IN (SELECT project_id FROM crew_membership WHERE user_id = auth.uid())`.
4.  **Recursion Safety Check:**
    *   Ensure the inside query doesn't try to join back to `projects` logic.

## Phase 4: Session Hygiene (The "Anti-Zombie" Layer)
**Goal:** Prevent Session Leakage on shared devices or re-signups.

1.  **Action:** Update `middleware.ts` to strictly ignore cookies on `/login` and `/signup`.
2.  **Action:** Implement a "Soft Logout" on `/signup` mount that clears LocalStorage but avoids the infinite Reload loop.
3.  **Test:**
    *   Log in as Founder.
    *   Open `/signup` in same tab.
    *   Verify you are logged out immediately.
    *   Create Account.
    *   Verify you land in a clean dashboard.

---

## How to Execute Phase 1 (Right Now)

You can run this SQL query in Supabase SQL Editor to see "At Risk" data:

```sql
-- Count projects with NO owner
SELECT COUNT(*) as headless_projects FROM projects WHERE user_id IS NULL;

-- Count projects owned by IDs that don't exist in Auth
SELECT COUNT(*) as ghost_projects 
FROM projects 
LEFT JOIN auth.users ON projects.user_id = auth.users.id
WHERE auth.users.id IS NULL;
```
