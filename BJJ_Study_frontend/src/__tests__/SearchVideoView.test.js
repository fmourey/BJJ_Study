import { mount, flushPromises } from '@vue/test-utils'
import SearchVideoView from '../views/SearchVideoView.vue'
import VideoCard from '../components/VideoCard.vue'
import Header from '../components/Header.vue'
import { vi } from 'vitest'

describe('SearchVideoView.vue', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

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
      title: 'Kimura Finish Techniques',
      youtube_url: 'https://www.youtube.com/watch?v=vid2',
      position: 'Guard Pass',
      tags: 'kimura,finish',
      start_time: '0:00',
      end_time: '3:00',
      description: 'Complete the kimura'
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

  it('should render the header', () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    )

    const wrapper = mount(SearchVideoView, {
      global: {
        components: { Header, VideoCard }
      }
    })

    expect(wrapper.findComponent(Header).exists()).toBe(true)
  })

  it('should render search bar with input and button', () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    )

    const wrapper = mount(SearchVideoView, {
      global: {
        components: { Header, VideoCard }
      }
    })

    const input = wrapper.find('.search-bar input')
    const button = wrapper.find('.add-tag-btn')

    expect(input.exists()).toBe(true)
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Add Tag')
  })

  it('should add tag when pressing Enter', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    )

    const wrapper = mount(SearchVideoView, {
      global: {
        components: { Header, VideoCard }
      }
    })

    const input = wrapper.find('.search-bar input')
    await input.setValue('Kimura')
    await input.trigger('keyup.enter')

    const tags = wrapper.findAll('.tag')
    expect(tags.length).toBe(1)
    expect(tags[0].text()).toContain('Kimura')
  })

  it('should add tag when clicking button', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    )

    const wrapper = mount(SearchVideoView, {
      global: {
        components: { Header, VideoCard }
      }
    })

    const input = wrapper.find('.search-bar input')
    const button = wrapper.find('.add-tag-btn')

    await input.setValue('Armbar')
    await button.trigger('click')

    const tags = wrapper.findAll('.tag')
    expect(tags.length).toBe(1)
    expect(tags[0].text()).toContain('Armbar')
  })

  it('should clear input after adding tag', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    )

    const wrapper = mount(SearchVideoView, {
      global: {
        components: { Header, VideoCard }
      }
    })

    const input = wrapper.find('.search-bar input')
    await input.setValue('Kimura')
    await input.trigger('keyup.enter')

    expect(input.element.value).toBe('')
  })

  it('should remove tag when clicking remove button', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    )

    const wrapper = mount(SearchVideoView, {
      global: {
        components: { Header, VideoCard }
      }
    })

    const input = wrapper.find('.search-bar input')
    await input.setValue('Kimura')
    await input.trigger('keyup.enter')

    const removeBtn = wrapper.find('.remove-btn')
    await removeBtn.trigger('click')

    const tags = wrapper.findAll('.tag')
    expect(tags.length).toBe(0)
  })

  it('should display search results', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVideos)
      })
    )

    const wrapper = mount(SearchVideoView, {
      global: {
        components: { Header, VideoCard }
      }
    })

    const input = wrapper.find('.search-bar input')
    await input.setValue('Kimura')
    await input.trigger('keyup.enter')

    await flushPromises()

    const videoCards = wrapper.findAllComponents(VideoCard)
    expect(videoCards.length).toBe(3)
  })

  it('should display result count', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVideos)
      })
    )

    const wrapper = mount(SearchVideoView, {
      global: {
        components: { Header, VideoCard }
      }
    })

    const input = wrapper.find('.search-bar input')
    await input.setValue('Kimura')
    await input.trigger('keyup.enter')

    await flushPromises()

    expect(wrapper.text()).toContain('3 result(s) found')
  })

  it('should display loading message during search', async () => {
    let resolveSearch
    global.fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveSearch = resolve
        })
    )

    const wrapper = mount(SearchVideoView, {
      global: {
        components: { Header, VideoCard }
      }
    })

    const input = wrapper.find('.search-bar input')
    await input.setValue('Kimura')
    await input.trigger('keyup.enter')

    expect(wrapper.text()).toContain('Searching...')

    resolveSearch({
      ok: true,
      json: () => Promise.resolve(mockVideos)
    })

    await flushPromises()
    expect(wrapper.text()).not.toContain('Searching...')
  })

  it('should display error message on search failure', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        statusText: 'Server Error'
      })
    )

    const wrapper = mount(SearchVideoView, {
      global: {
        components: { Header, VideoCard }
      }
    })

    const input = wrapper.find('.search-bar input')
    await input.setValue('Kimura')
    await input.trigger('keyup.enter')

    await flushPromises()

    expect(wrapper.text()).toContain('Search failed: Server Error')
  })

  it('should have filter controls visible', () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    )

    const wrapper = mount(SearchVideoView, {
      global: {
        components: { Header, VideoCard }
      }
    })

    expect(wrapper.find('.filter-group').exists()).toBe(true)
    expect(wrapper.text()).toContain('Position')
    expect(wrapper.text()).toContain('Max Video Length')
  })

  it('should have clear filters button', () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    )

    const wrapper = mount(SearchVideoView, {
      global: {
        components: { Header, VideoCard }
      }
    })

    const clearBtn = wrapper.find('.clear-btn')
    expect(clearBtn.exists()).toBe(true)
    expect(clearBtn.text()).toBe('Clear Filters')
  })

  it('should clear all filters and results', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVideos)
      })
    )

    const wrapper = mount(SearchVideoView, {
      global: {
        components: { Header, VideoCard }
      }
    })

    const input = wrapper.find('.search-bar input')
    await input.setValue('Kimura')
    await input.trigger('keyup.enter')

    await flushPromises()

    // Verify results exist
    expect(wrapper.findAllComponents(VideoCard).length).toBe(3)

    // Clear filters
    const clearBtn = wrapper.find('.clear-btn')
    await clearBtn.trigger('click')

    await flushPromises()

    // Verify cleared state
    const tags = wrapper.findAll('.tag')
    expect(tags.length).toBe(0)
    expect(wrapper.text()).toContain('No videos found')
  })

  it('should update search when adjusting max video length', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVideos)
      })
    )

    const wrapper = mount(SearchVideoView, {
      global: {
        components: { Header, VideoCard }
      }
    })

    const rangeInput = wrapper.find('input[type="range"]')
    expect(rangeInput.exists()).toBe(true)

    await rangeInput.setValue(1800)
    await flushPromises()

    expect(global.fetch).toHaveBeenCalled()
  })

  it('should format duration correctly in label', () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    )

    const wrapper = mount(SearchVideoView, {
      global: {
        components: { Header, VideoCard }
      }
    })

    // Default is 3600 seconds = 60 minutes
    expect(wrapper.text()).toContain('60m')
  })

  it('should pass video data to VideoCard components', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVideos)
      })
    )

    const wrapper = mount(SearchVideoView, {
      global: {
        components: { Header, VideoCard }
      }
    })

    const input = wrapper.find('.search-bar input')
    await input.setValue('Kimura')
    await input.trigger('keyup.enter')

    await flushPromises()

    const videoCards = wrapper.findAllComponents(VideoCard)
    expect(videoCards[0].props('video')).toEqual(mockVideos[0])
    expect(videoCards[1].props('video')).toEqual(mockVideos[1])
    expect(videoCards[2].props('video')).toEqual(mockVideos[2])
  })
})
