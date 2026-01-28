# onFormat Beta Launch Strategy
**"Fortify, Monetize, & Listen"**

## Phase 1: The "Velvet Rope" (Monetization & Access)
We need a robust system to manage who gets in and what they can touch. This prevents "free-loading" on expensive features (like AI) while offering a generous entry point.

### 1. The Subscription Architecture
*   **Stripe Integration:** We already have the package. We need to implement a **Webhook Handler** (`app/api/webhooks/stripe/route.ts`) to listen for `checkout.session.completed` and `customer.subscription.updated`.
*   **Database Schema:** Ensure `profiles` table has:
    *   `stripe_customer_id`
    *   `subscription_status` (active, past_due, trialing, free)
    *   `tier` (pro, studio, enterprise)
*   **The "Gatekeeper" Component:** A wrapper component `<SubscriptionGuard feature="ai_writer">` that checks the user's tier. If they lack access, it shows a sleek "Upgrade to Pro" glass-morphism lock screen instead of the feature.

### 2. Feature Flagging (The "Toggle")
Instead of hardcoding checks, we create a constant config using your feature flags system (or a simple JSON object).
*   **Free:** 1 Project, Basic Docs (Call Sheet, Schedule), No AI.
*   **Pro:** Unlimited Projects, Advanced Docs (Budget, DIT Log), AI "Silent Scribe", Mobile Companion.
*   **Logic:** `const CAN_ACCESS_MOBILE = user.tier === 'pro' || user.tier === 'studio';`

## Phase 2: Fortifying the Castle (Security & Protection)
Since we are client-side heavy (React/Next.js), "logic" is visible. We must protect the *data* and *expensive operations*.

### 1. Code "Protection" (The Reality)
*   **You cannot fully hide frontend code.** Any "obfuscation" is just a speed bump.
*   **The Solution:** Move the "Secret Sauce" to the server.
    *   **AI Logic:** The prompt engineering for "Silent Scribe" and "Auto-Shot List" should live in an API Route (`app/api/ai/analyze/route.ts`), not in the frontend component. This prevents competitors from stealing your prompt logic.
    *   **PDF Generation:** Keep this server-side if possible to watermark free versions.

### 2. Row Level Security (RLS) Audit (CRITICAL)
*   Before beta, we must run a "Red Team" script.
*   **Goal:** Ensure User A *cannot* fetch User B's project by manually changing an ID in the URL or console.
*   **Action:** Review all Supabase Policies. Every `SELECT`, `INSERT`, `UPDATE` must have `auth.uid() = user_id` or check `crew_membership`.

## Phase 3: The "Listening Post" (Feedback Loop)
Beta users encounter bugs we can't predict. We need to make it incredibly easy for them to tell us without leaving the app.

### 1. In-App Feedback Widget ("The Bug Zapper")
*   A small, floating "Report" button (bottom right).
*   **Function:**
    1.  User clicks it.
    2.  It captures the **Current URL**, **Browser Info**, and **Active Tool**.
    3.  User types: "The budget total isn't updating."
    4.  **Auto-Screenshot:** (Optional) uses `html2canvas` to snap their view.
    5.  Sends directly to a Slack channel or Supabase table `beta_feedback`.

### 2. "Rage Click" Monitoring
*   Install **PostHog** (Free tier is generous). It records sessions. You can watch a user struggle to find the "Export" button and fix the UI immediately. It's invaluable for UI/UX polish.

## Phase 4: Polish & "Missing" Logic
Items identified during our sessions that need tightening:

1.  **Onboarding Flow:** When a user signs up, do they see a blank screen?
    *   *Fix:* A "Demo Project" should be auto-created for every new user, populated with example data (The "Nike Commercial" example). This shows them the power of onFormat immediately.
2.  **Mobile Formatting:** We fixed the mobile *control* panel, but the actual doc viewers on mobile need to be touch-friendly (bigger text, read-only modes).
3.  **Offline State:** What happens if they lose internet? We should add a "Syncing..." / "Offline" indicator so they don't lose work.

---
**Next Step Recommendation:**
I recommend we start with **Phase 3 (Feedback)** immediately. Creating the `BetaFeedbackWidget` allows you to distribute the link to friends/testers *now* while we work on the payments in the background. Is that a go?
