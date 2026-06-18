---
task_id: "07"
title: "Frontend Post Detail & Comments"
description: "Implement Post Detail view, parse Markdown/BBcode dynamically, build nested comment tree, implement likes, and create report modals."
type: IMPLEMENTATION
phase: 3
status: pending
estimated_effort: M
complexity: medium
risk: low
depends_on: ["02", "04", "05", "06"]
rule_refs: ["PROPOSED_BR:report-auth-required", "PROPOSED_BR:report-rate-limit"]
date: "2026-06-05"
changelog:
  - version: 1.0
    date: "2026-06-05"
    summary: Initial task specification.
---

# Context
- **Requirement**: [03-ai_lab.md](../../requirements/03-ai_lab.md)
- **Parent Task**: [2026-06-05-ai-lab-implementation-tasks.md](../2026-06-05-ai-lab-implementation-tasks.md)
- **Applicable Workflows**: (None - Frontend Feature implementation)
- **Applicable Skills**: `bks-fe-ds-sdk-consumer`, `bks-fe-implement-feature`

---

# Task 07: Frontend Post Detail & Comments

## Description
This task implements the Post Detail page. It covers rendering the Markdown content, parsing custom BBcode such as `[similar][/similar]` to replace it with a dynamic React list of related posts, building the nested multi-level comment tree with reply forms and likes, and wiring up the "Like" buttons and "Báo cáo vi phạm" modals.

---

## Requirements

### 1. Post Detail Layout (NEW)
- **File**: `frontend/app/(dashboard)/posts/[id]/page.tsx`.
- **Components**:
  - `PostDetail`: Render title, tags, views, created date, and content.
  - `ArticleBody`: Renders Markdown content. It must scan the content for `[similar][/similar]` and inject the `<SimilarPostspostId={id} />` component in its place.
  - Implement a copy button for Code Blocks, a Share button (copies current page link to clipboard), and a Post Like button (indicates active state).

### 2. Nested Comment Tree (NEW)
- **File**: `frontend/app/(dashboard)/posts/[id]/comments/CommentSection.tsx`.
- **UX Logic**:
  - Displays a comment list fetched from `GET /api/v1/posts/{id}/comments`.
  - Supports nested structure: child comments (replies) are indented underneath parent comments.
  - Guest: Can view comments but comment input is hidden; shows "Đăng nhập để bình luận" button.
  - Member/Mod: Shows rich input editor for typing comment.
  - Reply button: Opens inline reply form under the parent comment.
  - Delete button: Shows on comments if the user owns them, or is Moderator/Admin.
  - Like button: Toggles comment like state.
  - Pagination: Loads 10 items per page with "Xem thêm" (Load More) pagination.

### 3. Abuse Report Modal (NEW)
- **Component**: `frontend/components/composables/ReportModal.tsx`.
- **UX Logic**:
  - Triggers by clicking the "Báo cáo vi phạm" button next to posts or comments.
  - Opens a Dialog containing a form (Radio options + Textarea reason).
  - Validation: requires a reason of at least 10 characters.
  - On submit: Calls `POST /api/v1/reports` using TanStack Query Mutation.
  - Shows success toast message on success or rate-limit warning.

---

## Testing Hints
- Mock copy to clipboard function in tests to ensure share button works.
- Verify `ArticleBody` replaces `[similar][/similar]` tag with the similar posts component.
- Verify report modal inputs validate properly before submission.

---

## Status
- [x] Create `PostDetail` container page.
- [x] Create `ArticleBody` with markdown interpreter and BBcode regex parsing.
- [x] Implement `SimilarPosts` widget fetching related items.
- [x] Create `CommentSection` displaying nested comment tree (parent-replies).
- [x] Create `CommentItem` component with like toggle and inline reply form.
- [x] Implement `ReportModal` dialog with Form validation.
- [x] Add i18n translation keys for comment forms, errors, and report reasons.
- [x] Run `pnpm lint`.

---

## Acceptance Criteria
1. Details page parses Markdown code blocks correctly and adds a "Copy" button inside the code blocks.
2. The `[similar][/similar]` BBCode is replaced by a custom cards list showing related posts.
3. Comments support multi-level rendering (nested hierarchy).
4. Submitting a report calls the API and shows a success toast message.
5. Post and Comment Likes toggle dynamically without page reloading (Optimistic Updates recommended).

---

## Error Scenarios
- User reports without logging in → blocked on frontend (modal not clickable/visible for guest).
- User exceeds report rate limit → Toast displays the hourly rate limit error.

---

## Dependencies
- Task 02 (Post Management API) — Core post detail API endpoints.
- Task 04 (Comment & Like API) — Comments and likes API endpoints.
- Task 05 (Report System API) — Abuse report API endpoint.
- Task 06 (Frontend Home & Forum Views) — Shared layouts must exist.
