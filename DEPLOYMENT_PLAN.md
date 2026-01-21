# Deployment & Beta Strategy Plan

## Goal
Migrate `onFORMAT` to production on Vercel, implementing a tiered subscription model (Free Beta / Inactive Paid / Founder Admin) and establishing a feedback loop for testers.

---

## Phase 1: The Infrastructure (Vercel + Supabase)
**Objective:** Get the app live on the internet with a production-ready database.

### What to Expect:
- The app will be accessible via a public URL (e.g., `onformat.vercel.app` or your custom domain).
- We will likely create a fresh "Production" project in Supabase to keep your test data separate from real user data.

### What I Need From You:
1.  **Vercel Account**: Connect your GitHub account to Vercel.
2.  **Environment Variables**: I will need you to input your distinct API keys (OpenRouter/OpenAI, Supabase, Stripe) into the Vercel dashboard. I will provide a list of exactly which ones.
    - **CRITICAL**: Add `OPENROUTER_API_KEY` to Vercel (Production environment). The app will fail without it.
3.  **Domain (Optional)**: If you bought a domain (e.g., `onformat.com`), you'll need to add it to Vercel.

---

## Phase 2: The Gatekeeper (Stripe Integration)
**Objective:** Manage who can access what. Set up the "Free Beta" and "Founder" tiers.

### Strategy:
1.  **Free / Beta Tier**:
    *   Price: $0/month.
    *   Permissions: Full access to features for testing purposes.
    *   Logic: When a user signs up, they are automatically placed on this tier (or manually approved if you prefer strict control).
2.  **Pro Tier (Inactive)**:
    *   We will build the structure but hide the upgrade button or label it "Coming Soon".
3.  **Founder / Admin Tier**:
    *   We will identify your specific email address (and anyone else you designate) as `admin`.
    *   This grants "Super Powers" (e.g., seeing all feedback, managing users, potential debug tools).

### What I Need From You:
1.  **Stripe Accounts**: Keys (Publishable Key and Secret Key) from your Stripe Dashboard.
2.  **Product Setup**:
    *   Create a "Free Beta" product in Stripe (Recurring, $0).
    *   Create a "Pro" product (Recurring, $XX).
    *   **Action**: Copy the `Price ID` for each. I will need these IDs to wire up the code.

---

## Phase 3: The Beta Loop (Feedback & Communication)
**Objective:** Capture bugs and user thoughts without friction.

### Strategy:
- **In-App Feedback Widget**: A subtle button (like the "Jump Start" one) or a "?" icon in the layout.
- **Function**: Opens a simple dialog: "Report a Bug" or "Send Feedback".
- **Destination**:
    - **Option A (Simplest)**: Saves to a `feedback` table in Supabase. You view it in a simple "Admin Dashboard" page we build for you.
    - **Option B**: Emails you directly (requires email service setup).
    - **Recommendation**: **Option A** (Database + Admin View). It keeps everything in one place and lets us tag/sort feedback.

### What I Need From You:
- **Approval**: Confirm if the "Admin Dashboard" approach works for you.

---

## Summary Checklist (The "Go" Signal)

| Step | Action | Owner |
| :--- | :--- | :--- |
| 1 | Create Prod Supabase Project | User |
| 2 | Create Stripe Products & Get IDs | User |
| 3 | Push Code to GitHub | Me |
| 4 | Connect GitHub to Vercel | User |
| 5 | Input Env Variables in Vercel | User |
| 6 | Verify Live Site & Sign Up | Both |

### Next Step
If this plan looks good, I will begin by generating the `feedback` table migration and the Stripe subscription handlers in the code.
