---
name: bks-fe-api-integration
description: |
  Hướng dẫn đầy đủ để tích hợp API vào một feature trong dự án Next.js: repository pattern
  (abstract + HTTP adapter + optional mock), Zod client-side validation, runtime response validation,
  xử lý 422 server errors (mapBackendErrors), hook orchestration, và toast policy.
  Đảm bảo logic hoàn chỉnh từ form submit → API call → validate response → map errors → toast.
user-invocable: true
triggers:
  - "api-integration"
  - "ghép api"
  - "tích hợp api"
  - "kết nối api"
  - "api hoàn chỉnh"
allowed-tools: [Read, Glob, Grep, Bash, Edit, Write, ReadLints]
---

# API Integration Skill

Skill này bao gồm **toàn bộ luồng API integration** cho một feature:

1. [Repository layer](#1-repository-layer) — abstract + HTTP adapter + Zod response guard
2. [Client-side validation](#2-client-side-validation-zod--react-hook-form) — Zod schema + RHF
3. [Hook orchestration](#3-hook-orchestration) — submit flow, 422 mapping, toast
4. [Form component wiring](#4-form-component-wiring) — setError pattern
5. [Checklist](#5-checklist)

> **Khi nào dùng skill này?**
> - Ghép API thật vào một feature đang mock
> - Xây feature mới cần full API flow (create/update/delete + list)
> - Debug lỗi 422, Zod crash, toast sai, setError không chạy
> - Review API integration của feature đã build

---

## Quick decision

Trước khi bắt đầu, xác định:

| Câu hỏi | Chọn |
|---------|------|
| API đã có hay chưa? | `http` nếu có, `mock` nếu chưa |
| Feature cần switch mock↔http lúc runtime? | `factory` pattern |
| Chỉ cần http? | `single-mode` — `new HttpRepo()` module scope |
| Chỉ mock? | `single-mode` — `useMemo(() => new MockRepo(), [])` trong hook |

---

## 1. Repository layer

### 1.1 File structure

```
features/<feature>/services/
├── <feature>.repository.ts              # Abstract port — hooks phụ thuộc vào đây
├── http-<feature>.repository.ts         # HTTP adapter
├── mock-<feature>.repository.ts         # Mock adapter (khi UI-first hoặc cần factory)
└── <feature>-repository.factory.ts      # Chỉ khi cần switch runtime
```

### 1.2 Abstract repository

```ts
// features/<feature>/services/<feature>.repository.ts
import type { Future } from '@/shared/types/common'
import type { Feature, CreateInput, UpdateInput, FeatureFilters } from '../types/<feature>'

export abstract class FeatureRepository {
  abstract list(filters: FeatureFilters): Future<PaginatedResponse<Feature>>
  abstract getById(id: number): Future<Feature>
  abstract create(input: CreateInput): Future<Feature>
  abstract update(id: number, input: UpdateInput): Future<Feature>
  abstract delete(id: number): Future<void>
}
```

### 1.3 HTTP adapter (đầy đủ patterns)

```ts
// features/<feature>/services/http-<feature>.repository.ts
import type { AxiosResponse } from 'axios'
import { HttpService } from '@/infra/api/http-service'
import type { ResponseData } from '@/shared/types/common'
import { FeatureSchema, FeatureListSchema } from '../schemas/<feature>.schema'
import type { Feature, CreateInput, UpdateInput, FeatureFilters } from '../types/<feature>'
import { FeatureRepository } from './<feature>.repository'

export class HttpFeatureRepository extends FeatureRepository {
  // ─── MANDATORY: HTTP 200 Fake-Error Guard ────────────────────────────────
  // Một số backend trả 422 ẩn trong HTTP 200 body. Gọi TRƯỚC khi Zod parse.
  //
  // ⚠️ PRIORITY ORDER: đọc status_code TỪ BODY TRƯỚC, fallback về res.status.
  //    res.status luôn là 200 (HTTP OK), nên `res.status || data.status_code`
  //    sẽ LUÔN trả về 200 — bỏ lọt 422. Phải đảo ngược thứ tự:
  private validateResponse(res: AxiosResponse<ResponseData<unknown>>) {
    const data = res.data
    // ✅ Đọc body trước — backend nhúng status_code trong HTTP 200 response
    const statusCode = (data as unknown as Record<string, unknown>)?.status_code as number | undefined
      || res.status
    const isError = statusCode === 422 || data?.success === false

    if (isError || statusCode === 401) {
      const error = new Error(data?.message || 'Request failed') as Error & {
        response?: { data?: unknown; status?: number }
      }
      error.response = { data, status: statusCode }
      throw error
    }
  }

  // ─── LIST ─────────────────────────────────────────────────────────────────
  async list(filters: FeatureFilters) {
    // Indexed filter format: filters[0][key]=x&filters[0][data]=y
    const params = this.buildListParams(filters)
    const res = await HttpService.get<unknown, AxiosResponse<ResponseData<PaginatedResponse<Feature>>>>(
      '/api/features',
      params,
    )
    // Validate response — không cần validateResponse cho GET read-only
    res.data.data.data = FeatureListSchema.parse(res.data.data.data)
    return res
  }

  // ─── GET BY ID ────────────────────────────────────────────────────────────
  async getById(id: number) {
    const res = await HttpService.get<unknown, AxiosResponse<ResponseData<Feature>>>(
      `/api/features/${id}`,
    )
    res.data.data = FeatureSchema.parse(res.data.data)
    return res
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(input: CreateInput) {
    const res = await HttpService.post<CreateInput, AxiosResponse<ResponseData<Feature>>>(
      '/api/features',
      input,
    )
    this.validateResponse(res)          // ← TRƯỚC Zod parse (bắt buộc cho mutations)
    res.data.data = FeatureSchema.parse(res.data.data)
    return res
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: number, input: UpdateInput) {
    const res = await HttpService.put<UpdateInput, AxiosResponse<ResponseData<Feature>>>(
      `/api/features/${id}`,
      input,
    )
    this.validateResponse(res)          // ← TRƯỚC Zod parse (bắt buộc cho mutations)
    res.data.data = FeatureSchema.parse(res.data.data)
    return res
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  async delete(id: number) {
    const res = await HttpService.delete<AxiosResponse<ResponseData<void>>>(
      `/api/features/${id}`,
    )
    this.validateResponse(res)
    return res
  }

  // ─── BOOLEAN ENDPOINTS (update/block/unlock/toggle) ───────────────────────
  // ⚠️ Một số endpoint trả `true` nhưng thực tế backend trả object {} hoặc null
  //    trong HTTP 200 body. `z.boolean().parse({})` → ZodError crash.
  //    Dùng union để chấp nhận cả hai, map object → true:
  //
  //    const parsed = z.union([z.boolean(), z.record(z.string(), z.unknown())]).parse(res.data.data)
  //    res.data.data = typeof parsed === 'boolean' ? parsed : true
  //
  // Ví dụ:
  async toggle(id: number) {
    const res = await HttpService.post<unknown, AxiosResponse<ResponseData<boolean>>>(
      `/api/features/${id}/toggle`,
    )
    this.validateResponse(res)
    const parsed = z.union([z.boolean(), z.record(z.string(), z.unknown())]).parse(res.data.data)
    res.data.data = typeof parsed === 'boolean' ? parsed : true
    return res
  }

  // ─── PRIVATE: transform filters → indexed wire format ─────────────────────
  private buildListParams(filters: FeatureFilters) {
    const params = new URLSearchParams()
    const filterEntries: Array<{ key: string; data: string }> = []

    if (filters.search) filterEntries.push({ key: 'search_name', data: filters.search })
    if (filters.status) filterEntries.push({ key: 'status', data: String(filters.status) })

    filterEntries.forEach(({ key, data }, i) => {
      params.set(`filters[${i}][key]`, key)
      params.set(`filters[${i}][data]`, data)
    })

    params.set('orders[0][key]', 'created_at')
    params.set('orders[0][dir]', 'desc')
    params.set('page', String(filters.page ?? 1))
    params.set('per_page', String(filters.perPage ?? 20))

    return params
  }
}
```

> **⚠️ Dấu hiệu nhận biết HTTP 200 Fake Error:**
> Thấy `ZodError: Invalid input: expected ..., received undefined/null` trong stack trace của
> repository method — đây là dấu hiệu backend trả 422 trong HTTP 200 body.
> Fix: gọi `this.validateResponse(res)` TRƯỚC `Schema.parse()`.

### 1.4 Instantiation trong hook

```ts
// HTTP only (default khi API sẵn sàng)
const repo = new HttpFeatureRepository()   // module scope, ngoài hook

// Mock only (UI-first, API chưa sẵn)
const repo = useMemo(() => new MockFeatureRepository(), [])  // trong hook

// Factory (cần switch runtime)
const repo = useMemo(() => createFeatureRepository(options.mode), [options.mode])
```

**Rules:**
- HTTP-only → module scope (`const repo = new Http...()` ngoài function)
- Mock / factory → `useMemo` bên trong hook, `[]` hay `[mode]` dependencies
- **Không bao giờ** vừa có `new HttpRepo()` ở module scope vừa có `MockRepo` trong cùng feature

---

## 2. Client-side validation (Zod + React Hook Form)

### 2.1 Schema file (một file, một hook)

```ts
// features/<feature>/schemas/<feature>.schema.ts
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'

// ── Response schema (runtime guard cho HTTP response) ──────────────────────
export const FeatureSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.enum(['active', 'inactive']),
  // ...thêm các field theo API contract
})

export type Feature = z.infer<typeof FeatureSchema>

export const FeatureListSchema = z.array(FeatureSchema)

// ── Form schema (client-side validation) ──────────────────────────────────
// Đọc references/validation-i18n.md trước khi thêm key mới.
// Cấu trúc: validation.* (template) + <feature>.fields.* (display name)
export const useFeatureSchemas = () => {
  const { t } = useTranslation()

  const schema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .min(1, { message: t('validation.required', { _field_: t('feature.fields.name') }) })
          .max(255, { message: t('validation.max', { _field_: t('feature.fields.name'), max: 255 }) }),

        email: z
          .string()
          .min(1, { message: t('validation.required', { _field_: t('feature.fields.email') }) })
          .email({ message: t('validation.email', { _field_: t('feature.fields.email') }) }),

        status: z.enum(['active', 'inactive'], {
          required_error: t('validation.required', { _field_: t('feature.fields.status') }),
        }),

        // File upload field (optional)
        avatar: z
          .instanceof(File)
          .refine((f) => f.size <= 5 * 1024 * 1024, {
            message: t('validation.file_size', { max: '5MB' }),
          })
          .optional(),
      }),
    [t],
  )

  return { schema }
}

export type FormInput = z.infer<ReturnType<typeof useFeatureSchemas>['schema']>
```

> **i18n keys:** Đọc `references/validation-i18n.md` (trong fe-implement-feature) trước khi thêm key.
> `validation.*` = templates chung. `<feature>.fields.*` = display name. Không hardcode string.

### 2.2 Validate trước khi submit

RHF + zodResolver tự validate trước khi gọi `onSubmit`. Không cần validate thủ công:

```ts
const { handleSubmit, setError, formState, ...form } = useForm<FormInput>({
  resolver: zodResolver(schema),
  defaultValues: {
    name: '',
    email: '',
    status: 'active',
    avatar: undefined,
  },
})

// handleSubmit chỉ gọi onValid khi Zod pass
const onValid = (data: FormInput) => onSubmit(data, setError)
```

---

## 3. Hook orchestration

Hook là nơi duy nhất kết nối form → repository → UI state → toast/error.

### 3.1 Full mutation hook (create + update + delete)

```ts
// features/<feature>/hooks/use-feature.ts
import { useState, useCallback } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { mapBackendErrors } from '@/shared/utils/map-backend-errors'
import { shouldShowToast, toast } from '@/shared/lib/toast'
import { HttpFeatureRepository } from '../services/http-<feature>.repository'
import type { FormInput, FeatureFilters } from '../types/<feature>'

const repo = new HttpFeatureRepository()  // module scope (HTTP-only)

export function useFeature() {
  const [data, setData] = useState<Feature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, perPage: 20, total: 0, totalPages: 0 })
  const [filters, setFiltersState] = useState<FeatureFilters>({ page: 1, perPage: 20 })

  // ── FETCH LIST ────────────────────────────────────────────────────────────
  const fetchList = useCallback(async (f: FeatureFilters = filters) => {
    setIsLoading(true)
    try {
      const res = await repo.list(f)
      setData(res.data.data.data)
      setPagination({
        page: res.data.data.current_page,
        perPage: res.data.data.per_page,
        total: res.data.data.total,
        totalPages: res.data.data.last_page,
      })
    } catch {
      // Lỗi fetch list → ErrorBoundary xử lý
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // ── CREATE ────────────────────────────────────────────────────────────────
  const create = useCallback(async (
    input: FormInput,
    setError: UseFormSetError<FormInput>,
  ): Promise<Feature | null> => {
    setIsSubmitting(true)
    try {
      const res = await repo.create(input)
      if (shouldShowToast(res.data.message)) toast.success(res.data.message)
      await fetchList()
      return res.data.data
    } catch (err: unknown) {
      return handleMutationError(err, setError)
    } finally {
      setIsSubmitting(false)
    }
  }, [fetchList])

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const update = useCallback(async (
    id: number,
    input: FormInput,
    setError: UseFormSetError<FormInput>,
  ): Promise<Feature | null> => {
    setIsSubmitting(true)
    try {
      const res = await repo.update(id, input)
      if (shouldShowToast(res.data.message)) toast.success(res.data.message)
      await fetchList()
      return res.data.data
    } catch (err: unknown) {
      return handleMutationError(err, setError)
    } finally {
      setIsSubmitting(false)
    }
  }, [fetchList])

  // ── DELETE ────────────────────────────────────────────────────────────────
  const remove = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await repo.delete(id)
      if (shouldShowToast(res.data.message)) toast.success(res.data.message)
      await fetchList()
      return true
    } catch (err: unknown) {
      // Delete errors (non-422) — toast generic message hoặc bubble lên ErrorBoundary
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status && status >= 500) throw err
      return false
    }
  }, [fetchList])

  return {
    data,
    isLoading,
    isSubmitting,
    pagination,
    filters,
    setFilters: setFiltersState,
    refetch: fetchList,
    create,
    update,
    delete: remove,
  }
}
```

### 3.2 Error handler (private helper)

```ts
// Trong cùng file hook, KHÔNG export ra ngoài
function handleMutationError<T extends Record<string, unknown>>(
  err: unknown,
  setError: UseFormSetError<T>,
): null {
  const responseData = (err as { response?: { data?: Record<string, unknown> } })?.response?.data
  const status = (err as { response?: { status?: number } })?.response?.status

  if (status === 422) {
    // Backend có thể trả errors qua `errors` hoặc `data` — thử cả hai
    const rawErrors =
      (responseData?.errors as Record<string, string[]> | null) ??
      (responseData?.data as Record<string, string[]> | null)

    // Nếu backend dùng snake_case → camelCase: truyền fieldMap
    // Ví dụ: mapBackendErrors(rawErrors, setError, { old_password: 'oldPassword' })
    mapBackendErrors(rawErrors, setError)

    // ❌ KHÔNG toast.error() khi 422 — field errors hiện inline dưới input rồi
    return null
  }

  // Lỗi khác (5xx, network) → bubble lên ErrorBoundary
  throw err
}
```

### 3.3 Toast policy

| Tình huống | Action |
|-----------|--------|
| Mutation success | `toast.success(res.data.message)` nếu `shouldShowToast(message)` |
| 422 validation | ❌ Không toast — errors hiện inline qua `setError` |
| 5xx / network | Re-throw → ErrorBoundary handle |
| Delete success | `toast.success(res.data.message)` nếu có message |

```ts
// ✅ Đúng
if (shouldShowToast(res.data.message)) toast.success(res.data.message)

// ❌ Sai — hardcode fallback
toast.success(res.data.message || 'Tạo thành công')

// ❌ Sai — toast khi 422
if (status === 422) toast.error('Dữ liệu không hợp lệ')
```

---

## 4. Form component wiring

### 4.1 Props contract

```tsx
// features/<feature>/components/<feature>-form.tsx
import type { UseFormSetError } from 'react-hook-form'
import type { FormInput } from '../types/<feature>'

type Props = {
  defaultValues?: Partial<FormInput>
  mode: 'create' | 'edit'
  isSubmitting: boolean
  onSubmit: (data: FormInput, setError: UseFormSetError<FormInput>) => Promise<void>
  onCancel?: () => void
}
```

### 4.2 useForm setup

```tsx
const { handleSubmit, setError, register, control, formState: { errors } } = useForm<FormInput>({
  resolver: zodResolver(schema),
  defaultValues: defaultValues ?? {
    name: '',
    email: '',
    status: 'active',
  },
})

// Pass setError xuống onSubmit để hook map server errors vào fields
const onValid = (data: FormInput) => onSubmit(data, setError)

return (
  <form onSubmit={handleSubmit(onValid)}>
    {/* fields */}
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? <Spinner /> : t('action.save')}
    </Button>
  </form>
)
```

### 4.3 Form với local state phụ (ví dụ: checkboxes, multi-select)

Khi form có local state ngoài RHF (ví dụ: `checkedModules`, `selectedIds`), **KHÔNG dùng `useEffect` + `reset()`** để sync từ `defaultValues` xuống local state. Pattern này gây bug nghiêm trọng:

**❌ Pattern SAI — gây setError bị xóa:**

```tsx
// NGUY HIỂM: defaultValues thường là object literal mới mỗi render từ parent.
// useEffect chạy lại → reset() xóa sạch toàn bộ form errors.
// setError từ mapBackendErrors không hiện được.
useEffect(() => {
  if (defaultValues) {
    reset({ email: defaultValues.email ?? '', ...defaultValues })
    setCheckedModules(buildChecked(defaultValues.roles))
  }
}, [defaultValues, reset])
```

**✅ Pattern ĐÚNG — lazy useState initializer:**

Vì dialog mount form bằng `{open && <FeatureForm ... />}`, form unmount/remount khi đóng/mở — `useState` lazy init chỉ chạy **một lần** khi mount:

```tsx
// Local state được khởi tạo từ defaultValues CHỈ KHI MOUNT — không chạy lại.
const [checkedModules, setCheckedModules] = useState<Record<number, boolean>>(() => {
  const checked: Record<number, boolean> = {}
  defaultValues?.roles?.forEach((r) => { checked[r.module] = true })
  return checked
})

const { handleSubmit, setError, ...form } = useForm<FormInput>({
  resolver: zodResolver(schema),
  defaultValues: {
    email: '',
    ...defaultValues,  // spread trực tiếp — không cần useEffect reset
  },
})
```

**Tại sao:**
- Parent thường truyền `defaultValues` như `{ email: admin.email, roles: admin.roles }` — object mới mỗi render.
- `useEffect` với dependency `[defaultValues]` sẽ **chạy lại mỗi render** → `reset()` xóa errors.
- `setError` từ `mapBackendErrors` bị nuốt → lỗi 422 không hiện dưới field.
- Lazy init tránh hoàn toàn vấn đề này.

**Dialog container phải mount form có điều kiện:**

```tsx
// Trong parent dialog:
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent ...>
    <DialogHeader>...</DialogHeader>
    {open && (   // ← mount/unmount khi open thay đổi → form reset tự nhiên
      <FeatureForm
        defaultValues={selectedItem ? { email: selectedItem.email } : undefined}
        mode={selectedItem ? 'edit' : 'create'}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
      />
    )}
  </DialogContent>
</Dialog>
```

### 4.3 FieldError rendering

Với RHF + `mapBackendErrors`, errors tự động hiện sau khi `setError` được gọi:

```tsx
<Field className="gap-1">
  <FieldLabel htmlFor="name" required>
    {t('feature.fields.name')}
  </FieldLabel>
  <FieldContent>
    <Input
      id="name"
      {...register('name')}
      aria-invalid={!!errors.name}
    />
  </FieldContent>
  {errors.name && <FieldError>{errors.name.message}</FieldError>}
</Field>
```

### 4.4 Dialog container

```tsx
// Trong dialog page / parent component
const { create, update, isSubmitting } = useFeature()

const handleSubmit = async (data: FormInput, setError: UseFormSetError<FormInput>) => {
  const result = mode === 'create'
    ? await create(data, setError)
    : await update(selectedId!, data, setError)

  if (result) {
    // Success: đóng dialog
    onClose()
    if (mode === 'create') form.reset()
  }
  // Nếu null → 422 đã được map vào setError, dialog vẫn mở cho user sửa
}
```

---

## 5. Checklist

Chạy trước khi merge. **🔴 Blockers phải pass hết.**

### 🔴 Blockers

- [ ] Repository abstract class tồn tại; HTTP adapter extend nó
- [ ] `HttpService` được dùng trong HTTP adapter (không gọi `axios` trực tiếp)
- [ ] `this.validateResponse(res)` được gọi TRƯỚC `Schema.parse()` trong MỌI mutation method
- [ ] **validateResponse đọc `data.status_code` TRƯỚC `res.status`** — không dùng `res.status || data.status_code` (res.status luôn là 200 khi backend fake-error)
- [ ] Zod response schema tồn tại và validate `res.data.data` trước khi return
- [ ] **Boolean endpoints dùng Zod union** — `z.union([z.boolean(), z.record(z.string(), z.unknown())])` thay vì `z.boolean()` (backend có thể trả `{}` hoặc `true`)
- [ ] Hook bắt 422 → `mapBackendErrors(rawErrors, setError)` (không toast.error)
- [ ] Lỗi non-422 được re-throw (bubble up ErrorBoundary)
- [ ] `shouldShowToast` guard được dùng trước mọi `toast.success()`
- [ ] Không có hardcode toast fallback string
- [ ] **Form với local state: KHÔNG dùng `useEffect` + `reset()` để sync từ `defaultValues`** — dùng lazy `useState` initializer (xem §4.3)
- [ ] Dialog mount form có điều kiện: `{open && <FeatureForm ... />}` để form unmount/remount khi đóng/mở

### 🟡 Required

- [ ] **HTTP-only:** `const repo = new HttpRepo()` ở module scope (ngoài hook)
- [ ] **Mock/factory:** `useMemo` bên trong hook
- [ ] Không vừa có `HttpRepo` module scope vừa có `MockRepo` cùng feature
- [ ] `fieldMap` được truyền khi backend snake_case ≠ form camelCase
- [ ] `rawErrors` được trích từ cả `response.data.errors` lẫn `response.data.data`
- [ ] `isSubmitting` riêng cho mutations; `isLoading` riêng cho fetch
- [ ] Form không reset sau 422 (user cần sửa đúng field bị lỗi)
- [ ] i18n: mọi error message qua `t()` — không hardcode

### 🟢 Recommended

- [ ] Auto-check: `rg "toast\.(success|error)\(['\"]"` — kết quả rỗng (không hardcode toast string)
- [ ] Auto-check: `rg "validateResponse" features/<name>` — có trong mọi mutation method
- [ ] `UseFeatureReturn` type được export khi hook dùng ở 2+ file
- [ ] Mock repository có `message` không rỗng trong mọi response (để `shouldShowToast` hoạt động khi dev)

---

## References

| File | Đọc khi |
|------|---------|
| `../bks-fe-implement-feature/references/project-patterns.md` | Cần xem `HttpService` API, response envelope, filter wire format |
| `../bks-fe-implement-feature/references/repository-factory-pattern.md` | Feature cần switch mock↔http lúc runtime |
| `../bks-fe-implement-feature/references/mock-repo-patterns.md` | Viết `Mock<Feature>Repository` |
| `../bks-fe-implement-feature/references/validation-i18n.md` | Thêm hoặc mở rộng key `validation.*` hoặc `<feature>.fields.*` |
| `../bks-fe-react-hook-form-zod/SKILL.md` | Form patterns nâng cao (useFieldArray, conditional fields) |

---

## Real-world references trong codebase

> **⚠️ LƯU Ý (Ví dụ minh hoạ):** Các file dưới đây chỉ là **ví dụ tham khảo** tại thời điểm viết skill. Skill này **KHÔNG** phụ thuộc vào chúng. Nếu các file này bị xoá, đổi tên hoặc refactor trong tương lai, skill vẫn giữ nguyên giá trị. Đừng cố đọc chúng nếu file không tồn tại.

| File (Ví dụ) | Patterns được demo |
|------|-------------------|
| `shared/utils/map-backend-errors.ts` | Util signature |
| `shared/lib/toast.ts` | shouldShowToast helper |
| `features/customers/` | List hook, filter params, pagination |
