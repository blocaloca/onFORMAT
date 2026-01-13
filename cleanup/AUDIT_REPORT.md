# onFORMAT Cleanup Audit Report

**Date:** 2025-12-26
**Auditor:** Claude (Cleanup Mode)
**Source of Truth:** onFORMAT_CORE.md, director_rules.md, CLEANUP_RULES.md

---

## Executive Summary

The current codebase contains **significant scope drift** from the core onFORMAT vision. Major issues identified:

1. **Document bloat**: 50+ document types vs. approved 13 core documents
2. **Stage naming misalignment**: Non-standard phase names ("Develop", "Wrap", "Pre-Production")
3. **AI-first tools**: 3 separate AI tools (LuxPix, GenStudio, ArtMind) conflict with production-first principle
4. **Social-first bias**: "social-content" template is oversized and social-creator focused vs producer-focused
5. **Director behavior**: Current prompt violates director_rules.md (claims to "create real projects", too performative)

---

## Document Audit

### Core Documents (Per onFORMAT_CORE.md)

**CONCEPT Phase:**
- ✅ Brief (exists)
- ⚠️ Creative Direction (missing - covered by "treatment" in video only)
- ⚠️ Shot & Scene Book (exists as "shot-book" and "shot-list" but scattered)

**PLAN Phase:**
- ⚠️ Locations & Sets (exists as "location-scout", "locations", "location-permits" - fragmented)
- ✅ Casting & Talent (exists as "casting")
- ✅ Crew List (exists)
- ✅ Schedule (exists)
- ✅ Budget (exists)

**EXECUTE Phase:**
- ✅ Call Sheet (exists)
- ⚠️ On-Set Notes (exists but as "on-set-notes", "production-log", "direction-notes" - fragmented)
- ✅ Client Selects (exists)

**WRAP Phase:**
- ⚠️ Deliverables & Licensing (exists as "deliverables-tracker", "license-tracking", "usage-licensing" - fragmented)
- ✅ Archive Log (exists)

### Non-Core Documents (To Deprecate)

**Social Media Specific** (conflicts with producer-first):
- platform-strategy
- content-pillars
- tone-voice
- audience-profile
- content-ideas
- scripts-prompts
- visual-style-guide
- posting-calendar
- shoot-blocks
- platform-rights
- approval-workflow
- content-tracker
- edits-versions
- captions-copy
- hashtags-metadata
- posting-schedule
- performance-report

**Video Post-Production** (future scope):
- edit-notes
- color-notes
- sound-mix
- vfx-notes
- music-cue

**Video Delivery** (future scope):
- broadcast-masters
- social-cutdowns
- clean-feeds

**Photo Post** (duplicative/niche):
- retouching-notes
- dit-notes
- image-selects
- art-book
- mood-board (keep but reframe as "Creative Direction")

**Insurance/Legal** (out of scope for v1):
- production-insurance
- equipment-list
- gear-list

**Workflow Management** (out of scope):
- audio-log
- script-notes
- media-organization
- live-selects

**Total Non-Core:** ~40 document types

---

## Stage/Phase Naming Issues

### Current Naming:
- Commercial Video: "pre-production", "production", "post-production", "delivery"
- Commercial Photography: "develop", "plan", "execute", "wrap"
- Social Content: "develop", "plan", "execute", "wrap"

### Should Be (Per onFORMAT_CORE.md):
- **Concept** (not "develop" or "pre-production")
- **Plan** (standard)
- **Execute** (not "production")
- **Wrap** (acceptable but should standardize to match "delivery" concept)

**Issue:** Inconsistent naming across templates reduces clarity.

---

## Template Audit

### Commercial Video
**Status:** Partial alignment
**Issues:**
- Stage names non-standard
- Too many post-production docs (5) - out of v1 scope
- "delivery" docs (4) are future-facing

**Recommendation:** Simplify to core 13 docs, rename stages

### Commercial Photography
**Status:** Partial alignment
**Issues:**
- 21 total documents (too many)
- "mood-board" and "art-book" overlap
- Insurance, permits, equipment lists are producer tasks, not onFORMAT core
- Stage names need standardization

**Recommendation:** Reduce to ~10 core docs

### Social Media Content
**Status:** **MISALIGNED**
**Issues:**
- 26 total documents
- User type: "Content Creator, Influencer" - **NOT producer**
- Heavy bias toward social media strategy vs production
- Documents like "hashtags-metadata", "performance-report", "posting-schedule" are marketing tools, not production docs
- Conflicts with "producer-first" principle

**Recommendation:**
- Either deprecate entirely OR
- Reframe as "Hybrid Content Production" for producers who shoot social alongside commercial
- Reduce to Brief, Schedule, Budget, Crew, Call Sheet, Selects, Archive (~7 docs)

### Locked Templates (Pro/Studio Tier)
**Status:** Future scope
**Action:** Keep as locked placeholders, no immediate changes needed

---

## AI Features Audit

### 1. Director AI
**Current Location:** `/app/director/page.tsx`, `/app/api/director/route.ts`

**Violations:**
1. **System Prompt:** Says "creative collaborator" and "can CREATE REAL PROJECTS" - performative, overpromises
2. **Tone:** "Brief, conversational, practical. No fluff" - too casual for professional tool
3. **Missing:** No guardrails against inventing locations, vendors, costs
4. **Missing:** No handling of unfamiliar location requests

**Per director_rules.md Should:**
- "Ask structured clarifying questions"
- "Help users think through tradeoffs"
- NOT "pretend to be creative auteur"
- Must say "I'm unsure" when uncertain
- Must NOT invent facts

**Recommendation:** Rewrite system prompt to align with director_rules.md

### 2. LuxPix Tool
**Location:** `/app/tools/luxpix/page.tsx`

**Issue:** Appears to be AI-first image generation or editing tool
**Conflicts:** onFORMAT is production-first, not AI art generator
**Status:** Unknown functionality (needs investigation)

**Recommendation:** Deprecate or repurpose as production-facing feature

### 3. GenStudio Tool
**Location:** `/app/tools/genstudio/page.tsx`

**Issue:** Name suggests AI-first generative studio
**Conflicts:** onFORMAT avoids hallucination-heavy outputs

**Recommendation:** Deprecate or reframe as production tool with clear boundaries

### 4. ArtMind Tool
**Location:** `/app/tools/artmind/page.tsx`

**Issue:** Name suggests creative AI tool
**Conflicts:** onFORMAT is not a creative ideation platform

**Recommendation:** Deprecate or reframe

---

## Naming Issues

### Non-Standard Terms:
- "Mood Board" → Should be "Creative Direction" (visual references)
- "Shot Book" → Should be "Shot & Scene Book" (per core docs)
- "Wrap" → Inconsistent with "Delivery"
- "On-Set Notes" → Fragmented across multiple doc types
- "Location Scout" → Should be "Locations & Sets"

### AI-Branded Names:
- "Director" → Acceptable (industry term)
- "ArtMind" → Not industry-standard
- "GenStudio" → Not industry-standard
- "LuxPix" → Not industry-standard

---

## Database/Storage Issues

### Image Upload Feature
**Status:** Recently added for "mood-board"
**Issue:** Mood board is not a core v1 document

**Recommendation:** Repurpose image upload for "Creative Direction" document

### Completed Status
**Status:** Recently added `completed` boolean to documents
**Issue:** None - aligns with production tracking

**Recommendation:** Keep

---

## Feature Bloat

### Export Features
- PDF export ✅
- DOCX export ⚠️ (future scope)
- Excel export ⚠️ (future scope)

**Per onFORMAT_CORE.md:**
"Primary outputs are PDFs"

**Recommendation:** Keep PDF, mark DOCX/Excel as future enhancements

---

## Breakdown by Action Type

### KEEP (Aligned with Core):
1. Brief document
2. Budget document
3. Schedule document
4. Crew List document
5. Casting document
6. Call Sheet document
7. Client Selects document
8. Archive Log document
9. PDF export feature
10. Completed status tracking
11. Director AI (after rewrite)

### RENAME (Industry Standard):
1. "Mood Board" → "Creative Direction"
2. "Shot Book" → "Shot & Scene Book"
3. "Location Scout" → "Locations & Sets"
4. "On-Set Notes" → Consolidate fragments into single doc
5. Stages: Standardize to "Concept/Plan/Execute/Wrap"

### CONSOLIDATE (Reduce Fragmentation):
1. Location docs (scout + permits + locations) → "Locations & Sets"
2. On-set docs (on-set-notes + production-log + direction-notes) → "On-Set Notes"
3. Selects docs (client-selects + image-selects + live-selects) → "Client Selects"
4. Licensing docs (usage-licensing + license-tracking + deliverables-tracker) → "Deliverables & Licensing"

### DEPRECATE (Not Core v1):
1. social-content template (or radically simplify)
2. All social media marketing docs (26 documents)
3. All post-production detail docs (edit, color, sound, vfx, music)
4. All delivery format docs (broadcast, cutdowns, clean feeds)
5. Insurance/equipment/gear lists
6. LuxPix, GenStudio, ArtMind tools (pending investigation)
7. DOCX/Excel export (move to future)
8. Art Book document
9. Retouching Notes document
10. DIT Notes document
11. Audio Log document
12. Script Supervisor Notes document
13. Media Organization document

### NEEDS INVESTIGATION:
1. What do LuxPix/GenStudio/ArtMind actually do?
2. Custom templates feature - is it production-focused?
3. Dashboard complexity - too many options?

---

## Risk Assessment

### HIGH RISK (Breaking Changes):
1. Removing social-content template
2. Deprecating 40+ document types
3. Rewriting Director AI prompt
4. Removing AI tools (LuxPix, GenStudio, ArtMind)

### MEDIUM RISK:
1. Renaming stages across templates
2. Consolidating fragmented documents
3. Updating UI to hide deprecated docs

### LOW RISK:
1. Renaming documents to industry standard
2. Marking export formats as future
3. Updating documentation

---

## Recommended Cleanup Sequence

### Phase 1: Document Deprecation (Non-Breaking)
1. Add `deprecated: true` flag to document types
2. Update templates to mark non-core docs
3. Hide deprecated docs from UI (don't delete)
4. Update documentation

### Phase 2: Naming Standardization
1. Rename stages to Concept/Plan/Execute/Wrap
2. Rename documents to industry standard
3. Update database references
4. Update UI labels

### Phase 3: Director AI Rewrite
1. Rewrite system prompt per director_rules.md
2. Add guardrails against hallucination
3. Add unfamiliar location handling
4. Update tone to professional/calm

### Phase 4: Template Simplification
1. Reduce Commercial Video to 13 core docs
2. Reduce Commercial Photography to 10 core docs
3. Simplify or deprecate Social Content template
4. Standardize stage structure across all

### Phase 5: Feature Audit
1. Investigate LuxPix/GenStudio/ArtMind purpose
2. Deprecate or repurpose based on findings
3. Mark DOCX/Excel export as future
4. Clean up unused components

---

## Open Questions Requiring User Approval

1. **Social Content Template:** Deprecate entirely OR simplify to producer-focused?
2. **AI Tools:** What is actual functionality of LuxPix/GenStudio/ArtMind?
3. **Export Formats:** Remove DOCX/Excel immediately or mark as "beta"?
4. **Mood Board Images:** Keep upload feature for "Creative Direction"?
5. **Stage Names:** Use "Concept/Plan/Execute/Wrap" or "Concept/Plan/Execute/Delivery"?
6. **Template Count:** Keep 3 main templates or reduce to 2 (Video/Photo only)?

---

## Success Metrics

After cleanup, system should have:
- ✅ 13-15 core document types (down from 50+)
- ✅ Consistent stage naming across templates
- ✅ Director AI aligned with director_rules.md
- ✅ No AI-first features (unless repurposed)
- ✅ Producer-first language throughout
- ✅ Clear, familiar terminology
- ✅ Simplified UI with fewer options

---

## Next Steps

**AWAITING USER APPROVAL** before proceeding with:
1. Document deprecation strategy
2. Director AI prompt rewrite
3. Template simplification approach
4. AI tools disposition (keep/deprecate/repurpose)
5. Social content template decision

**DO NOT PROCEED** with file deletion or database changes until approved.

---

**Audit Status:** COMPLETE
**Recommendation:** Proceed with conservative, phased approach per CLEANUP_RULES.md
