# Security & Identity Vulnerability Report

## Executive Summary
A critical vulnerability exists where new user registrations ("Sign Ups") can inadvertently inherit the active session of a previously logged-in administrator (Founder). This results in the new user viewing the Founder's private data immediately upon accessing the dashboard.

## 1. The Core Vulnerability: Zombie Session Persistence
**Symptom:** A new user signup on a browser with an existing session results in the user interacting with the application *as* the previous user (Founder).

**Root Cause:**
*   **Cookie Resilience:** Supabase Auth cookies (`sb-[ref]-auth-token`) are failing to be deleted by the client-side `signOut()` methods due to timing issues or attribute mismatches (Path/Domain).
*   **Middleware Resurrection:** The application `middleware.ts` may be refreshing and re-setting the valid Founder cookie *during* the signup request flow, effectively undoing the logout action before the new session is established.
*   **Singleton Pollution:** The client-side Supabase instance (`lib/supabase.ts`) persists in browser memory (SPA state), holding the old JWT token even after the UI attempts to switch users.

## 2. Permissions Architecture Risk
*   **Logic:** `lib/permissions.ts` uses `isFounder(email)`.
*   **Risk:** The logic is sound, but the *input* is compromised. Because the session remains "Founder", the email passed to this function is the Founder's email, correctly granting full access to the wrong person (the new user using the old session).

## 3. Remediation Plan (Phase 4)

### A. Atomic Logout Route
Create a dedicated API route `/auth/logout` that:
1.  Manually expires all auth cookies with strict path/domain matching.
2.  Calls `supabase.auth.signOut()` globally.
3.  Performs a hard redirect to `/login`.

### B. Middleware Guardrails
Update `middleware.ts` to explicitly **ignore session refreshing** on `/login` and `/signup` routes. It should strictly pass-through these requests without attempting to validate or renew existing cookies.

### C. Client Singleton Removal
Refactor `lib/supabase.ts` to export a **function** (`createClient()`) instead of a **singleton instance**. This ensures every React component mount gets a fresh authentication state, preventing memory leaks of old tokens.

### D. Verification Enforcement
Ensure `app/signup/page.tsx` strictly blocks dashboard access until `data.session` is confirmed unique and valid, halting the flow if Email Confirmation is required but not yet completed.
