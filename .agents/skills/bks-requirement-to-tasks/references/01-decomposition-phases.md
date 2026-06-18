# Decomposition Phases

This document details the 5-phase process for transforming requirement specifications into implementation tasks.

---

## Phase I: Requirement Absorption & Scope Understanding

1. Read the formal requirement document completely.
2. Identify and list:
   - All **entities/tables** affected (from DATA MODEL UPDATES).
   - All **processing flows** (from PROCESSING FLOWS).
   - All **business rules** (from BUSINESS RULES → `BR-*` resolved via `docs/system/br-registry.md`; unresolved rules may use `PROPOSED_BR:{slug}` in requirement/task stage only).
   - All **API endpoints** (from API ENDPOINT INVENTORY).
   - All **notifications** (from NOTIFICATIONS).
   - All **background jobs** and scheduled tasks.
   - All **third-party integrations** (e.g., Stripe, AWS).
3. Classify each item by **layer**: Database, Backend API, Service Logic, Background Job, Frontend, Testing, Documentation.

---

## Phase II: Codebase Audit

Before creating tasks, verify the current state of the codebase:

1. **Existing Code & Logic**: Search for existing Controllers, Services, Models, Migrations, and Enums related to the feature. 
   - **Logic Source Rule**: When auditing documentation, use ONLY `docs/logic/` as the source of truth for current system behavior. Do NOT read `docs/draft`, other `docs/requirements`, or existing `docs/tasks` during this audit to avoid confusion with implementation history.
   - For Frontend: check existing features, Redux stores, and shared UI components in `src/shared/components`.
2. **Current State Annotation**: For each affected file, note:
   - Does it exist? What's its current state?
   - What needs to be ADDED vs. MODIFIED vs. DELETED?
3. **Workflow & Skill Mapping**: Identify which project **workflows** (complete processes) and **skills** (individual standards) apply to each task category. This is a **MANDATORY** step for all IMPLEMENTATION tasks:

| Category | Workflow | Skill |
|---|---|---|
| **Database Infrastructure** | `/execute-database-task` | `bks-be-database-standard` |
| **API (CRUD, Single, List)** | `/execute-api-task` | `bks-be-api-standard` |
| **Artisan Commands** | `/execute-command-task` | `bks-be-command-standard` |
| **Background Jobs** | `/execute-job-task` | `bks-be-job-standard` |
| **Master Data Registration** | `/execute-api-task` | `bks-be-master-data-standard` |
| **Frontend Features** | (None) | `fe-ui-standard` |

> [!CAUTION]
> **CRITICAL ARCHITECTURE RULES — Must be reflected in every task file:**
>
> **1. Service Namespaces are Fixed:**
> | Layer | Namespace | Factory | Used by |
> |---|---|---|---|
> | API business logic | `App\Services\Api\{Module}\` | `ApiFactory` | HTTP Controllers |
> | Background logic | `App\Services\Background\{Module}\` | `BackgroundFactory` | Jobs & Commands |
> | Shared utilities | `App\Services\Common\` | `CommonFactory` | Any layer |
>
> **2. FORBIDDEN — New Factory Files**: The three factories (`ApiFactory`, `BackgroundFactory`, `CommonFactory`) are **permanent**. NEVER propose creating a new `XxxFactory.php` file. New services are **added as getter methods** to the existing factory.
>
> **3. MANDATORY — DTOs for all business service inputs**: Every method in `Api\` and `Background\` services that accepts structured input MUST use a `final readonly` DTO (`app/DTOs/{Layer}/{Module}/{Action}Data.php`). Tasks MUST include DTO creation in their checklist and requirements.
>
> **4. No cross-calling within a layer**: An `Api\` service must NOT call another `Api\` service. Shared logic belongs in `Common\`.

> [!NOTE]
> Testing and documentation requirements are handled by the **same execution workflow** as the feature (e.g., `/execute-api-task` covers the API code, its docs, and related tests). They do NOT require a separate task unless explicitly separated into Phase 4.

---

## Phase III: Task Grouping & Phasing

Group related work into **task modules** and assign them to implementation phases:

### Standard Phases

| Phase | Description | Typical Tasks |
|---|---|---|
| **Phase 1: Foundation** | Database schema, Enums, Models | Migrations, model updates, enum definitions |
| **Phase 2a: Background Jobs & Commands** | Async / CLI business logic | Background Services, Jobs, Artisan Commands |
| **Phase 2b: Backend API** | HTTP API layer | Controllers, Services, FormRequests, Resources, Webhooks |
| **Phase 3: Frontend** | UI implementation | Pages, components, composables, stores |
| **Phase 4: Quality & Documentation** | Testing and docs | PHPUnit tests, API docs, Logic docs |

> [!IMPORTANT]
> **Phase 2a MUST come before Phase 2b.** When a feature involves both a Background Job AND an API trigger, the Job task MUST be created and completed first. The API task that dispatches the job lists the Job task as its dependency.

### Grouping Rules

1. **One Task = One Skill + One Workflow (MANDATORY)**: Each IMPLEMENTATION task MUST map to exactly **one** execution workflow and **one** skill. This is the primary grouping constraint.

   > [!CAUTION]
   > **FORBIDDEN: A single task MUST NOT mix API code and Job code.** If a feature requires BOTH an HTTP endpoint (API layer) AND a background Job, these MUST be decomposed into separate tasks:
   > - Task A — **Job task** (`bks-be-job-standard`, Phase 2a) — implements the Background Service + Job stub.
   > - Task B — **API task** (`bks-be-api-standard`, Phase 2b) — implements the Controller + Service dispatch call, with `depends_on: ["Task A"]`.
   >
   > **Execution Order**: Job task ALWAYS precedes the API task that triggers it.
   >
   > **MANDATORY — Master Data Task Separation**: If a requirement introduces new enums, lookup tables, or tree structures, these MUST be registered in `MasterDataService`. This registration MUST be a separate task in **Phase 1 (Foundation)**:
   > - Task A — **Master Data task** (`bks-be-master-data-standard`, Phase 1) — registers resources and implements custom drivers.
   > - Task B — **API task** (`bks-be-api-standard`, Phase 2b) — uses the resources, with `depends_on: ["Task A"]`.
   >
   > **Execution Order**: Master Data registration ALWAYS precedes the API task that uses it.

2. **One Task = One Functional Unit**: Each task should represent a logically cohesive piece of work that can be implemented and tested independently.
3. **Maximum Scope**: A single task should NOT span more than one of these categories:
   - Database schema + Enums + Models (foundation layer)
   - One API flow/feature module (e.g., Registration, Payment)
   - One background job or one Artisan command
   - One frontend feature area
4. **Minimum Scope**: A single task should NOT be smaller than a complete endpoint or a complete model setup. Avoid micro-tasks like "Add one column" or "Create one enum".
5. **Cross-Cutting Concerns**: Features that span multiple modules (e.g., Email Notifications, Activity Logging) should be separate **COORDINATION** tasks, referenced by other tasks as dependencies.

### Size Guidelines

- **Ideal task size**: A task's Requirements section should be **500–2000 words** of implementation detail.
- **Split signal**: If a task's Requirements section exceeds **2000 words** or covers more than **5 endpoints**, consider splitting into sub-tasks.
- **Merge signal**: If a task has **fewer than 3 checklist items** or its Requirements section is under **200 words**, consider merging into a related task.

---

## Phase IV: Dependency Resolution

1. Build a **dependency graph** between tasks using Mermaid format.
2. Ensure no circular dependencies exist.
3. For each task, explicitly list:
   - **Depends on**: Which task(s) must be completed first.
   - **Required by**: Which task(s) depend on this task.
4. Identify tasks that can be **parallelized** (no dependencies between them).
5. Define a **recommended execution order** that respects dependencies while maximizing parallelism.

---

## Phase V: Task Detail Generation

For each task, generate a detailed task file following the Mandatory Task File Structure.

> [!IMPORTANT]
> **Specification Precision**: Every IMPLEMENTATION task must include concrete structural details — actual class names, method signatures (no bodies), file paths (relative to project root), validation rules, and expected API responses. A developer reading the task should know **WHAT** to create/modify and **WHERE**, but NOT see the full code. Code snippets are **suggestive** — showing signatures, DTO fields, or config shapes only.
>
> **Remember**: Task files are NOT source code. They are **implementation blueprints**. The implementor (AI agent using execution skills like `bks-be-api-standard`, `bks-be-database-standard`) will write the actual production code.
>
> **Traceability**: Every requirement item MUST reference at least one `BR-*` (resolved in `docs/system/br-registry.md`) or `TR-XXX` (Technical Requirement). Unregistered rules MAY use `PROPOSED_BR:{slug}` in requirement/task stage, but MUST be resolved to official `BR-*` before finalizing `docs/logic/`.
> 
> **Localization**: Every task MUST define its required **Localization Keys** (for backend lang files and frontend UI/Zod).
>
> **Frontend Architecture**:
> - Components are **Client Components** by default (React + Vite).
> - Use **Zod** for all form registrations and validation schemas.
> - Follow the `src/features/{name}/` directory structure.

---

## Frontend Task Decomposition Strategy

Frontend tasks require careful decomposition to prevent AI implementors from being overwhelmed. Based on the `fe-implementation` skill's 6-phase workflow, tasks should be scoped to fit within **500–2000 words** and avoid cognitive overload.

### Task Splitting Strategies

| Strategy | When to Use | Example |
|----------|-------------|---------|
| **By Feature Module** | Independent UI features | "User List Page", "Create User Modal" |
| **By Layer** | Complex features with many files | Task 1: API hooks + types, Task 2: Components, Task 3: Page integration |
| **By Scope** | Large tasks (L/XL effort) | Task 1: UI structure only, Task 2: API integration + state |
| **By Operation** | CRUD operations | Separate tasks for Create, Read (List/Detail), Update, Delete |

### Recommended FE Task Patterns

**Pattern 1: Simple Page (S/M effort)**
- Single task covering: API hooks → Components → Page → i18n strings
- Max 3-4 components, 1-2 API endpoints

**Pattern 2: Complex Feature (L/XL effort)**
- Task A: Data layer (hooks, types, Zod schemas, API endpoints)
- Task B: UI components (presentational, form components)
- Task C: Page integration (composition, navigation, error handling)
- Task D: Polish (loading states, error boundaries, accessibility)

**Pattern 3: Form-Heavy Feature**
- Task A: Form schema (Zod validation, types)
- Task B: Form components (inputs, validation UI)
- Task C: API integration (submit, error handling)
- Task D: List/Detail views

### What NOT to Include in One Task

| Anti-pattern | Why | Solution |
|-------------|-----|----------|
| >5 components | Too many files to track | Split by component hierarchy |
| >3 API endpoints | Complex state management | Separate data layer task |
| UI + Full API integration | Context switching overload | UI-only first, then integration |
| Multiple pages | Too broad scope | One task per page/route |

### Size Guidelines for FE Tasks

- **Ideal**: 2-4 components + 1-2 API hooks + i18n strings
- **Max**: 500–2000 words in Requirements section
- **Split signal**: >5 components OR >3 API endpoints OR complex form validation
- **Effort**: Most FE tasks should be **S** or **M** (1-5 hours)

### Task Dependencies for FE

```
Task A: API Layer (hooks, types)
    ↓
Task B: Components (presentational)
    ↓
Task C: Page Integration (composition)
    ↓
Task D: Polish & QA (a11y, loading states)
```

- API layer MUST be done before integration
- Components can be done in parallel if using mock data
- i18n strings should be defined in all tasks but verified in final task

### Reference Skill Context

> [!IMPORTANT]
> Every FE task MUST reference the `fe-implementation` skill and include:
> - Reminder to read `references/design-system.md`
> - Reminder to read `references/project-structure.md`
> - Reminder to read `references/integrations.md` (for i18n/Sentry/MSW)
> - Checklist items from the skill's Phase 6 verification
