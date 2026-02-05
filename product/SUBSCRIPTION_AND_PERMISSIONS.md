# Subscription & Permissions Architecture

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
  subscription_tier: 'basic' | 'pro' | 'enterprise';
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
```typescript
interface CrewMember {
  project_id: string;
  user_email: string;
  role: 'owner' | 'producer' | 'editor' | 'viewer';
}
```

---

## 2. Subscription Logic (Stripe)

Subscriptions are managed via Stripe Checkout sessions and kept in sync using Webhooks.

### Tiers
- **Basic**: Free / Trial?
- **Pro**: Paid tier.
- **Enterprise**: Custom.

### Checkout Flow (`app/api/checkout/route.ts`)
1. User requests upgrade.
2. Endpoint creates Stripe Checkout Session.
3. `userId` is attached to session `metadata`.
4. User redirects to Stripe hosted page.

### Webhook Synchronization (`app/api/webhooks/stripe/route.ts`)
Using `supabaseAdmin` (bypassing RLS) to update profiles.

- **`checkout.session.completed`**:
  - Sets `subscription_status = 'active'`
  - Sets `subscription_tier = 'pro'`
- **`customer.subscription.deleted`**:
  - Sets `subscription_status = 'inactive'`
  - Sets `subscription_tier = 'basic'`

---

## 3. onFORMAT Permissions (Web App)

Access control is a mix of Global (App Access) and Contextual (Project Access).

### Global Access Control (`lib/permissions.ts`)
Currently implements a simple check with a "Founder Bypass".

```typescript
export const hasAccess = (user: Profile, tier: string) => {
    // 1. Founder Bypass
    if (isFounder(user.email)) return true;

    // 2. Status Check
    if (user.subscription_status === 'active') return true;

    return false;
};
```

### Project Access Control (RLS)
(Inferred from architecture)
- **Owners**: Can CRUD their own projects (`auth.uid() = user_id`).
- **Crew**: Can Access projects where they exist in `crew_membership`.

---

## 4. OnSet Mobile Logic

The mobile experience (`onSET`) uses a bifurcated logic: **Identity** (Who are you?) and **Visibility** (What can you see?).

### Identity & Access (`app/mobile/[id]/page.tsx`)
Access to the mobile dashboard is determined by checking `crew_membership`.

```typescript
// Fetch Role based on Email and Project ID
const { data: crew } = await supabase
    .from('crew_membership')
    .select('role')
    .eq('project_id', id)
    .eq('user_email', user.email)
    .maybeSingle();

if (crew) setUserRole(crew.role);
```

### Feature Gating (Mobile Control Panel)
The **Producer** controls what is visible on mobile using the specific `onset-mobile-control` tool in the web app.

1. **Producer** selects tools in Web App -> Saves to `project.data.phases.ON_SET.drafts['onset-mobile-control']`.
2. **Mobile App** reads this config:
```typescript
// Parse Allowed Tools from Project Data
const controlRaw = project.data.phases?.['ON_SET']?.drafts?.['onset-mobile-control'];
const validTools = JSON.parse(controlRaw).selectedTools;

// Filter UI
const visibleTools = allTools.filter(t => validTools.includes(t.key));
```

---

## 5. Beta Readiness Feedback

### Status: 🟡 Functional but Fragile

**Strengths:**
- **Stripe Integration**: The checkout and webhook flow is standard and robust.
- **Mobile Gating**: The system for Producers to control Mobile visibility is highly flexible and data-driven.

**Critical Gaps (Must Fix for Beta):**
1. **Placeholder Permissions**: `lib/permissions.ts` still has a comment `// Normal Subscription Logic (Placeholder)`. It currently returns `false` for anyone not "Active" or "Founder", effectively blocking Free Tier basic usage if that was intended.
2. **Email Dependency**: `crew_membership` relies on `user_email`. If a user changes their email in Auth, they lose access. Ideally, this should link to `auth.users.id` upon invitation acceptance.
3. **Tier Enforcement**: There is no code currently enforcing usage limits (e.g., "Max 3 Projects for Basic"). The system tracks Tiers but doesn't appear to *act* on them in the creation logic.

**Recommendation:**
- Implement the specific logic in `lib/permissions.ts` to differentiate Basic vs Pro feature access.
- Ensure `crew_membership` is robust against email casing differences (always lowercase).
