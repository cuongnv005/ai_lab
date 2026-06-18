---
task_id: "05"
title: "Report System & Queue API"
description: "Implement report vi-pham submission for posts and comments, apply strict hourly rate limits, and build Admin Report Queue endpoints."
type: IMPLEMENTATION
phase: 2
status: completed
estimated_effort: S
complexity: medium
risk: medium
depends_on: ["01", "02", "04"]
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
- **Applicable Workflows**: `/execute-api-task`
- **Applicable Skills**: `bks-be-api-standard`

---

# Task 05: Report System & Queue API

## Description
This task implements the abuse reporting system. Logged-in users (`member` and `moderator` roles) can submit reports against any post or comment. Reports are rate-limited to 5 per hour per user. Admin users have access to the Admin Report Queue, where they can either dismiss a report or resolve it by deleting the reported content.

---

## Requirements

### 1. DTOs & Services (NEW)
Create DTOs at `backend/app/DTOs/Api/Report/`:
- `CreateReportData`: `reportable_type` (string), `reportable_id` (int), `reason` (string).

Create `ReportService` at `backend/app/Services/Api/Report/ReportService.php` extending `App\Services\Base\Service` and register it in `ApiFactory`:
- Method signatures:
  - `public function submitReport(CreateReportData $dto): Report`
  - `public function listPendingReports(): LengthAwarePaginator` (Admin only)
  - `public function resolveReport(int $id): void` (Deletes the reported post/comment and updates status, Admin only)
  - `public function dismissReport(int $id): void` (Updates status to dismissed, Admin only)

### 2. Rate Limiting Logic (NEW)
- Before creating a report record in `submitReport()`, count the reports created by the authenticated user in the last 60 minutes.
- If the count is >= 5, throw an `InputException` (translates to `422` with message `report.error_rate_limit`).

### 3. Controllers & Routes (NEW)
Create `ReportController` at `backend/app/Http/Controllers/User/ReportController.php`:
- Expose `/api/v1/reports` endpoint for users to submit reports.
- Expose Admin-only endpoints `/api/v1/admin/reports` (GET, PUT resolve, PUT dismiss).
- Verify Admin role middleware for the admin endpoints.

---

## API Endpoints Summary

| Method | URI | Description | Input Parameters | Output Response | Auth |
|--------|-----|-------------|------------------|-----------------|------|
| `POST` | `/api/v1/reports` | Submit abuse report | `reportable_type`, `reportable_id`, `reason` | Report Object | Sanctum (`api`) |
| `GET` | `/api/v1/admin/reports` | List pending reports | `page` (int) | Paginated Reports | Sanctum (`admin`) |
| `PUT` | `/api/v1/admin/reports/{id}/resolve` | Resolve report (deletes content) | — | `{ "success": true }` | Sanctum (`admin`) |
| `PUT` | `/api/v1/admin/reports/{id}/dismiss` | Dismiss report (keep content) | — | `{ "success": true }` | Sanctum (`admin`) |

---

## Testing Hints
- Test that non-admin users get `403 Forbidden` on Admin endpoints.
- Test that submitting more than 5 reports within an hour returns a `422 Validation Error` due to rate limits.
- Test that resolving a report soft-deletes the target post or comment.

---

## Status
- [x] Create `CreateReportData` DTO.
- [x] Create `ReportService` with rate limiting, queue listing, resolve, and dismiss methods.
- [x] Register `ReportService` in `ApiFactory`.
- [x] Create requests validations (`CreateReportRequest`).
- [x] Implement `ReportController` endpoints and register routes.
- [x] Add Spatie Role checks for Admin endpoints.
- [x] Run `php artisan code:format`.
- [x] Run `php artisan test --filter=ReportTest`.

---

## Acceptance Criteria
1. Only authenticated users can submit reports.
2. Users can submit reports on posts (`App\Models\Post`) and comments (`App\Models\Comment`).
3. Users are blocked with `422` error when exceeding 5 reports per hour.
4. Admin resolving a report soft-deletes the reported model (post or comment is no longer visible) and sets report status to `RESOLVED` (2).
5. Admin dismissing a report keeps the content and sets report status to `DISMISSED` (3).

---

## Error Scenarios
- Submitting a report without logging in → returns `401 Unauthorized`.
- Exceeding the hourly report rate limit → returns `422 Validation Error`.
- Accessing Admin endpoints as a Member or Moderator → returns `403 Forbidden`.

---

## Dependencies
- Task 01 (Database Infrastructure & Setup) — Reports table must exist.
- Task 02 (Post Management API) — Post model must exist.
- Task 04 (Comment & Like API) — Comment model must exist.
