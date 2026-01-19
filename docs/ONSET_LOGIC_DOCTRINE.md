# onSET Logic & Architecture Doctrine
> **Status:** LIVE  
> **Last Updated:** 2026-01-18  
> **Maintainer:** Chief Stack Engineer (Antigravity)

This document serves as the **Single Source of Truth** for the `onSET` feature ecosystem, specifically the **Mobile Control Panel**, **Permissions System (ABC)**, and **Mobile App View**. Any code refactoring MUST preserve the logic defined herein.

---

## 1. Core Architecture: The "Sync" Model

The `onSET` system synchronizes a Web Dashboard (Director/Producer view) with a streamlined Mobile Web App (Crew view).

### Data Source
- **Single Document**: Configuration is stored in a specific Supabase document of type `onset-mobile-control`.
- **Location**: `project.phases.ON_SET.drafts['onset-mobile-control']`.
- **Key Schema**:
  ```typescript
  {
    isLive: boolean;          // Global "Go Live" switch
    toolGroups: {             // Permissions Map
      [toolKey: string]: string[] // e.g., 'dit-log': ['A', 'B']
    }
  }
  ```
- **Database Constraint**: The document `status` MUST be `'DRAFT'` (or `'IN_PROGRESS'`) during updates. DO NOT use `'LIVE'` as a status string, as it violates database check constraints.

---

## 2. The ABC Permissions System

We use a simplified Role-Based Access Control (RBAC) mapped to 3 arbitrary groups: **A**, **B**, and **C**.

### A. The Actors
1.  **Admin / Configurator**:
    *   **Defined By**: `userRole` is 'admin' OR 'owner'.
    *   **Extended Definition**: Crew members with roles: *Producer, Executive Producer, Director, UPM, DIT, 1st AD*.
    *   **Privileges**: Can see ALL tools, can toggle A/B/C permissions for any tool.
2.  **Crew Member**:
    *   **Defined By**: `userEmail` matching an entry in the **Crew List** document.
    *   **Privileges**: specifically assigned `onSetGroups` (e.g., `['A']`).
3.  **Public/Unknown**:
    *   **Privileges**: None by default (unless Public Access is explicitly enabled, currently disabled).

### B. The Logic Flow
1.  **Crew List**: The `crew-list` document determines which User Email belongs to which Group.
2.  **Control Panel**: The Admin assigns Tools to Groups (e.g., "Call Sheet" -> Group A).
3.  **Resolution**:
    *   If `User.groups` overlaps with `Tool.groups` -> **ACCESS GRANTED**.
    *   If `Tool.groups` is empty -> **ACCESS DENIED** (Strict Mode: "Show none if none granted").
    *   If User is **Admin** -> **ACCESS GRANTED** (Global Override).

---

## 3. Mobile Control Panel (The "Remote")

This is the Floating Interface (`FloatingMobileControl.tsx`) used by Admins to orchestrate the set.

### Functional Requirements
1.  **Visibility**: It MUST be a **Floating Window**, draggable, persisting over the workspace.
2.  **Content**:
    *   Lists ALL available onSET tools (sorted by Phase).
    *   Displays A/B/C Toggle Buttons for EVERY tool.
3.  **Admin Experience Protection**:
    *   **CRITICAL**: The Control Panel MUST NOT filter tools based on the Admin's own group assignments.
    *   *Regression Prevention*: If an Admin assigns "Sound Report" to Group 'C', and the Admin is not in 'C', the tool **MUST REMAIN VISIBLE** in the Control Panel so they can manage it. Filtering is for the *Consumer* (Mobile App), not the *Controller*.
4.  **Alert System**:
    *   Must display `latestNotification` (e.g., "SHOT LOG UPDATED") as a banner.
    *   Must trigger visual cues (blinking/pulsing) to confirm sync activity.

---

## 4. Mobile App (The "Receiver")

This is the Client View (`app/mobile/[id]/page.tsx`) accessed by crew via QR Code.

### Functional Requirements
1.  **Strict Filtering**:
    *   The App acts as the "Lens" for the crew member.
    *   It **MUST** authenticate the user (`supabase.auth.getUser()`).
    *   It **MUST** cross-reference `Crew List` to find user groups.
    *   It **MUST** hide any tool that does not have an explicit permission grant for the user's group.
2.  **Empty State Handling**:
    *   **DIT Log**: If the log exists but has 0 entries, it MUST render the **Table Headers** and a "Waiting for entries" status. It must NOT show a generic "Empty List" or "No Data" error, as this confirms to the DIT that the *capability* is active.
3.  **Real-time**: The app should ideally poll or subscribe to changes (currently polling via refresh or potential realtime hook).

---

## 5. Development Protocols

1.  **Do Not regress Admin Visibility**: Always distinguish between "View Permissions" (Mobile App) and "Edit Configuration" (Control Panel).
2.  **Database Safety**: Always use standard status enums (`DRAFT`) when creating system documents programmatically.
3.  **Component Isolation**: When refactoring to floating components, ensure all parent props (like `crewList`, `userRole`) are explicitly passed and typed.
