---
task_id: "04"
title: "Comment & Like API"
description: "Implement nested comments list and creation, and implement the toggle like/unlike API for both posts and comments."
type: IMPLEMENTATION
phase: 2
status: completed
estimated_effort: M
complexity: medium
risk: low
depends_on: ["01", "02"]
rule_refs: ["PROPOSED_BR:post-delete-policy"]
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

# Task 04: Comment & Like API

## Description
This task implements the nested comment system below posts, including replying to a parent comment (up to 2 levels on the UI, mapped via `parent_id` in database) and comment deletion. It also implements the toggle like/unlike API endpoints for posts and comments, ensuring a user can only like a resource once.

---

## Requirements

### 1. DTOs & Services (NEW)
Create DTOs at `backend/app/DTOs/Api/Engagement/`:
- `CreateCommentData`: `content` (string), `parent_id` (int, nullable).

Create `EngagementService` at `backend/app/Services/Api/Engagement/EngagementService.php` extending `App\Services\Base\Service` and register it in `ApiFactory`:
- Method signatures:
  - `public function getPostComments(int $postId): LengthAwarePaginator` (Paginated, 10 per page, loaded in a tree structure)
  - `public function addComment(int $postId, CreateCommentData $dto): Comment`
  - `public function deleteComment(int $id): void` (Owner, Mod, or Admin only)
  - `public function togglePostLike(int $postId): bool` (Returns true if liked, false if unliked)
  - `public function toggleCommentLike(int $commentId): bool` (Returns true if liked, false if unliked)

### 2. Controllers & Request validations (NEW)
Create `EngagementController` at `backend/app/Http/Controllers/User/EngagementController.php`:
- Expose endpoints for comments list, comment submit, comment delete, post like toggle, and comment like toggle.
- Secure submit, delete, and like actions with Sanctum auth middleware.

---

## API Endpoints Summary

| Method | URI | Description | Input Parameters | Output Response | Auth |
|--------|-----|-------------|------------------|-----------------|------|
| `GET` | `/api/v1/posts/{postId}/comments` | Get paginated comments | `page` (int) | Paginated Comments Tree | Guest |
| `POST` | `/api/v1/posts/{postId}/comments` | Add comment / Reply | `content` (string), `parent_id` (int, null) | Comment Object | Sanctum (`api`) |
| `DELETE` | `/api/v1/comments/{id}` | Delete comment | — | `{ "success": true }` | Sanctum (`api`) |
| `POST` | `/api/v1/posts/{postId}/like` | Toggle post like | — | `{ "liked": true/false }` | Sanctum (`api`) |
| `POST` | `/api/v1/comments/{commentId}/like` | Toggle comment like | — | `{ "liked": true/false }` | Sanctum (`api`) |

---

## Testing Hints
- Verify nested comment relations (`parent` and `replies` association).
- Verify like toggle logic: sending the post request twice results in adding then removing the like.
- Ensure concurrency safety: duplicate Likes are caught by DB Unique index and handled gracefully without throwing 500.

---

## Status
- [x] Create `CreateCommentData` DTO.
- [x] Create `EngagementService` with comments and likes logic.
- [x] Register `EngagementService` in `ApiFactory`.
- [x] Create requests validations (`CreateCommentRequest`).
- [x] Implement `EngagementController` endpoints and register API routes.
- [x] Run `php artisan code:format`.
- [x] Run `php artisan test --filter=EngagementTest`.

---

## Acceptance Criteria
1. Comment tree loads correctly (e.g. replies have matching `parent_id`).
2. Only the comment owner, Moderator, or Admin can delete a comment.
3. Toggle Likes adds a row to `post_likes` / `comment_likes` on first hit, and deletes it on the second hit.
4. Comments endpoint paginates at 10 items per page.

---

## Error Scenarios
- Unauthenticated user attempts to comment or like → returns `401 Unauthorized`.
- Non-owner attempts to delete comment → returns `403 Forbidden`.
- Liking a non-existent post → returns `404 Not Found`.

---

## Dependencies
- Task 01 (Database Infrastructure & Setup) — Comments and likes tables must exist.
- Task 02 (Post Management API) — Post model and service must exist.
