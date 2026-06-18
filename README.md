# 🤖 Hướng Dẫn Sử Dụng Beki AI Agents (Workflows & Skills)

Dự án Beki AI sử dụng hệ thống các AI Agents để chuẩn hóa và tăng tốc quá trình lập trình. Để sử dụng hệ thống AI một cách hiệu quả nhất, bạn cần nắm rõ ba khái niệm cốt lõi: **Skills** (Kỹ năng/Tiêu chuẩn), **Workflows** (Quy trình làm việc) và **Feature Development Flow** (Quy trình phát triển tính năng).

---

## 1. 🚀 Quy Trình Phát Triển Tính Năng (Feature Development Flow)

Đây là quy trình chuẩn "đầu-đến-cuối" (end-to-end) để chuyển đổi một ý tưởng thô thành sản phẩm hoàn chỉnh trong dự án:

1.  **Phân tích yêu cầu sơ bộ (Draft Analysis):**
    *   Bạn đặt file yêu cầu thô (ví dụ: `new-feature.md`) vào thư mục `docs/draft/`.
    *   Sử dụng lệnh: `/pm-analyze-draft-req`.
    *   **Kết quả:** Một bản đặc tả kỹ thuật chuẩn chỉnh được tạo ra trong `docs/requirements/`.

2.  **Phân rã tác vụ (Task Decomposition):**
    *   Sau khi có bản đặc tả, bạn yêu cầu AI chia nhỏ nó thành các bước thực hiện.
    *   Sử dụng lệnh: `/pm-decompose-req-to-tasks`.
    *   **Kết quả:** Các file task nhỏ (TODO list) được tạo ra trong thư mục `docs/tasks/`.

3.  **Thực thi tác vụ (Task Execution):**
    *   **Backend** — yêu cầu AI thực hiện từng file task bằng các workflow chuyên dụng:
        *   `/execute-api-task`: Để phát triển API.
        *   `/execute-database-task`: Để tạo Migration, Model, Seeder, Enum.
        *   `/execute-job-task`: Để tạo Background Job.
        *   `/execute-command-task`: Để tạo Artisan Command.
    *   **Frontend** — yêu cầu AI thực hiện task bằng các skill trong `/.agents/skills/bks-fe-*` (xem mục 3.1). Thứ tự khuyến nghị:
        1.  `bks-fe-implement-feature` — scaffold feature (form / list / CRUD / detail).
        2.  `bks-fe-ds-sdk-consumer` — UI theo `@bks/ds-system-sdk` (AI tự nạp khi viết UI).
        3.  `bks-fe-api-integration` — ghép API thật (repository, Zod, 422, toast).
        4.  `bks-fe-list-url-state` — đồng bộ filter/pagination với URL (list page).
        5.  `bks-fe-create-tc-component` + `bks-fe-create-tc-flow` — viết test Vitest + Playwright.
    *   **Kết quả:** Code hoàn chỉnh, Test case và tài liệu logic (`docs/logic/`).

---

## 2. ⚡ Workflows (Quy trình làm việc chi tiết)

**Workflows** là các kịch bản hướng dẫn AI thực hiện các bước cụ thể phù hợp với tiêu chuẩn dự án. Tất cả workflows được lưu ở thư mục `/.agents/workflows/`.

### Cách Sử Dụng Workflows (Slash Commands)
Bạn chỉ cần gõ các **Slash Command** vào hộp thoại chat với AI kèm theo đường dẫn file liên quan.

**Các Lệnh Quan Trọng:**
*   `/pm-analyze-draft-req`: Phân tích yêu cầu từ `docs/draft/` -> `docs/requirements/`.
*   `/pm-decompose-req-to-tasks`: Phân rã đặc tả từ `docs/requirements/` -> `docs/tasks/`.
*   `/execute-api-task`: Thực thi task phát triển API (Bắt buộc dùng cho Backend API).
*   `/execute-database-task`: Thực thi task liên quan đến hạ tầng Database.
*   `/execute-job-task`: Thực thi task liên quan đến Background Job.
*   `/execute-command-task`: Thực thi task liên quan đến Artisan Command.

---

## 3. 🎯 Skills (Kỹ năng & Tiêu chuẩn)

**Skills** là tập hợp các quy tắc, tiêu chuẩn mã nguồn mà AI Agent **BẮT BUỘC** phải tuân theo. AI sẽ tự động nạp các skill này khi thực hiện Workflows tương ứng. Tất cả skills nằm trong `/.agents/skills/`.

### Các Skills Chính (Backend)
*   `bks-be-api-standard`: Tiêu chuẩn vàng cho API (Controller → Service → Resource).
*   `bks-be-database-standard`: Tiêu chuẩn cho Migration, Model, Factory, Seeder.
*   `bks-be-testing-standard`: Tiêu chuẩn viết Unit/Feature Test (AAA pattern).
*   `bks-be-job-standard`: Tiêu chuẩn xử lý tác vụ nền và Service delegation.
*   `bks-be-command-standard`: Tiêu chuẩn viết Artisan Command và Scheduling.
*   `bks-doc-logic-standard`: Quy chuẩn viết tài liệu nghiệp vụ (Logic Docs).
*   `bks-requirement-analysis`: Phương pháp luận phân tích yêu cầu từ Draft.
*   `bks-requirement-to-tasks`: Kỹ thuật chia nhỏ task và quản lý phụ thuộc.

### 3.1. Các Skills Frontend (Next.js)

Các skill frontend nằm trong `/.agents/skills/bks-fe-*`. AI **bắt buộc** nạp skill tương ứng trước khi viết code. Bạn có thể @ mention trực tiếp skill hoặc dùng trigger phrase bên dưới.

| Skill | Khi nào dùng | Trigger / Lệnh gợi ý |
|-------|--------------|----------------------|
| [`bks-fe-implement-feature`](.agents/skills/bks-fe-implement-feature/SKILL.md) | **Skill gốc** — triển khai feature FE end-to-end: phân loại flow (A form / B list / C CRUD / D detail), Q&A, design system, form, list, pre-merge checklist | *"implement feature"*, *"làm màn hình CRUD"*, *"tạo feature frontend"* |
| [`bks-fe-api-integration`](.agents/skills/bks-fe-api-integration/SKILL.md) | Ghép API: repository pattern, Zod runtime guard, RHF validation, hook orchestration, map 422 → `setError`, toast policy | *"api-integration"*, *"ghép api"*, *"tích hợp api"*, *"kết nối api"* |
| [`bks-fe-ds-sdk-consumer`](.agents/skills/bks-fe-ds-sdk-consumer/SKILL.md) | UI với `@bks/ds-system-sdk`: component, layout, typography, filter toolbar, table card, badge, upload | Tự kích hoạt khi viết UI; hoặc @ mention skill |
| [`bks-fe-list-url-state`](.agents/skills/bks-fe-list-url-state/SKILL.md) | List page: filter + pagination đồng bộ URL (`useSearchParams`), reload/share link/Back-Forward giữ state | *"sync filter với URL"*, *"list url state"*, refactor list page |
| [`bks-fe-create-tc-component`](.agents/skills/bks-fe-create-tc-component/SKILL.md) | Unit/integration test Vitest: render, validation, hook, MSW — **chỉ** file trong `__tests__/` | *"create-tc-component"*, *"viết unit test"*, *"tạo vitest"* |
| [`bks-fe-create-tc-flow`](.agents/skills/bks-fe-create-tc-flow/SKILL.md) | E2E Playwright: redirect, auth guard, cookie, navigation — **chỉ** file trong `e2e/` | *"create-tc-flow"*, *"viết testcase flow"*, *"tạo test e2e"* |

#### Quan hệ giữa các skill Frontend

```
bks-fe-implement-feature  (orchestrator — bắt đầu từ đây)
    ├── bks-fe-ds-sdk-consumer      (UI/UX — mọi màn hình)
    ├── bks-fe-api-integration      (API — bắt buộc trước khi viết hook/repository)
    ├── bks-fe-list-url-state       (list page có filter/pagination + URL)
    ├── bks-fe-create-tc-component  (Vitest — component/logic)
    └── bks-fe-create-tc-flow       (Playwright — flow/URL/cookie)
```

#### Chi tiết từng skill

**`bks-fe-implement-feature`** — Single source of truth cho feature frontend.

- Phân loại **độ phức tạp**: Simple / Standard / Complex.
- Phân loại **flow**: A (form only), B (list only), C (full CRUD), D (detail/read).
- **i18n bắt buộc** — không hardcode string.
- Create/edit mặc định = **modal dialog** (`FormDialogContent`, max-width 720px).
- Pre-merge: `pnpm lint`, checklist 🔴/🟡/🟢.
- Tham chiếu mẫu: `frontend/features/auth/` (feature hiện có); list + URL sync theo skill → pattern `*-list-query.ts`, `use-*.ts`, `*-filters-toolbar.tsx` (skill tham chiếu `features/users/`).

**`bks-fe-api-integration`** — Luồng API đầy đủ cho một feature.

- Repository: abstract + `http-*` adapter (+ optional mock/factory).
- `validateResponse()` **trước** Zod parse (bắt HTTP 200 fake-error / 422).
- Hook: `create` / `update` / `delete` / `fetchList`; 422 → `mapBackendErrors`, **không** toast.
- Form: truyền `setError`; **không** dùng `useEffect` + `reset()` sync `defaultValues`.
- Dialog: `{open && <FeatureForm ... />}` để unmount/remount form.

**`bks-fe-ds-sdk-consumer`** — Chuẩn UI với Design System SDK.

- **Đọc 9 file references** trước khi viết UI (setup, typography, component-rules, layout, filter-toolbar, pagination, badge, component-detection, wireframe).
- Ưu tiên SDK exports; `size="default"` trừ khi spec yêu cầu khác.
- List: filter toolbar (không stack dọc); table card `overflow-hidden border-border p-0 gap-0`.
- Form: `Field` + `FieldLabel` + `FieldContent`; scroll container có `custom-scrollbar`.

**`bks-fe-list-url-state`** — URL là single source of truth cho list.

- Param search = `q` (map `filters.search` trong code).
- Omit giá trị mặc định khỏi URL; `router.replace` + `{ scroll: false }`.
- Debounce search 300ms; Zod parse URL → safe defaults khi invalid.
- File mẫu (theo skill): `*-list-query.ts`, `use-*.ts`, `*-filters-toolbar.tsx` trong `frontend/features/<feature>/`.

**`bks-fe-create-tc-component`** — Vitest (component/logic).

- **Scope cứng:** chỉ `__tests__/` — **cấm** `e2e/` và `*.spec.ts`.
- Tối thiểu **≥ 10 VT** (logic) + **≥ 10 VT-DS** (design token) = **≥ 20 TC** mỗi lần chạy.
- Domain: render, validation, loading, store/MSW, accessibility — **không** assert URL/cookie thật.
- Chạy: `pnpm test:unit __tests__/tests/<domain>/<feature>.test.tsx`

**`bks-fe-create-tc-flow`** — Playwright E2E (flow thật).

- **Scope cứng:** chỉ `e2e/` — **cấm** `__tests__/` và `*.test.tsx`.
- Tối thiểu **≥ 10 TC** (PW-01..N): redirect, auth guard, cookie, API intercept.
- Recon DOM trước khi viết selector; Page Object Model.
- Chạy: `pnpm test:e2e e2e/tests/<domain>/<feature>.spec.ts`

> **Phân chia test Vitest vs Playwright:** Vitest = component/logic/state; Playwright = navigation/URL/cookie/auth guard. Hai skill **không trùng** TC — dùng `__tests__/coverage-maps/<domain>.<feature>.md` để theo dõi.

#### Lệnh kiểm tra Frontend thường dùng

| Lệnh | Mục đích |
|------|----------|
| `cd frontend && pnpm lint` | Lint trước merge |
| `cd frontend && pnpm build` | Build production |
| `pnpm test:unit` | Vitest unit/integration |
| `pnpm test:e2e` | Playwright E2E |
| `pnpm quality:check` | Typecheck + lint + format + test |

---

## 💡 Lưu Ý Quan Trọng

1.  **Luôn bắt đầu từ Workflow:** Đừng yêu cầu AI "viết code ngay". Hãy đi đúng quy trình: **Draft -> Requirements -> Tasks -> Execution**.
2.  **Double Documentation:** Mọi thay đổi logic phải được cập nhật vào cả code và tài liệu Markdown trong `docs/logic/`.
3.  **Kiểm tra Tasks:** Trước khi chạy `/execute-xxxx-task` (backend) hoặc skill `bks-fe-*` (frontend), hãy đảm bảo file task có đầy đủ thông tin (workflow/skill cần dùng, flow A/B/C/D, data mode http/mock).
4.  **Review Plan:** Luôn đọc kỹ "Implementation Plan" của AI trước khi cho phép nó sửa đổi file.
5.  **Frontend — @ mention skill:** Khi làm FE, @ skill cụ thể (ví dụ `@.agents/skills/bks-fe-implement-feature`) giúp AI nạp đúng tiêu chuẩn ngay từ đầu.
6.  **Test — đúng skill, đúng thư mục:** Vitest (`bks-fe-create-tc-component` → `__tests__/`), Playwright (`bks-fe-create-tc-flow` → `e2e/`). Không trộn hai loại trong cùng một skill.

Chúc bạn xây dựng dự án Beki AI hiệu quả! 🚀
