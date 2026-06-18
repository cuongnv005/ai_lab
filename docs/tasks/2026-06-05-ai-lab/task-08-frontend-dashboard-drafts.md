---
task_id: "08"
title: "Frontend Dashboard & Editor Auto-save"
description: "Implement user dashboard, post create/edit forms, integrate SCeditor with BBcode support, and build the 30-second draft auto-save hook."
type: IMPLEMENTATION
phase: 3
status: pending
estimated_effort: M
complexity: high
risk: medium
depends_on: ["02", "03", "06"]
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
- **Applicable Workflows**: (None - Frontend Feature implementation)
- **Applicable Skills**: `bks-fe-ds-sdk-consumer`, `bks-fe-implement-feature`

---

# Task 08: Frontend Dashboard & Editor Auto-save

## Description
This task implements the personal writing dashboard. It includes the user's dashboard view to manage posts (listing draft, pending, published, and rejected posts with count and status badges), a create/edit post form containing the WYSIWYG editor (SCeditor supporting markdown and custom tags), and a custom hook to perform draft auto-saving every 30 seconds isolated by the selected Category.

---

## Requirements

### 1. Personal Post Management (NEW)
- **File**: `frontend/app/(dashboard)/dashboard/posts/page.tsx`.
- **UX Layout**:
  - A table or card list showing the user's own posts with status labels:
    - `Pending`: Yellow badge.
    - `Published`: Green badge.
    - `Rejected`: Red badge. If rejected, hover/click shows the `reject_reason` inside a tooltip or card details.
  - Columns: Title, Comments Count, Likes Count, Status, Actions (Edit, Delete).
  - Pagination: 10 items per page.
  - Search filter input to filter posts by title.

### 2. Post Creation & Editing Form (NEW)
- **File**: `frontend/app/(dashboard)/dashboard/posts/new/page.tsx` and `/posts/[id]/edit/page.tsx`.
- **Fields**:
  - Title: Text input.
  - Category: Select dropdown (fetching list from API).
  - Content: Rich editor.
  - Tags: Badge input where user can add multiple tags.
- **WYSIWYG Editor Integration**:
  - Implement `sceditor` (or a React equivalent) initialized to output Markdown/BBCode.
  - Add quick action buttons to wrap highlighted text with:
    - `[preview]text[/preview]`
    - `[similar][/similar]`
  - Provide a "Xem trước" (Preview) tab/button which renders the content (translating BBCode/Markdown to HTML).

### 3. Draft Auto-save hook (NEW)
- **Hook**: `frontend/hooks/useDraftAutoSave.ts`.
- **Logic**:
  - Listen to changes on `title`, `content`, `category_id`, and `tags`.
  - Every 30 seconds, if dirty, call the `/api/v1/drafts/autosave` endpoint.
  - Display a subtle message: "Đã tự động lưu nháp lúc [Giờ]" when autosave completes successfully.
  - When `category_id` changes: fetch the current draft for this category. If it exists, prompt the user with a confirmation dialog: "Bạn có bản nháp cho danh mục này. Bạn có muốn khôi phục không?". If accepted, fill the form fields with draft values.

---

## Testing Hints
- Test the auto-save hook using Vitest timers (`vi.useFakeTimers()`).
- Verify that changing Category triggers draft retrieval.
- Verify status colors: PENDING matches CSS yellow token, REJECTED matches CSS red token.

---

## Status
- [ ] Create personal posts dashboard grid page with status badges.
- [ ] Install and configure `sceditor` inside a client React component wrapper with dynamic loading (SSR disabled).
- [ ] Create new/edit post form layout and wire up React Hook Form.
- [ ] Build the `useDraftAutoSave` hook and configure debounce/interval timers.
- [ ] Implement category-based draft recovery confirmation logic.
- [ ] Link publishing action to delete matching drafts upon success.
- [ ] Add i18n translation keys.
- [ ] Run `pnpm lint`.

---

## Acceptance Criteria
1. Changing Categories triggers a call to `/api/v1/drafts` to fetch the specific draft.
2. Writing inside the editor triggers an automatic background save to the drafts database every 30 seconds.
3. Submitting the post successfully redirects the user and clears the draft for that category.
4. Dashboard displays posts with the correct visual colors and reject reasons.

---

## Error Scenarios
- Server goes offline during auto-save → interface displays a silent warning (e.g. red status dot "Không thể lưu nháp tự động"), doesn't crash the editor.

---

## Dependencies
- Task 02 (Post Management API) — Endpoints for post creation/retrieval.
- Task 03 (Draft Auto-save API) — Auto-save endpoint definitions.
- Task 06 (Frontend Home & Forum Views) — Shared dashboard layouts.
