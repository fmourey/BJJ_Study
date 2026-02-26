import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import Header from '../components/Header.vue'
import { useAuth0 } from '@auth0/auth0-vue'

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: vi.fn()
}))

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
    expect(wrapper.find('.home').exists()).toBe(true)
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
      expect(wrapper.find('.login').exists()).toBe(true)
    })

    it('should display Register button', () => {
      const wrapper = mount(Header)
      expect(wrapper.find('.register').exists()).toBe(true)
    })

    it('should NOT display Logout button', () => {
      const wrapper = mount(Header)
      expect(wrapper.find('.logout').exists()).toBe(false)
    })

    it('should NOT display My Account button', () => {
      const wrapper = mount(Header)
      expect(wrapper.find('.myaccount').exists()).toBe(false)
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
      expect(wrapper.find('.logout').exists()).toBe(true)
    })

    it('should display My Account button', () => {
      const wrapper = mount(Header)
      expect(wrapper.find('.myaccount').exists()).toBe(true)
    })

    it('should NOT display Login button', () => {
      const wrapper = mount(Header)
      expect(wrapper.find('.login').exists()).toBe(false)
    })

    it('should NOT display Register button', () => {
      const wrapper = mount(Header)
      expect(wrapper.find('.register').exists()).toBe(false)
    })
  })

  it('should always display Home button', () => {
    mockUseAuth0.mockReturnValue({
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: ref(false)
    })

    const wrapper = mount(Header)
    const homeBtn = wrapper.find('.home')
    expect(homeBtn.exists()).toBe(true)
    expect(homeBtn.text()).toBe('Accueil')
  })
})
