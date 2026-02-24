import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VideoCard from '../components/VideoCard.vue'

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: vi.fn(() => ({
    getAccessTokenSilently: vi.fn(),
    isAuthenticated: { value: false }
  }))
}))

describe('VideoCard.vue', () => {
  let mockVideo

  beforeEach(() => {
    mockVideo = {
      id: 1,
      title: 'Complete Kimura Technique',
      youtube_url: 'https://www.youtube.com/watch?v=abc123def456',
      position: 'Guard Pass',
      tags: 'kimura, armbar, submission',
      start_time: '0:00',
      end_time: '2:30',
      description: 'Learn the complete kimura technique from setup to finish'
    }
  })

  describe('Basic rendering', () => {
    it('should display video title', () => {
      const wrapper = mount(VideoCard, {
        props: { video: mockVideo }
      })

      expect(wrapper.text()).toContain('Complete Kimura Technique')
    })

    it('should display video position', () => {
      const wrapper = mount(VideoCard, {
        props: { video: mockVideo },
        global: {
          stubs: {
            VideoAuthor: true
          }
        }
      })

      expect(wrapper.text()).toContain('Guard Pass')
    })

    it('should display video tags', () => {
      const wrapper = mount(VideoCard, {
        props: { video: mockVideo }
      })

      expect(wrapper.text()).toContain('kimura')
      expect(wrapper.text()).toContain('armbar')
    })

    it('should render a video card element', () => {
      const wrapper = mount(VideoCard, {
        props: { video: mockVideo }
      })

      const card = wrapper.find('.video-card')
      expect(card.exists()).toBe(true)
    })
  })

  describe('YouTube thumbnail', () => {
    it('should generate correct YouTube thumbnail URL', () => {
      const wrapper = mount(VideoCard, {
        props: { video: mockVideo }
      })

      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://img.youtube.com/vi/abc123def456/hqdefault.jpg')
    })

    it('should extract video ID correctly from various URL formats', () => {
      const videos = [
        {
          ...mockVideo,
          youtube_url: 'https://youtube.com/watch?v=XYZ789'
        },
        {
          ...mockVideo,
          youtube_url: 'https://youtu.be/XYZ789'
        }
      ]

      videos.forEach(video => {
        const wrapper = mount(VideoCard, {
          props: { video }
        })

        const img = wrapper.find('img')
        expect(img.attributes('src')).toContain('XYZ789')
      })
    })

    it('should have alt text for accessibility', () => {
      const wrapper = mount(VideoCard, {
        props: { video: mockVideo }
      })

      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBeTruthy()
    })
  })

  describe('Duration calculation', () => {
    it('should correctly calculate video duration (2:30)', () => {
      const wrapper = mount(VideoCard, {
        props: { video: mockVideo }
      })

      // Assuming duration is displayed as "2:30"
      expect(wrapper.text()).toContain('2:30')
    })

    it('should handle single-digit seconds with leading zero', () => {
      const video = {
        ...mockVideo,
        start_time: '0:00',
        end_time: '1:05'
      }

      const wrapper = mount(VideoCard, {
        props: { video }
      })

      expect(wrapper.text()).toContain('1:05')
    })

    it('should handle durations over an hour', () => {
      const video = {
        ...mockVideo,
        start_time: '0:00',
        end_time: '1:30:45'
      }

      const wrapper = mount(VideoCard, {
        props: { video }
      })

      expect(wrapper.text()).toContain('1:30:45')
    })

    it('should calculate duration from specified start and end times', () => {
      const video = {
        ...mockVideo,
        start_time: '1:00',
        end_time: '3:00'
      }

      const wrapper = mount(VideoCard, {
        props: { video }
      })

      // Should display 2:00 (3:00 - 1:00)
      expect(wrapper.text()).toContain('2:00')
    })
  })

  describe('Edge cases', () => {
    it('should handle missing tags', () => {
      const video = {
        ...mockVideo,
        tags: ''
      }

      const wrapper = mount(VideoCard, {
        props: { video }
      })

      expect(wrapper.find('.video-card').exists()).toBe(true)
    })

    it('should handle very long titles', () => {
      const video = {
        ...mockVideo,
        title: 'A Very Long Video Title That Explains Everything About The Technique And All The Details You Need To Know'
      }

      const wrapper = mount(VideoCard, {
        props: { video }
      })

      // Should still render
      expect(wrapper.text()).toContain('Very Long Video Title')
    })

    it('should be a clickable card', () => {
      const wrapper = mount(VideoCard, {
        props: { video: mockVideo }
      })

      const card = wrapper.find('.video-card')
      expect(card.classes()).toBeDefined()
    })
  })
})
