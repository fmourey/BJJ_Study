import { mount, flushPromises } from '@vue/test-utils'
import VideoDetailView from '../views/VideoDetailView.vue'
import VideoCard from '../components/VideoCard.vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 1 } })
}))

describe('VideoDetailView.vue', () => {
  it('loads the principal video and calculates 8 similar videos', async () => {
    const mainVideo = {
      id: 1,
      title: 'Main',
      youtube_url: 'https://youtube.com/watch?v=MAIN123',
      position: 'Guard Pass',
      tags: ['kimura', 'armbar'],
      start_time: '0:00',
      end_time: '1:00',
      created_at: '2024-01-01T00:00:00Z',
      description: 'Description'
    }

    const allVideos = [
      mainVideo,
      { id: 2, position: 'Guard Pass', tags: ['kimura'] },
      { id: 3, position: 'Closed Guard', tags: ['kimura'] },
      { id: 4, position: 'Guard Pass', tags: ['x'] },
      { id: 5, position: 'Mount', tags: ['kimura'] },
      { id: 6, position: 'Side Control', tags: ['armbar'] },
      { id: 7, position: 'Guard Pass', tags: [] },
      { id: 8, position: 'Guard Pass', tags: ['kimura', 'armbar'] },
      { id: 9, position: 'Closed Guard', tags: ['x'] },
      { id: 10, position: 'Mount', tags: ['armbar'] }
    ]

    global.fetch = vi.fn((url) => {
      if (url.includes('/api/videos/1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mainVideo)
        })
      }

      if (url.includes('/api/search')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(allVideos)
        })
      }

      return Promise.reject(new Error(`Unexpected fetch URL: ${url}`))
    })

    const wrapper = mount(VideoDetailView)

    await flushPromises()

    expect(wrapper.text()).toContain('Main')

    const related = wrapper.findAllComponents(VideoCard)
    expect(related.length).toBe(8)
  })
})
