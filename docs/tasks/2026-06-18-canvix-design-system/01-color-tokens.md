---
task_id: "01"
title: "Color Token Integration"
description: "Update color CSS custom properties in styles.css to match the Canvix brand colors while keeping dark mode compatible."
type: IMPLEMENTATION
phase: 3
status: completed
estimated_effort: S
complexity: low
risk: low
depends_on: []
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

# Task 01: Color Token Integration

## Description
This task updates the primary color custom properties, text colors, and default box shadows in the design system SDK to align with the new Canvix visual direction. The changes are restricted to CSS variables to guarantee zero layout regression.

## Requirements

### 1. Update SDK global stylesheet (MODIFY)
- **File path**: `frontend/bks/ds-system-sdk/styles.css`
- **Action**: Update the following color custom properties under the `:root` pseudo-class:

```css
/* Update these within :root */
--primary: oklch(64.7% 0.2 224.8);                /* #1FA4EF Bright Blue */
--primary-foreground: oklch(1 0 0);                /* White */
--foreground: oklch(10.5% 0.028 252);              /* #0F172A Navy */
--card-foreground: oklch(10.5% 0.028 252);         /* #0F172A Navy */
--popover-foreground: oklch(10.5% 0.028 252);      /* #0F172A Navy */
--border: oklch(91.8% 0.006 247);                  /* #E5E7EB */
--input: oklch(91.8% 0.006 247);                  /* #E5E7EB */
--ring: oklch(64.7% 0.2 224.8);                    /* #1FA4EF Bright Blue */
--muted-foreground: oklch(49.7% 0.025 252);        /* #64748B Slate */
--background: oklch(98.6% 0.003 247);              /* #F8FAFC Off White */
--sidebar-primary: oklch(64.7% 0.2 224.8);         /* Match main primary */
--sidebar-ring: oklch(64.7% 0.2 224.8);
--sidebar-border: oklch(91.8% 0.006 247);
--text: #334155;                                   /* Slate - body copy */
--text-h: #0F172A;                                 /* Navy - headings */
--shadow: rgba(15, 23, 42, 0.14) 0px 18px 42px 0px; /* Canvix raised elevation shadow */
```

- **Action**: Update the dark mode mappings under the `.dark` class to match dark equivalents:

```css
/* Update these within .dark */
--primary: oklch(72% 0.16 224.8);                  /* Lighter blue to contrast dark bg */
--primary-foreground: oklch(10.5% 0.028 252);
--foreground: oklch(0.985 0 0);
--ring: oklch(72% 0.16 224.8);
--sidebar-primary: oklch(72% 0.16 224.8);
--sidebar-ring: oklch(72% 0.16 224.8);
--text: #9ca3af;
--text-h: #f3f4f6;
```

- **Action**: Locate the `@media (prefers-color-scheme: dark)` block in `styles.css` and ensure the dark variables mirror the `.dark` class where relevant.

## Status
- [x] Update light mode color custom properties in `styles.css`
- [x] Update dark mode color custom properties in `styles.css`
- [x] Run `pnpm lint` in `frontend` directory to ensure format and validation passes

## Acceptance Criteria
1. The primary brand color changes to the Bright Blue (#1FA4EF) on buttons, active states, and borders.
2. Background color adjusts to soft `#F8FAFC`, and default text color matches `#334155` (Slate) / headings match `#0F172A` (Navy).
3. Shadow styling updates to the smooth Canvix raised shadow.
4. Dark mode colors automatically apply when the `.dark` class or preferred color scheme dark mode is active.
