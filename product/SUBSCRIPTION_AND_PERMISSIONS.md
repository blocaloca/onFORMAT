# Subscription, Security & Permissions Architecture

## 1. Core Infrastructure

### Database Schema (Supabase)
The system relies on three core tables to manage identity, access, and projects.

**`profiles`**
- Links to Supabase Auth via `id`.
- Stores global subscription state.
```typescript
interface Profile {
  id: string; // References auth.users
  email: string;
  subscription_status: 'active' | 'inactive' | 'trial';
  subscription_tier: 'scout' | 'pro' | 'studio';
  ai_request_count: number; // Tracks API usage
  stripe_customer_id?: string;
}
```

**`projects`**
- The core data unit.
- Owned by a single user (`user_id`).
```typescript
interface Project {
  id: string;
  user_id: string; // Owner
  data: JSON; // Contains all document drafts/state
}
```

**`crew_membership`**
- Manages access to projects for non-owners.
- **Identity Enforcement:** Ensures users only access domains designated to their role.
```typescript
interface CrewMember {
  project_id: string;
  user_email: string; // Case-insensitive matching used in lookups
  role: string; // e.g., 'Producer', 'DIT', 'Director of Photography'
  is_online: boolean;
}
```

---

## 2. Row Level Security (RLS) Hardening

The application strictly enforces Postgres Row Level Security (RLS) to prevent unauthorized API access.

### `projects` Table
- **Owners**: Access via `auth.uid() = user_id`.
- **Crew**: Access via `check_project_access(id)` which verifies `crew_membership` against `auth.jwt() ->> 'email'`.
- **Note:** Anonymous reads/writes are expressly DENIED natively.

### `crew_membership` Table
- **Members**: Can view memberships where `(auth.jwt() ->> 'email') = user_email`.
- **Project Owners**: Can view all crew members for their owned projects.

---

## 3. OnSET Mobile System (QR Code / Soft-Login Architecture)

The Mobile gateway (`/onset/[id]`) relies on a specific "Soft Login" flow for set execution, optimized for speed via QR Codes where crew members don't need formal Auth JWTs.

### The RLS Override Problem
Because crew members enter their email and save it in `localStorage` without generating a formal Supabase Session, native Supabase Client reads to `projects` will fail due to RLS blocking anonymous users.

### The Security-First Bypass Solution
To accommodate secure soft-login without exposing the database to the internet, all initial Mobile calls use specific server-side API endpoints wrapping `supabaseAdmin` (Service Role Proxy):

1. **`GET /api/onset/project`**
   - **Bypasses RLS** to return the `projects` row corresponding to `id`.
   - **Resolves Identity Server-Side**: Accepts the `email` from local storage and queries `crew_membership` server-side, returning `_roleFromDB`. This safely bypasses RLS constraints on `crew_membership`.

2. **`POST /api/onset/project-update`**
   - **Bypasses RLS** for writes: All mobile tool mutations (DIT logs, Camera Reports, Notes) are sent to this API endpoint to safely append to the project data using `supabaseAdmin`.

---

## 4. OnSET Permissions Matrix

Access on Mobile is governed by the **Permissions Matrix**, controlled by the Producer in the Web App's `onset-mobile-control` tool.

### Matrix Operation
- The `onset-mobile-control` drafts object contains a `matrix` mapping Mobile Role IDs (e.g., `producer`, `dit`) to specific permissions (`view`, `edit`, `none`) per Document Tool key (e.g., `camera-report`).
- **Deny-by-Default:** The mobile UI resolves the user's role from the Server API, derives their `roleId` (via `deriveMobileRoleId`), and checks the JSON `matrix`. If no permission is explicitly declared 'view' or 'edit', the document is completely hidden from the user's workspace.
- **Case-Insensitive Identities:** Role assignment through `crew_membership` lookups use `.ilike('user_email', email)` to prevent capitalization discrepancies from causing access "ghosting."

---

## 5. Subscription Logic (Stripe)

Subscriptions are managed via Stripe Checkout sessions and kept in sync using Webhooks.

### Tiers
- **Scout / Trial**: Basic ideation. Limited AI requests.
- **Pro**: Professional production toolset. Expanded AI limits.
- **Studio**: Total access. Unlimited AI and enterprise features.

### Webhook Synchronization (`app/api/webhooks/stripe/route.ts`)
Using `supabaseAdmin` (bypassing RLS) to update profiles.
- **`checkout.session.completed`**: Sets active and tier.
- **`customer.subscription.deleted`**: Downgrades to inactive/basic.

---

## 6. AI Usage Enforcement (`app/api/onformat-v0/route.ts`)

The system implements a tiered "Pay-to-Play" model for AI usage to manage API costs (OpenRouter).

### Enforcement Logic
Before every OpenRouter call, the API:
1. Verifies the authenticated `user_id`.
2. Fetches `subscription_tier` and `ai_request_count` from `profiles`.
3. Returns `403 Forbidden` if the limit for the user's tier has been reached.
4. **On Success**: Increments `ai_request_count` by 1 in the database.
