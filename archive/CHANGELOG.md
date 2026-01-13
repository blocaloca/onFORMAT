# onFORMAT Cleanup Changelog

## Phase 1 - Core Alignment (2025-12-26)

**Objective:** Align codebase with onFORMAT_CORE.md principles

### Approved Changes

**Templates:**
- ✅ Reduced from 3 templates to 2 core templates (Commercial Photography, Commercial Video)
- ✅ Deprecated Social Content template (non-producer focused)
- ✅ Standardized stages to: Concept / Plan / Execute / Wrap

**Documents:**
- ✅ Consolidated fragmented document types
- ✅ Renamed to industry-standard terminology
- ✅ Marked non-core documents as deprecated

**AI Features:**
- ✅ Updated Director AI to comply with director_rules.md
- ✅ Deprecated LuxPix, GenStudio, ArtMind from navigation
- ✅ Removed hallucination-prone behaviors

**Exports:**
- ✅ Enforced PDF-only exports (DOCX/Excel marked as future)

---

## Detailed Changes

### Templates Modified

#### Commercial Photography
**Before:** 21 documents across 4 stages (develop/plan/execute/wrap)
**After:** 13 core documents across 4 stages (Concept/Plan/Execute/Wrap)

**Stage Renaming:**
- "develop" → "Concept"
- "plan" → "Plan" (unchanged)
- "execute" → "Execute" (unchanged)
- "wrap" → "Wrap" (unchanged)

**Document Changes:**
- RENAMED: "mood-board" → "creative-direction"
- RENAMED: "shot-book" → "shot-scene-book"
- RENAMED: "location-scout" → "locations-sets"
- CONSOLIDATED: location-permits + locations → "locations-sets"
- CONSOLIDATED: usage-licensing + license-tracking + deliverables-tracker → "deliverables-licensing"
- DEPRECATED: art-book (redundant with creative-direction)
- DEPRECATED: equipment-list (production management tool, not core doc)
- DEPRECATED: production-insurance (out of scope)
- DEPRECATED: retouching-notes (post-production detail)
- DEPRECATED: dit-notes (technical detail)
- DEPRECATED: image-selects (covered by client-selects)

#### Commercial Video
**Before:** 22 documents across 4 stages (pre-production/production/post-production/delivery)
**After:** 13 core documents across 4 stages (Concept/Plan/Execute/Wrap)

**Stage Renaming:**
- "pre-production" → "Concept"
- "production" → "Execute"
- "post-production" → REMOVED (out of v1 scope)
- "delivery" → "Wrap"

**Document Changes:**
- RENAMED: "treatment" → "creative-direction"
- RENAMED: "location-scout" → "locations-sets"
- RENAMED: "crew-booking" → "crew-list"
- DEPRECATED: script (future scope)
- DEPRECATED: storyboard (future scope)
- DEPRECATED: shot-list (covered by shot-scene-book)
- DEPRECATED: production-log (covered by on-set-notes)
- DEPRECATED: script-notes (technical detail)
- DEPRECATED: audio-log (technical detail)
- DEPRECATED: edit-notes (post-production, out of v1)
- DEPRECATED: color-notes (post-production, out of v1)
- DEPRECATED: sound-mix (post-production, out of v1)
- DEPRECATED: vfx-notes (post-production, out of v1)
- DEPRECATED: music-cue (post-production, out of v1)
- DEPRECATED: broadcast-masters (delivery detail, out of v1)
- DEPRECATED: social-cutdowns (delivery detail, out of v1)
- DEPRECATED: clean-feeds (delivery detail, out of v1)

#### Social Content Template
**Before:** 26 documents across 4 stages
**After:** DEPRECATED - conflicts with producer-first principle

**Reason:** Template focused on content creators/influencers, not producers. Documents like "hashtags-metadata", "performance-report", "posting-schedule" are marketing tools, not production documents.

**Future:** May be reintroduced as "Hybrid Content Production" for producers who shoot social alongside commercial work.

---

### Document System Changes

#### Core Document Set (13 Documents)

**Concept Phase:**
1. Brief
2. Creative Direction (was: mood-board, treatment)
3. Shot & Scene Book (was: shot-book)

**Plan Phase:**
4. Locations & Sets (was: location-scout, consolidated)
5. Casting & Talent
6. Crew List
7. Schedule
8. Budget

**Execute Phase:**
9. Call Sheet
10. On-Set Notes
11. Client Selects

**Wrap Phase:**
12. Deliverables & Licensing (consolidated)
13. Archive Log

#### Document Type Mappings

```typescript
// Renamed Documents
"mood-board" → "creative-direction"
"treatment" → "creative-direction"
"shot-book" → "shot-scene-book"
"location-scout" → "locations-sets"
"crew-booking" → "crew-list"

// Consolidated Documents
["location-scout", "location-permits", "locations"] → "locations-sets"
["usage-licensing", "license-tracking", "deliverables-tracker"] → "deliverables-licensing"
["on-set-notes", "production-log", "direction-notes"] → "on-set-notes"
["client-selects", "image-selects", "live-selects"] → "client-selects"

// Deprecated Documents (40+ types)
- All social media marketing docs
- All post-production detail docs
- All delivery format docs
- Insurance/equipment/gear lists
- Technical workflow docs
```

---

### AI Behavior Changes

#### Director AI System Prompt
**Before:**
- "creative collaborator for production planning who can CREATE REAL PROJECTS"
- "Brief, conversational, practical. No fluff."
- Performative tone, overpromising capabilities

**After:**
- Calm, professional tone
- Clear boundaries on what AI can/cannot do
- Guardrails against inventing facts
- Structured question approach
- Explicit uncertainty handling

**Compliance with director_rules.md:**
- ✅ No invented facts, locations, vendors
- ✅ No pretense of local knowledge
- ✅ No speculative creative treatments by default
- ✅ Clear labeling of uncertainty
- ✅ Professional, grounded tone

---

### UI/Navigation Changes

#### Deprecated from Navigation:
- /tools/luxpix (AI-first tool, conflicts with production-first)
- /tools/genstudio (AI-first tool, hallucination-prone)
- /tools/artmind (AI-first tool, not production-focused)

**Status:** Routes remain but hidden from UI. May be removed in Phase 2.

#### Export Options:
**Before:** PDF, DOCX, Excel
**After:** PDF only

**Reason:** Per onFORMAT_CORE.md: "Primary outputs are PDFs"

DOCX/Excel code remains but UI options removed. May be reintroduced as "beta" features in future.

---

### Files Modified

**Templates:**
- `lib/project-templates.ts` - Major refactor
- `lib/project-templates.ts.backup` - Original backed up

**Director AI:**
- `app/api/director/route.ts` - System prompt rewrite
- `app/api/director/route.ts.backup` - Original backed up
- `app/api/director/create-projects/route.ts` - Updated to use new document types

**Metadata & Branding:**
- `app/layout.tsx` - Updated metadata from "Creative OS" to "onFORMAT"
- Removed AI tool branding (LuxPix, GenStudio, ArtMind) from description

**Deprecated AI Tools:**
- `app/tools/luxpix/page.tsx` - Added deprecation notice
- `app/tools/genstudio/page.tsx` - Added deprecation notice
- `app/tools/artmind/page.tsx` - Added deprecation notice
- Routes remain for backward compatibility but are not linked in UI

**Template Display & Selection:**
- `app/dashboard/page.tsx` - Removed locked template logic
- `components/NewProjectModal.tsx` - Removed locked template filtering
- `components/CustomTemplateModal.tsx` - Removed locked template filtering
- All templates are now freely accessible (no tier restrictions in Phase 1)

**Document Forms:**
- TBD: Rename mood-board components to creative-direction (Phase 2)
- TBD: Update document type references (Phase 2)

**Export:**
- `app/document/[id]/page.tsx` - Removed DOCX/Excel export buttons from UI
- Export functions remain in `lib/export-documents.ts` for potential future use

---

### Database Impact

**Schema Changes:** NONE (conservative approach)

**Data Migration:** NOT REQUIRED
- Existing documents with old type names will continue to work
- New documents will use new naming
- Deprecated types will gradually phase out

**Notes:**
- No breaking changes to existing user data
- Backward compatible with existing projects
- Clean migration path for future schema updates

---

### Breaking Changes

**For Users:**
- Social Content template no longer available
- AI tools (LuxPix, GenStudio, ArtMind) removed from navigation
- DOCX/Excel export options removed
- Some document types renamed in new projects

**For Developers:**
- Template structure changed (stages renamed)
- Document type names changed
- Director AI prompt significantly different
- Export functions still exist but UI hidden

**Mitigation:**
- Existing projects unaffected
- Old document types still render
- No data loss
- Gradual transition approach

---

### Testing Required

**Critical Paths:**
1. Director AI creates projects with new document types
2. New documents render correctly with renamed types
3. PDF export works for all core documents
4. Navigation hides deprecated AI tools
5. Existing projects with old document types still work

**Validation:**
1. All 13 core documents present in new projects
2. Stages named Concept/Plan/Execute/Wrap
3. Director tone is professional and grounded
4. No DOCX/Excel buttons in UI
5. Dashboard shows only Photography/Video templates

---

### Rollback Plan

If issues arise:
1. Revert `lib/project-templates.ts` to previous version
2. Revert `app/api/director/route.ts` to previous prompt
3. Restore export buttons in document editor
4. Re-enable AI tools in navigation

**Files backed up:** (should create backups before applying changes)

---

### Next Steps (Phase 2)

**Not included in Phase 1:**
1. File deletion (deprecated components/pages)
2. Database schema updates
3. Complete UI refactor
4. Custom template system alignment
5. Advanced document consolidation

**Awaiting approval for Phase 2**

---

### Metrics

**Before Cleanup:**
- 3 templates (Photography, Video, Social)
- 50+ document types
- 4 AI tools (Director + 3 deprecated)
- Inconsistent stage naming
- 3 export formats

**After Cleanup:**
- 2 templates (Photography, Video)
- 13 core document types + deprecated types
- 1 AI tool (Director, compliant)
- Standardized stage naming (Concept/Plan/Execute/Wrap)
- 1 export format (PDF)

**Reduction:**
- -33% templates
- -74% document types
- -75% AI tools
- +100% naming consistency
- -67% export complexity

---

## Status: PHASE 1 COMPLETE

**Completed:**
- ✅ Audit and planning
- ✅ Changelog created
- ✅ Template refactoring (2 core templates, 13 documents)
- ✅ Director AI compliance update
- ✅ AI tools deprecated (LuxPix, GenStudio, ArtMind)
- ✅ PDF-only exports enforced
- ✅ Metadata/branding updated to onFORMAT

**Pending:**
- ⏳ Documentation updates
- ⏳ Testing and validation
- ⏳ User communication
- ⏳ Phase 2 approval

---

**Last Updated:** 2025-12-26
**Phase:** 1 of 3
**Status:** Active Development
