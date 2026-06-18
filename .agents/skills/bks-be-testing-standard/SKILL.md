---
name: bks-be-testing-standard
description: Comprehensive backend testing standards for Laravel (PHPUnit). Covers Feature Tests, Unit Tests, Performance Testing (N+1 queries, response time), Security Testing (SQL injection, IDOR, XSS, rate limiting), Integration Testing, Concurrency (optimistic locking, race conditions), API Contract Testing, Data Integrity (migrations, soft delete, audit trail), and Edge Cases. Use this skill whenever writing tests, ensuring code coverage, validating API responses, testing database operations, implementing security checks, or handling concurrent operations in Laravel applications. Also use this skill when updating existing tests after logic changes — it supports both full test creation and partial update workflows.
---

# Laravel Backend Testing Standards

This skill provides a mandatory workflow for writing and maintaining comprehensive tests in Laravel applications. It supports two execution modes: **Full Workflow** (writing tests from scratch) and **Partial Update** (updating existing tests after logic changes).

> [!IMPORTANT]
> Every significant piece of code should have at least one corresponding test. If a full Feature Test is too complex, fall back to Unit Testing each key Service method.

---

## Step 0: Determine Execution Mode

Before starting any work, determine which workflow to follow:

```
Do tests already exist for this feature?
├── NO  → Full Workflow (Steps 1–7)
└── YES → Has the application logic changed and tests need updating?
          ├── YES → Partial Update Workflow (see "Partial Update Workflow" section below)
          └── NO  → Clarify the task with the user
```

If the user explicitly says they want to write tests from scratch, always use the Full Workflow regardless of whether tests exist.

---

## Full Workflow

### Step 1: Decide Test Type

```
Is the feature an HTTP endpoint?
├── YES → Can you test the full request cycle end-to-end?
│         ├── YES → Feature Test
│         └── NO  → Feature Test for HTTP layer + Unit Tests for Service methods
└── NO  → Is it Service logic, calculations, or background jobs?
          └── YES → Unit Test
```

**Fallback Rule**: When Feature Tests are impractical (3rd-party APIs, OAuth, complex flows), write Unit Tests covering each key Service method. Every branch, happy path, and unhappy path should be tested.

---

### Step 2: Read the Required Reference Files

Based on the test type decided in Step 1, you **MUST** read the corresponding reference file before writing any test code. These files contain structure templates, mandatory techniques, and concrete examples that are essential.

**Always read first:**
1. Read `references/test-reporting.md` — Contains the **mandatory report format** and template. You need to understand this format BEFORE writing tests so you can track results correctly as you work.

**For Feature Tests (HTTP endpoints):**
1. Read `references/feature-tests.md` — Contains the structure template, test design techniques (EP, BVA, Validation Matrix, Decision Table, State Transition), mandatory assertions, and negative case requirements.

**For Unit Tests (Service logic):**
1. Read `references/unit-tests.md` — Contains the structure template, mocking rules, and when-to-use guidance.

**Additionally, read these reference files when the corresponding area is relevant to your test:**

| When this applies | Read this file |
|---|---|
| Endpoints with database queries or large datasets | `references/performance-testing.md` |
| Endpoints with user input or multi-tenant data | `references/security-testing.md` |
| Features with side effects (events, notifications, transactions) | `references/integration-concurrency.md` |
| API response contracts, soft delete, migrations, edge cases | `references/contract-integrity-edge.md` |

> [!IMPORTANT]
> Do NOT proceed to writing tests without reading the relevant reference files. The techniques documented there (especially EP, BVA, and the Validation Matrix for Feature Tests) are mandatory — not optional.

---

### Step 3: Analyze Source Code

Before designing test cases, read and analyze these source files:

1. **`FormRequest`'s `rules()` method** — Identify EVERY validation rule across all fields.
2. **Custom Rules** — Check for custom rule classes and analyze their internal success/failure paths.
3. **`Service` and `Controller` logic** — Identify all logic branches (`if`, `ternary`, `match`, `switch`).
4. **`Policy` class** — Understand authorization logic and permission scopes.
5. **`Model` relationships** — Identify eager-loading requirements and side effects.

---

### Step 4: Design Test Cases Using Required Techniques

For Feature Tests, you MUST apply these techniques from `references/feature-tests.md`. The reason these techniques matter is that they systematically eliminate gaps — without EP you might over-test valid inputs, without BVA you'll miss off-by-one errors, and without the Validation Matrix you'll forget to test nullable vs required fields.

#### Validation Matrix (Mandatory for every FormRequest)
Read each field's validation rules, then **group test cases by rule type** — not by field. This means one test function per rule type that validates all fields sharing that rule, rather than one test function per field per rule. This reduces redundancy while maintaining full coverage.

For example, if `name` and `email` both have the `required` rule, write ONE test `test_store_fails_when_required_fields_are_missing` that sends a payload without both fields and asserts both appear in the validation errors — NOT two separate tests for each field.

Design test cases for these rule categories:
- **Required Rule**: One test that omits ALL required fields at once and asserts each one appears in the validation error response
- **Nullable Rule**: One test that sends `null` for each nullable field (can combine into one test if they share the same nullable behavior)
- **Data Type Rules** (`integer`, `boolean`, `array`, `string`): One test per type constraint that sends wrong-type values for all fields sharing that type
- **Format Rules** (`email`, `url`, `regex`): One test per format rule that sends incorrectly formatted values for all fields sharing that format
- **Business Rules** (`unique`, `exists`): One test per business rule — e.g., one test for all `unique` violations, one test for all `exists` violations
- **Enum Rules**: One test that sends an invalid enum value for all enum fields at once
- **Conditional Rules** (`required_if`, `required_with`, `required_unless`): One test per conditional rule group, testing both condition-met and condition-not-met scenarios
- **BVA/Max Length Rules**: One test that sends max+1 values for all fields sharing the same max length constraint. Group fields by same max length boundary where practical.

> [!IMPORTANT]
> The key principle is: **same rule = same test function**. The only exception is when a field requires a unique test setup (e.g., `unique` rule needs pre-seeded data, `exists` rule needs a foreign key) that cannot be combined with other fields' setup in a single request. In that case, create a separate test for that field's specific setup need, but still avoid creating separate tests for fields that CAN be tested together.

#### Equivalence Partitioning (EP)
Pick **one representative value** for each valid and invalid partition to reduce test case count without losing coverage.

#### Boundary Value Analysis (BVA)
Test `min-1`, `min`, `min+1` and `max-1`, `max`, `max+1` for every field with numeric or length constraints.

#### Decision Table (for complex business logic)
Map all input conditions to resulting actions. Test every combination of True/False.

#### State Transition (for status workflows)
Verify valid transitions (Happy Path) and explicitly test INVALID transitions (Negative Path).

> [!TIP]
> See `references/feature-tests.md` for concrete examples of each technique with sample code.

---

### Step 5: Create the Report File

Before writing any tests, create the report file at `docs/testing/{feature_name}.md` with the header. This ensures the report exists before you start tracking results.

```markdown
# Báo cáo Test: [Tên Feature]

## 1. Thông tin chung
- **Ngày test**: YYYY-MM-DD
- **Môi trường**: Local / Testing

## 2. Chi tiết kết quả chạy test
```

---

### Step 6: Write, Run, and Report Per File

This is the most critical step. You process **one test file at a time** through a complete cycle. The key principle is: **report failures BEFORE fixing them**, then update the report after each fix. This two-phase approach guarantees failures are captured in writing — never relying on memory.

```
For each test file:
  1. Write the test file
  2. Run it: php artisan test --filter={TestClassName}
  3. Append results to report IMMEDIATELY (including any failures as-is)
  4. If failures exist → fix one, re-run, update the report entry
  5. Repeat step 4 until all pass
  6. Only then move to the next test file
```

> [!IMPORTANT]
> **Do NOT write all test files first and then run them.** The reason this per-file approach matters is that when you batch-write many test files before running, your context becomes too long and you will lose track of intermediate failures. This has been observed in practice: reports end up showing 100% pass with zero fail history, which is almost certainly incomplete. Process one file at a time to ensure accurate documentation.

#### 6a. Write One Test File

Create a single test file following the conventions below.

**File Organization:**
```text
tests/Feature/
├── Api/                          # API Feature Tests (directly under feature folders, e.g. Api/Auth, Api/Company)
├── Console/                      # Artisan Console Commands integration tests
└── Jobs/                         # Queue background job dispatch integration tests

tests/Unit/
├── Services/                     # Centralized tests for complex service business logic
├── Jobs/                         # Background job execution handler unit tests
├── Rules/                        # Custom Validation Rules tests
└── Helpers/                      # Static Helper utility tests
```

Examples:
- `tests/Feature/Api/Company/CompanyStoreTest.php`
- `tests/Feature/Api/Auth/UserLoginTest.php`
- `tests/Feature/Console/SendRemindersCommandTest.php`
- `tests/Feature/Jobs/ProcessInvoiceJobDispatchTest.php`
- `tests/Unit/Services/AuthServiceTest.php`
- `tests/Unit/Jobs/ProcessInvoiceJobTest.php`
- `tests/Unit/Rules/PasswordRuleTest.php`

**Core Principles:**
- **Framework**: PHPUnit (built into Laravel 13)
- **Isolation**: Every test is independent — use `RefreshDatabase` trait
- **Database**: SQLite `:memory:` for speed (pre-configured in `phpunit.xml`)
- **Pattern**: Follow **AAA** — Arrange → Act → Assert
- **Factories**: Use Model Factories for test data, never hardcode
- **Type Safety**: Assert against constants or Enum values, not raw integers
- **File Isolation**: Each endpoint/action MUST have its own separate test file

**Naming Conventions:**

| Context | Convention | Example |
|---|---|---|
| Feature test class | `{Resource}{Action}Test` | `CompanyStoreTest` |
| Feature method | `test_{subject}_can_{action}_{condition}` | `test_user_can_update_profile_successfully` |
| Unit test class | `{Feature}Test` | `AuthServiceTest` |
| Unit method | `test_{method}_{condition}_returns_{result}` | `test_create_when_email_exists_throws_exception` |

**Mandatory Assertions for Feature Tests:**
1. **HTTP Status Code**: `assertStatus(200 | 201 | 204 | 400 | 401 | 403 | 404 | 422)`
2. **Response Structure**: `assertJsonStructure` or `assertJsonPath` on key fields
3. **Database State** (for mutations): `assertDatabaseHas()` or `assertDatabaseMissing()`
4. **Activity Log** (BR-G002 — for create/update/delete endpoints): Assert an activity record was created
   ```php
   $this->assertDatabaseHas('activity_log', [
       'subject_type' => Company::class,
       'subject_id'   => $company->id,
       'description'  => 'updated',
       'causer_id'    => $user->id,
   ]);
   ```
5. **Side Effects** (if applicable): Jobs dispatched, Mails sent, Events fired

**Mandatory Negative/Error Cases** — every Feature Test file MUST also cover:
- **Unauthenticated** (`401`): Call without `actingAs`
- **Forbidden** (`403`): Call with a user that lacks permission
- **Validation Error** (`422`): Send invalid/missing fields grouped by rule type (see Validation Matrix in Step 4)
- **Not Found** (`404`): Reference a non-existent resource
- **Business Rule Violation** (`400`): Trigger a known business constraint failure

#### 6b. First Run

```bash
php artisan test --filter={TestClassName}
```

#### 6c. Report Initial Results — BEFORE Fixing

**Immediately after the first run**, append results to `docs/testing/{feature_name}.md` for **every test method**, recording their actual state right now — pass or fail. Use this EXACT format for every single test method — no summarization, no shortcuts:

```markdown
### [N]. `[đường dẫn file test]` ([Mô tả nhóm])

#### Test Case 1: `test_method_that_passed`
- **Nội dung test**: Mô tả ngắn gọn kiểm tra điều gì.
- **Kết quả**: `pass`

#### Test Case 2: `test_method_that_failed`
- **Nội dung test**: Mô tả ngắn gọn kiểm tra điều gì.
- **Kết quả**: `fail`
- **Nguyên nhân**: [Mô tả lỗi thực tế từ output của PHPUnit — error message, expected vs actual, exception thrown]
```

> [!IMPORTANT]
> **Tại sao phải report TRƯỚC KHI fix?** Vì nếu bạn fix trước rồi mới report, bạn sẽ ở trạng thái "mọi thứ đã pass" và chỉ ghi `pass` cho tất cả test cases. Điều này đã xảy ra nhiều lần trong thực tế. Bằng cách ghi nhận fail **ngay lúc nó xảy ra**, bạn đảm bảo report phản ánh đúng quá trình test.

> [!CAUTION]
> **FORBIDDEN FORMATS** — These are real mistakes from past reports. If your output matches ANY of these patterns, it is WRONG:
>
> **❌ Summary counts instead of per-case entries:**
> ```
> ### 2. ContactStoreTest.php
> - **Tổng số test cases**: 14
> - **Đạt**: 14
> - **Không đạt**: 0
> ```
>
> **❌ Bullet-point list with arrow format:**
> ```
> - `test_guest_cannot_store_contact`: Kiểm tra... -> **Pass**
> - `test_user_without_permission`: Kiểm tra... -> **Pass**
> ```
>
> **❌ Custom labels like `Lưu ý sửa lỗi`:**
> If you fixed something (test code, app code, config) to make a test pass, that test FAILED initially. Report it as `fail (Đã khắc phục thành pass)` with `Nguyên nhân` + `Các bước giải quyết`. Do NOT invent labels like `Lưu ý sửa lỗi`.
>
> **❌ Other forbidden patterns:**
> - Summarizing as "100% PASSED (6/6 tests)"
> - Skipping test cases that passed — ALL methods must be listed
> - Grouping as "Lần chạy 1" / "Lần chạy 2"
> - Using `#### Chi tiết test cases:` as a section header
>
> **✅ The ONLY acceptable format is:**
> ```
> #### Test Case N: `test_method_name`
> - **Nội dung test**: [mô tả]
> - **Kết quả**: `pass` hoặc `fail`
> ```
> Every single test method must have its own `#### Test Case N:` entry. No exceptions, no shortcuts, no matter how many tests there are.

#### 6d. Fix and Update Report

If there were failures in step 6c, fix them one by one:

1. Analyze the root cause of the failure
2. Fix the code (test code, application code, or configuration)
3. Re-run: `php artisan test --filter={TestClassName}`
4. **Make a surgical edit** to the report file — change ONLY these specific parts of the existing entry:
   - Change `**Kết quả**: \`fail\`` → `**Kết quả**: \`fail\` (Đã khắc phục thành \`pass\`)`
   - ADD the line `**Các bước giải quyết**:` with the actual steps you took
   - **Keep** the existing `Nguyên nhân` line exactly as written — do NOT remove or modify it

After fixing, the report entry should look like:

```markdown
#### Test Case 2: `test_method_that_failed`
- **Nội dung test**: Mô tả ngắn gọn kiểm tra điều gì.
- **Kết quả**: `fail` (Đã khắc phục thành `pass`)
- **Nguyên nhân**: [Nguyên nhân gốc rễ — giữ nguyên từ bước 6c, KHÔNG XÓA]
- **Các bước giải quyết**:
  1. [Bước 1 đã thực hiện để sửa lỗi]
  2. [Bước 2 nếu cần]
```

> [!CAUTION]
> **NEVER rewrite or replace the entire test file section in the report.** When updating after a fix:
> - ✅ Edit ONLY the `Kết quả` line of the specific test case that was fixed
> - ✅ ADD `Các bước giải quyết` below the existing `Nguyên nhân`
> - ❌ Do NOT select and replace the entire `### [N].` section
> - ❌ Do NOT remove any existing content (especially `Nguyên nhân`)
> - ❌ Do NOT rewrite all entries — only touch the entry that changed

Repeat for each failure until all tests pass.

#### 6e. Validate and Repeat for Next Test File

**Before moving to the next file**, perform this mandatory self-check on the report section you just wrote:

1. **Re-read** the section you appended to the report file
2. **Verify** each of these conditions:
   - Every test method has its own `#### Test Case N:` heading (not a bullet point, not a summary)
   - Every entry has `- **Nội dung test**:` and `- **Kết quả**:` lines
   - Any test you had to fix (changed test code, app code, config, assertion) is marked `fail (Đã khắc phục thành pass)` with `Nguyên nhân` and `Các bước giải quyết` — NOT `pass` with `Lưu ý sửa lỗi`
   - There are no summary lines like `Tổng số test cases: N` or `Đạt: N`
3. **If any violation is found**, fix the report section NOW before continuing

The reason this checkpoint matters is that context drift causes agents to start using shortcuts after the first file. By validating your own output against these rules, you catch format deviations before they propagate to all remaining files.

Only after validation passes, go back to 6a for the next test file.

#### 6f. Final Verification

After all individual test files are done, run the **full test suite** one final time:

```bash
php artisan test --filter={FeaturePrefix}
```

If any new failures appear (regression), fix them and update the report accordingly.

---

### Step 7: Core Checklist — Mandatory Verification

**STOP here.** Before running the validation script, go through every item below. If any item is not satisfied, go back and fix it before proceeding.

- [ ] Each endpoint/action has its own separate test file in `tests/Feature/Api/{Feature}/` (or `tests/Feature/Console/` or `tests/Feature/Jobs/`)
- [ ] Happy path returns correct HTTP status and JSON structure
- [ ] Unauthenticated returns `401`
- [ ] Forbidden (wrong role/ownership) returns `403`
- [ ] Invalid input returns `422` with validation errors
- [ ] Not Found returns `404`
- [ ] Database writes verified with `assertDatabaseHas()`
- [ ] Validation Matrix applied: all rule types tested, grouped by rule type (not per-field per-function)
- [ ] Model Factories used exclusively (no hardcoded data)
- [ ] Full test suite passes: `php artisan test --filter={TestClassName}`
- [ ] Report file at `docs/testing/{feature_name}.md` follows the exact format (every test case has `#### Test Case N` with `Nội dung test` and `Kết quả`)
- [ ] Report is entirely in Vietnamese

---

### Step 8: Run Validation Script

```bash
# Validate test structure compliance
php .agents/skills/bks-be-testing-standard/scripts/validate-test-structure.php /path/to/project
```

See `scripts/validate-test-structure.php` for detailed validation rules.

---

## Partial Update Workflow

Use this workflow when **tests already exist** for a feature, but the application logic has changed (bug fix, new field, modified validation rule, refactored business logic) and some tests need updating.

The goal is efficiency: identify what changed, update only the affected tests, and verify no regression.

### Step P1: Identify Changes

Read the changed source files to understand what logic was modified. Focus on:
- **Which files changed?** (Controller, Service, FormRequest, Model, Policy, Migration)
- **What specific logic changed?** (New validation rule, modified business condition, added field, changed status transition)
- **Are there new code paths** that need new test cases?

### Step P2: Impact Analysis

Based on the changes identified in Step P1, determine which existing test files and test methods are affected:

1. **Read the existing test files** for the feature (e.g. in `tests/Feature/Api/{Feature}/` or `tests/Unit/Services/`).
2. **Map each change to affected tests**:
   - Changed validation rule → affects validation test methods in `{Resource}StoreTest.php` or `{Resource}UpdateTest.php`
   - Changed business logic → affects relevant happy path and error case methods
   - New field added → may need new test methods for validation and response structure
   - Changed authorization → affects permission-related test methods
3. **List the affected test files and methods** before making any changes.

### Step P3: Update Tests

1. **Read the relevant reference files** if the change touches a new area (e.g., read `references/security-testing.md` if the change adds a new input field).
2. **Modify only the affected test methods**. Do NOT rewrite entire test files unless the changes are so extensive that it's more efficient.
3. **Add new test methods** if the change introduces new logic paths that aren't covered by existing tests.
4. **Delete test methods** only if the tested feature/behavior has been removed entirely.

### Step P4: Run, Fix, and Update Report

1. **Run the affected test files first** for fast feedback:
   ```bash
   php artisan test --filter={AffectedTestClassName}
   ```

2. **Fix any failures** — these may come from:
   - Your test updates not matching the new logic correctly
   - The application code change introducing an unintended side effect
   - Existing tests breaking due to the application change (regression discovery!)

3. **Update the existing report file** at `docs/testing/{feature_name}.md`:
   - For **modified test cases**: Update the existing entry, marking it as `pass (Đã cập nhật logic)` if the test was updated to match new behavior, or `fail (Đã khắc phục thành pass)` if a regression was found and fixed.
   - For **new test cases**: Append new entries following the same format.
   - For **removed test cases**: Remove the entry and add a note in section `1. Thông tin chung` explaining what was removed and why.
   - **Do NOT delete existing fail history** from the report — it remains valuable documentation.

4. **Run the full feature test suite** to catch regressions:
   ```bash
   php artisan test --filter={FeaturePrefix}
   ```

5. If any unrelated tests break, fix and document them in the report.

### Step P5: Core Checklist

Go through the **Core Checklist** from Step 7 to verify completeness.

---

## Extended Checklist — Apply When Relevant

The items below are **not required for every test**. Apply them only when the feature involves the corresponding area. Reference the indicated file for detailed guidance.

### Performance (when feature has database queries or large datasets)
- [ ] N+1 queries detected (`assertQueryCountLessThan`) — see `references/performance-testing.md`
- [ ] Response time assertions for critical endpoints

### Security (when feature has user input or multi-tenant data)
- [ ] SQL injection payloads tested (no 500 errors) — see `references/security-testing.md`
- [ ] IDOR attempts return 404/403
- [ ] Mass assignment protection verified
- [ ] XSS payloads escaped in responses

### Integration & Concurrency (when feature has side effects or concurrent access)
- [ ] Cross-service side effects verified (events, notifications) — see `references/integration-concurrency.md`
- [ ] Transaction rollback tested
- [ ] Optimistic locking handles concurrent updates
- [ ] Unique constraints handled gracefully

### Data Integrity & Edge Cases (when feature touches data lifecycle)
- [ ] Response schema validated (no field leakage) — see `references/contract-integrity-edge.md`
- [ ] Soft delete preserves and restores correctly
- [ ] Audit trail captures mutations
- [ ] Boundary values (min/max) handled
- [ ] Unicode and special characters supported
- [ ] Empty collections return consistent structure
- [ ] Timezone and date edge cases covered

### Jobs/Commands (when testing background jobs or artisan commands)
- [ ] Unit Test for `BackgroundService::run()`
- [ ] Happy path with valid DTO
- [ ] Failure/edge case (invalid state, already processed)
- [ ] For Command: `$this->artisan('{signature}')` with valid and invalid input

---