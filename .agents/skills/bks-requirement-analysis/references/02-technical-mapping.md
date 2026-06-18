# Technical Mapping

Map business concepts to technical components using project standards.

## Persistence

Propose table schema changes or new tables. Refer to `bks-be-database-standard`.

### Column Table Format

Each table MUST use this format:

```markdown
#### Table: `table_name`

| Column | Type | Length | Null | Unique | Default | Action | Description | Notes |
|--------|------|--------|------|--------|---------|--------|-------------|-------|
| id | bigint | 20 | NO | YES | — | KEPT | Primary key | — |
| name | string | 255 | NO | NO | — | ADDED | Display name | Set to 'Default' |
| email | string | 255 | NO | YES | — | ADDED | User email | — |
| balance | decimal | 12,2 | NO | NO | 0 | MODIFIED | User balance | **Lock**: uses `lockForUpdate` |
| status | tinyInteger| — | NO | NO | 1 | ADDED | User status | See Enum: `UserStatus` |
| deleted_at | timestamp | — | YES | NO | NULL | ADDED | Soft delete | — |
```

**Action values**: `KEPT` | `ADDED` | `MODIFIED` | `DELETED` | `MOVED_TO:{table}` | `MOVED_FROM:{table}` | `SNAPSHOT`

### Primary Key Mandate

EVERY table, including secondary or pivot tables (e.g., `role_user`, `department_user`), MUST explicitly define an `id` column as its Primary Key.

## Security & Authorization

Define who can perform which action (RBAC). Refer to `App\Policies` and Controller & Auth Standards.

## Logic Placement

Determine if a rule belongs in a Controller, Service, Middleware, or a Background Job. Refer to `bks-be-api-standard`.

### Service Layer Organization

| Layer | Location | Registration | Usage |
|-------|----------|--------------|-------|
| **API Layer** | `App\Services\Api\{Module}\` | `ApiFactory` | Logic triggered by HTTP requests |
| **Background Layer** | `App\Services\Background\{Module}\` | `BackgroundFactory` | Logic triggered by Jobs or Artisan Commands |
| **Common Layer** | `App\Services\Common\` | `CommonFactory` | Shared utilities (file upload, webhook dispatch) |

### DTO Requirement

Every API and Background service method that accepts structured input MUST receive a `final readonly` DTO (`App\DTOs\{Layer}\{Module}\{Action}Data`) — NEVER a raw `array`.

> [!CAUTION]
> **FORBIDDEN: Do NOT propose creating new Factory files.** The three factory files (`ApiFactory`, `BackgroundFactory`, `CommonFactory`) are permanent. New services are ADDED as methods to the existing factory — never by creating a new factory class.

### Eloquent Observers Warning

Do NOT propose using Eloquent Observers for critical business events (like Webhook Dispatches or Audit Logging) due to their silent failure during DB bulk-update operations. Explicitly require manual event triggers inside the Service layer.

## Integrations

Define interactions with 3rd-party APIs (Webhooks, Request/Response cycles). Refer to `bks-be-api-standard`.

## Background Jobs

Identify any scheduled tasks, queued jobs, or cron-based logic. Refer to `bks-be-job-standard` and `bks-be-command-standard`.

## Notifications

Map each notification trigger to channel (email/SMS/push), template, and variables.

```markdown
| Trigger Event | Channel | Template/Subject | Variables | Recipient |
|---------------|---------|------------------|-----------|-----------|
| User registers | Email | Registration invitation | `{link}`, `{token}` | User |
| Payment failed | Email | Payment reminder | `{plan_name}`, `{retry_date}` | User |
```

## UI/UX & Frontend (React + Vite)

Define all frontend requirements to ensure seamless integration:

- **Feature Directory**: Files live in `src/features/[feature_name]`.
- **Component Split**:
  - **Page Layout**: Route-level page components.
  - **Client Components**: Forms, interactive widgets, modal handlers.
- **State Management**: Identify if shared state in **Redux Toolkit & Saga** is required.
- **Validation**: Define **Zod** schema fields and error messages (localized).
- **Handling Delays**: How to indicate loading states (spinners, skeleton loaders).
- **User Feedback**: What success/error messages are shown (localized keys required).

> Refer to `fe-ui-standard` for frontend patterns.
