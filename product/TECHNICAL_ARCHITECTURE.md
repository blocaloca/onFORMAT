# Technical Architecture & Database Schema

## 1. Supabase Database Schema

onFORMAT uses Supabase (PostgreSQL) as its primary store. The schema is designed for multi-project, role-based workflows with strict scoping.

### Core Tables

#### `projects`
The top-level container for all production data.
- **id**: UUID (Primary Key)
- **owner_id**: UUID (Foreign Key to `auth.users`)
- **name**: Text
- **status**: Text (active, archived)
- **data**: JSONB
  - Stores all **Document State** (Drafts) organized by Phase.
  - Structure: `{ "phases": { "DEVELOP": { "drafts": {...} }, "PRE-PRODUCTION": { "drafts": {...} } } }`
  - *Note*: While structured data (Call Sheet rows) lives in the JSON blob for v1 flexibility, relational tables are used for entities that require high-concurrency access (Crew, Logs).

#### `crew_membership`
Manages access control and roles per project.
- **id**: UUID
- **project_id**: UUID (FK)
- **user_email**: Text (Used for invite matching)
- **role**: Text (Enum: 'Owner', 'Admin', 'Key', 'Crew')
- **permissions**: JSONB (Granular overrides)

#### `on_set_groups`
Defines visibility groups for mobile tools (A/B/C logic).
- **id**: UUID
- **crew_id**: UUID (FK to `crew_membership`)
- **group_code**: Text ('A', 'B', 'C')

### Real-Time Tables

#### `dit_logs` (Relational)
High-frequency log entries for media management.
- **id**: UUID
- **project_id**: UUID (FK)
- **roll_id**: Text (A001)
- **media_type**: Text
- **status**: Text
- **created_at**: Timestamp

---

## 2. Security Model (RBAC)

Access is denied by default and granted via `crew_membership`.

### Roles

1.  **Founder / Owner** (`super-admin`)
    - **Access**: Full Read/Write on ALL projects and system settings.
    - **Override**: Can enter any project via "God Mode" for support.

2.  **Producer / Admin**
    - **Access**: Full Read/Write on specific loaded project.
    - **Capabilities**: Can invite crew, change permissions, and "Publish" documents.
    - **Mobile View**: Sees ALL tool groups (A, B, and C).

3.  **Key / Department Head**
    - **Access**: Read/Write on their Department's Docs (e.g., DP sees Camera Report + Shot List).
    - **Mobile View**: Sees assigned Groups (e.g., A + B).

4.  **Crew**
    - **Access**: Read-Only on Call Sheet + Safety Docs.
    - **Mobile View**: Limited to specific assigned documents (Call Sheet, Crew List).

### Row Level Security (RLS)
- **Projects**: visible only if `auth.uid() == owner_id` OR `auth.email` exists in `crew_membership`.
- **Documents**: visible based on `project_id` match.

---

## 3. Technical Logic: Camera Report (Shot Log)

The Camera Report replaces the legacy "Shot Log" and uses specific technical logic for valid production data.

### Smart Carry-Over (Roll Scoped)

The "Carry-Over" logic (inheriting lens, ISO, etc. from the previous shot) is **Scoped to the Roll**.
- **Logic**:
  - `IF` New Shot is on `Current Roll` -> `Inherit {Lens, ISO, WB, Shutter}`.
  - `IF` New Shot is on `New Roll` -> `Reset {Lens, ISO, WB} to Defaults`.
  - `Take Number`: Increments per shot ID. Resets to "1" on new Shot ID.

### Required Metadata Fields
For a valid Camera Report entry, the following are **Mandatory**:
- `roll_id` (e.g., A001, B005)
- `scene` & `take`
- `lens_mm` (Integer)
- `iso` (Integer)
- `wb` (Kelvin Integer)
- `shutter_angle` (Decimal) or `shutter_speed` (Fraction)
- `fps` (Project vs Off-Speed)
- `timecode_in` (SMPTE format)

---

## 4. API & Data Flow

- **Write**: All critical writes (Logs, Status changes) go through Supabase.
- **Read**: Real-time subscriptions listen for `broadcast` events (e.g., `NEW_ROLL_PULLED`) to trigger UI updates without full refresh.
- **Offline**: Mobile app queues mutations using `tanstack-query` (future v2) or local state sync (current v1).
