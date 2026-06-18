import { mockManager } from './mock-manager'
import { AuthMock } from '@/features/auth/mocks/auth.mock'

// Register all mock modules
mockManager.register(new AuthMock())

// Export the combined handlers
export const handlers = mockManager.getAllHandlers()
