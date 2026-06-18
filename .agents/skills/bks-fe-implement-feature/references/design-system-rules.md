# Design System Rules (Step 2 reference)

These rules are non-negotiable during implementation. Apply without asking the user.

For the **deviation policy** (when you must legitimately break a rule), see SKILL.md → Step 5.

---

## UI/UX Authority — `bks-ds-sdk-consumer`

**ALL UI/UX decisions are delegated to the `bks-ds-sdk-consumer` skill.**

Before writing ANY UI code in a feature, read the following references from `bks-ds-sdk-consumer`:

| Reference                          | Read when                                                     |
| ---------------------------------- | ------------------------------------------------------------- |
| `references/setup.md`             | First time importing SDK or CSS                               |
| `references/typography.md`        | Adding or reviewing visible text                              |
| `references/component-rules.md`   | Using any SDK UI component                                    |
| `references/layout-patterns.md`   | Composing pages, forms, CRUD, detail, dashboard, settings     |
| `references/filter-toolbar-layout.md` | Building CRUD list filter bars                            |
| `references/pagination-layout.md` | Table/list pagination footer                              |
| `references/status-badge-rules.md`| Using Badge / status labels                                   |
| `references/component-detection-rules.md` | Converting HTML/mockups to SDK components            |
| `references/wireframe-rules.md`   | Wireframe/mockup → SDK (ignore pixels/colors)               |

### What `bks-ds-sdk-consumer` governs (do NOT duplicate here):

- **Component selection** — which SDK component for each UI intent
- **Component size** — `default` unless spec says otherwise
- **Layout composition** — screen type identification, hierarchy, cards vs bands, gap tokens
- **Typography** — `.typo-*` utilities, role map, color separation
- **Form field composition** — `Field` + `FieldLabel` + `FieldContent` + `FieldError` + `FieldDescription`
- **Spacing** — `gap-1` to `gap-8` scale
- **Scroll containers** — `custom-scrollbar` on every overflow
- **Upload components** — single vs multi, consumer vs SDK responsibilities
- **Badge/status** — variant from meaning, consistency per page
- **Filter toolbar** — toolbar layout, responsive patterns
- **Component detection** — mapping raw HTML to SDK components

### What this file still governs (logic-side rules):

- SDK import paths (quick reference below)
- Layout shell selection (which shell for which flow)
- Dialog form structure (STRICT — scroll/footer rules)
- Styling prohibitions in feature code
- Validation & i18n strategy
- Toast policy
- Date/time formatting
- Loading / error / empty state patterns
- Responsive verification breakpoints
- Reusable utility function rules

---

## SDK Imports (quick reference)

```tsx
import { 
  Button, Input, Card, CardContent,
  Field, FieldLabel, FieldContent, FieldError, FieldDescription,
} from "@bks/ds-system-sdk"
```

Subpath imports also valid:

```tsx
import { Button } from "@bks/ds-system-sdk/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@bks/ds-system-sdk/dialog"
```

**Do not** copy SDK source components into the consumer app.

---

## Layout shells

- **List page** → `LayoutPage` with `heading`, `pagination`, `filter` props
- **Routed form** → `LayoutFormPage` with `heading`, `topAction`, `bottomAction` (sticky, centered max 730px)
- **Dialog form** → `FormDialogContent` + `DialogTitle` (pattern: max-w 720px, p-0, border-b header)

### Modal Form Standards (STRICT)

- **Structure:** `DialogHeader` with `px-6 py-4 border-b bg-background` for clean, premium separation.
- **Layout:** `FormDialogContent` typically uses `className="sm:max-w-[720px] p-0 overflow-hidden gap-0"` to create a unified container.
- **Scrolling:** Dialog form container **MUST** enforce `max-h-[75vh]` with `overflow-y-auto` on the scrollable body — non-negotiable for all dialog forms regardless of content length.
- **Footer:** All action buttons inside a dialog form **MUST** be wrapped in `DialogFooter` — never place buttons outside `DialogFooter` or inline in the form body.
- `DialogFooter` must remain **outside** the scrollable area so actions are always visible.

### Standard Dialog pattern

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@bks/ds-system-sdk/dialog"
import { Button } from "@bks/ds-system-sdk/button"

<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
  <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden gap-0">
    <DialogHeader className="px-6 py-4 border-b bg-background">
      <DialogTitle>
        {t('feature.dialogs.create')}
      </DialogTitle>
    </DialogHeader>
    
    {/* Scrollable body */}
    <div className="custom-scrollbar max-h-[60vh] overflow-y-auto px-6 py-4">
      <FeatureForm
        mode="create"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </div>
    
    <DialogFooter className="border-t px-6 py-4">
      <Button variant="outline" onClick={onClose}>
        {t('Action.cancel')}
      </Button>
      <Button loading={isSubmitting}>
        {t('Action.save')}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

- Never modify `shared/layouts/` unless the task explicitly scopes an app-wide change; exception: update `shared/layouts/app-shell.tsx` to register the feature nav item.
- Match patterns from `features/customers/` and existing admin pages.

---

## Styling prohibitions in feature code (STRICT — zero tolerance)

**Core principle:** Clean code, single-responsibility components, easy to read and maintain.

- `className` on SDK primitives (`Button`, `Input`, `Badge`, etc.) in feature code is **FORBIDDEN** — use `variant` / `size` props.
- `className` **allowed only** on layout wrappers (`div`, grids, `flex` containers) for structural layout.
- `shadow-*` classes are **FORBIDDEN** in feature code.
- Never add arbitrary Tailwind utilities to override design-system component appearance.

> For full component rules (size defaults, button rules, form field rules, color tokens),
> see `bks-ds-sdk-consumer` → `references/component-rules.md`.

---

## Validation & i18n

Pick **one** validation strategy per feature (from plan or default to inline English):

- **Inline English:** `z.string().min(1, "Name is required")`
- **i18n:** `t("validation.required", { _field_: t("<feature>.fields.name") })` — see `validation-i18n.md`

No mixing within a feature. When using i18n: list the keys in the plan before writing schemas.

### Copy rules

- Match the **existing locale strategy of the project**. New copy must follow the validation-i18n contract.
- If i18n: shared `validation.*` error templates + `<feature>.fields.*` for field display names.
- If existing screen is already localized, extend the same mechanism.

---

## Toasts

- **Hook responsibility:** Feature hooks orchestrate toasts after API calls.
- **Source:** `ResponseData.message` only. If missing or empty after `trim()` → **no toast**. No invented fallback messages.
- **Helper + import:** Use the shared `shouldShowToast` from `@/shared/lib/toast`. Single source of
  truth and the full example live in `project-patterns.md` → "Toast policy". **Do not redefine the
  helper per feature.**

---

## Date/time formatting (STRICT)

All date/time values displayed in tables and UI **MUST** use one of these two formats based on context:

| Context                                                          | Format             | Example            |
| ---------------------------------------------------------------- | ------------------ | ------------------ |
| Date only (created date, birth date, expiry date)                | `DD-MM-YYYY`       | `23-04-2026`       |
| Date + time (timestamps, activity logs, last login, audit trail) | `DD-MM-YYYY HH:mm` | `23-04-2026 14:30` |

- **Choose format by semantic context:** If the time component is meaningful for the user's decision-making → use `DD-MM-YYYY HH:mm`. If only the date matters → use `DD-MM-YYYY`.
- Use the typed helpers in `shared/lib/format-date.ts` (`formatDate(date)` and `formatDateTime(date)`).
- Never use raw `toLocaleDateString()` or unformatted ISO strings in the UI.
- Use `date-fns` (already in project: `format` from `date-fns`) for formatting — do not write manual date string manipulation.

---

## Responsive

- Mobile-first; verify 320 / 768 / 1280px.
- Tables: `overflow-x-auto`.
- Filters: `grid grid-cols-12 gap-3`.
- Form footer: `flex flex-col-reverse gap-2 sm:flex-row sm:justify-end`.
- Use `min-w-0`, `truncate`, `break-words` as needed.
- `Intl.NumberFormat` for locale-safe number/currency formatting.

> For responsive layout composition patterns (toolbar, mobile stacking, split panes),
> see `bks-ds-sdk-consumer` → `references/layout-patterns.md` and `references/filter-toolbar-layout.md`.

---

## Loading, error, empty states

- **Loading:** Use `Skeleton` from the design system for content placeholders. Use ellipsis `…` only for inline transient states (e.g. button label while submitting).
- **Error:** Wrap pages in `ErrorBoundary` from `shared/components/`. Show retry CTA when recoverable. Toasts only for transient mutation errors.
- **Empty:** Use the `Empty` family (`Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`).
- **Optimistic update:** Allowed for list mutations when latency matters; **must** rollback on failure and surface error via toast.

---

## Reusable utility functions

- Any helper function used in **2+ places** MUST be extracted to a util file (`features/<feature>/utils/` or `shared/lib/`).
- Util functions must be **pure functions** — no side effects, no dependencies on React state or hooks.
- Each util file must export **one focused concern** (e.g. `format-date.ts`, `parse-currency.ts`).
- Write clean, typed signatures with JSDoc for public utils; avoid generic names like `helper`, `utils`, `misc`.
