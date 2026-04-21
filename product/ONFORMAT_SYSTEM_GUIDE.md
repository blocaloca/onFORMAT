# onFORMAT — Comprehensive System Architecture & Feature Guide

## 1. System Vision
onFORMAT is a **Production-Ready Creative Operating System** designed for high-density, professional media workflows. It deconstructs the traditional, fragmented production lifecycle—currently scattered across spreadsheets, emails, and messaging apps—and rebuilds it into a unified, document-centric environment.

**Core Philosophy:** 
- **Decision Containers**: Every document is a bounded space for specific producer thinking.
- **Interconnectivity**: A single change in a project's schedule or crew list instantly propagates through all related documents (e.g., updating a Schedule automatically updates the Call Sheet).
- **Operational Truth**: Real-time sync between the onset crew (mobile) and the production office (desktop).

---

## 2. The Production Lifecycle (4 Phases)
The platform is structured around four distinct chronological phases. Each phase "owns" specific document templates and hands off cleanly to the next.

### Phase 1: DEVELOPMENT
*Focus: Defining intent and creative shape before reality intrudes.*
- **Brief**: Establishes project intent, format, and core objectives.
- **Creative Direction**: Defines visual references, mood, and creative approach.
- **Shot & Scene Book**: Initial mapping of must-have visuals and scene breakdowns.
- **AV Script**: Dual-column formatting for audio and visual elements.
- **Storyboard**: Visual sequence mapping with prompt/description integration.
- **Creative Concept**: High-level territory and strategy definition.
- **Director's Treatment**: The vision for execution, tone, and pacing.
- **Mood Board**: High-fidelity grid of references and color palettes.
- **Lookbook**: Curated visual standards for the production.

### Phase 2: PRE-PRODUCTION
*Focus: Turning creative intent into executable, risk-aware reality.*
- **Locations & Sets**: Scouting details, studio bookings, and set requirements.
- **Casting & Talent**: Managing talent options, approvals, and contact data.
- **Crew List**: Centralized directory of all production roles and contacts.
- **Schedule**: The chronological master plan of the shoot.
- **Budget**: Financial planning with category-specific line items.
- **Equipment List**: Technical package requirements (Camera, Grip, Electric).
- **Props List**: Master inventory of production objects and set dressing.
- **Wardrobe**: Styling direction and talent-specific clothing logs.
- **Talent Release**: Automated legal capture for on-camera personnel.
- **Property Release**: Access and usage agreements for physical locations.

### Phase 3: PRODUCTION
*Focus: Running the shoot with literal, operational accuracy.*
- **Call Sheet**: Centralized shoot-day instructions for all departments.
- **On-Set Notes**: Real-time capture of changes, timecodes, and creative shifts.
- **EComm Shot List**: High-volume product tracking with real-time status updates (Prep, On Set, Wrapped).
- **Shot List**: Technical camera plan for the shoot day.
- **DIT Log**: Verification of data capture, checksums, and storage status.
- **Camera Report**: Metadata capture for lenses, filters, and card names.
- **Sound Report**: Log of audio takes, track counts, and metadata.
- **Script Notes**: Continuity logs for post-production handoff.
- **OnSet Control Panel**: The mobile interface for real-time crew interaction.

### Phase 4: POST-PRODUCTION
*Focus: Methodical closing and professional archive of the project.*
- **Client Selects**: Tool for ranking and approving specific captured assets.
- **Deliverables & Licensing**: Tracking final exports and associated usage rights.
- **Archive Log**: Final checklist for data security and asset storage paths.
- **Budget Actuals**: Reconciliation of estimated vs. actual project spend.
- **Releases Manager**: Central dashboard for auditing all signed legal documents.

---

## 3. Core Technical Pillars (The "Engines")

### A. onSET Mobile Control
The mobile-first interface designed for the chaos of a live set. 
- **Direct Feed**: Shot completions and DIT logs entered on phones flow instantly to the Producer’s dashboard.
- **Live Distribution**: Digital Call Sheets are distributed to the entire crew via a unified mobile environment.
- **Tactical Feedback**: Allows crew to "tap to snap" reference thumbnails or update shot statuses (Prep/On Set/Wrapped) in real-time.

### B. Project Dashboard & Integrated Architecture
Beyond a simple folder system, the dashboard is a "Production Graph."
- **25+ Templated Documents**: Industry-standard logic pre-baked into every file level.
- **Cross-document Data Sync**: Eliminates redundant data entry by sharing a common project metadata layer.
- **Global Project State**: Allows producers to manage 10+ projects simultaneously with high density.

### C. Project Vision: AI Liaison
An agentic collaboration engine that understands production logic.
- **Context-Aware Assistance**: AI trained to brainstorm creative, generate intelligent shot lists, and pre-populate brief templates based on project intent.
- **Zero-Drama Partner**: Designed to assist without hallucinating logistics or over-questioning producer decisions.

### D. The Printroom (High-Fidelity PDF Engine)
The professional output layer of the system.
- **Client-Ready Layouts**: Converts raw production data into polished, branded PDF documents.
- **Custom Cover Sheets**: Every export includes custom project branding and metadata headers.
- **Batch Export**: Ability to export entire "production stacks" for final delivery.

---

## 4. Administrative & Access Infrastructure
- **Role-Based Access Control (RBAC)**: Granular permission matrix ensuring DITs, Directors, and Producers see only the information relevant to their role.
- **Founder & Pro Tiers**: Tiered access logic supporting basic users, professional producers, and "Founder" level super-users with unlimited overrides.
- **Supabase Backbone**: Real-time PostgreSQL synchronization for zero-latency updates worldwide.

---

## 5. Key Differentiators (Technical Edge)
1. **Vertical Integration**: Not a generic tool. It is built specifically for the *Media Production Industry*, understanding the difference between a "Lens" and a "Deliverable."
2. **Elimination of "Spreadsheet Hell"**: Replaces brittle Excel files with structured, relational data models that render into beautiful UIs.
3. **Office-to-Set Loop**: The unique ability to have a producer in London see a "Wrapped" status on a shot occurring in Los Angeles within seconds.
