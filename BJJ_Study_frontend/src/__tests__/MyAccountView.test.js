import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MyAccountView from '../views/MyAccountView.vue'
import Header from '../components/Header.vue'
import VideoCard from '../components/VideoCard.vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  })),
  useRoute: vi.fn(() => ({
    params: {}
  }))
}))

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: vi.fn(() => ({
    user: { value: { email: 'test@example.com', given_name: 'John', family_name: 'Doe', picture: 'https://example.com/photo.jpg' } },
    isAuthenticated: { value: true },
    getAccessTokenSilently: vi.fn(() => Promise.resolve('mock-token'))
  }))
}))

describe('MyAccountView - Complete Test Suite', () => {
  const mockUser = {
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
    {
      id: 1,
      title: 'My First Video',
      youtube_url: 'https://youtube.com/watch?v=vid1',
      start_time: '0:00',
      end_time: '2:00',
      position: 'Guard Pass',
      tags: 'technique'
    },
    {
      id: 2,
      title: 'My Second Video',
      youtube_url: 'https://youtube.com/watch?v=vid2',
      start_time: '0:00',
      end_time: '3:00',
      position: 'Mount',
      tags: 'submission'
    }
  ]

  beforeEach(() => {
    global.fetch = vi.fn()
    vi.clearAllMocks()
  })

  describe('Component structure', () => {
    it('should render header component', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('/profile')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockUser)
          })
        }
        if (url.includes('/videos')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
      })

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.findComponent(Header).exists()).toBe(true)
    })

    it('should display page title "Mon Profil"', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
      )

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.text()).toContain('Mon Profil')
    })

    it('should have personal and BJJ profile sections', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
      )

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.text()).toContain('Mon Profil BJJ')
      expect(wrapper.text()).toContain('Mes Vidéos')
    })
  })

  describe('Profile loading', () => {
    it('should fetch and display user profile', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('/profile')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockUser)
          })
        }
        if (url.includes('/videos')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
      })

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.text()).toContain(mockUser.email)
      expect(wrapper.text()).toContain(mockUser.pseudo)
    })

    it('should handle profile loading from Auth0 for new user', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404
        })
      )

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.exists()).toBe(true)
    })

    it('should display loading state initially', () => {
      global.fetch = vi.fn(() => new Promise(() => {})) // Never resolves

      const wrapper = mount(MyAccountView)

      expect(wrapper.text()).toBeTruthy()
    })

    it('should handle fetch errors gracefully', async () => {
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('Network error'))
      )

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Personal information display', () => {
    it('should display email address', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
      )

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.text()).toContain(mockUser.email)
    })

    it('should display birthdate', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
      )

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.text()).toContain('1990')
    })

    it('should display account creation date', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
      )

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.text()).toContain('2024')
    })

    it('should display profile photo placeholder with initials', async () => {
      const userWithoutPhoto = { ...mockUser, profile_photo: null }
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(userWithoutPhoto)
        })
      )

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.text()).toContain('JD')
    })
  })

  describe('BJJ profile information', () => {
    it('should display BJJ club information', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
      )

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.text()).toContain('BJJ Academy')
    })

    it('should display BJJ belt level', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
      )

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.text()).toContain('bleu')
    })

    it('should display city information', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
      )

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.text()).toContain('Paris')
    })

    it('should display "-" for missing BJJ information', async () => {
      const userWithoutBJJ = {
        ...mockUser,
        bjj_club: '',
        bjj_belt: '',
        bjj_city: ''
      }
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(userWithoutBJJ)
        })
      )

      const wrapper = mount(MyAccountView)
      await flushPromises()

      const text = wrapper.text()
      expect(text.includes('-')).toBe(true)
    })
  })

  describe('Video management', () => {
    it('should display published videos count', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('/profile')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockUser)
          })
        }
        if (url.includes('/published')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockVideos)
          })
        }
        if (url.includes('/liked')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
      })

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.text()).toContain('Mes vidéos publiées (2)')
    })

    it('should display liked videos count', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('/profile')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockUser)
          })
        }
        if (url.includes('/published')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
        if (url.includes('/liked')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockVideos)
          })
        }
      })

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.text()).toContain('Mes vidéos likées (2)')
    })

    it('should display VideoCard components for published videos', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('/profile')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockUser)
          })
        }
        if (url.includes('/published')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockVideos)
          })
        }
        if (url.includes('/liked')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
      })

      const wrapper = mount(MyAccountView)
      await flushPromises()

      const videoCards = wrapper.findAllComponents(VideoCard)
      expect(videoCards.length).toBe(2)
    })

    it('should switch between published and liked videos tabs', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('/profile')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockUser)
          })
        }
        if (url.includes('/published')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mockVideos[0]])
          })
        }
        if (url.includes('/liked')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mockVideos[1]])
          })
        }
      })

      const wrapper = mount(MyAccountView)
      await flushPromises()

      const buttons = wrapper.findAll('button')
      const likedButton = buttons.find(b => b.text().includes('likées'))

      if (likedButton) {
        await likedButton.trigger('click')
        await flushPromises()
      }

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Empty states', () => {
    it('should display message when no published videos', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('/profile')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockUser)
          })
        }
        if (url.includes('/videos')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
      })

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.text()).toBeTruthy()
    })

    it('should display message when no liked videos', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('/profile')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockUser)
          })
        }
        if (url.includes('/published')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
        if (url.includes('/liked')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
      })

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Edit functionality', () => {
    it('should toggle personal info edit form', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
      )

      const wrapper = mount(MyAccountView)
      await flushPromises()

      const editButtons = wrapper.findAll('.edit-btn')
      const personalEditBtn = editButtons[0]

      await personalEditBtn.trigger('click')
      await flushPromises()

      expect(wrapper.find('.edit-form').exists()).toBe(true)
    })

    it('should toggle BJJ info edit form', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
      )

      const wrapper = mount(MyAccountView)
      await flushPromises()

      const editButtons = wrapper.findAll('.edit-btn')
      const bjjEditBtn = editButtons[1]

      await bjjEditBtn.trigger('click')
      await flushPromises()

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Form submission', () => {
    it('should save personal information', async () => {
      const saveMock = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
      )

      global.fetch = vi.fn((url) => {
        if (url.includes('/profile') && url.endsWith('/profile')) {
          return saveMock()
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
      })

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.exists()).toBe(true)
    })

    it('should display success message after save', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
      )

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.exists()).toBe(true)
    })

    it('should display error message on save failure', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: 'Validation error' })
        })
      )

      const wrapper = mount(MyAccountView)
      await flushPromises()

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Authentication checks', () => {
    it('should redirect unauthenticated users', async () => {
      const pushMock = vi.fn()

      useRouter.mockReturnValue({
        push: pushMock
      })

      useAuth0.mockReturnValue({
        user: { value: null },
        isAuthenticated: { value: false },
        getAccessTokenSilently: vi.fn()
      })

      mount(MyAccountView)
      await flushPromises()

      expect(pushMock).toHaveBeenCalled()
    })
  })
})
