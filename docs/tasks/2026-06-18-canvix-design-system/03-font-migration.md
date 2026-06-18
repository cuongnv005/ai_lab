---
task_id: "03"
title: "Plus Jakarta Sans Font Migration"
description: "Migrate the primary font family to Plus Jakarta Sans with full Vietnamese character support across Next.js layout and CSS stylesheets."
type: IMPLEMENTATION
phase: 3
status: completed
estimated_effort: S
complexity: low
risk: low
depends_on: ["02"]
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

# Task 03: Plus Jakarta Sans Font Migration

## Description
This task migrates the primary font of the project from `Be Vietnam Pro` to `Plus Jakarta Sans`. To ensure full readability for Vietnamese users, the font must be loaded with both `latin` and `vietnamese` subsets.

## Requirements

### 1. Update Next.js Root Layout (MODIFY)
- **File path**: `frontend/app/layout.tsx`
- **Action**: Import and initialize `Plus_Jakarta_Sans` instead of `Be_Vietnam_Pro`.
- **Implementation Guidelines**:
  - Load the font with variable name `--font-plus-jakarta`.
  - Set subsets to `["latin", "vietnamese"]`.
  - Set weights to `["300", "400", "500", "600", "700", "800"]`.
  - Apply the class name to `<html>` element.

```tsx
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// Within RootLayout, replace:
// className={`${beVietnamPro.variable}`}
// with:
// className={`${plusJakartaSans.variable}`}
```

### 2. Update Global Tailwind Theme (MODIFY)
- **File path**: `frontend/app/globals.css`
- **Action**: Replace references to `var(--font-be-vietnam)` with `var(--font-plus-jakarta)` inside the `@theme` block.

```css
@theme {
  --font-sans: var(--font-plus-jakarta), ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}
```

### 3. Update SDK Font Fallbacks (MODIFY)
- **File path**: `frontend/bks/ds-system-sdk/styles.css`
- **Action**: Change the variables `--sans`, `--heading`, and `--ds-font-family` to reference `Plus Jakarta Sans`.

```css
--sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
--heading: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
--ds-font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
```

## Status
- [x] Modify `layout.tsx` to load `Plus_Jakarta_Sans` and replace layout CSS variables
- [x] Modify `globals.css` to update Tailwind font-sans theme mapping
- [x] Modify `styles.css` to configure fallbacks for `--sans`, `--heading`, and `--ds-font-family`
- [x] Run `pnpm lint` in `frontend` directory to ensure format and syntax validation passes

## Acceptance Criteria
1. The web application renders text in `Plus Jakarta Sans` without breaking.
2. Vietnamese characters and accents display with correct glyph spacing and layout.
3. No console errors or network layout blocks caused by missing font subsets.
