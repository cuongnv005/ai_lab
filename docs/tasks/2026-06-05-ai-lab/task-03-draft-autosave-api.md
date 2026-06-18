---
task_id: "03"
title: "Draft Auto-save API"
description: "Implement draft auto-save UPSERT endpoints isolated by category_id and user_id, and handle cleanups on post submission."
type: IMPLEMENTATION
phase: 2
status: completed
estimated_effort: S
complexity: low
risk: low
depends_on: ["01", "02"]
rule_refs: ["PROPOSED_BR:draft-category-isolation", "PROPOSED_BR:draft-auto-cleanup"]
date: "2026-06-05"
changelog:
  - version: 1.0
    date: "2026-06-05"
    summary: Initial task specification.
---

# Context
- **Requirement**: [03-ai_lab.md](../../requirements/03-ai_lab.md)
- **Parent Task**: [2026-06-05-ai-lab-implementation-tasks.md](../2026-06-05-ai-lab-implementation-tasks.md)
- **Applicable Workflows**: `/execute-api-task`
- **Applicable Skills**: `bks-be-api-standard`

---

# Task 03: Draft Auto-save API

## Description
This task implements the auto-save draft functionality. Drafts are isolated per user per category, meaning a user can have a distinct draft for each Category. When editing an existing post, drafts are also tracked using `post_id`. Once a post is successfully published or updated, the corresponding draft is cleaned up.

---

## Requirements

### 1. DTOs & Services (NEW)
Create DTO at `backend/app/DTOs/Api/Draft/`:
- `AutoSaveDraftData`: `category_id` (int), `post_id` (int, nullable), `title` (string, nullable), `content` (string, nullable), `tags` (array of strings, nullable).

Create `DraftService` at `backend/app/Services/Api/Draft/DraftService.php` extending `App\Services\Base\Service` and register it in `ApiFactory`:
- Method signatures:
  - `public function autoSave(AutoSaveDraftData $dto): Draft` (Performs DB UPSERT based on unique combination `[user_id, category_id, post_id]`)
  - `public function getDraft(int $categoryId, ?int $postId = null): ?Draft`
  - `public function deleteDraft(int $categoryId, ?int $postId = null): void`

### 2. Integration with PostService (MODIFY)
Inside `PostService` (created in Task 02):
- Trigger `$this->draftService->deleteDraft($categoryId, $postId)` when a post is successfully published (`createPost` or `updatePost`).

### 3. Controller & Routes (NEW)
Create `DraftController` at `backend/app/Http/Controllers/User/DraftController.php`:
- Expose endpoints to save and load drafts.
- Secure with Sanctum auth middleware.

---

## API Endpoints Summary

| Method | URI | Description | Input Parameters | Output Response | Auth |
|--------|-----|-------------|------------------|-----------------|------|
| `POST` | `/api/v1/drafts/autosave` | Auto-save draft | `category_id` (int), `post_id` (int, null), `title`, `content`, `tags` (JSON) | Draft Object | Sanctum (`api`) |
| `GET` | `/api/v1/drafts` | Load current draft | `category_id` (int), `post_id` (int, null) | Draft Object or `null` | Sanctum (`api`) |

---

## Testing Hints
- Verify that saving draft for category A does not overwrite draft for category B.
- Verify that posting deletes the draft record.

---

## Status
- [x] Create `AutoSaveDraftData` DTO.
- [x] Create `DraftService` and implement the `UPSERT` logic.
- [x] Inject `DraftService` inside `PostService` and add deletion hook on save.
- [x] Register `DraftService` in `ApiFactory`.
- [x] Create requests validations (`AutoSaveDraftRequest`, `GetDraftRequest`).
- [x] Implement `DraftController` endpoints and register API routes.
- [x] Run `php artisan code:format`.
- [x] Run `php artisan test --filter=DraftTest`.

---

## Acceptance Criteria
1. Sending draft autosave requests executes an UPSERT inside the `drafts` table, matching `(user_id, category_id, post_id)`.
2. Changing Categories returns the correct draft for that category or `null` if none exists.
3. Submitting a post successfully calls the cleanup hook, removing the matching draft record.

---

## Error Scenarios
- Missing `category_id` on autosave → returns `422 Validation Error`.
- Unauthenticated access → returns `401 Unauthorized`.

---

## Dependencies
- Task 01 (Database Infrastructure & Setup) — Drafts table must exist.
- Task 02 (Post Management API) — PostService must exist to connect cleanup hook.
