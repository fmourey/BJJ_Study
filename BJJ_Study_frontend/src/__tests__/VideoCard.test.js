import { mount } from '@vue/test-utils'
import VideoCard from '../components/VideoCard.vue'

describe('VideoCard.vue', () => {
  const video = {
    id: 1,
    title: 'Best Kimura Tutorial',
    youtube_url: 'https://www.youtube.com/watch?v=abc123',
    start_time: '0:10',
    end_time: '1:10',
    tags: ['kimura'],
    position: 'Guard Pass'
  }

  it('print the title', () => {
    const wrapper = mount(VideoCard, {
      props: { video }
    })

    expect(wrapper.text()).toContain('Best Kimura Tutorial')
  })

  it('generates a valid YouTube thumbnail', () => {
    const wrapper = mount(VideoCard, {
      props: { video }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://img.youtube.com/vi/abc123/hqdefault.jpg')
  })

  it('correctly calculates the duration', () => {
    const wrapper = mount(VideoCard, {
      props: { video }
    })
    
    expect(wrapper.text()).toContain('1:00')
  })
})
