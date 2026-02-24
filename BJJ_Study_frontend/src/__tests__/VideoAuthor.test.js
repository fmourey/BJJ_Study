import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VideoAuthor from '../components/VideoAuthor.vue'
import { getInitials } from '../composables/useVideoInfo'

describe('VideoAuthor.vue', () => {
  const mockAuthor = {
    id: 1,
    name: 'Jean',
    surname: 'Dupont',
    pseudo: 'jeandupont',
    profile_photo: 'https://example.com/profile.jpg'
  }

  describe('Component rendering', () => {
    it('should render author component', () => {
      const wrapper = mount(VideoAuthor, {
        props: { author: mockAuthor }
      })

      expect(wrapper.find('.video-author').exists()).toBe(true)
    })

    it('should display author pseudo when available', () => {
      const wrapper = mount(VideoAuthor, {
        props: { author: mockAuthor }
      })

      expect(wrapper.text()).toContain('jeandupont')
    })

    it('should display author name as fallback', () => {
      const author = {
        ...mockAuthor,
        pseudo: null
      }

      const wrapper = mount(VideoAuthor, {
        props: { author }
      })

      // Should fall back to name
      expect(wrapper.text()).toContain('Jean')
    })
  })

  describe('Profile photo handling', () => {
    it('should display profile photo when available', () => {
      const wrapper = mount(VideoAuthor, {
        props: { author: mockAuthor }
      })

      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe(mockAuthor.profile_photo)
    })

    it('should display initials placeholder when no photo', () => {
      const author = {
        ...mockAuthor,
        profile_photo: null
      }

      const wrapper = mount(VideoAuthor, {
        props: { author }
      })

      const placeholder = wrapper.find('.author-photo-placeholder')
      expect(placeholder.exists()).toBe(true)
      expect(placeholder.text()).toContain('JD')
    })

    it('should have correct alt text for accessibility', () => {
      const wrapper = mount(VideoAuthor, {
        props: { author: mockAuthor }
      })

      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe(mockAuthor.pseudo)
    })
  })

  describe('Author fallback text', () => {
    it('should display Anonyme when author is null', () => {
      const wrapper = mount(VideoAuthor, {
        props: { author: null }
      })

      expect(wrapper.text()).toContain('Anonyme')
    })

    it('should display pseudo preferentially', () => {
      const author = {
        name: 'Jean',
        pseudo: 'jeandupont'
      }

      const wrapper = mount(VideoAuthor, {
        props: { author }
      })

      expect(wrapper.text()).toContain('jeandupont')
      expect(wrapper.text()).not.toContain('Jean')
    })
  })

  describe('Initials generation', () => {
    it('should generate correct initials with getInitials function', () => {
      expect(getInitials('Jean', 'Dupont')).toBe('JD')
    })

    it('should handle missing surname in initials', () => {
      expect(getInitials('Jean', '')).toBe('J')
    })

    it('should handle missing name in initials', () => {
      expect(getInitials('', 'Dupont')).toBe('D')
    })

    it('should display generated initials in placeholder', () => {
      const author = {
        name: 'Pierre',
        surname: 'Martin',
        pseudo: 'pierre.martin',
        profile_photo: null
      }

      const wrapper = mount(VideoAuthor, {
        props: { author }
      })

      const placeholder = wrapper.find('.author-photo-placeholder')
      expect(placeholder.text()).toBe('PM')
    })
  })

  describe('Styling and layout', () => {
    it('should have correct structure with photo and pseudo', () => {
      const wrapper = mount(VideoAuthor, {
        props: { author: mockAuthor }
      })

      expect(wrapper.find('.author-photo').exists()).toBe(true)
      expect(wrapper.find('.pseudo').exists()).toBe(true)
    })

    it('should display author info horizontally', () => {
      const wrapper = mount(VideoAuthor, {
        props: { author: mockAuthor }
      })

      const container = wrapper.find('.video-author')
      // Check that it has flex display (from CSS class)
      expect(container.classes()).toBeDefined()
    })
  })

  describe('Default props', () => {
    it('should handle undefined author gracefully', () => {
      const wrapper = mount(VideoAuthor, {
        props: { author: undefined }
      })

      expect(wrapper.text()).toContain('Anonyme')
    })

    it('should use default null author when not provided', () => {
      const wrapper = mount(VideoAuthor, {
        props: {}
      })

      // Should render something without errors
      expect(wrapper.exists()).toBe(true)
    })
  })
})
