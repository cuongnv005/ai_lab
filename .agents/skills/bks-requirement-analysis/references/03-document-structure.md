# Document Structure

Every requirement document in `docs/requirements/` MUST follow this structure.

## 1. YAML Frontmatter

Used for categorization and status tracking.

```yaml
---
title: [Requirement Title]
description: [Short summary of the change]
status: pending_implementation | in_progress | completed
date: [YYYY-MM-DD]
version: 1.0
changelog:
  - version: 1.0
    date: [YYYY-MM-DD]
    summary: Initial requirement specification.
---
```

### Versioning Rules

- **Bump minor** (1.0 → 1.1) when clarifying or adding details without changing scope.
- **Bump major** (1.x → 2.0) when scope, data model, or core flows change significantly.
- **Always add a changelog entry** with date and summary when updating a requirement document.

## 2. OVERVIEW

A high-level summary of the requirement and its primary business goal. Must explain the **full scope** of the change, not just restate the draft's introduction.

## 3. CONTEXT

- **Modules**: Affected modules (e.g., User).
- **Features**: Key functional areas.
- **Guards**: Which authentication guards are involved (e.g., `user`).
- **Third-parties**: External integrations (e.g., Stripe, AWS).

## 4. OUT OF SCOPE

Explicitly list what is **NOT** included in this requirement to prevent scope creep. Focus on adjacent features the draft might imply but doesn't require immediately.

## 5. BUSINESS RULES

A numbered list of business rules extracted from the draft and analysis, each rule standalone and testable:

```markdown
- **BR-G001**: [Rule description]. Referenced in: Flow #{n}.
- **BR-AUTH-003**: [Rule description]. Referenced in: Flow #{n}, Flow #{m}.
- **PROPOSED_BR:require-tenant-boundary**: [New rule pending registration]. Referenced in: Flow #{k}.
```

### Rule ID Policy

- Use only IDs that already exist in `docs/system/br-registry.md`.
- For new, not-yet-registered rules, use `PROPOSED_BR:{slug}` (requirement/task stage only).
- `PROPOSED_BR` MUST be resolved to official `BR-*` before logic docs (`docs/logic/`) are finalized.

This section enables developers to write unit/feature tests per rule.

## 6. REQUIREMENT ANALYSIS

Detailed breakdown of logic phases, rules, and conditions. Use tables or lists for clarity.

## 7. DATA MODEL UPDATES

Detailed changes to models and fields. This section must be **EXHAUSTIVE** and replace any data descriptions in the draft.

### Rules

- **Per-Table Breakdown**: List every table affected.
- **Primary Key Mandate**: EVERY table MUST explicitly define an `id` column as its Primary Key.
- **Technical Names**: Use English for technical names (Snake Case for DB).
- **Snapshot Logic**: Explicitly define which fields are copied from where (e.g., Plan to UserPlan).

> [!IMPORTANT]
> **Stakeholder-Defined Schema Rule**: If the draft explicitly defines database columns, the AI MUST:
> 1. Preserve ALL columns exactly as defined — no silent omission, merge, or rename.
> 2. Flag perceived issues as "Suggested Modifications" requiring user approval.
> 3. Clearly distinguish between **stakeholder-defined columns** (mandatory) and **AI-proposed columns** (suggested).

### Enum Definition Rule

For every column identified as Enum type, include:

1. **Full list of enum values** (integers starting from 1) with their business names and descriptions.
2. **Database Type**: Specify `tinyInteger` (<= 127 cases) or `smallInteger`.
3. **Localization Keys**: Define the key path for labels used by the mandatory `label()` method.
4. **State transition table**: which value can transition to which.
5. **Transition triggers**: who/what triggers each transition (User action, System job, Webhook).
6. **API Structure**: API responses MUST return both the integer `value` and the localized `label`.

**Example:**

```markdown
#### Enum: `PaymentStatus`

| Value (int) | Name | Description | Localization Key |
|-------------|------|-------------|------------------|
| 1 | PENDING | Awaiting payment | `enums.payment_status.pending` |
| 2 | PAID | Payment confirmed | `enums.payment_status.paid` |
| 3 | FAILED | Payment attempt failed | `enums.payment_status.failed` |
| 4 | REFUNDED | Payment refunded | `enums.payment_status.refunded` |

**Transitions:**
| From | To | Trigger |
|------|----|---------|
| pending | paid | Stripe webhook `payment_intent.succeeded` |
| pending | failed | Stripe webhook `payment_intent.payment_failed` |
| paid | refunded | User action via dashboard |
```

## 8. PROCESSING FLOWS

Step-by-step atomic logic for **EVERY** scenario identified. Use numbered lists for sequential steps.

- **Exhaustive Scenarios**: Must cover all actions (e.g., User Create, User Update, System Auto-Action).
- **External Interactions**: Define exactly how Webhooks, 3rd-party APIs, and Background Jobs interact with the database.

> [!WARNING]
> **Explicit State Changes Rule**: Every step that modifies data MUST include a `State Changes` sub-list showing exactly which `table.column` changes and to what value.

### Example Flow

```markdown
### Flow 1: User Registration (Free Plan)
1. User selects a Free plan and submits. (BR-001)
2. System creates `UserPlan` record. (BR-002)
   **State Changes:**
   - `user_plans.payment_type` = `free`
   - `user_plans.is_free` = `true`
3. System activates the user. (BR-003)
   **State Changes:**
   - `users.plan_id` = `{new_plan_id}`
   - `users.is_premium` = `false`
   - `users.payment_status` = `paid`
   - `users.expired_date` = calculated from plan config

**Concurrency Handling:**
- **Mechanism**: No DB lock needed for free registration. 
- **Atomic Lock**: Cache lock `register-user-{email}` to prevent double-submit.

**Acceptance Criteria (Happy Path):**
- [ ] User successfully selects the free plan and is redirected to the dashboard.
- [ ] User status reflects the new free plan without requiring payment.
- [ ] Localization key `auth.register_success` is displayed.
```

### Error Handling Per Flow

Each Processing Flow MUST end with an **Error Cases** sub-section:

```markdown
**Error Cases:**
| Error Condition | System Behavior | State Changes |
|-----------------|-----------------|---------------|
| Stripe API timeout | Retry 3 times, then mark failed | `status` = `failed` |
| Duplicate webhook | Idempotent check via `stripe_payment_id` | No change |
| User not found | Log error, return 404 | No change |
```

At minimum, address: network failure, duplicate request, invalid state, authorization failure, and third-party API error.

## 9. UI/UX & FRONTEND IMPLICATIONS (React + Vite)

Define all frontend requirements to ensure seamless integration:
- Feature Directory: `src/features/[feature_name]`
- Component Split: Page Layout vs Client Components
- State Management: Redux Toolkit & Saga requirements
- Validation: Zod schema fields and error messages (localized)
- Handling Delays: Loading states (spinners, skeleton loaders)
- User Feedback: Success/error messages (localized keys required)

## 10. NOTIFICATIONS

If the feature involves any notification, email, or communication, include a notification inventory table.

## 11. API ENDPOINT INVENTORY

List all new or modified endpoints.

```markdown
| Method | Endpoint | Guard | Description | Related Flow |
|--------|----------|-------|-------------|--------------|
| POST | `/api/v1/register` | guest | User registration | Flow 1 |
| GET | `/api/v1/profile` | api | Get personal profile | Flow 2 |
```

## 12. IMPLEMENTATION TASKS

A high-level phased TODO list to guide the transition into development tasks.

## 13. DRAFT COVERAGE MATRIX (Optional for high-density drafts)

Map each section/bullet from the draft to the corresponding requirement section to ensure nothing is silently dropped:

```markdown
| Draft Section | Draft Item | Requirement Section | Status |
|---------------|-----------|---------------------|--------|
| "Registration Flow" | Email invitation | Flow 1, Step 1 | ✅ Covered |
| "Plan Types" | Installment payment_times | BR-005, Data Model | ✅ Covered |
| "Model: User" | show_warning column | Data Model: users | ✅ Covered |
```
