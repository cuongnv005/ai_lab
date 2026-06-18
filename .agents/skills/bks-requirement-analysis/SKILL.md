---
name: bks-requirement-analysis
description: A generalized methodology for transforming raw/vague draft requirements into structured, technical specifications ready for implementation.
---

# Requirement Analysis Methodology

This skill defines a robust, project-agnostic process for analyzing initial requirement drafts and refining them into formal technical documentation. It establishes a standard directory structure and analysis workflow to ensure logical completeness and technical feasibility.

## 1. Standard Directory Structure

To maintain clarity and traceability, this methodology assumes a standard two-stage documentation process:

| Directory | Purpose | Usage |
|---|---|---|
| `docs/logic/` | **System Intelligence**: The single source of truth for existing business logic, workflows, and technical patterns. | **Analysis Tool** |
| `docs/system/br-registry.md` | **BR Registry**: The single source of truth for Business Rule IDs and semantics. | **Rule Lookup** |
| `docs/draft/` | Raw, initial requirements, brain dumps, or rough ideas from stakeholders. | **Source** |
| `docs/requirements/` | Formal, analyzed, and structured specifications ready for technical design. | **Output** |

> [!CAUTION]
> **Logic Lookup Rule**: ALWAYS use `docs/logic/` to understand the current system. Do NOT read `docs/draft/`, `docs/requirements/`, or `docs/tasks/` for project logic unless the user explicitly asks for a specific file. These folders contain implementation history, while `docs/logic/` is actively maintained for system intelligence.

> [!TIP]
> When copying this skill to a new project, ensure these directories are created or update the skill's instructions to match your project's specific paths.

## 2. Objective
To transform "what the user wants" (Draft) into "what the system must do" (Requirement Specification) by closing logical gaps and defining technical implications.

> [!IMPORTANT]
> **Analysis, not Summarization**: The goal is NOT to summarize the draft. The goal is to **analyze** it—finding what is missing, defining what is silent, and building a technical blueprint that is ready for implementation. Summarization is a failure of this skill.

## 3. Analysis Phases

### Phase I: Content Absorption
- Read the source file from `docs/draft/` completely to understand the core business value.
- Identify primary stakeholders (Who uses this?), main entities (What data is stored?), and the definition of "Success".
- **Draft Density Assessment**: Evaluate the draft's level of detail:
  - **High-density** (detailed schema, step-by-step flows): Preserve ALL details; no omissions allowed.
  - **Low-density** (vague descriptions, just goals): AI must proactively propose concrete technical designs.
  - This assessment determines how much the AI "invents" vs "preserves" in later phases.

### Phase II: Legacy Logic, Module & Scope Audit
Before defining new requirements, the AI MUST understand the current system architecture:
- **Module Identification**: Identify which existing module (e.g., User, Common) this feature belongs to. Search `routes/` and `app/Http/Controllers/` to confirm.
- **Audit Existing Code/Docs**: Search for existing Controllers, Services, and business logic documents (`docs/logic/`) related to the feature. 
  - > [!IMPORTANT]
  - > **Logic Source Rule**: Use ONLY `docs/logic/` as the document source of truth for existing logic. Do NOT read `docs/draft`, `docs/requirements`, or `docs/tasks` during this audit as they may contain outdated or implementation-specific history.
- **Audit Core Infrastructure**:
  - **Enums**: Check `app/Enums/` for existing states/types that should be reused.
  - **TableService**: Check for existing list endpoints using `TableService` to ensure consistent filtering/sorting patterns.
  - **Policies**: Check `app/Policies/` for existing authorization rules that should be extended.
- **Authorization & Guards**: Identify which guard (e.g., `api` (User), `web`) and which policies/permissions govern the entities.
- **Identify Conflicts**: Determine where the new draft contradicts or replaces current behavior.
- **BR Registry Audit**: Resolve all referenced `BR-*` against `docs/system/br-registry.md`.
  - If a new business rule is needed but not yet registered, label it as `PROPOSED_BR:{slug}` **only in requirement/task artifacts**.
  - Before implementation updates `docs/logic/`, convert every `PROPOSED_BR:{slug}` into an official `BR-*` ID registered in `docs/system/br-registry.md`.
  - Do NOT use `PROPOSED_BR` in final logic documentation.
- **Dependency Check**: Ensure new changes don't break existing modules or data structures.
- **Transition Strategy**: Explicitly define if the requirement replaces old logic or extends it.

### Phase III: Logical Gap Detection
Scan the draft for common omissions that lead to bugs or delays. Focus on "Silences"—parts where the draft is technically vague:
- **Internal Contradictions**: Scan the draft for conflicting statements within itself (e.g., Section A says "free plan needs no payment" but Section B says "all plans require payment"). Report each contradiction as a gap with exact quotes from both conflicting sections.
- **State Infinity**: Does every entity have a clear lifecycle? (e.g., If a payment is "Pending", how does it move to "Success" or "Failed"?)
- **Internal Logic Flags**: Identify flags that developers need but stakeholders didn't mention (e.g., `is_current`, `retry_at`, `is_old_debt`).
- **The "Unhappy" Path**: What happens when things go wrong? (e.g., Network timeout, invalid input, insufficient funds).
- **Localization Silences**: Identify missing translation keys for success/error messages, status labels, and UI text. (Refer to `bks-be-api-standard` for localization patterns).
- **Validation & Constraints**: Are there hidden rules? (e.g., "Must be divisible by X", "Minimum amount is Y").
- **Time-based Logic**: Does any logic happen automatically over time? (e.g., Expiration, scheduled charging, reminders).
- **Concurrency & Race Conditions**: Can two users do the same thing at once? If the flow involves financial data or strict state transitions, **MUST** explicitly analyze the need for `lockForUpdate()` or atomic locks. (Refer to `bks-be-api-standard` Section 2.3).
- **Data Integrity & Snapshots**: Should we copy (snapshot) data at a point in time (e.g., copying Plan prices to a UserPlan)?
- **Notifications & Communications**: Does any state change trigger an email, push notification, or in-app message?
- **Permissions**: Can one user see another's data?
- **Pagination & Performance**: Will any list endpoint return large datasets that need pagination, caching, or indexing?
- **Idempotency**: Can the same action be safely repeated? (e.g., Webhook delivered twice, user clicks submit twice)
- **Data Migration & Defaults**: For existing records, what happens when a new mandatory field is added?
- **Audit & Logging**: Are there sensitive actions that require an immutable activity trace (who did what, when)?
- **Master Data Gaps**: Identify if the frontend needs specific lookup data to implement the feature (e.g., a list of statuses, a department tree, or a set of roles). Ensure these are added to the requirement and designated for registration in the Master Data API.
- **Labels vs. Storage Mapping**: Distinguish between "Business Labels" (e.g., "Active", "Pending") and "Storage Values" (e.g., `1`, `0`). AI must proactively recommend integer-backed Enums for statuses even if the draft uses strings as names. Every Enum MUST implement a `label()` method for frontend display. (Refer to `bks-be-database-standard` Section 3).

### Phase IV: Technical Mapping
Map business concepts to technical components using project standards:
- **Persistence**: Propose table schema changes or new tables. Refer to `bks-be-database-standard`.
- **Security & Authorization**: Define who can perform which action (RBAC). Refer to `App\Policies` and Controller & Auth Standards.
- **Logic Placement**: Determine if a rule belongs in a Controller, Service, Middleware, or a Background Job. Refer to `bks-be-api-standard`.
  - **API Layer**: Service logic triggered by HTTP requests MUST go into `App\Services\Api\{Module}\` and be registered in `ApiFactory`.
  - **Background Layer**: Logic triggered by Jobs or Artisan Commands MUST go into `App\Services\Background\{Module}\` and be registered in `BackgroundFactory`.
  - **Common Layer**: Shared utilities (e.g., file upload, webhook dispatch) go into `App\Services\Common\` and be registered in `CommonFactory`.
  - **DTO Requirement**: Every API and Background service method that accepts structured input MUST receive a `final readonly` DTO (`App\DTOs\{Layer}\{Module}\{Action}Data`) — NEVER a raw `array`.

  > [!CAUTION]
  > **FORBIDDEN: Do NOT propose creating new Factory files.** The three factory files (`ApiFactory`, `BackgroundFactory`, `CommonFactory`) are permanent. New services are ADDED as methods to the existing factory — never by creating a new factory class.

  **Important Rule**: Do NOT propose using Eloquent Observers for critical business events (like Webhook Dispatches or Audit Logging) due to their silent failure during DB bulk-update operations. Explicitly require manual event triggers inside the Service layer.
- **Integrations**: Define interactions with 3rd-party APIs (Webhooks, Request/Response cycles). Refer to `bks-be-api-standard`.
- **Background Jobs**: Identify any scheduled tasks, queued jobs, or cron-based logic. Refer to `bks-be-job-standard` and `bks-be-command-standard`.
- **Notifications**: Map each notification trigger to channel (email/SMS/push), template, and variables.
- **Performance Analysis**: Analyze query patterns, data volume projections, caching needs, and define performance acceptance criteria. Refer to [Performance Analysis](./references/07-performance-analysis.md).
- **UI/UX & Frontend (Next.js)**: 
  - Map business actions to new UI screens and components.
  - Define **Zod schemas** for form validation.
  - Refer to `fe-implementation` skill for frontend standards.

### Phase V: Interactive Refinement & Logic Suggestion
This phase is the most critical for moving from a vague draft to a production-ready technical specification.
- **Proactive Gap Assessment**: Do not just wait for instructions. Actively identify silences in the draft (e.g., "What if the user cancels mid-installment?").
- **Recommend the "Most Logical" Path**: For every identified gap, the AI MUST propose at least one concrete logical solution based on industry best practices (e.g., Stripe's 3D Secure flows, idempotent webhook handlers).
- **Collaborative Discussion**: Present trade-offs and ask for the stakeholder's preference, but always lead with a recommended default.
- **Refinement Loop Limit**: Maximum **2 refinement rounds** are allowed. After 2 rounds, any unresolved disagreements MUST be documented as `Open Questions` in the final requirement document and the process proceeds to Phase VI.

**Mandatory Gap Report Format**: When presenting gaps to the user, use a structured table format to accelerate choices:
```markdown
#### Gap #{n}: [Title]
- **Draft says**: [quote from draft, or "Silent — not mentioned"]
- **Problem**: [why this is a gap]

| Solution | Description | Impact/Trade-offs |
|---|---|---|
| **[AI Recommended]** Option A | [concrete proposal] | [pros/cons] |
| Option B | [alternative approach] | [pros/cons] |
```

### Phase VI: Document Finalization (Stand-alone Blueprint)
Finalize the requirement document in `docs/requirements/` only after the core logic has been refined and approved.
- **Stand-alone requirement**: The final document MUST be a complete technical blueprint that allows the draft to be deleted. It must contain every detail mentioned in the draft plus the analyzed gaps and technical mappings.
- **Scope Splitting Rule**: If the feature scope is large (>3 affected modules OR >10 distinct processing flows OR the document body exceeds ~4000 words), the AI MUST propose splitting into multiple requirement documents organized by module or phase (e.g., `2026-04-01-user-plan-phase1-registration.md`, `2026-04-01-user-plan-phase2-payment.md`). Each split document must be self-contained with its own DATA MODEL and PROCESSING FLOWS sections.
- **Cross-Requirement Consistency** (when split): If a feature is split into multiple requirement documents, the AI MUST:
  1. Add a **Sibling Documents** section at the top of each split document listing ALL related requirement documents with their scope summary.
  2. Ensure **shared entities** (tables, enums, business rules) are defined identically across all documents — no conflicting column types, enum values, or rule definitions.
  3. Designate one document as the **source of truth** for each shared entity (e.g., the `users` table schema is owned by Phase 1). Other documents MUST reference the owning document instead of redefining the entity.
  4. Include a **Cross-Reference Matrix** mapping each shared entity to its owning document:
     ```
     | Shared Entity | Owner Document | Referenced By |
     |---------------|----------------|---------------|
     | `users` table | phase1-registration.md | phase2-payment.md |
     | `PaymentStatus` enum | phase2-payment.md | phase1-registration.md |
     ```

## 4. Mandatory File Structure
Every requirement document in `docs/requirements/` MUST follow this structure:

### 1. YAML Frontmatter
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

**Versioning Rules:**
- **Bump minor** (1.0 → 1.1) when clarifying or adding details without changing scope.
- **Bump major** (1.x → 2.0) when scope, data model, or core flows change significantly.
- **Always add a changelog entry** with date and summary when updating a requirement document.

### 2. OVERVIEW
A high-level summary of the requirement and its primary business goal. Must explain the **full scope** of the change, not just restate the draft's introduction.

### 3. CONTEXT
- **Modules**: Affected modules (e.g., User).
- **Features**: Key functional areas.
- **Guards**: Which authentication guards are involved (e.g., `user`).
- **Third-parties**: External integrations (e.g., Stripe, AWS).

### 4. OUT OF SCOPE
Explicitly list what is **NOT** included in this requirement to prevent scope creep. Focus on adjacent features the draft might imply but doesn't require immediately.

### 5. BUSINESS RULES
A numbered list of business rules extracted from the draft and analysis, each rule standalone and testable:
```
- **BR-G001**: [Rule description]. Referenced in: Flow #{n}.
- **BR-AUTH-003**: [Rule description]. Referenced in: Flow #{n}, Flow #{m}.
- **PROPOSED_BR:require-tenant-boundary**: [New rule pending registration]. Referenced in: Flow #{k}.
```
Rule ID policy:
- Use only IDs that already exist in `docs/system/br-registry.md`.
- For new, not-yet-registered rules, use `PROPOSED_BR:{slug}` (requirement/task stage only).
- `PROPOSED_BR` MUST be resolved to official `BR-*` before logic docs (`docs/logic/`) are finalized.
This section enables developers to write unit/feature tests per rule.

### 6. REQUIREMENT ANALYSIS
Detailed breakdown of logic phases, rules, and conditions. Use tables or lists for clarity.

### 7. DATA MODEL UPDATES
Detailed changes to models and fields. This section must be **EXHAUSTIVE** and replace any data descriptions in the draft.

**Rules:**
- **Per-Table Breakdown**: List every table affected.
- **Primary Key Mandate**: EVERY table, including secondary or pivot tables (e.g., `role_user`, `department_user`), MUST explicitly define an `id` column as its Primary Key.
- **Technical Names**: Use English for technical names (Snake Case for DB).
- **Snapshot Logic**: Explicitly define which fields are copied from where (e.g., Plan to UserPlan).

> [!IMPORTANT]
> **Stakeholder-Defined Schema Rule**: If the draft explicitly defines database columns, the AI MUST:
> 1. Preserve ALL columns exactly as defined — no silent omission, merge, or rename.
> 2. Flag perceived issues as "Suggested Modifications" requiring user approval.
> 3. Clearly distinguish between **stakeholder-defined columns** (mandatory) and **AI-proposed columns** (suggested).

**Mandatory Column Table Format** — Each table MUST use the following format:

```markdown
#### Table: `table_name`

| Column | Type | Length | Null | Unique | Default | Action | Description | Notes |
|--------|------|--------|------|--------|---------|--------|-------------|-------|
| id | bigint | 20 | NO | YES | — | KEPT | Primary key | — |
| name | string | 255 | NO | NO | — | ADDED | Display name | Set to 'Default' |
| email | string | 255 | NO | YES | — | ADDED | User email | — |
| balance | decimal | 12,2 | NO | NO | 0 | MODIFIED | User balance | **Lock**: uses `lockForUpdate` |
| status | tinyInteger| — | NO | NO | 1 | ADDED | User status | See Enum: `UserStatus` |
| deleted_at | timestamp | — | YES | NO | NULL | ADDED | Soft delete | — |

Where Action = KEPT | ADDED | MODIFIED | DELETED | MOVED_TO:{table} | MOVED_FROM:{table} | SNAPSHOT
```

**Enum Definition Rule** — For every column identified as Enum type, include:
1. **Full list of enum values** (integers starting from 1) with their business names and descriptions.
2. **Database Type**: Specify `tinyInteger` (<= 127 cases) or `smallInteger`.
3. **Localization Keys**: Define the key path for labels used by the mandatory `label()` method (e.g., `enums.payment_status.{snake_case_name}`).
4. **State transition table**: which value can transition to which.
5. **Transition triggers**: who/what triggers each transition (User action, System job, Webhook).
6. **API Structure**: API responses MUST return both the integer `value` and the localized `label`.

Example:
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

### 8. PROCESSING FLOWS
Step-by-step atomic logic for **EVERY** scenario identified. Use numbered lists for sequential steps.
- **Exhaustive Scenarios**: Must cover all actions (e.g., User Create, User Update, System Auto-Action).
- **External Interactions**: Define exactly how Webhooks, 3rd-party APIs, and Background Jobs interact with the database.

> [!WARNING]
> **Explicit State Changes Rule**: Every step that modifies data MUST include a `State Changes` sub-list showing exactly which `table.column` changes and to what value.

Example:
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

**Error Handling Per Flow**: Each Processing Flow MUST end with an **Error Cases** sub-section:
```markdown
**Error Cases:**
| Error Condition | System Behavior | State Changes |
|-----------------|-----------------|---------------|
| Stripe API timeout | Retry 3 times, then mark failed | `status` = `failed` |
| Duplicate webhook | Idempotent check via `stripe_payment_id` | No change |
| User not found | Log error, return 404 | No change |
```
At minimum, address: network failure, duplicate request, invalid state, authorization failure, and third-party API error.

### 9. UI/UX & FRONTEND IMPLICATIONS (REACT + NEXT.JS)
Define all frontend requirements to ensure a seamless integration:
- **Feature Directory**: Files live in `frontend/app/(dashboard)/[feature_name]/` (Next.js App Router).
- **Component Split**:
  - **Page Layout**: Route-level `page.tsx` and `layout.tsx` components.
  - **Client Components**: Forms, interactive widgets, modal handlers (use `'use client'`).
- **State Management**: Identify if shared state in **Zustand** is required.
- **Validation**: Define **Zod** schema fields and error messages (localized).
- **Handling Delays**: How to indicate loading states (spinners, skeleton loaders).
- **User Feedback**: What success/error messages are shown (localized keys required).
### 10. NOTIFICATIONS
If the feature involves any notification, email, or communication, include a notification inventory:

| Trigger Event | Channel | Template/Subject | Variables | Recipient |
|---------------|---------|------------------|-----------|-----------|
| User registers | Email | Registration invitation | `{link}`, `{token}` | User |
| Payment failed | Email | Payment reminder | `{plan_name}`, `{retry_date}` | User |

### 11. API ENDPOINT INVENTORY

List all new or modified endpoints.

| Method | Endpoint | Guard | Description | Related Flow |
|--------|----------|-------|-------------|--------------|
| POST | `/api/v1/register` | guest | User registration | Flow 1 |
| GET | `/api/v1/profile` | api | Get personal profile | Flow 2 |

### 12. IMPLEMENTATION TASKS
A high-level phased TODO list to guide the transition into development tasks.

### 13. DRAFT COVERAGE MATRIX (Optional for high-density drafts)
Map each section/bullet from the draft to the corresponding requirement section to ensure nothing is silently dropped:

| Draft Section | Draft Item | Requirement Section | Status |
|---------------|-----------|---------------------|--------|
| "Registration Flow" | Email invitation | Flow 1, Step 1 | ✅ Covered |
| "Plan Types" | Installment payment_times | BR-005, Data Model | ✅ Covered |
| "Model: User" | show_warning column | Data Model: users | ✅ Covered |

## 5. Portability & Customization
- **Language**: Adopt the project's documentation language. The AI MUST match the language used in the draft document.
- **Standard Names**: Always propose technical names in English (Snake Case for DB, CamelCase for Classes) even if the description is in another language.
- **Filename Mapping**: Ensure the output filename in `docs/requirements/` matches the naming convention of the draft (e.g., including the target implementation date).

## 6. Best Practices
- **Blueprint Mentality**: Every requirement document should be a developer's first document—they should be able to start coding without further clarification on logic.
- **Role Accuracy**: NEVER assume a role manages an entity without verifying the existing controller/guard structure via codebase search (Check `routes/` and `Controllers/`).
- **Snapshotting**: Always consider if certain data should be snapshotted (copied) to preserve history.
- **No Silent Omissions**: If the draft mentions a detail (column, rule, flow), it MUST appear in the requirement. If the AI decides to exclude something, it must explicitly state why in the DRAFT COVERAGE MATRIX.
- **Low-density Draft Handling**: When a draft is vague (just goals, no schema), the AI must proactively propose:
  - Full database schema with tables and columns.
  - All enum definitions with values and transitions.
  - Complete processing flows with state changes.
  - API endpoint inventory.
  - Background jobs and scheduled tasks.
  Present all proposals in "Suggested" status during Phase V for user approval.

**Low-density Draft Example:**
> Draft: *"I want users to be able to subscribe to monthly plans and pay with credit card."*

Expected AI output for this draft:
- **Proposed tables**: `plans` (name, price, interval, features), `subscriptions` (user_id, plan_id, status, started_at, expires_at, canceled_at), `payments` (subscription_id, amount, method, status, paid_at)
## 7. Quality Standard: Implementation-Ready Checklist
Before finalizing a document, the AI MUST verify each item. Failure on any item means the document is NOT ready.

### Content Completeness
- [ ] No "Overview" is just a rewrite of the draft's intro; it must explain the *full* scope of the change.
- [ ] **Column-by-Column Verification**: Every column mentioned in the draft is present in DATA MODEL UPDATES. No column is silently omitted.
- [ ] **Enum Completeness**: Every Enum column has a full value list + state transition table.
- [ ] **Module & Role Verification**: The `CONTEXT` section correctly identifies the Module and Guard (User) based on the existing codebase.

### Logic Completeness
- [ ] All logical states are defined (tables are preferred for state transitions).
- [ ] Internal flags (for state tracking) are proposed in the DATA MODEL UPDATES.
- [ ] Business Rules are individually numbered and testable.
- [ ] 3rd-party integration details (Webhooks, Error codes) are explicitly defined.
- [ ] "What if" / error scenarios for every main flow are addressed in Error Cases tables.

### Flow Completeness
- [ ] **Exhaustive Processing Flows**: Every distinct action documented in the draft has a dedicated step-by-step flow.
- [ ] **Explicit State Changes**: Every step that modifies data includes `State Changes` sub-list.
- [ ] **Error Cases**: Every flow ends with an Error Cases table.

### Auxiliary Sections
- [ ] **Notifications**: If any notification is mentioned or implied, the NOTIFICATIONS table is present.
- [ ] **API Endpoints**: The API ENDPOINT INVENTORY is present if API changes are needed.

### Stand-alone Check
- [ ] Can a developer build this feature if the `docs/draft/` file is deleted? (The answer must be YES).

## 8. Traceability & Integrity Verification
Before considering the requirement "Finalized", perform this sanity check:

### BR-to-Flow Coverage
- [ ] **Every Business Rule (`BR-*`)** is resolved in `docs/system/br-registry.md` OR marked as `PROPOSED_BR:{slug}` in requirement/task stage.
- [ ] No `PROPOSED_BR:{slug}` remains in final logic docs (`docs/logic/`).
- [ ] **Every Processing Flow step** (where logic is applied) references at least one `BR-*` or `PROPOSED_BR:{slug}`.

### Localization Coverage
- [ ] Every possible user-facing message/label in the flows has a corresponding **Localization Key** in the DATA MODEL or UI/UX sections.

### Concurrency Audit
- [ ] Every flow involving data modification has been assessed for **Race Conditions**, and the "Concurrency Handling" sub-section is present if risks exist.
