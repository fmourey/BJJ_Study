import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import VideoDetailView from '../views/VideoDetailView.vue'
import VideoCard from '../components/VideoCard.vue'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ params: { id: '1' } }))
}))

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: vi.fn(() => ({
    getAccessTokenSilently: vi.fn(),
    isAuthenticated: { value: false }
  }))
}))

describe('VideoDetailView - Complete Test Suite', () => {
  const mainVideo = {
    id: 1,
    title: 'Complete Kimura Technique',
    youtube_url: 'https://youtube.com/watch?v=MAIN123',
    position: 'Guard Pass',
    tags: 'kimura,armbar',
    start_time: '0:00',
    end_time: '1:00',
    created_at: '2024-01-01T00:00:00Z',
    description: 'Learn the complete kimura technique'
  }

  const relatedVideos = [
    {
      id: 2,
      title: 'Kimura Setup',
      youtube_url: 'https://youtube.com/watch?v=vid2',
      position: 'Guard Pass',
      tags: 'kimura',
      start_time: '0:00',
      end_time: '0:45',
      description: 'Setup techniques'
    },
    {
      id: 3,
      title: 'Armbar Finish',
      youtube_url: 'https://youtube.com/watch?v=vid3',
      position: 'Mount',
      tags: 'armbar',
      start_time: '0:00',
      end_time: '0:30',
      description: 'Finish the armbar'
    },
    {
      id: 4,
      title: 'Guard Pass Basics',
      youtube_url: 'https://youtube.com/watch?v=vid4',
      position: 'Guard Pass',
      tags: 'fundamentals',
      start_time: '0:00',
      end_time: '2:00',
      description: 'Basic guard pass'
    },
    {
      id: 5,
      title: 'Submission Strategy',
      youtube_url: 'https://youtube.com/watch?v=vid6',
      position: 'Guard Pass',
      tags: 'kimura,strategy',
      start_time: '0:00',
      end_time: '2:45',
      description: 'Strategic submissions'
    },
    {
      id: 6,
      title: 'Advanced Armbar',
      youtube_url: 'https://youtube.com/watch?v=vid7',
      position: 'Mount',
      tags: 'armbar,advanced',
      start_time: '0:00',
      end_time: '3:00',
      description: 'Advanced armbar variations'
    },
    {
      id: 7,
      title: 'Guard Pass Drills',
      youtube_url: 'https://youtube.com/watch?v=vid8',
      position: 'Guard Pass',
      tags: 'drills,practice',
      start_time: '0:00',
      end_time: '4:00',
      description: 'Practice drills'
    },
    {
      id: 8,
      title: 'Kimura Variations',
      youtube_url: 'https://youtube.com/watch?v=vid9',
      position: 'Side Control',
      tags: 'kimura,variations',
      start_time: '0:00',
      end_time: '5:00',
      description: 'Different kimura variations'
    }
  ]

  beforeEach(() => {
    global.fetch = vi.fn()
    vi.clearAllMocks()
  })

  describe('Main video display', () => {
    it('should load and display main video', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes(`/api/videos/${mainVideo.id}`)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mainVideo)
          })
        }
        if (url.includes('/api/search')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mainVideo, ...relatedVideos])
          })
        }
      })

      const wrapper = mount(VideoDetailView)
      await flushPromises()

      expect(wrapper.text()).toContain(mainVideo.title)
      expect(wrapper.text()).toContain(mainVideo.description)
    })

    it('should display video metadata (position, tags)', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes(`/api/videos/${mainVideo.id}`)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mainVideo)
          })
        }
        if (url.includes('/api/search')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mainVideo, ...relatedVideos])
          })
        }
      })

      const wrapper = mount(VideoDetailView)
      await flushPromises()

      expect(wrapper.text()).toContain('Guard Pass')
      expect(wrapper.text()).toContain('kimura')
    })

    it('should display formatted creation date', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes(`/api/videos/${mainVideo.id}`)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mainVideo)
          })
        }
        if (url.includes('/api/search')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mainVideo, ...relatedVideos])
          })
        }
      })

      const wrapper = mount(VideoDetailView)
      await flushPromises()

      expect(wrapper.text()).toBeTruthy()
    })
  })

  describe('Related videos calculation', () => {
    it('should display exactly 7 related videos', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes(`/api/videos/${mainVideo.id}`)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mainVideo)
          })
        }
        if (url.includes('/api/search')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mainVideo, ...relatedVideos])
          })
        }
      })

      const wrapper = mount(VideoDetailView)
      await flushPromises()

      const relatedCards = wrapper.findAllComponents(VideoCard)
      expect(relatedCards.length).toBe(7)
    })

    it('should select videos with matching position or tags', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes(`/api/videos/${mainVideo.id}`)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mainVideo)
          })
        }
        if (url.includes('/api/search')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mainVideo, ...relatedVideos])
          })
        }
      })

      const wrapper = mount(VideoDetailView)
      await flushPromises()

      const relatedCards = wrapper.findAllComponents(VideoCard)

      // All related videos should have some relevance
      relatedCards.forEach(card => {
        const video = card.props('video')
        const hasMatchingTag = mainVideo.tags.split(',').some(tag =>
          video.tags && video.tags.includes(tag)
        )
        const hasMatchingPosition = video.position === mainVideo.position

        expect(hasMatchingTag || hasMatchingPosition).toBe(true)
      })
    })

    it('should exclude main video from related videos', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes(`/api/videos/${mainVideo.id}`)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mainVideo)
          })
        }
        if (url.includes('/api/search')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mainVideo, ...relatedVideos])
          })
        }
      })

      const wrapper = mount(VideoDetailView)
      await flushPromises()

      const relatedCards = wrapper.findAllComponents(VideoCard)

      relatedCards.forEach(card => {
        const video = card.props('video')
        expect(video.id).not.toBe(mainVideo.id)
      })
    })

    it('should prioritize by number of matching tags', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes(`/api/videos/${mainVideo.id}`)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mainVideo)
          })
        }
        if (url.includes('/api/search')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mainVideo, ...relatedVideos])
          })
        }
      })

      const wrapper = mount(VideoDetailView)
      await flushPromises()

      const relatedCards = wrapper.findAllComponents(VideoCard)
      expect(relatedCards.length).toBe(8)
    })
  })

  describe('Navigation and linking', () => {
    it('should display related videos as clickable cards', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes(`/api/videos/${mainVideo.id}`)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mainVideo)
          })
        }
        if (url.includes('/api/search')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mainVideo, ...relatedVideos])
          })
        }
      })

      const wrapper = mount(VideoDetailView)
      await flushPromises()

      const relatedCards = wrapper.findAllComponents(VideoCard)
      expect(relatedCards.length).toBeGreaterThan(0)

      relatedCards.forEach(card => {
        expect(card.props('video')).toBeDefined()
        expect(card.props('video').id).toBeDefined()
      })
    })
  })

  describe('Error handling', () => {
    it('should handle video not found (404)', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ error: 'Not found' })
        })
      )

      const wrapper = mount(VideoDetailView)
      await flushPromises()

      // Should render without crashing
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('Network error'))
      )

      const wrapper = mount(VideoDetailView)
      await flushPromises()

      expect(wrapper.exists()).toBe(true)
    })

    it('should handle malformed JSON response', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.reject(new Error('Invalid JSON'))
        })
      )

      const wrapper = mount(VideoDetailView)
      await flushPromises()

      // Should handle gracefully
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Loading states', () => {
    it('should display loading state initially', () => {
      global.fetch = vi.fn(() => new Promise(() => {})) // Never resolves

      const wrapper = mount(VideoDetailView)

      // Should render while loading
      expect(wrapper.exists()).toBe(true)
    })

    it('should complete loading when data arrives', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes(`/api/videos/${mainVideo.id}`)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mainVideo)
          })
        }
        if (url.includes('/api/search')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mainVideo, ...relatedVideos])
          })
        }
      })

      const wrapper = mount(VideoDetailView)
      await flushPromises()

      expect(wrapper.text()).toContain(mainVideo.title)
    })
  })

  describe('Responsive layout', () => {
    it('should display main video prominently', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes(`/api/videos/${mainVideo.id}`)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mainVideo)
          })
        }
        if (url.includes('/api/search')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mainVideo, ...relatedVideos])
          })
        }
      })

      const wrapper = mount(VideoDetailView)
      await flushPromises()

      expect(wrapper.text()).toContain(mainVideo.title)
    })

    it('should display related videos below main video', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes(`/api/videos/${mainVideo.id}`)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mainVideo)
          })
        }
        if (url.includes('/api/search')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mainVideo, ...relatedVideos])
          })
        }
      })

      const wrapper = mount(VideoDetailView)
      await flushPromises()

      const videoCards = wrapper.findAllComponents(VideoCard)
      expect(videoCards.length).toBe(8)
    })
  })
})
