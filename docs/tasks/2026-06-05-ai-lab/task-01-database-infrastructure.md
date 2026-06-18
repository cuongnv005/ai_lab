---
task_id: "01"
title: "Database Infrastructure & Setup"
description: "Create migrations for AI_Lab entities, declare Eloquent Models, specify relationships, define backed Enums, and seed default categories and roles."
type: IMPLEMENTATION
phase: 1
status: completed
estimated_effort: M
complexity: medium
risk: low
depends_on: []
rule_refs: ["PROPOSED_BR:post-auto-publish-mod-admin", "PROPOSED_BR:draft-category-isolation"]
date: "2026-06-05"
changelog:
  - version: 1.0
    date: "2026-06-05"
    summary: Initial task specification.
---

# Context
- **Requirement**: [03-ai_lab.md](../../requirements/03-ai_lab.md)
- **Parent Task**: [2026-06-05-ai-lab-implementation-tasks.md](../2026-06-05-ai-lab-implementation-tasks.md)
- **Applicable Workflows**: `/execute-database-task`
- **Applicable Skills**: `bks-be-database-standard`

---

# Task 01: Database Infrastructure & Setup

## Description
This task establishes the entire database foundation for the AI_Lab platform. It includes creating the database tables with PK/FK constraints, defining Eloquent Models with proper attributes and relations, defining status Enums, and creating DB seeders for initial categories, tags, and roles (specifically registering the `moderator` role in Spatie Laravel Permission).

---

## Requirements

### 1. Migrations (NEW)
Create migrations for the following tables. Note that **every table** must have an auto-incrementing `id` primary key:
- `categories`: `id`, `name`, `slug` (unique), `description` (nullable), `created_at`, `updated_at`.
- `posts`: `id`, `user_id` (FK), `category_id` (FK), `title`, `content` (long text), `summary` (nullable), `status` (tinyInteger, default: 1), `views_count` (int, default: 0), `reject_reason` (text, nullable), `created_at`, `updated_at`.
- `tags`: `id`, `name` (unique), `slug` (unique), `created_at`, `updated_at`.
- `post_tag`: `id` (PK, auto-increment), `post_id` (FK -> posts.id, cascade), `tag_id` (FK -> tags.id, cascade).
- `comments`: `id`, `post_id` (FK), `user_id` (FK), `parent_id` (FK -> comments.id, nullable, cascade), `content` (text), `created_at`, `updated_at`.
- `post_likes`: `id`, `post_id` (FK), `user_id` (FK), `created_at`. Unique key on `(post_id, user_id)`.
- `comment_likes`: `id`, `comment_id` (FK), `user_id` (FK), `created_at`. Unique key on `(comment_id, user_id)`.
- `drafts`: `id`, `user_id` (FK), `category_id` (FK), `post_id` (FK -> posts.id, nullable), `title` (nullable), `content` (nullable), `tags` (JSON, nullable), `created_at`, `updated_at`. Unique index on `(user_id, category_id, post_id)`.
- `reports`: `id`, `user_id` (FK), `reportable_type` (string), `reportable_id` (bigint), `reason` (text), `status` (tinyInteger, default: 1), `resolved_by` (FK -> users.id, nullable), `resolved_at` (nullable), `created_at`, `updated_at`.

### 2. Models & Relationships (NEW)
Define the following Models in `backend/app/Models/` with proper properties and relationships:
- **Category**: `hasMany` Posts, `hasMany` Drafts.
- **Post**: `belongsTo` User, `belongsTo` Category, `hasMany` Comments, `belongsToMany` Tags (via `post_tag`), `hasMany` Likes (`post_likes`).
- **Tag**: `belongsToMany` Posts.
- **Comment**: `belongsTo` Post, `belongsTo` User, `belongsTo` Parent (`Comment`), `hasMany` Replies (`Comment`), `hasMany` Likes (`comment_likes`).
- **PostLike** / **CommentLike**: `belongsTo` User, `belongsTo` Post / Comment.
- **Draft**: `belongsTo` User, `belongsTo` Category, `belongsTo` Post (nullable).
- **Report**: `belongsTo` User, MorphTo `reportable` (Post / Comment), `belongsTo` Resolver (User).

All Models must include the `LogsActivity` trait as per `BR-G002` (System Activity Audit Trail).

### 3. Enums (NEW)
Define enums in `backend/app/Enums/`:
- **PostStatus (backed int)**:
  - `PENDING = 1`
  - `PUBLISHED = 2`
  - `REJECTED = 3`
  - Needs `label()` method supporting localization key: `enums.post_status.*`.
- **ReportStatus (backed int)**:
  - `PENDING = 1`
  - `RESOLVED = 2`
  - `DISMISSED = 3`
  - Needs `label()` method supporting localization key: `enums.report_status.*`.

### 4. Spatie Permission role update (MODIFY)
Add `moderator` to the `UserRole` enum if exist, or update role seeders to seed:
- `admin`
- `moderator`
- `member`

### 5. Seeders (NEW)
- **CategorySeeder**: Seed 5 standard AI Categories (e.g., "Generative AI", "Prompts Engineering", "AI Coding Agents", "NLP", "Computer Vision").
- **TagSeeder**: Seed 10 common AI tags (e.g., "chatgpt", "midjourney", "claude", "cursor", "laravel", "nextjs").
- **RoleSeeder**: Seed Spatie roles (`admin`, `moderator`, `member`).

---

## Testing Hints
- Verify migration constraints by rolling back and running them again.
- Database test schema verification using PHPUnit models assertion.

---

## Status
- [x] Create Category model, migration, seeder.
- [x] Create Tag and Post model, migrations, seeders, pivot table.
- [x] Create Comment, PostLike, CommentLike models and migrations.
- [x] Create Draft model, migration, unique index constraint.
- [x] Create Report model, morph relation migration.
- [x] Create `PostStatus` and `ReportStatus` backed Enums.
- [x] Update `UserRole` enum and seed roles (`admin`, `moderator`, `member`).
- [x] Run `php artisan migrate:rollback` and migrate again to verify `down()` methods.
- [x] Run `php artisan code:format`.

---

## Acceptance Criteria
1. Databases migrations run without errors and create all 9 tables.
2. Models have the correct relationship bindings matching the schema.
3. Every pivot/secondary table has an `id` PK column.
4. Auto-save unique constraint `(user_id, category_id, post_id)` is enforced at DB index level.
5. `moderator` role exists in the roles table.

---

## Error Scenarios
- Duplicate draft insertion for the same user, category, and post → DB returns unique constraint violation.
- Non-existent parent comment ID for reply comment → DB returns foreign key constraint violation.

---

## Dependencies
- None
