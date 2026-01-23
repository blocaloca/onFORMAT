# System Map & Nomenclature Audit

## 1. Database Schema Map

### Postgres Tables (Supabase)

**`projects`**
*   **Keys**: `id` (PK, UUID), `user_id` (FK -> profiles.id)
*   **Columns**: `name`, `product_type`, `created_at`, `updated_at`
*   **Data Storage**: `data` (JSONB). This is the "Core" of the application.
    *   **Logic Flow**: All tool drafts (Scripts, Reports, Lists) live here as serialized JSON strings.

**`crew_membership`**
*   **Keys**: `id` (PK), `project_id` (FK -> projects.id)
*   **Columns**: `user_email`, `role` (e.g. 'viewer', 'editor'), `is_verified`.
*   **Purpose**: Access Control logic (RLS policies).

**`profiles`**
*   **Keys**: `id` (PK, UUID)
*   **Columns**: `email`, `subscription_tier`, `role` (system role), `stripe_customer_id`.

**`project_versions` (Orphaned)**
*   **Keys**: `project_id` (FK)
*   **Status**: Unused. The application currently manages version history within the `projects.data` JSON structure (array of drafts), bypassing this table.

**`character_library` (Orphaned)**
*   **Status**: Unused in current `onFormat` product type.

### JSON Schema (`projects.data`)

The application uses a Document-Store pattern inside SQL. Structure:

*   `phases` (Object)
    *   `DEVELOPMENT` (Mapped from 'Development')
    *   `PRE_PRODUCTION` (Mapped from 'Pre-Production')
    *   `ON_SET` (Mapped from 'Production' - **Nomenclature Mismatch**)
    *   `POST` (Mapped from 'Post-Production')
    *   **Content**: Each phase contains `drafts` (Key-Value Map: ToolKey -> JSON String).

**Key Column Verification**:
*   Camera Report: Uses `lens` (Confirmed).
*   Crew List: Uses `status` ('online'/'offline') and `group` ('A'/'B'/'C').
*   Projects: Code checks `owner_id` in `data` JSON, but DB column is `user_id`. **Logic Gap**.

## 2. Nomenclature Audit

*   **Phases**:
    *   **UI Label**: "Production"
    *   **Code/DB Key**: `ON_SET`
    *   **Target**: `PRODUCTION`
    *   **Status**: **Migration Incomplete**. The system relies on `ON_SET`. Changing this now would require a full DB migration of existing JSON data.

*   **Identity**:
    *   **DB Column**: `user_id`
    *   **Code Reference**: `data.owner_id` (Seen in `app/mobile` and `app/project`).
    *   **Status**: **Critical Logic Gap**. The code expects `owner_id` to exist in the JSON blob. If not present (legacy projects), Owner-level checks (like "Ghost Mode" access) may fail.

## 3. Feature Status Report

*   **Fully Functional**:
    *   **Roll-Scoped Smart Carry-Over**: Camera Report template correctly auto-increments takes and carries over metadata (Roll, Scene, Lens, FPS) from the previous row.
    *   **Realtime Permissions & Login**: Mobile login works via Crew List email matching (Robust Fallback implemented). Status Light syncs to Desktop.

*   **Partially Built**:
    *   **Group A/B/C Permissions**:
        *   *Exists*: UI toggles in Control Panel and Crew List.
        *   *Missing*: The Mobile App (`app/mobile`) receives the Allowed Tools list but **ignores** the User's Group. It displays ALL allowed tools to ANY logged-in crew member. Enforce logic is missing.
    *   **DIT Media Alert**:
        *   *Exists*: Control Panel displays alerts from DIT Log.
        *   *Missing*: The "Signal Light" notification system in `WorkspaceEditor` only monitors Crew Status. It does not trigger system-wide alerts for DIT issues.

*   **Non-Existent**:
    *   **AV Script-to-Shot List Sync**: `ShotListTemplate` has no logic to import scenes/dialogue from the AV Script. It initializes as an empty list (manual entry only).

## 4. Orphaned Logic

*   **Table**: `project_versions` (Superseded by internal JSON versioning).
*   **Table**: `character_library`.
*   **Code**: `FloatingMobileControl.tsx` (simulator) - References exist but file likely deleted/unused in production flow.

## 5. Logic Flow Data Map

**Data Flow: Script to Set**

1.  **Strategy**: User creates `Creative Brief` (Stored: `projects.data.phases.STRATEGY.drafts['brief']`).
2.  **Generative**: `WorkspaceEditor` (via AI) reads Brief -> Generates `AV Script` (text).
3.  **Storage**: `AV Script` saved to `projects.data.phases.DEVELOPMENT.drafts['av-script']`.
4.  **Breakdown (Gap)**: User opens `Shot List`.
    *   *Current*: User types manually.
    *   *Target*: Shot List should read `drafts['av-script']` and populate rows.
5.  **Production**: User opens `Camera Report`.
    *   MetaData: Reads `importedSchedule` (if available), but does not link to Shot List IDs.
6.  **Status**: Logic remains siloed per tool. No specific "ID-based" flow connects a Script Row -> Shot -> Camera Take.
