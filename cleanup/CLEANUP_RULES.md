# Cleanup Rules — onFORMAT

## Purpose

These rules govern refactoring, simplification, and cleanup of the
existing codebase and feature set.

The goal is clarity, not expansion.

---

## Source of Truth

- onFORMAT_CORE.md defines what the product is.
- Any feature that conflicts with it must be flagged.

---

## Cleanup Principles

1. Deprecate before deleting  
   Do not remove files or features without explicit approval.

2. Favor fewer, stronger documents  
   Redundant or overlapping documents should be merged or deprecated.

3. Production clarity over feature count  
   If a feature confuses the user, it weakens the product.

4. No new features during cleanup  
   Cleanup is not an opportunity to add scope.

---

## Document Handling

- Core documents remain active.
- Non-core documents should be marked:
  `status: deprecated`
- Deprecated documents may remain in code but should be removed from UI.

---

## Naming Rules

- Use industry-standard terminology
- Avoid clever or AI-branded names
- If a producer wouldn’t recognize it instantly, rename it

---

## AI Constraints

- AI behavior must follow director_rules.md
- No hallucination-prone features may be introduced
- AI-first tools must be reframed as production-first

---

## Decision Rule

If unsure whether to keep something, ask:

“Does this help a producer make a real decision?”

If not, it does not belong in v1.
