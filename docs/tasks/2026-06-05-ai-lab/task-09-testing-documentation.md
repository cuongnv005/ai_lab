---
task_id: "09"
title: "Testing & Logic Documentation"
description: "Write backend PHPUnit tests (Unit and Feature), implement frontend Vitest and Playwright E2E suites, and write the logic docs under docs/logic/."
type: DOCUMENTATION
phase: 4
status: pending
estimated_effort: M
complexity: medium
risk: low
depends_on: ["02", "03", "04", "05", "06", "07", "08"]
rule_refs: []
date: "2026-06-05"
changelog:
  - version: 1.0
    date: "2026-06-05"
    summary: Initial task specification.
---

# Context
- **Requirement**: [03-ai_lab.md](../../requirements/03-ai_lab.md)
- **Parent Task**: [2026-06-05-ai-lab-implementation-tasks.md](../2026-06-05-ai-lab-implementation-tasks.md)
- **Applicable Workflows**: (None - Documentation/Testing task)
- **Applicable Skills**: `bks-be-testing-standard`, `bks-fe-create-tc-component`, `bks-fe-create-tc-flow`, `bks-doc-logic-standard`

---

# Task 09: Testing & Logic Documentation

## Description
This task coordinates the writing of test suites and updating system intelligence documentation. It covers writing backend feature and unit tests (for Post, Draft, Comment, Like, and Report APIs), writing frontend unit tests for custom hooks/components, running E2E flow tests for post creation/moderation, and drafting logic documents.

---

## Requirements

### 1. Backend Testing (PHPUnit) (NEW)
Create tests inside `backend/tests/`:
- **Feature Tests**:
  - `PostPublishTest`: Verify Member/Mod/Admin status defaults (`PENDING` vs `PUBLISHED`), BBCode extraction.
  - `DraftAutoSaveTest`: Verify UPSERT logic, draft isolation per category, and deletion upon successful submit.
  - `EngagementTest`: Verify nested comments (parent/replies) retrieve and delete permissions, check like toggle.
  - `AbuseReportTest`: Verify report submissions, rate-limits check (fails >= 5/h), and Admin resolving/dismissing.
- **Unit Tests**:
  - Test helper methods (e.g. BBCode parsing helper isolated logic).

### 2. Frontend Testing (Vitest & Playwright) (NEW)
- **Vitest Unit/Integration Tests**:
  - Test `useDraftAutoSave` hook behaves correctly (triggers auto-save API at 30 seconds interval, restores state).
  - Test `ArticleBody` correctly parses Markdown and matches standard design tokens.
- **Playwright E2E Tests**:
  - Test Happy Path: Member logins, writes a post, selects category, sees auto-saved banner, clicks publish. Post appears in Category forum but not Homepage.
  - Admin logins, views approval queue, promotes Member's post. Post appears on Homepage.

### 3. System Logic Documentation (NEW)
Create documentation in `docs/logic/`:
- **`docs/logic/post/post-lifecycle.md`**: Outlines post statuses, role permissions, BBCode syntax, and similar posts lookup logic.
- **`docs/logic/post/draft-autosave.md`**: Outlines details on auto-saving mechanics, draft recovery dialog flow, and cleanup actions.
- **`docs/logic/report/abuse-reporting.md`**: Outlines report status transitions, rate limits, and actions inside the admin report queue.

Register the newly created files in `docs/logic/index.md` and convert all `PROPOSED_BR` references to official registered `BR-*` rules inside `docs/system/br-registry.md`.

---

## Status
- [ ] Create Backend PHPUnit Feature and Unit tests.
- [ ] Create Frontend Vitest test files.
- [ ] Create Playwright spec test files.
- [ ] Run PHPUnit tests suite (`docker compose exec -it -u www-data app php artisan test`).
- [ ] Run Vitest suite (`docker compose exec -it node pnpm test:run`).
- [ ] Run Playwright suite (`docker compose exec -it node pnpm test:e2e`).
- [ ] Create system logic docs (`docs/logic/post/post-lifecycle.md`, etc.).
- [ ] Register new rules in `docs/system/br-registry.md`.
- [ ] Update `docs/logic/index.md`.

---

## Acceptance Criteria
1. Backend coverage for Post, Draft, Engagement, and Report service logic is >= 90%.
2. All written PHPUnit feature tests pass successfully.
3. Playwright E2E test runs full publish and promote flow successfully.
4. Business logic documentation is compiled with valid YAML frontmatter following project documentation standards.

---

## Dependencies
- Task 02 to 08 must be implemented.
