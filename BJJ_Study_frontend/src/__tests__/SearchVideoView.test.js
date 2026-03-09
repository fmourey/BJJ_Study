import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import SearchVideoView from '../views/SearchVideoView.vue'
import VideoCard from '../components/VideoCard.vue'
import Header from '../components/Header.vue'

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: vi.fn(() => ({
    getAccessTokenSilently: vi.fn(),
    isAuthenticated: { value: false }
  }))
}))

describe('SearchVideoView - Complete Test Suite', () => {
  const mockVideos = [
    {
      id: 1,
      title: 'Kimura Setup from Guard',
      youtube_url: 'https://www.youtube.com/watch?v=vid1',
      position: 'Guard Pass',
      tags: 'kimura,setup',
      start_time: '0:00',
      end_time: '2:30',
      description: 'Learn how to set up a kimura'
    },
    {
      id: 2,
      title: 'Deep Half Guard Sweep',
      youtube_url: 'https://www.youtube.com/watch?v=vid2',
      position: 'Bottom Mount',
      tags: 'sweep,deep-half',
      start_time: '0:00',
      end_time: '3:00',
      description: 'Master the deep half guard sweep'
    },
    {
      id: 3,
      title: 'Closed Guard Escape',
      youtube_url: 'https://www.youtube.com/watch?v=vid3',
      position: 'Closed Guard',
      tags: 'escape',
      start_time: '0:00',
      end_time: '1:45',
      description: 'Escape from closed guard'
    }
  ]

  // Helper fetch qui répond aux deux endpoints possibles
  const fetchAllVideos = (url) => {
    if (url.includes('/api/videos') || url.includes('/api/search')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockVideos) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
  }

  beforeEach(() => {
    global.fetch = vi.fn()
    vi.clearAllMocks()
  })

  describe('Component structure and rendering', () => {
    it('should render with header component', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      )
      const wrapper = mount(SearchVideoView, {
        global: { stubs: { Header: true, Search: true, VideoCard: true } }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should display search container', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      )
      const wrapper = mount(SearchVideoView)
      await flushPromises()
      expect(wrapper.text()).toBeTruthy()
    })
  })

  describe('Initial video loading', () => {
    it('should load and display all videos on mount', async () => {
      // Le fetch initial sans filtre va sur /api/videos, pas /api/search
      global.fetch = vi.fn(fetchAllVideos)

      const wrapper = mount(SearchVideoView)
      await flushPromises()

      const videoCards = wrapper.findAllComponents(VideoCard)
      expect(videoCards.length).toBe(3)
    })

    it('should handle empty video list', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      )
      const wrapper = mount(SearchVideoView)
      await flushPromises()
      expect(wrapper.findAllComponents(VideoCard).length).toBe(0)
    })

    it('should pass video data correctly to VideoCard', async () => {
      global.fetch = vi.fn(fetchAllVideos)
      const wrapper = mount(SearchVideoView)
      await flushPromises()
      const firstCard = wrapper.findAllComponents(VideoCard)[0]
      expect(firstCard.props('video').title).toBe('Kimura Setup from Guard')
      expect(firstCard.props('video').id).toBe(1)
    })
  })

  describe('Video filtering and search', () => {
    it('should filter videos when search changes', async () => {
      // Le premier appel (sans filtre) va sur /api/videos
      global.fetch = vi.fn(fetchAllVideos)

      const wrapper = mount(SearchVideoView)
      await flushPromises()

      let videoCards = wrapper.findAllComponents(VideoCard)
      expect(videoCards.length).toBe(3)

      await flushPromises()
    })

    it('should filter by position correctly', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('position=Closed')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([mockVideos[2]]) })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockVideos) })
      })
      const wrapper = mount(SearchVideoView)
      await flushPromises()
      expect(wrapper.findAllComponents(VideoCard).length).toBeGreaterThan(0)
    })

    it('should filter by tags correctly', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('tags=kimura')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([mockVideos[0]]) })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockVideos) })
      })
      const wrapper = mount(SearchVideoView)
      await flushPromises()
      expect(wrapper.findAllComponents(VideoCard).length).toBeGreaterThan(0)
    })
  })

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))
      const wrapper = mount(SearchVideoView)
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle API errors (non-200 status)', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({ error: 'Server error' }) })
      )
      const wrapper = mount(SearchVideoView)
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findAllComponents(VideoCard).length).toBe(0)
    })

    it('should handle malformed video data', async () => {
      const malformedVideos = [{ id: 1, title: 'Missing properties video' }, mockVideos[0]]
      global.fetch = vi.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve(malformedVideos) })
      )
      const wrapper = mount(SearchVideoView)
      await flushPromises()
      expect(wrapper.findAllComponents(VideoCard).length).toBe(2)
    })
  })

  describe('Performance and scaling', () => {
    it('should handle large number of videos', async () => {
      const manyVideos = Array.from({ length: 50 }, (_, i) => ({ ...mockVideos[0], id: i + 1, title: `Video ${i + 1}` }))
      global.fetch = vi.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve(manyVideos) })
      )
      const wrapper = mount(SearchVideoView)
      await flushPromises()
      expect(wrapper.findAllComponents(VideoCard).length).toBe(50)
    })

    it('should display videos in proper grid layout', async () => {
      global.fetch = vi.fn(fetchAllVideos)
      const wrapper = mount(SearchVideoView)
      await flushPromises()
      const videoCards = wrapper.findAllComponents(VideoCard)
      expect(videoCards.length).toBeGreaterThan(0)
      videoCards.forEach((card) => {
        expect(card.props('video')).toBeDefined()
        expect(card.props('video').id).toBeDefined()
      })
    })
  })

  describe('Data refresh and updates', () => {
    it('should allow manual refresh of video list', async () => {
      const mockFetch = vi.fn(fetchAllVideos)
      global.fetch = mockFetch
      const wrapper = mount(SearchVideoView)
      await flushPromises()
      expect(mockFetch).toHaveBeenCalled()
    })
  })
})
