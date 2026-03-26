# Changelog

All notable changes to the Creative OS / onFORMAT Ecosystem will be documented in this file.

## [0.4.0] - 2026-03-25

### High-Level Summary
This update introduces the **Producer Alert System**, **Advanced RBAC (Role-Based Access Control)**, and **PrintRoom Pagination**, transforming OnSet Mobile from a document viewer into a real-time production nerve center.

### Added
- **Producer Alert System**:
    - Real-time "Pulse" broadcasts from mobile to desktop.
    - Interactive "Red Glow" navigation indicators on the desktop dashboard for new DIT, Camera, and Note activity.
    - Toast notifications for critical set events (Shot Complete, New Roll, DIT Issue).
- **Advanced RBAC Architecture**:
    - **ABCD Permission Bundles**:
        - **Group A (Creative)**: Treatment, Storyboard, Creative Brief.
        - **Group B (Logistics)**: Call Sheets, Crew List, Production Schedule.
        - **Group C (Capture)**: DIT Logs, Camera Reports, Shot Logs.
        - **Group D (Admin/Edit)**: Grants full delete/edit permissions to non-owner crew (e.g., DITs, Coordinators).
    - **Role-Based Mapping**: Automatic document visibility based on production roles (DP, Director, DIT, etc.).
- **User manual & Support**:
    - Created a premium `/help` page (User Manual).
    - Integrated Support Ecosystem into the Account Tab.
- **PrintRoom Pagination**:
    - Automatic multi-page PDF generation for overflowing content.
    - Improved landscape/portrait rendering logic for Creative Briefs and Locations.

### Fixed
- **Mobile UI Hardening**:
    - Standardized "Paper Theme" (Dark-on-Light) for all document views.
    - Resolved "Ghost" demo tools appearing when permissions were empty.
    - Fixed padding and layout issues in the Script and Shot List views.
- **Print Specifics**:
    - Removed browser UI artifacts (inputs, borders) from PDF exports.
    - Standardized font-weight and contrast for "Professional Print" standards.

### Security
- Implemented "Default Deny" for write-access across all mobile components.
- Hardened role verification to ensure only authenticated crew members see production data.

---

## [0.3.5] - 2026-03-13

### Changed
- Isolated Production Crew logic per project to prevent cross-production data leakage.
- Refined `WorkspaceEditor` save-draft logic for AI-generated content.

### Fixed
- Video Bulletin bug where YouTube/Vimeo links wouldn't play on user accounts.
