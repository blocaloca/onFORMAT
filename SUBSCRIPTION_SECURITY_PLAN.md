# Subscription, Security, & Beta Launch Plan

**Objective:** Establish a robust, secure, and monetizeable foundation for onFORMAT, ensuring absolute data isolation, clear value propositions, and a founder-controlled ecosystem.

---

## Phase 1: The Security Foundation (Zero Leakage)
**Goal:** Guarantee that user A *never* sees user B's data, and that crew access is strictly compartmentalized.

### 1. Row Level Security (RLS) Audit & Hardening
*   **Action:** Conduct a line-by-line audit of all Supabase RLS policies.
*   **The "Owner-Only" Rule:** Ensure every table (`projects`, `documents`, `budgets`) has a default `deny all` policy, explicitly allowing access ONLY if `auth.uid() == user_id`.
*   **The "Crew" Exception:** Implement a secure `project_members` table. RLS policies must check this table to grant read/write access to specific projects, *not* the entire account.
*   **Deliverable:** A Security Audit Report confirming that direct API calls cannot breach data boundaries.

### 2. Temporary Crew Access Logic
*   **Concept:** "Project-Scoped Identity". Crew members are guests, not account holders (unless they sign up).
*   **Flow:**
    *   Producer invites via email + Role (e.g., "Director of Photography", "Editor").
    *   System generates a securely signed, time-limited invite token.
    *   Upon accepting, the user is added to `project_members` with that specific role.
    *   **Revocation:** Removing a user from the project instantly kills their RLS access.
    *   **Expiry:** (Optional) Auto-expire access after a project enters "Archived" status.

### 3. Authentication Barriers
*   **Action:** Enforce Email Verification before allowing project creation.
*   **Session Management:** Ensure rigid session timeouts for critical actions (e.g., deleting a project) to prevent unauthorized access on shared on-set devices.

---

## Phase 2: Subscription Infrastructure (Founder Control)
**Goal:** Implement a flexible, Stripe-backed subscription engine that puts you in the driver's seat.

### 1. Stripe Integration & Webhooks
*   **Setup:** Connect Stripe Billing with Supabase.
*   **Sync:** Implement webhooks (`customer.subscription.created`, `updated`, `deleted`) to sync status to a `public.subscriptions` table in real-time. Application logic reads from database, *not* Stripe API (for speed).

### 2. The "God Mode" Admin Dashboard
*   **Action:** Build a hidden `/admin` route accessible only to your specific User ID.
*   **Capabilities needed:**
    *   **User List:** See every signed-up user.
    *   **Subscription Override:** Manually grant "Pro" or "Beta" status to ANY user (bypassing Stripe). Essential for VIPs/partners.
    *   **Impersonation (Read-Only):** Ability to view a user's project list (metadata only) to debug support issues.

### 3. Tier Definition & Gating
*   **Structure:**
    *   **Free / Scout:** 1 Project, Basic PDFs, Watermarked.
    *   **Pro / Producer:** Unlimited Projects, White-label PDFs, Crew Invites.
    *   **Studio (Future):** Multiple admins, shared team workspace.
*   **Implementation:** Create a `TierFeatureGuard` component.
    *   *Example:* If a Free user tries to add a 2nd project -> "Upgrade to Pro" modal.
    *   *Example:* If a Free user tries to export a "Clean" PDF -> "Watermark removal is a Pro feature".

---

## Phase 3: User Experience & Dashboard Redesign
**Goal:** Make the subscription status visible and the upgrade path irresistible.

### 1. The Dashboard (User Home)
*   **Redesign:** Move away from a simple list. Create a "Command Center" view.
    *   **Top Bar:** "Plan: FREE (1/1 Projects Used)".
    *   **The Hook:** A progress bar showing usage limits. Visual urgency prompts upgrades.
    *   **Account Settings:** Dedicated "Billing" tab with "Manage Subscription" (portal link) and Invoice history.

### 2. Smart "Paywalls" (Contextual Upsells)
*   **Action:** Don't just block features; sell them.
*   **Placement:**
    *   Inside the **Print Room**: "Remove onFORMAT branding? [Upgrade]"
    *   Inside **Crew Management**: "Need to invite your DP? [Unlock Collaboration]"

### 3. Messaging & Clarity
*   **Action:** Ensure all pricing pages and modals explicitly state: *“Crew members do NOT need a paid subscription to join your project.”* (This is a common friction point).

---

## Phase 4: Beta Program & Feedback Loop
**Goal:** Use early adopters to refine the product before the public launch.

### 1. Beta Gating
*   **Mechanism:** Use an `is_beta_user` flag in the `profiles` table.
*   **Control:** Only users with this flag can access new features (e.g., AI Script Breakdown) before they roll out globally.

### 2. The "Red Phone" Feedback Button
*   **UI:** A floating, unobtrusive button (bottom right) on *every* protected page.
*   **Function:** Opens a simple modal: "Report a Bug" vs. "Feature Request".
*   **Routing:** Sends directly to a dedicated Slack channel or database table for immediate founder review.

### 3. The "Roadmap" Page
*   **Concept:** A public or user-only page showing "What's Next".
*   **Engagement:** Allow Pro users to "Vote" on the next feature (e.g., "Mobile App" vs. "Financial Reports").

---

## Recommended "Best Practices" for Launch
1.  **Grandfathering:** Plan code logic to support "Early Adopters" indefinitely. They should never be forced onto a worse plan later.
2.  **Grace Periods:** If a payment fails, don't lock them out instantly. Give a 3-day grace period (handled by Stripe logic + App logic).
3.  **Data Retention:** Define what happens when a user cancels. (e.g., "We keep your data for 6 months, then archive it").
