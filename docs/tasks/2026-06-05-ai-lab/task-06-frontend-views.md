---
task_id: "06"
title: "Frontend Home & Forum Views"
description: "Build layout components (Header, Footer), implement Homepage grid list for published posts, and implement Category discussion views."
type: IMPLEMENTATION
phase: 3
status: completed
estimated_effort: M
complexity: medium
risk: low
depends_on: ["02"]
rule_refs: ["PROPOSED_BR:post-homepage-eligibility", "PROPOSED_BR:post-discussion-visibility"]
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

# Task 06: Frontend Home & Forum Views

## Description
This task implements the general layout and landing views for the AI_Lab frontend. It covers building the Header navigation (with user profile status, dark/light mode toggle, and roles conditional buttons), the Footer, the Homepage post list grid (showing published posts), and the Forum pages displaying Category headers and topic lists (showing pending member discussion threads).

---

## Requirements

### 1. Layout: Header & Footer (NEW/MODIFY)
- **Files**: `frontend/components/layouts/Header.tsx`, `frontend/components/layouts/Footer.tsx`.
- **Logic**:
  - Left: Logo + Brand Name "AI_Lab".
  - Center: Navigation Links: Homepage (`/`), Discussions (`/forum`).
  - Right:
    - Search input.
    - Dark mode / Light mode toggle.
    - If Guest: "Đăng nhập" / "Đăng ký" buttons.
    - If Authenticated: Avatar dropdown showing user name.
      - If Role is `member` or `moderator`: Show "Bài viết của tôi" link.
      - If Role is `admin`: Show "Dashboard" button (links to Laravel admin page).

### 2. Homepage (Grid View) (NEW/MODIFY)
- **File**: `frontend/app/(dashboard)/page.tsx` (or target landing page).
- **UX Design**:
  - Grid layout (1 col on mobile, 2 cols on tablet, 3 cols on desktop) displaying PostCards.
  - PostCard displays: Post title, summary, views count, created time (relative format like "3 ngày trước"), and the author's avatar/name.
  - Hover animations: Subtle scaling, box-shadow increases.
  - API call: Connect to `GET /api/v1/posts` using TanStack Query.

### 3. Category Discussions (Forum View) (NEW)
- **Files**: `frontend/app/(dashboard)/forum/page.tsx`, `frontend/app/(dashboard)/forum/[categorySlug]/page.tsx`.
- **Logic**:
  - `/forum` lists all categories.
  - `/forum/[categorySlug]` lists all topics/threads (posts in this category).
  - Lists posts from `GET /api/v1/categories/{slug}/posts` (which includes both published and pending discussion posts).
  - Displays a "Viết bài thảo luận" button on the Category header, redirecting logged-in users to the creation form.

---

## Testing Hints
- Verify dark/light mode switches Tailwind colors smoothly.
- Mock API responses using MSW handlers for posts and category queries.
- Verify conditional buttons are rendered based on mock authentication store state (member vs. admin).

---

## Status
- [ ] Implement or update Layout Header with navigation links and role guards.
- [ ] Implement Layout Footer with social links and terms of service.
- [ ] Create PostCard component with beautiful hover styles.
- [ ] Implement Homepage page fetching published posts.
- [ ] Create Forum page listing categories.
- [ ] Create Category detail page displaying discussion topic cards.
- [ ] Add i18n keys for navigation links and empty lists.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm test` for layout component rendering.

---

## Acceptance Criteria
1. Homepage fetches only `status = 2` (Published) posts and lists them in a responsive card grid.
2. Clicking a category in the Forum displays posts belonging to that category (including PENDING discussion posts).
3. Header changes dynamically when logging in/out, displaying the correct buttons for Member, Moderator, and Admin.
4. UI matches brand typography (Josefin Sans, Outfit) and is responsive across mobile, tablet, and desktop viewports.

---

## Error Scenarios
- API server returns 500 on posts fetching → page shows an error state with a "Thử lại" (Retry) button.
- Accessing a non-existent category slug → shows a customized 404 page.

---

## Dependencies
- Task 02 (Post Management API) — Endpoint definitions are needed.
