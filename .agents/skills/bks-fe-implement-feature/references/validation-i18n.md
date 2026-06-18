# Validation i18n Locale Contract

When using i18n for Zod (and related client validation), follow this contract in the locale file (e.g. `public/locales/vi/translation.json`).

## Key separation

- **`action.*` = shared action buttons:** Generic actions used across the app (e.g. `save`, `cancel`, `edit`, `delete`, `create`, `search`, `reset`).
- **`validation.*` = shared error templates only:** Reusable validation error message templates (e.g. `required`, `min`, `numberFinite`). Do **not** put feature-specific labels here.
- **`<feature>.*` = feature-specific keys:** All feature-specific text must live under its own root.
  - **`<feature>.fields.*`**: Human-readable names for `{{_field_}}` interpolation.
  - **`<feature>.title.*`**: Page/Dialog titles.
  - **`<feature>.messages.*`**: Feature-specific success/confirm messages.
- **Interpolation example:** In the schema hook: `t('validation.required', { _field_: t('systemSettings.fields.googleDriveRootCrm') })`.

## Rules

- **i18n is MANDATORY:** Hardcoded strings in UI components are forbidden.
- **Perfect Synchronization:** Every key added to the `vi` locale file MUST also be added to the `en` locale file, and vice-versa. No missing translations.
- **Zero Redundancy:** Strictly forbid duplicate translations. Check shared roots (`action.*`, `validation.*`) BEFORE adding feature-specific keys. If a concept exists in a shared root, you MUST use it.
- **Feature isolation:** New feature keys MUST be scoped under their feature name (e.g., `customers.fields.name`).
- **Flat keys under shared roots:** Add new keys as direct children of `validation` or `action` only when they are truly generic.
- **No Unused Keys:** Clean up translation keys if the corresponding code is removed or refactored.
- **Reuse before adding:** Prefer existing shared keys (`validation.required`, `validation.min`, `validation.max`, …) with interpolation when the sentence shape already matches. Add a new `validation.*` key only when no existing template fits.
- **Flexible messages:** Prefer templates with placeholders so one key works across fields and numeric bounds. Use the project's established placeholder style (`{{_field_}}`, `{{_length_}}`, `{{_min_}}`, `{{_max_}}`) and pass values from the schema hook (`useMemo` + `useTranslation`).

## Placeholder examples

- `validation.min` with `_field_` + `_length_` for minimum string length; `_field_` resolved via `t('<feature>.fields.<key>')`.
- `validation.numberBetweenInclusive` with `_field_`, `_min_`, `_max_` for inclusive numeric ranges.
- Generic number rules: `validation.numberFinite`, `validation.numberInteger`, `validation.numberPositive` with `_field_` from `<feature>.fields.*`.

## Reference implementation

- `features/system-settings/schemas/system-settings.schema.ts` — `t('validation.…')` for templates + `t('systemSettings.fields.…')` for field names.
- `public/locales/vi/translation.json` — `validation` for templates; `systemSettings.fields` for labels.
