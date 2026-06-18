---
name: bks-requirement-to-tasks
description: Use this skill when breaking down a formal requirement specification (from docs/requirements/) into granular, implementation-ready task files (in docs/tasks/). Defines the decomposition methodology, task structure, dependency management, and quality standards.
---

# Requirement-to-Tasks Decomposition Methodology

This skill defines a structured process for transforming formal requirement specifications (`docs/requirements/`) into granular, actionable implementation tasks (`docs/tasks/`). Each task must be self-contained, testable, and detailed enough for a developer (or AI agent) to implement without ambiguity.

> [!CAUTION]
> **Task Files Are Specifications, Not Code**: Task files describe **WHAT** to implement, not the exact code to write. Code snippets in task files serve as **suggestions and guidance** — they illustrate the expected shape, interfaces, and patterns. The implementor (AI agent using execution skills) will write the actual code following the project's coding standards. Do NOT write complete, production-ready code inside task files.

> [!IMPORTANT]
> **Prerequisite**: This skill assumes the input requirement has already been analyzed and finalized using the `bks-requirement-analysis` methodology. Never decompose a raw draft — only decompose formal requirement documents from `docs/requirements/`.

## 1. Standard Directory Structure

| Path | Purpose |
|---|---|
| `docs/logic/` | **System Intelligence**: The single source of truth for existing business logic, workflows, and technical patterns. |
| `docs/requirements/{date}-{feature}.md` | **Input**: Formal requirement specification (source of truth). |
| `docs/tasks/{date}-{feature}-implementation-tasks.md` | **Output**: Task index file — master list of all task modules with links, phases, and status. |
| `docs/tasks/{date}-{feature}/` | **Output**: Directory containing individual task files. |

> [!CAUTION]
> **Logic Lookup Rule**: ALWAYS use `docs/logic/` to understand the current system. Do NOT read `docs/draft/`, existing `docs/requirements/` (other than the input), or `docs/tasks/` for project logic unless explicitly mentioned.

**Naming Conventions:**
- `{date}` = Requirement date from frontmatter (e.g., `2026-04-01`).
- `{NN}` = Zero-padded task number (e.g., `01`, `02`, `14`).
- `{slug}` = Kebab-case short description (e.g., `database-infrastructure`, `api-registration-flow`).

## 2. Objective

Transform the structured PROCESSING FLOWS, DATA MODEL, and BUSINESS RULES from a requirement specification into a set of independent, ordered, and phased implementation tasks. Each task must represent a **complete, deployable unit of work**.

> [!WARNING]
> **Decomposition, not Duplication**: Do NOT copy-paste entire sections from the requirement into tasks. Instead, **extract**, **reorganize**, and **enrich** the requirement content into task-specific instructions.
>
> **Specifications, not Code**: Task files define the **intent, constraints, and expected outcomes**. Code snippets are **illustrative examples** showing the general shape of the solution — method signatures, data structures, or API shapes. The implementor writes the actual implementation code following the referenced skill's standards.

## 3. Task Types

Every task MUST be classified into one of the following types:

| Type | Description | Delivers Code? |
|---|---|---|
| **IMPLEMENTATION** | Creates or modifies actual source code. Can be deployed independently. | ✅ Yes |
| **COORDINATION** | Aggregates cross-cutting logic across multiple tasks. Does NOT contain unique code — its requirements are **delegated** to other tasks. | ❌ No (delegates) |
| **DOCUMENTATION** | Produces documentation only (API docs, logic docs, test plans). | ❌ No |

**Key Rules:**
- Every task file MUST declare its type in the YAML frontmatter (`type` field).
- **IMPLEMENTATION tasks** MUST map to exactly **one** execution workflow and **one** skill.
- **COORDINATION tasks** MUST include a **Delegation Map** section.
- **COORDINATION dependency rule**: When an IMPLEMENTATION task lists a COORDINATION task in its `depends_on`, the implementor MUST read the COORDINATION task's **Delegation Map** and **Cross-cutting Business Rules** before starting.

## 4. Implementation Workflow

Follow these phases to decompose requirements into tasks:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    REQUIREMENT-TO-TASKS WORKFLOW                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PHASE I: REQUIREMENT ABSORPTION                                      │
│  ├── Read formal requirement document completely                      │
│  ├── Identify: entities, flows, business rules, API endpoints         │
│  ├── Identify: notifications, background jobs, third-party services   │
│  └── Classify each item by layer (DB, API, Job, Frontend)             │
│                         ↓                                             │
│  PHASE II: CODEBASE AUDIT                                             │
│  ├── Search for existing Controllers, Services, Models, Migrations    │
│  ├── Use ONLY docs/logic/ as source of truth                          │
│  ├── Map workflows and skills to each task category                   │
│  └── Annotate: ADD vs MODIFY vs DELETE                                │
│                         ↓                                             │
│  PHASE III: TASK GROUPING & PHASING                                   │
│  ├── Group by: One Task = One Skill + One Workflow                    │
│  ├── Assign to phases: 1→2a→2b→3→4                                     │
│  ├── Apply size guidelines (500–2000 words per task)                  │
│  └── Create COORDINATION tasks for cross-cutting concerns             │
│                         ↓                                             │
│  PHASE IV: DEPENDENCY RESOLUTION                                      │
│  ├── Build dependency graph (Mermaid format)                          │
│  ├── Ensure no circular dependencies                                  │
│  └── Define execution order maximizing parallelism                      │
│                         ↓                                             │
│  PHASE V: TASK DETAIL GENERATION                                      │
│  ├── Generate task files with mandatory structure                     │
│  ├── Generate index file with progress tracking                       │
│  └── Run quality checklist validation                                 │
│                         ↓                                             │
│  PHASE VI: PRESENTATION & REFINEMENT                                  │
│  ├── Present Task Index to user                                       │
│  ├── Highlight decisions and ask for feedback                         │
│  ├── Iterate based on feedback (max 2 rounds)                         │
│  └── Generate final task files after approval                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Critical Architecture Rules

> [!CAUTION]
> These rules MUST be reflected in every IMPLEMENTATION task:
>
> **1. Service Namespaces:**
> | Layer | Namespace | Factory |
> |---|---|---|
> | API business logic | `App\Services\Api\{Module}\` | `ApiFactory` |
> | Background logic | `App\Services\Background\{Module}\` | `BackgroundFactory` |
> | Shared utilities | `App\Services\Common\` | `CommonFactory` |
>
> **2. FORBIDDEN — New Factory Files**: NEVER create `XxxFactory.php`. Add getter methods to existing factories only.
>
> **3. MANDATORY — DTOs**: Every method in `Api\` and `Background\` services MUST use `final readonly` DTOs (`app/DTOs/{Layer}/{Module}/{Action}Data.php`).
>
> **4. Task Separation Rules:**
> - **API + Job**: Split into separate tasks (Job in Phase 2a, API in Phase 2b)
> - **Master Data**: Separate task in Phase 1 using `bks-be-master-data-standard`
> - **Phase 2a MUST precede Phase 2b** when both are needed

### Standard Phases

| Phase | Description | Typical Tasks |
|---|---|---|
| **Phase 1: Foundation** | Database schema, Enums, Models | Migrations, model updates, enum definitions |
| **Phase 2a: Background Jobs & Commands** | Async / CLI business logic | Background Services, Jobs, Artisan Commands |
| **Phase 2b: Backend API** | HTTP API layer | Controllers, Services, FormRequests, Resources |
| **Phase 3: Frontend** | UI implementation | Pages, components, composables, stores |
| **Phase 4: Quality & Documentation** | Testing and docs | PHPUnit tests, API docs, Logic docs |

## 5. Reference Documentation

| Document | Purpose |
|---|---|
| [references/01-decomposition-phases.md](./references/01-decomposition-phases.md) | Detailed breakdown of all 5 decomposition phases + **Frontend Task Decomposition Strategy** |
| [references/02-task-types.md](./references/02-task-types.md) | Complete task type definitions (IMPLEMENTATION, COORDINATION, DOCUMENTATION) |
| [references/03-task-file-structure.md](./references/03-task-file-structure.md) | Mandatory structure for individual task files (YAML + 10 sections) |
| [references/04-index-file-structure.md](./references/04-index-file-structure.md) | Structure for the master task index file (progress tracking, dependency graph) |
| [references/05-task-lifecycle.md](./references/05-task-lifecycle.md) | Status transitions, modification protocols, escalation procedures |
| [references/06-quality-validation.md](./references/06-quality-validation.md) | Pre-presentation checklist and post-generation validation steps |
| [references/07-examples.md](./references/07-examples.md) | Complete examples: IMPLEMENTATION task, COORDINATION task, and Index file |

## 6. Quick Reference

### Workflow → Skill Mapping

| Category | Workflow | Skill |
|---|---|---|
| Database Infrastructure | `/execute-database-task` | `bks-be-database-standard` |
| API (CRUD, Single, List) | `/execute-api-task` | `bks-be-api-standard` |
| Artisan Commands | `/execute-command-task` | `bks-be-command-standard` |
| Background Jobs | `/execute-job-task` | `bks-be-job-standard` |
| Master Data Registration | `/execute-api-task` | `bks-be-master-data-standard` |
| Frontend Features | (None) | `fe-implementation` |

### Task Size Guidelines

- **Ideal**: Requirements section = 500–2000 words
- **Split signal**: >2000 words or >5 endpoints
- **Merge signal**: <3 checklist items or <200 words

### Effort Estimates

| Code | Effort | Duration |
|---|---|---|
| `S` | Small | ~1-2 hours |
| `M` | Medium | ~3-5 hours |
| `L` | Large | ~1-2 days |
| `XL` | Extra Large | ~3+ days |

## 7. Quality Gates

> [!IMPORTANT]
> **MANDATORY**: Run this validation before presenting tasks to the user:

1. ✅ Every IMPLEMENTATION task maps to exactly ONE workflow + ONE skill
2. ✅ No task mixes API code and Job code (split if needed)
3. ✅ Job tasks appear before API tasks that trigger them
4. ✅ Every COORDINATION task has a Delegation Map
5. ✅ Mermaid dependency graph has no circular dependencies
6. ✅ Every `BR-*` is registered in `docs/system/br-registry.md`
7. ✅ Every enum has integer backing, `label()` method, API returns value+label
8. ✅ No new factory files proposed (use existing factories)
9. ✅ Every service method uses DTOs, not raw arrays

For complete validation checklist, see [references/06-quality-validation.md](./references/06-quality-validation.md).
