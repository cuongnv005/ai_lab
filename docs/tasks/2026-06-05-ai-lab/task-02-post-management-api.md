---
task_id: "02"
title: "Post Management API"
description: "Implement Post CRUD endpoints, filter by category and tags, handle BBCode preview tags to extract summary, and construct dynamic Similar Posts endpoint."
type: IMPLEMENTATION
phase: 2
status: completed
estimated_effort: M
complexity: medium
risk: low
depends_on: ["01"]
rule_refs: ["PROPOSED_BR:post-homepage-eligibility", "PROPOSED_BR:post-discussion-visibility", "PROPOSED_BR:post-auto-publish-mod-admin", "PROPOSED_BR:post-rejection-flow", "PROPOSED_BR:post-delete-policy"]
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

# Task 02: Post Management API

## Description
This task implements the core Post REST API endpoints. This includes listing published posts on the homepage (grid), listing posts in category discussions (including PENDING status), viewing details (increasing view count), creating posts with status transitions based on user roles, and handling BBCode tag `[preview]` to extract the summary. It also covers the API to fetch similar posts based on shared tags.

---

## Requirements

### 1. DTOs & Services (NEW)
Create DTOs at `backend/app/DTOs/Api/Post/`:
- `CreatePostData`: `title` (string), `content` (string), `category_id` (int), `tags` (array of strings).
- `UpdatePostData`: `title` (string, optional), `content` (string, optional), `category_id` (int, optional), `tags` (array of strings, optional).

Create `PostService` at `backend/app/Services/Api/Post/PostService.php` extending `App\Services\Base\Service` and register it in `ApiFactory`:
- Method signatures:
  - `public function listHomepagePosts(): LengthAwarePaginator`
  - `public function listCategoryPosts(string $categorySlug): LengthAwarePaginator`
  - `public function getPostDetails(int $id): Post` (Increments views count)
  - `public function createPost(CreatePostData $dto): Post`
  - `public function updatePost(int $id, UpdatePostData $dto): Post`
  - `public function deletePost(int $id): void`
  - `public function getSimilarPosts(int $id, int $limit = 3): Collection`

### 2. BBCode Parse Logic (NEW)
Inside `PostService` (or a helper/service class):
- When saving a post (`create` or `update`), scan the content for `[preview]content[/preview]`.
- Extract the text inside and save it into the `posts.summary` column.
- Strip the `[preview]` and `[/preview]` tags from `posts.content` to keep it clean.
- Ensure the similar posts query ranks posts in the same category sharing the same tags first, ordered by views or date.

### 3. Controllers & Requests (NEW)
Create `PostController` at `backend/app/Http/Controllers/User/PostController.php`:
- Standard CRUD actions mapped to endpoints.
- Apply Sanctum auth middleware to store, update, destroy endpoints.
- Authorization:
    - Member: Can create (goes to `PENDING`), can update/delete own post only.
    - Mod / Admin: Can create (goes to `PUBLISHED`), can update/delete any post.

---

## API Endpoints Summary

| Method | URI | Description | Input Parameters | Output Response | Auth |
|--------|-----|-------------|------------------|-----------------|------|
| `GET` | `/api/v1/posts` | List Homepage Published Posts | `page` (int) | Paginated Post List | Guest |
| `GET` | `/api/v1/posts/{id}` | Post Details (increases views) | — | Post Object | Guest |
| `GET` | `/api/v1/posts/{id}/similar` | Get 3 similar posts | — | Collection of 3 Posts | Guest |
| `GET` | `/api/v1/categories/{slug}/posts` | List Category discussion posts | `page` (int) | Paginated Post List (includes PENDING status) | Guest |
| `POST` | `/api/v1/posts` | Create Post | Title, Content, Category, Tags | Created Post Object | Sanctum (`api`) |
| `PUT` | `/api/v1/posts/{id}` | Update Post | Title, Content, Category, Tags | Updated Post Object | Sanctum (`api`) |
| `DELETE` | `/api/v1/posts/{id}` | Delete Post | — | `{ "success": true }` | Sanctum (`api`) |

---

## Testing Hints
- Verify `PostService` extracts `[preview]` correctly.
- Verify status assignment: Member post defaults to `PENDING`, Admin/Mod post defaults to `PUBLISHED`.
- Verify similar posts lookup returns only published posts.

---

## Status
- [x] Create `CreatePostData` and `UpdatePostData` DTOs.
- [x] Create `PostService` and add method bindings.
- [x] Implement BBCode `[preview]` parsing logic.
- [x] Register `PostService` in `ApiFactory`.
- [x] Create requests validations (`CreatePostRequest`, `UpdatePostRequest`).
- [x] Implement `PostController` CRUD endpoints and routes.
- [x] Apply Spatie policy checks inside Controller/Service.
- [x] Run `php artisan code:format`.
- [x] Run `php artisan test --filter=PostTest`.

---

## Acceptance Criteria
1. Member posts appear instantly in `/api/v1/categories/{slug}/posts` but not in `/api/v1/posts` (homepage).
2. Admin or Moderator posts appear in both endpoints immediately.
3. Viewing detail increases `posts.views_count` by 1.
4. BBcode `[preview]` tags are parsed, text is extracted into `summary`, and raw tag formatting is deleted from the body.
5. Only the author, Moderator, or Admin can edit or delete a post.

---

## Error Scenarios
- Unauthenticated user attempts to create post → returns `401 Unauthorized`.
- Non-author Member attempts to edit another's post → returns `403 Forbidden`.
- Posting with non-existent `category_id` → returns `422 Validation Error`.

---

## Dependencies
- Task 01 (Database Infrastructure & Setup) — Table schemas and Spatie roles must be loaded.
