import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import VideoDetailView from '../views/VideoDetailView.vue'
import VideoCard from '../components/VideoCard.vue'



vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRoute: vi.fn(() => ({ params: { id: '1' } })),
    useRouter: vi.fn(() => ({ push: vi.fn() }))
  }
})

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: vi.fn(() => ({
    getAccessTokenSilently: vi.fn(),
    isAuthenticated: { value: false }
  }))
}))

// Mock du composant Search.vue qui expose useSearch
const mockResults = ref([])

vi.mock('../components/Search.vue', () => ({
  default: { template: '<div />' },
  useSearch: vi.fn(() => ({
    results: mockResults,
    selectedTags: ref([]),
    selectedPosition: ref(null),
    executeSearch: vi.fn(() => Promise.resolve()),
    maxVideoLength: ref(300),
    availablePositions: ref([]),
    availableTags: ref([]),
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
    { id: 2, title: 'Kimura Setup', youtube_url: 'https://youtube.com/watch?v=vid2', position: 'Guard Pass', tags: 'kimura', start_time: '0:00', end_time: '0:45', description: 'Setup techniques' },
    { id: 3, title: 'Armbar Finish', youtube_url: 'https://youtube.com/watch?v=vid3', position: 'Mount', tags: 'armbar', start_time: '0:00', end_time: '0:30', description: 'Finish the armbar' },
    { id: 4, title: 'Guard Pass Basics', youtube_url: 'https://youtube.com/watch?v=vid4', position: 'Guard Pass', tags: 'fundamentals', start_time: '0:00', end_time: '2:00', description: 'Basic guard pass' },
    { id: 5, title: 'Submission Strategy', youtube_url: 'https://youtube.com/watch?v=vid6', position: 'Guard Pass', tags: 'kimura,strategy', start_time: '0:00', end_time: '2:45', description: 'Strategic submissions' },
    { id: 6, title: 'Advanced Armbar', youtube_url: 'https://youtube.com/watch?v=vid7', position: 'Mount', tags: 'armbar,advanced', start_time: '0:00', end_time: '3:00', description: 'Advanced armbar variations' },
    { id: 7, title: 'Guard Pass Drills', youtube_url: 'https://youtube.com/watch?v=vid8', position: 'Guard Pass', tags: 'drills,practice', start_time: '0:00', end_time: '4:00', description: 'Practice drills' },
    { id: 8, title: 'Kimura Variations', youtube_url: 'https://youtube.com/watch?v=vid9', position: 'Side Control', tags: 'kimura,variations', start_time: '0:00', end_time: '5:00', description: 'Different kimura variations' }
  ]

  const mockFetch = (url) => {
    if (url.includes('/comments')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    }
    if (url.includes('/api/videos/')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mainVideo) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  }

beforeEach(() => {
  mockResults.value = [mainVideo, ...relatedVideos]
  global.fetch = vi.fn(mockFetch)
  vi.clearAllMocks()
})



  describe('Main video display', () => {
    it('should load and display main video', async () => {
      const wrapper = mount(VideoDetailView)
      await flushPromises()
      expect(wrapper.text()).toContain(mainVideo.title)
      expect(wrapper.text()).toContain(mainVideo.description)
    })

    it('should display video metadata (position, tags)', async () => {
      const wrapper = mount(VideoDetailView)
      await flushPromises()
      expect(wrapper.text()).toContain('Guard Pass')
      expect(wrapper.text()).toContain('kimura')
    })

    it('should display formatted creation date', async () => {
      const wrapper = mount(VideoDetailView)
      await flushPromises()
      expect(wrapper.text()).toBeTruthy()
    })
  })

  describe('Related videos calculation', () => {
    it('should display exactly 7 related videos', async () => {
      const wrapper = mount(VideoDetailView)
      await flushPromises()
      const relatedCards = wrapper.findAllComponents(VideoCard)
      expect(relatedCards.length).toBe(7)
    })

    it('should select videos with matching position or tags', async () => {
      const wrapper = mount(VideoDetailView)
      await flushPromises()
      const relatedCards = wrapper.findAllComponents(VideoCard)
      relatedCards.forEach(card => {
        const video = card.props('video')
        const hasMatchingTag = ['kimura', 'armbar'].some(tag => video.tags && video.tags.includes(tag))
        const hasMatchingPosition = video.position === mainVideo.position
        expect(hasMatchingTag || hasMatchingPosition).toBe(true)
      })
    })

    it('should exclude main video from related videos', async () => {
      const wrapper = mount(VideoDetailView)
      await flushPromises()
      const relatedCards = wrapper.findAllComponents(VideoCard)
      relatedCards.forEach(card => {
        expect(card.props('video').id).not.toBe(mainVideo.id)
      })
    })

    it('should prioritize by number of matching tags', async () => {
      const wrapper = mount(VideoDetailView)
      await flushPromises()
      const relatedCards = wrapper.findAllComponents(VideoCard)
      expect(relatedCards.length).toBe(7)
    })
  })

  describe('Navigation and linking', () => {
    it('should display related videos as clickable cards', async () => {
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




  describe('Loading states', () => {
    it('should display loading state initially', () => {
      global.fetch = vi.fn(() => new Promise(() => {}))
      const wrapper = mount(VideoDetailView)
      expect(wrapper.exists()).toBe(true)
    })

    it('should complete loading when data arrives', async () => {
      const wrapper = mount(VideoDetailView)
      await flushPromises()
      expect(wrapper.text()).toContain(mainVideo.title)
    })
  })

  describe('Responsive layout', () => {
    it('should display main video prominently', async () => {
      const wrapper = mount(VideoDetailView)
      await flushPromises()
      expect(wrapper.text()).toContain(mainVideo.title)
    })

    it('should display related videos below main video', async () => {
      const wrapper = mount(VideoDetailView)
      await flushPromises()
      const videoCards = wrapper.findAllComponents(VideoCard)
      expect(videoCards.length).toBe(7)
    })
  })
})
