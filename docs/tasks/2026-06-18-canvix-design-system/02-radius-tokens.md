---
task_id: "02"
title: "Radius Token Integration"
description: "Define separate radius tokens for buttons, cards, and inputs in styles.css without changing the base radius."
type: IMPLEMENTATION
phase: 3
status: completed
estimated_effort: S
complexity: low
risk: low
depends_on: ["01"]
rule_refs: []
date: "2026-06-18"
changelog:
  - version: 1.0
    date: "2026-06-18"
    summary: Initial task specification.
---

# Context
- **Requirement**: [canvix.io-DESIGN.md](../../draft/canvix.io-DESIGN.md)
- **Parent Task**: [2026-06-18-canvix-design-system-implementation-tasks.md](../2026-06-18-canvix-design-system-implementation-tasks.md)
- **Applicable Workflows**: `/fe-implementation`
- **Applicable Skills**: `bks-fe-implement-feature`

---

# Task 02: Radius Token Integration

## Description
This task introduces explicit border-radius custom properties for buttons, cards, and text inputs to reflect the Canvix styling rules. The base `--radius` (0.5rem) remains locked to preserve compatibility with default shadcn scale operations.

## Requirements

### 1. Add Radius Custom Properties to SDK styles (MODIFY)
- **File path**: `frontend/bks/ds-system-sdk/styles.css`
- **Action**: Add the following custom properties to the `:root` pseudo-class (around line 66 near `--radius: 0.5rem;`):

```css
/* Add these custom radius values */
--radius-btn: 0.9375rem;   /* 15px default button radius */
--radius-card: 1.375rem;   /* 22px default card radius */
--radius-input: 0.75rem;   /* 12px default text input radius */
```

- **Action**: Map these custom properties into Tailwind v4 theme configurations by declaring them in the `@theme inline` block:

```css
@theme inline {
  /* ... existing config ... */
  --radius-btn: var(--radius-btn);
  --radius-card: var(--radius-card);
  --radius-input: var(--radius-input);
}
```

## Status
- [x] Add the three radius custom properties to `:root` in `styles.css`
- [x] Map the radius custom properties in `@theme inline` block in `styles.css`
- [x] Run `pnpm lint` in `frontend` directory to format and validate CSS files

## Acceptance Criteria
1. The CSS variables `--radius-btn`, `--radius-card`, and `--radius-input` are present in `:root` and compile correctly.
2. The variables are accessible via Tailwind CSS classes (e.g., `rounded-btn`, `rounded-card`, `rounded-input`).
3. The base `--radius` remains set to `0.5rem`.
