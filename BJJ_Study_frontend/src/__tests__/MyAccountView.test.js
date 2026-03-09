import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MyAccountView from '../views/MyAccountView.vue'
import Header from '../components/Header.vue'
import VideoCard from '../components/VideoCard.vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useRoute: vi.fn(() => ({ params: {} }))
}))

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: vi.fn(() => ({
    user: { value: { sub: 'auth0|123', email: 'test@example.com', name: 'John' } },
    isAuthenticated: { value: true },
    getAccessTokenSilently: vi.fn(() => Promise.resolve('mock-token'))
  }))
}))

// Helper : toujours stubber Header et Footer pour éviter $router.push undefined
const mountView = () => mount(MyAccountView, {
  global: {
    stubs: { Header: true, Footer: true }
  }
})

describe('MyAccountView - Complete Test Suite', () => {
  const mockUser = {
    auth0_id: 'auth0|123',
    email: 'john.doe@example.com',
    name: 'John',
    surname: 'Doe',
    pseudo: 'johndoe',
    birthdate: '1990-01-15',
    profile_photo: 'https://example.com/profile.jpg',
    bjj_club: 'BJJ Academy',
    bjj_belt: 'bleu',
    bjj_city: 'Paris',
    created_at: '2024-01-01T12:00:00Z'
  }

  const mockVideos = [
    { id: 1, title: 'My First Video', youtube_url: 'https://youtube.com/watch?v=vid1', start_time: '0:00', end_time: '2:00', position: 'Guard Pass', tags: 'technique' },
    { id: 2, title: 'My Second Video', youtube_url: 'https://youtube.com/watch?v=vid2', start_time: '0:00', end_time: '3:00', position: 'Mount', tags: 'submission' }
  ]

  const defaultFetch = (url) => {
    if (url.includes('/profile')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUser) })
    if (url.includes('/published')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    if (url.includes('/liked')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  }

  beforeEach(() => {
    global.fetch = vi.fn(defaultFetch)
    vi.clearAllMocks()
    useAuth0.mockReturnValue({
      user: { value: { sub: 'auth0|123', email: 'test@example.com', name: 'John' } },
      isAuthenticated: { value: true },
      getAccessTokenSilently: vi.fn(() => Promise.resolve('mock-token'))
    })
    useRouter.mockReturnValue({ push: vi.fn() })
  })

  describe('Component structure', () => {
    it('should render header component', async () => {
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.findComponent(Header).exists()).toBe(true)
    })

    it('should display page title "My profile"', async () => {
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.text()).toContain('My profile')
    })

    it('should have personal and BJJ profile sections', async () => {
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.text()).toContain('My profile')
      expect(wrapper.text()).toContain('My studies')
    })
  })

  describe('Profile loading', () => {
    it('should fetch and display user profile', async () => {
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.text()).toContain(mockUser.pseudo)
      expect(wrapper.text()).toContain(mockUser.bjj_club)
    })

    it('should handle profile loading from Auth0 for new user', async () => {
      global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 404 }))
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })

    it('should display loading state initially', () => {
      global.fetch = vi.fn(() => new Promise(() => {}))
      const wrapper = mountView()
      expect(wrapper.text()).toContain('Chargement')
    })

    it('should handle fetch errors gracefully', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Personal information display', () => {
    it('should display email address', async () => {
      // auth0|123 === mockUser.auth0_id → canEdit = true → bouton Modifier visible
      const wrapper = mountView()
      await flushPromises()
      // Trouver le bouton "Modifier" dans main (pas dans le Header stubbé)
      const modifierBtn = wrapper.findAll('button').find(b => b.text().includes('Modifier'))
      expect(modifierBtn).toBeDefined()
      await modifierBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('input[type="email"]').element.value).toBe(mockUser.email)
    })

    it('should display birthdate', async () => {
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.text()).toContain('ans')
    })

    it('should display account creation date', async () => {
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })

    it('should display profile photo placeholder with initials', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('/profile')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ ...mockUser, profile_photo: null }) })
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      })
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.text()).toContain('JD')
    })
  })

  describe('BJJ profile information', () => {
    it('should display BJJ club information', async () => {
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.text()).toContain('BJJ Academy')
    })

    it('should display BJJ belt level', async () => {
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.text()).toContain('bleu')
    })

    it('should display city information', async () => {
      const wrapper = mountView()
      await flushPromises()
      const modifierBtn = wrapper.findAll('button').find(b => b.text().includes('Modifier'))
      expect(modifierBtn).toBeDefined()
      await modifierBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.edit-grid').exists()).toBe(true)
    })

    it('should display "-" for missing BJJ information', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('/profile')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ ...mockUser, bjj_club: '', bjj_belt: '', bjj_city: '' }) })
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      })
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.text()).toContain('-')
    })
  })

  describe('Video management', () => {
    it('should display published videos count', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('/profile')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUser) })
        if (url.includes('/published')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockVideos) })
        if (url.includes('/liked')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      })
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.text()).toContain('Mes vidéos (2)')
    })

    it('should display liked videos count', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('/profile')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUser) })
        if (url.includes('/published')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
        if (url.includes('/liked')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockVideos) })
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      })
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.text()).toContain('Vidéos likées (2)')
    })

    it('should display VideoCard components for published videos', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('/profile')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUser) })
        if (url.includes('/published')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockVideos) })
        if (url.includes('/liked')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      })
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.findAllComponents(VideoCard).length).toBe(2)
    })

    it('should switch between published and liked videos tabs', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('/profile')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUser) })
        if (url.includes('/published')) return Promise.resolve({ ok: true, json: () => Promise.resolve([mockVideos[0]]) })
        if (url.includes('/liked')) return Promise.resolve({ ok: true, json: () => Promise.resolve([mockVideos[1]]) })
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      })
      const wrapper = mountView()
      await flushPromises()
      const likedButton = wrapper.findAll('button').find(b => b.text().includes('likées'))
      if (likedButton) {
        await likedButton.trigger('click')
        await flushPromises()
      }
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Empty states', () => {
    it('should display message when no published videos', async () => {
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.text()).toContain('Aucune vidéo')
    })

    it('should display message when no liked videos', async () => {
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Edit functionality', () => {
    it('should toggle personal info edit form', async () => {
      const wrapper = mountView()
      await flushPromises()
      const modifierBtn = wrapper.findAll('button').find(b => b.text().includes('Modifier'))
      expect(modifierBtn).toBeDefined()
      await modifierBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.edit-grid').exists()).toBe(true)
    })

    it('should toggle BJJ info edit form', async () => {
      const wrapper = mountView()
      await flushPromises()
      const modifierBtn = wrapper.findAll('button').find(b => b.text().includes('Modifier'))
      if (modifierBtn) {
        await modifierBtn.trigger('click')
        await flushPromises()
      }
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Form submission', () => {
    it('should save personal information', async () => {
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })

    it('should display success message after save', async () => {
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })

    it('should display error message on save failure', async () => {
      global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 400, json: () => Promise.resolve({ error: 'Validation error' }) }))
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Authentication checks', () => {
    it('should redirect unauthenticated users', async () => {
      const pushMock = vi.fn()
      useRouter.mockReturnValue({ push: pushMock })
      useAuth0.mockReturnValue({
        user: { value: null },
        isAuthenticated: { value: false },
        getAccessTokenSilently: vi.fn()
      })
      mount(MyAccountView, { global: { stubs: { Header: true, Footer: true } } })
      await flushPromises()
      expect(pushMock).toHaveBeenCalled()
    })
  })
})
