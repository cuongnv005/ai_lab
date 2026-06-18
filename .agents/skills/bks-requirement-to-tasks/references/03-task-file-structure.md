# Task File Structure

This document defines the mandatory structure for every individual task file.

---

## Header: YAML Frontmatter

**Template:**
```yaml
---
task_id: "{NN}"
title: "{Task Title}"
description: "{Short summary of the task}"
type: IMPLEMENTATION | COORDINATION | DOCUMENTATION
phase: 1 | 2 | 3 | 4
status: pending | in_progress | completed
estimated_effort: S | M | L | XL
complexity: low | medium | high
risk: low | medium | high
depends_on: []
rule_refs: []
date: "{YYYY-MM-DD}"
changelog:
  - version: 1.0
    date: "{YYYY-MM-DD}"
    summary: Initial task specification.
---
```

**Field Definitions:**

| Field | Description |
|---|---|
| `task_id` | Zero-padded task number (e.g., `"01"`, `"14"`). |
| `type` | Task type: `IMPLEMENTATION`, `COORDINATION`, or `DOCUMENTATION`. |
| `phase` | Phase number (1–4). |
| `status` | `pending` → `in_progress` → `completed`. |
| `estimated_effort` | `S` (~1-2h), `M` (~3-5h), `L` (~1-2 days), `XL` (~3+ days). |
| `complexity` | `low` (well-understood, no unknowns), `medium` (some design decisions), `high` (new tech, complex logic). |
| `risk` | `low` (routine), `medium` (some unknowns), `high` (3rd party integration, concurrency, new tech). |
| `depends_on` | Array of task IDs this task depends on (e.g., `["01", "03"]`). |
| `rule_refs` | Array of business rules used by this task (e.g., `["BR-G007", "BR-AUTH-004"]`; `PROPOSED_BR:{slug}` is allowed only while rule is pending registration). |
| `changelog` | Version history. Bump minor for clarifications, major for scope changes. |

---

## Section 1: Context Block (MANDATORY)

**Template:**
```markdown
# Context
- **Requirement**: [{requirement-filename}](../../requirements/{requirement-filename})
- **Parent Task**: [{index-filename}](../{index-filename})
- **Applicable Workflows**: `/workflow-1`, `/workflow-2`, ...
- **Applicable Skills**: `skill-1`, `skill-2`, ...

---
```

> [!IMPORTANT]
> **Workflows** (e.g., `/execute-api-task`) are complete execution processes — follow them step-by-step. **Skills** (e.g., `bks-be-api-standard`) are individual coding standards.
> 
> **Every implementation task MUST contain the applicable execution workflow and corresponding skill.** This context is the primary source of truth for implementation logic. If a task is missing these, the implementor will be blocked.

---

## Section 2: Title & Description

**Template:**
```markdown
# Task {NN}: {Title}

## Description
[2-3 sentences explaining WHAT this task delivers and WHY it matters. Include context about the current state of the codebase if relevant.]

## Out of Scope (Optional)
[Explicitly list what should NOT be done in this task to prevent AI from overstepping boundaries.]
```

---

## Section 3: Current State (Optional)

If modifying existing code, document what already exists:

**Template:**
```markdown
## Current State (Already Exists)
- **Tables**: [list existing tables]
- **Models**: [list existing models]
- **Enums**: [list existing enums with values]
- **Routes**: [list existing routes if relevant]
```

---

## Section 4: Requirements

The core of the task — detailed implementation instructions organized by component:

**Template:**
```markdown
## Requirements

### 1. {Component Name} ({Action: NEW/MODIFY/DELETE})

[Detailed instructions with:]
- **File path**: (relative to project root).
- **Class/Method signatures**: (Full signatures with types).
- **Logic flow**: (Numbered steps, linking to BR-XXX).
- **Validation (MANDATORY Table Format)**: MUST define all validation rules in a table.

| Field | Presence | Type | Boundaries | Format | Cross-field Rules | Notes |
|-------|----------|------|------------|--------|-------------------|-------|
| `name` | `required` | `string` | `max:50` | — | — | — |
| `tax_code` | `required_if:type,company` | `string` | `regex:/^\d{10,13}$/` | — | Required only when `type == 'company'` | — |
| `end_date` | `required` | `date` | `after:start_date` | `Y-m-d` | Must be after `start_date` | — |

- **Cross-field Validation Rules (MANDATORY if applicable)**: List all inter-field dependencies explicitly.

| Condition | Affected Fields | Rule | Error Message Key |
|-----------|----------------|------|-------------------|
| `type == 'company'` | `tax_code`, `company_name` | Required | `validation.tax_code_required_for_company` |
| `end_date` present | `end_date`, `start_date` | `end_date > start_date` | `validation.end_date_after_start` |
| `new_password` present | `new_password`, `old_password` | Must differ | `validation.password_must_differ` |

- **Localization Keys**: List all new/modified lang keys.
```

**Rules for Requirements:**
- **Be Explicit**: Specify exact file paths, class names, method names.
- **Suggest, Don't Implement**: Code snippets illustrate the **expected shape** — method signatures, DTO fields, return types, or config structure. They are **NOT** complete implementations. Avoid writing full method bodies, business logic, or boilerplate. The implementor (AI agent) will generate production code following the referenced skill's standards.
- **Show Method Signatures**: Include method signatures with types as **guidance** (e.g., `register(RegisterData $dto): User`). Do NOT write the method body.
- **Service Location**: API services go in `app/Services/Api/{Module}/`, Background services go in `app/Services/Background/{Module}/`. NEVER `app/Services/User/` or new directories.
- **DTO Before Service**: For every new service method, specify the DTO location and fields (`app/DTOs/{Layer}/{Module}/{Action}Data.php`). The method signature MUST accept the DTO, not a raw `array`.
  ```php
  // ✅ CORRECT — Signature suggestion in task requirement
  public function create(CreatePostData $dto): Post

  // ❌ FORBIDDEN — Full implementation in task requirement
  public function create(CreatePostData $dto): Post
  {
      $post = Post::create([...$dto->toArray()]);
      return $post;
  }
  ```
- **Factory — Register Only**: New services are ALWAYS registered as getter methods inside the **existing** `ApiFactory`, `BackgroundFactory`, or `CommonFactory`. NEVER create a new `XxxFactory.php` file.
- **Reference Business Rules**: Link to `BR-*`/`TR-XXX` from the requirement. `BR-*` must resolve in `docs/system/br-registry.md`.
- **Enum Standards (MANDATORY)**: Foundation tasks for Enums MUST specify:
  - **Backing type**: Integer (`tinyInteger`/`smallInteger`) or String — as dictated by the storage design.
  - **Class implementation**: Mandatory `label()` method using `trans()`.
  - **API Response**: JsonResources MUST return both value and label fields.

### Code Usage Policy in Task Files

| Usage Level | When to Use | Example |
|---|---|---|
| **Method Signature** | Always — shows expected interface | `public function register(RegisterData $dto): User` |
| **DTO Fields List** | When creating new DTOs | `fields: email: string, name: string` |
| **Short Snippet** | To clarify a tricky pattern or config shape | 3-5 lines showing trait usage or array structure |
| **Full Implementation** | **NEVER** — the implementor writes this | ❌ Complete method bodies, business logic |

> [!IMPORTANT]
> **Rule of thumb**: If a code block exceeds **10 lines**, it's likely too detailed for a task file. Reduce it to a signature + comment describing the logic flow.

---

## Section 4a: Delegation Map (COORDINATION Tasks Only)

COORDINATION tasks do not implement code directly. Instead, they MUST include a delegation map showing which implementation tasks handle each sub-requirement:

**Template:**
```markdown
## Delegation Map

| Requirement | Delegated To | Section | Status |
|---|---|---|---|
| {Sub-requirement 1} | Task {NN} | Requirements §{N} | ⏳ Pending |
| {Sub-requirement 2} | Task {NN} | Requirements §{N} | ⏳ Pending |
```

**Rules:**
- Every sub-requirement of a COORDINATION task MUST be delegated to exactly one IMPLEMENTATION task.
- The delegation must reference the specific section within the target task.
- Status should be updated as delegated tasks are completed.

---

## Section 5: API Endpoints Summary (For API Tasks Only)

**Template:**
```markdown
## API Endpoints Summary

| Method | URI | Description | Input Parameters | Output Response | Auth |
|--------|-----|-------------|------------------|-----------------|------|
| `POST` | `/api/v1/...` | ... | `key` (type, presence, boundaries) | `{ "id": 1, ... }` | Guard |
```

---

## Section 6: Testing Hints (Optional, for IMPLEMENTATION Tasks)

Provide guidance for the testing task to reference:

**Template:**
```markdown
## Testing Hints
- **Backend Requirements**:
  - **Factory needs**: [list required factories and their key states]
  - **Mock requirements**: [external services to mock, e.g., Stripe, Email]
- **Frontend Requirements**:
  - **Stores/Composables**: [state to mock or verify]
  - **UI Interactions**: [expected DOM changes, dialogs, or navigation]
- **Key test scenarios**:
  - [Happy path scenario]
  - [Edge case scenario]
  - [Error scenario]
- **Assertions**: [key state changes to verify]
```

---

## Section 7: Status Checklist

**Template:**
```markdown
## Status
- [ ] {Actionable item 1}
- [ ] {Actionable item 2}
- [ ] Run `php artisan migrate:rollback` and migrate again to verify `down()` methods (If modifying DB).
- [ ] Run `php artisan code:format` (Backend) OR `pnpm lint` (Frontend).
- [ ] Run `php artisan test --filter={RelatedTestClass}` (Backend) OR `pnpm test` (Frontend).
```

**Rules:**
- Each checkbox = one concrete, verifiable action.
- Order should follow logical implementation sequence.
- **Always include** the appropriate formatting/linting command as the second-to-last item.
- **Migration rollback check**: For tasks modifying the database schema (Phase 1), ALWAYS include a manual check to run `php artisan migrate:rollback`.
- **Conditional test command**:
  - For IMPLEMENTATION tasks: include `php artisan test --filter={RelatedTestClass}`.
  - For DOCUMENTATION tasks: omit the test command.

---

## Section 8: Acceptance Criteria

**Template:**
```markdown
## Acceptance Criteria
1. {Numbered, testable criterion}
2. {Another criterion with specific expected values/behaviors}
```

**Rules:**
- Each criterion must be **testable**.
- Include specific HTTP status codes, expected state changes, and edge cases.
- Cover both happy path and key error paths.

---

## Section 9: Error Scenarios

**Template:**
```markdown
## Error Scenarios
- {Condition} → {Expected HTTP status/behavior}.
```

Map directly from the requirement's Error Cases tables.

---

## Section 10: Dependencies

**Template:**
```markdown
## Dependencies
- Task {NN} ({Title}) — {Why it's needed}.
```

**Note for COORDINATION tasks**: When an IMPLEMENTATION task depends on a COORDINATION task, add a note reminding implementors to read the COORD task's Delegation Map and Cross-cutting Business Rules.
