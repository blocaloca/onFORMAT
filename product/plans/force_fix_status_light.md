---
description: Plan to force-fix mobile heartbeat and desktop status light.
---

# Force-Fix Plan: Real-Time Status & Mobile Heartbeat

## Objective
Decouple the mobile heartbeat from complex project data loading (documents/control panels) to ensure it fires reliably for authenticated users. Fix the 406 error by simplifying the request.

## 1. Mobile Heartbeat (app/mobile/[id]/page.tsx)
We will create a **standalone** `useEffect` that:
1.  Resolves the current Session/User immediately.
2.  Sets up the interval (30s) + Visibility Listener.
3.  Sends the Pulse **without** waiting for the full Project object to load (it only needs `id` from params and `user.email`).

**The Pulse Code:**
```typescript
const { error } = await supabase
    .from('crew_membership')
    .update({ 
        is_online: true, 
        last_seen_at: new Date().toISOString() 
    })
    .match({ 
        project_id: id, 
        user_email: user.email 
    });
```
*Note: Using `.match()` is cleaner for multi-column matching.*

**Ghost Mode:**
Inside this effect, we check `if (email === 'casteelio@gmail.com')`. If true, we proceed immediately, bypassing any "Crew List" checks.

## 2. Fix 406 Error
The 406 "Not Acceptable" error in Supabase often occurs when a query expects a Single row return (`.single()`) but RLS policies hide the row (returning 0 rows), or when the return type is void but the client expects JSON.
*   **Fix:** We will remove `.single()` from optimistic checks where existence is uncertain.
*   **Fix:** For the heartbeat, we will use `.select()` at the end if we want return data, or just standard update if not (returns 204 No Content usually, valid).

## 3. Desktop Listener (CrewListTemplate.tsx)
We will update the Realtime `UPDATE` listener.
*   **Log:** `console.log("DEBUG: Received update for [user] - is_online: [value]")`
*   **Force UI:** 
    ```typescript
    const lightColor = (isOnline && isRecent) ? 'bg-emerald-500' : 'bg-zinc-200';
    ```

## Execution Steps
1.  **Modify `app/mobile/[id]/page.tsx`**: Add independent Heartbeat effect.
2.  **Modify `components/onformat/templates/CrewListTemplate.tsx`**: Add Debug Log and verify CSS logic.
