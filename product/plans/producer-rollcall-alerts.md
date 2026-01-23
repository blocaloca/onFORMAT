---
description: Implementation plan for Producer RollCall Alerts using Realtime crew_membership listeners.
---

# Producer RollCall Alerts

## Objective
Notify the Producer (and other desktop users) when a crew member comes "Online" (enters the OnSet Mobile app), visualized as a "RollCall" signal light or toast.

## Context
Previously, status was stored in the `projects` JSON blob. We recently migrated status tracking to the `crew_membership` table with a heartbeat mechanism (pulse every 20s).
This means the Desktop Workspace must now listen to the `crew_membership` table, not just the `projects` table, to detect presence changes.

## Challenge: Heartbeat Spam
The mobile app updates `last_seen_at` every 20 seconds. This triggers a Postgres `UPDATE` event every 20 seconds.
If we simply alert on "UPDATE where status=online", we will get an alert every 20 seconds for every user.

## Solution: Local State Diffing
We will maintain a `crewStatusRef` (Map<Email, Status>) in the WorkspaceEditor.
1. **Initial Fetch**: When mounting, fetch current statuses to populate the Ref.
2. **Event Listener**: Listen for `UPDATE` on `crew_membership`.
3. **Logic**:
   - `NewStatus = payload.new.status`
   - `OldStatus = crewStatusRef.current.get(email)`
   - IF `NewStatus === 'online'` AND `OldStatus !== 'online'`:
     - **TRIGGER ALERT**: "RollCall: [Name/Email] is now on-set."
   - Update `crewStatusRef` with new status.

## Founder Bypass
Hardcode check: If `payload.new.user_email === 'casteelio@gmail.com'`, suppress the alert. This prevents the Founder/Support Admin from triggering production alerts when investigating issues.

## Implementation Details

### File: `components/onformat/WorkspaceEditor.tsx`

```typescript
// New State/Ref
const crewStatusRef = useRef<Record<string, string>>({});

// Initial Fetch
useEffect(() => {
    // Fetch initial statuses...
}, [projectId]);

// Realtime Listener
useEffect(() => {
    const channel = supabase.channel('crew-status-alerts')
        .on('postgres_changes', { event: 'UPDATE', table: 'crew_membership', ... }, (payload) => {
            const { user_email, status, name } = payload.new;
            
            // 1. Founder Bypass
            if (user_email === 'casteelio@gmail.com') return;

            // 2. Diff against local knowledge
            const prev = crewStatusRef.current[user_email] || 'offline';
            
            if (status === 'online' && prev !== 'online') {
                // 3. Trigger Alert
                setLatestNotification({ msg: `RollCall: ${name || user_email} is now on-set`, time: Date.now() });
            }

            // 4. Update Local Knowledge
            crewStatusRef.current[user_email] = status;
        })
        .subscribe();
    return () => ...
}, [projectId]);
```
