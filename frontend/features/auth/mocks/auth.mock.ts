import { http, HttpResponse, delay, type HttpHandler } from 'msw'
import { BaseMock } from '@/infra/mocks/base-mock'

const MOCK_USER = {
  id: 1,
  name: 'Admin System',
  email: 'admin@example.com',
  status: 1,
  roles: ['admin'],
  permissions: [],
}

// Sanctum SPA mode is cookie-based; in mock mode we emulate the session with a
// simple in-memory flag toggled by login/logout.
let mockSessionActive = false

export class AuthMock extends BaseMock {
  public getHandlers(): HttpHandler[] {
    return [
      // GET /sanctum/csrf-cookie — primes the CSRF cookie (no body)
      http.get('*/sanctum/csrf-cookie', async () => {
        await delay(50)
        return new HttpResponse(null, { status: 204 })
      }),

      // POST /api/auth/login
      http.post('*/api/auth/login', async ({ request }) => {
        await delay(400)
        const body = await request.json() as { email?: string; password?: string }

        // Simulate 500
        if (body.email === '500@example.com') {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        }

        // Simulate invalid credentials
        if (body.email !== 'admin@example.com' || body.password !== 'admin123') {
          return HttpResponse.json({
            success: false,
            message: 'Sai thông tin đăng nhập.',
            errors: null,
            data: null
          }, { status: 401 })
        }

        mockSessionActive = true

        // Sanctum SPA: login returns the current user (MeResource), no token.
        return HttpResponse.json({
          success: true,
          message: 'Đăng nhập thành công.',
          errors: null,
          data: MOCK_USER
        })
      }),

      // POST /api/auth/logout
      http.post('*/api/auth/logout', async () => {
        await delay(200)
        mockSessionActive = false
        return HttpResponse.json({
          success: true,
          message: 'Đăng xuất thành công.',
          errors: null,
          data: null
        })
      }),

      // POST /api/auth/change-password
      http.post('*/api/auth/change-password', async ({ request }) => {
        await delay(400)
        if (!mockSessionActive) {
          return HttpResponse.json({
            success: false,
            message: 'Vui lòng đăng nhập lại để tiếp tục.',
            errors: null,
            data: null
          }, { status: 401 })
        }

        const formData = await request.formData()
        const currentPassword = formData.get('current_password')

        if (currentPassword === 'wrongpassword') {
          return HttpResponse.json({
            success: false,
            message: 'Dữ liệu bạn đã nhập không chính xác. Vui lòng thử lại.',
            errors: {
              current_password: ['Mật khẩu cũ không chính xác.']
            },
            data: null
          }, { status: 422 })
        }

        return HttpResponse.json({
          success: true,
          message: 'Đổi mật khẩu thành công.',
          errors: null,
          data: true
        })
      }),

      // GET /api/auth/me
      http.get('*/api/auth/me', async () => {
        await delay(300)
        if (!mockSessionActive) {
          return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }
        return HttpResponse.json({
          success: true,
          message: 'Success',
          errors: null,
          data: MOCK_USER
        })
      }),
    ]
  }
}
