import { vi } from 'vitest'

// Mock Auth0 globally
export const mockAuth0 = {
  isAuthenticated: { value: false },
  user: { value: null },
  getAccessTokenSilently: vi.fn(),
  loginWithRedirect: vi.fn(),
  logout: vi.fn()
}

// Setup fetch mock
export const setupFetchMock = () => {
  global.fetch = vi.fn()
}

export const mockFetch = (responses) => {
  global.fetch = vi.fn((url) => {
    for (const [pattern, response] of Object.entries(responses)) {
      if (url.includes(pattern)) {
        return Promise.resolve(response)
      }
    }
    return Promise.reject(new Error(`No mock for ${url}`))
  })
}

// Create mocked Auth0 composable
export function createMockAuth0Composable(options = {}) {
  return {
    isAuthenticated: { value: options.isAuthenticated ?? false },
    user: { value: options.user ?? null },
    getAccessTokenSilently: vi.fn(() => Promise.resolve('mock-token')),
    loginWithRedirect: vi.fn(),
    logout: vi.fn()
  }
}
