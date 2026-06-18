# 📊 Test Reporting

This reference documents the mandatory format for test reports. Reports are written to `docs/testing/{feature_name}.md` (kebab-case, e.g., `docs/testing/company-management.md`).

> [!IMPORTANT]
> The test report file MUST be written entirely in **Vietnamese**.

## When to Create/Update the Report

- **Full Workflow**: Create the report file header in Step 5, then for each test file follow this two-phase process:
  1. **Phase 1 — Step 6c**: After the first run, write results immediately — including failures as `fail` with `Nguyên nhân`
  2. **Phase 2 — Step 6d**: After fixing a failure, update the entry to `fail (Đã khắc phục thành pass)` and add `Các bước giải quyết`
- **Partial Update Workflow**: Update the existing report file in Step P4 — modify entries for changed tests, add new entries, but never delete existing fail history.

## Report Purpose

The report documents the **complete testing journey** — not just the final state where everything passes. The two-phase approach (report failures first, then update after fixing) ensures failures are always captured. If you report only after fixing, you will naturally default to writing `pass` for everything because that's the current state. A report showing only `pass` for every test case is almost certainly incomplete.

## Report Structure

The report file MUST follow this exact structure:

```markdown
# Báo cáo Test: [Tên Feature]

## 1. Thông tin chung
- **Ngày test**: YYYY-MM-DD
- **Môi trường**: Local / Testing

## 2. Chi tiết kết quả chạy test

### [Tên file Test] (e.g., `tests/Feature/Api/Company/CompanyStoreTest.php`)

#### Test Case 1: `test_user_can_create_company_successfully`
- **Nội dung test**: `test_user_can_create_company_successfully` - Kiểm tra việc người dùng đã đăng nhập với đầy đủ quyền có thể tạo mới công ty thành công với payload hợp lệ và dữ liệu được lưu chính xác trong database.
- **Kết quả**: `pass`

#### Test Case 2: `test_guest_cannot_create_company`
- **Nội dung test**: `test_guest_cannot_create_company` - Kiểm tra việc khách (chưa đăng nhập) sẽ bị từ chối truy cập (mã lỗi 401 hoặc redirect) khi cố gắng tạo mới công ty.
- **Kết quả**: `fail` (Đã khắc phục thành `pass`)
- **Nguyên nhân**: Route của api thiếu middleware guard `auth:sanctum`, dẫn đến việc request không hợp lệ vẫn gọi được vào controller.
- **Các bước giải quyết**:
  1. Cập nhật file `routes/api.php` để đưa route tạo mới công ty vào trong group sử dụng middleware `auth:sanctum`.
  2. Chạy lại test bằng câu lệnh `php artisan test --filter=CompanyStoreTest` để xác nhận test case đã pass hoàn toàn.
```

## Result Classification Rules

Every test case MUST use one of these three result formats:

| Situation | Format | Required Fields |
|---|---|---|
| Test passed on first run | `pass` | `Nội dung test`, `Kết quả` |
| Test failed initially but was fixed | `fail` (Đã khắc phục thành `pass`) | `Nội dung test`, `Kết quả`, `Nguyên nhân`, `Các bước giải quyết` |
| Test still fails | `fail` | `Nội dung test`, `Kết quả`, `Nguyên nhân` |

> [!IMPORTANT]
> Every test that failed at any point during the testing process — even if you later fixed the test code, application code, or configuration to make it pass — MUST be reported as `fail (Đã khắc phục thành pass)` with the root cause and fix steps documented. Do NOT report these as simply `pass`. The value of this report lies in documenting what went wrong and how it was resolved.

## Additional Result Formats for Partial Updates

When updating existing tests after logic changes (Partial Update Workflow), use these additional formats:

| Situation | Format |
|---|---|
| Test updated to match new logic, passes | `pass (Đã cập nhật logic)` |
| Existing test broke due to logic change, then fixed | `fail (Đã khắc phục thành pass - Regression)` with `Nguyên nhân` and `Các bước giải quyết` |
| New test case added during update | Same as normal (`pass` or `fail`) |

## Common Mistakes — Do NOT Do These

These are real mistakes observed in practice. The report format exists for a reason — stakeholders need to see what went wrong and how it was resolved.

### ❌ Mistake 1: Summarizing instead of listing each test case
```markdown
### 2.1 ContactIndexTest
- **Trạng thái**: **100% PASSED** (6/6 tests)
```
This tells the reader nothing. Were there failures during testing? What was tested?

### ✅ Correct: List every test case individually
```markdown
### 1. `tests/Feature/Api/Contact/ContactIndexTest.php` (Danh sách Người liên hệ)

#### Test Case 1: `test_user_unauthenticated_cannot_list_contacts`
- **Nội dung test**: Khách chưa đăng nhập không thể xem danh sách người liên hệ (Trả về 401).
- **Kết quả**: `pass`

#### Test Case 2: `test_user_with_scope_related_can_view_owned_contacts`
- **Nội dung test**: Người dùng có scope RELATED chỉ xem được contacts do mình tạo.
- **Kết quả**: `fail` (Đã khắc phục thành `pass`)
- **Nguyên nhân**: Test setup không gán `created_by` cho contact, dẫn đến scope query trả về rỗng.
- **Các bước giải quyết**:
  1. Thêm `'created_by' => $this->user->id` khi tạo contact trong test.
```

### ❌ Mistake 2: Rewriting the section after fixing, losing fail history
When you fix a test and then rewrite the entire `### [N].` section, the `Nguyên nhân` gets removed. Instead, make a **surgical edit**: only change the `Kết quả` line and add `Các bước giải quyết`.

### ❌ Mistake 3: Using custom formats
Do NOT use "Lần chạy 1" / "Lần chạy 2", "PASSED"/"FAILED", or any format other than the template. The format is: `#### Test Case N:` → `Nội dung test` → `Kết quả` → (if fail) `Nguyên nhân` → `Các bước giải quyết`.

### ❌ Mistake 4: Using bullet-point lists with arrow format
```markdown
### 2. ContactStoreTest.php (Tạo mới Contact)
- **Tổng số test cases**: 14
- **Đạt**: 14
- **Không đạt**: 0

#### Chi tiết test cases:
- `test_guest_cannot_store_contact`: Kiểm tra... -> **Pass**
- `test_user_without_permission`: Kiểm tra... -> **Pass**
```
This format loses all structure. Each test method MUST have its own `#### Test Case N:` heading with `Nội dung test` and `Kết quả` on separate lines. Summary counts like `Tổng số test cases` and `Đạt` are never acceptable.

### ❌ Mistake 5: Using `Lưu ý sửa lỗi` instead of proper fail documentation
```markdown
#### Test Case 1: `test_guest_cannot_list_contacts`
- **Nội dung test**: Kiểm tra...
- **Kết quả**: `pass`
- **Lưu ý sửa lỗi**: Xóa tất cả các user trong DB trước khi chạy...
```
If you changed anything (test code, app code, config, assertion) to make a test pass, that test **failed initially**. The `Lưu ý sửa lỗi` label does not exist in the template. The correct way to document this is:
```markdown
#### Test Case 1: `test_guest_cannot_list_contacts`
- **Nội dung test**: Kiểm tra...
- **Kết quả**: `fail` (Đã khắc phục thành `pass`)
- **Nguyên nhân**: AutoLoginMiddleware tự động đăng nhập user đầu tiên có ID = 1...
- **Các bước giải quyết**:
  1. Xóa tất cả các user trong DB trước khi chạy request...
```

## Format Validation Checklist

Before considering the report complete, verify:
- [ ] Every test method has its own `#### Test Case N:` entry — NO summarization like "100% PASSED (6/6)"
- [ ] Every entry has `Nội dung test` with a description in Vietnamese
- [ ] Every entry has `Kết quả` with the correct classification (`pass`, `fail`, or `fail (Đã khắc phục thành pass)`)
- [ ] Every `fail` entry has `Nguyên nhân` documented
- [ ] Every fixed `fail` entry has `Các bước giải quyết` documented
- [ ] No `Nguyên nhân` was removed during the fix process — fail history is preserved
- [ ] No custom labels like `Lưu ý sửa lỗi` — use `Nguyên nhân` + `Các bước giải quyết` instead
- [ ] No summary counts like `Tổng số test cases` or `Đạt` — every test case must be listed individually
- [ ] Test cases are grouped under their `### [N].` header with file path
- [ ] The report is entirely in Vietnamese
