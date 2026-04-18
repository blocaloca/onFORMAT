# Security & Identity Vulnerability Report (Living Document)

## Executive Summary
This document tracks critical security vulnerabilities, resolutions, and architectural paradigms to ensure future AI contributors or engineers do not inadvertently regress the security posture of creative-os.

---

## Issue 1: Zombie Session Persistence (Resolved)

**Symptom:** A new user signup on a browser with an existing session resulted in the new user interacting with the application *as* the previous user (Founder).
**Root Cause:** Suboptimal Cookie/Middleware session invalidation on the client side.
**Resolution:**
- Atomic Logout logic enforced (`/auth/logout`) with strict cookie wiping.
- Middleware explicitly programmed to ignore session refreshing on `/login` and `/signup` routes.
- Component-level singleton instantiation of Supabase.

---

## Issue 2: OnSet Mobile "Project Not Found" / RLS Lockdown (Resolved: v1.0.7)

**Symptom:** Following the strict enforcement of Postgres Row Level Security (RLS) on all core tables (via `017_security_hardening.sql`), the OnSET Mobile app (`/onset/[id]`) began throwing "PROJECT NOT FOUND" errors and failing.
**Root Cause:**
- OnSET Mobile relies on a "Soft Login" architecture via QR codes (saving email to `localStorage`), where users do not have a formal `auth.jwt()` Supabase session.
- The new RLS rules strictly blocked `anon` requests natively on the client for `projects` and `crew_membership`.
- Because the read queries failed, the app failed to load the project, failed to resolve the crew member's identity, and failed to grant array privileges.

**Secure Remediation Pattern (The "Bypass" Architecture):**
To preserve the friction-free QR code mobile workflow while maintaining high-security RLS on the Web Dashboard, a strictly controlled API-Bypass architecture was implemented:
1. **`GET /api/onset/project?id=[ID]&email=[EMAIL]`**
   - Uses `supabaseAdmin` to fetch the project data ignoring RLS.
   - Performs a server-side `.ilike` lookup on `crew_membership` to securely determine the user's role (`_roleFromDB`).
   - Prevents unauthorized modification while ensuring the mobile app retrieves accurate data and resolves roles correctly.
2. **`POST /api/onset/project-update`**
   - Intercepts all mobile write events (DIT Logs, Camera Reports, Notes) instead of allowing them to execute `supabase.from('projects').update`.
   - Modifies the project safely on the backend via Service Role and returns the result to synchronize the client.

**CRITICAL SAFEGUARD FOR FUTURE WORK:**
- **DO NOT** attempt to make `app/onset/[id]/page.tsx` fetch or write to `projects` directly using the `supabase` API. RLS will silently block it. You **MUST** use the `/api/onset/` route handlers.
- **DO NOT** lower the database's native RLS policies to fix client-side access bugs.

---

## Issue 3: Role Authorization Ghosting (Resolved)

**Symptom:** Users designated as "DIT" or "Director of Photography" on a project were receiving "Crew" access globally, hiding authorized documents.
**Root Cause:**
- Email inputs were not standardized, meaning `Casteelfoto@gmail.com` did not match the database `casteelfoto@gmail.com`.
- Mobile Role IDs were loosely matched using string replacing, failing to correctly map explicit tools to complex roles like "Director of Photography" (which needed mapping to `dp`).

**Resolution:**
- **Identity:** All database lookups for crew membership now aggressively utilize Postgres `.ilike` for case-insensitive matching.
- **Role Mapping:** The unified utility `deriveMobileRoleId()` is enforced throughout the codebase as the single source of truth for translating a human-readable `role` (e.g., "Director of Photography") into a programmatic matrix pointer (`dp`).
