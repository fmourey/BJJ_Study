import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import Header from '../components/Header.vue'
import { useAuth0 } from '@auth0/auth0-vue'

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: vi.fn()
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useRouter: vi.fn(() => ({ push: vi.fn() })) }
})

describe('Header.vue', () => {
  const mockUseAuth0 = vi.mocked(useAuth0)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the header with correct structure', () => {
    mockUseAuth0.mockReturnValue({
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: ref(false)
    })
    const wrapper = mount(Header)
    expect(wrapper.find('.header').exists()).toBe(true)
    expect(wrapper.text()).toContain('Home')
  })

  describe('When user is NOT authenticated', () => {
    beforeEach(() => {
      mockUseAuth0.mockReturnValue({
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: ref(false)
      })
    })

    it('should display Login button', () => {
      const wrapper = mount(Header)
      expect(wrapper.text()).toContain('Login')
    })

    it('should display Register button', () => {
      const wrapper = mount(Header)
      expect(wrapper.text()).toContain('Sign Up')
    })

    it('should NOT display Logout button', () => {
      const wrapper = mount(Header)
      expect(wrapper.text()).not.toContain('Logout')
    })

    it('should NOT display My Account button', () => {
      const wrapper = mount(Header)
      expect(wrapper.text()).not.toContain('My Profile')
    })
  })

  describe('When user is authenticated', () => {
    beforeEach(() => {
      mockUseAuth0.mockReturnValue({
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: ref(true)
      })
    })

    it('should display Logout button', () => {
      const wrapper = mount(Header)
      expect(wrapper.text()).toContain('Logout')
    })

    it('should display My Account button', () => {
      const wrapper = mount(Header)
      expect(wrapper.text()).toContain('My Profile')
    })

    it('should NOT display Login button', () => {
      const wrapper = mount(Header)
      expect(wrapper.text()).not.toContain('Login')
    })

    it('should NOT display Register button', () => {
      const wrapper = mount(Header)
      expect(wrapper.text()).not.toContain('Sign Up')
    })
  })

  it('should always display Home button', () => {
    mockUseAuth0.mockReturnValue({
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: ref(false)
    })
    const wrapper = mount(Header)
    expect(wrapper.text()).toContain('Home')
  })
})
