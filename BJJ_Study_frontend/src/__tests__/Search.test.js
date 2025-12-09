import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSearch } from '../components/Search.vue'

describe('Search.vue composable - useSearch()', () => {
  let search

  beforeEach(() => {
    search = useSearch()
    // Reset fetch mock
    global.fetch = vi.fn()
  })

  describe('Tag Management', () => {
    it('should add a tag', () => {
      search.addTag('Kimura')
      expect(search.selectedTags.value).toContain('Kimura')
    })

    it('should not add duplicate tags', () => {
      search.addTag('Armbar')
      search.addTag('Armbar')
      expect(search.selectedTags.value.length).toBe(1)
    })

    it('should trim whitespace when adding tags', () => {
      search.addTag('  Guard Escape  ')
      expect(search.selectedTags.value).toContain('Guard Escape')
    })

    it('should not add empty tags', () => {
      search.addTag('')
      search.addTag('   ')
      expect(search.selectedTags.value.length).toBe(0)
    })

    it('should remove a tag', () => {
      search.addTag('Kimura')
      search.addTag('Armbar')
      search.removeTag('Kimura')
      expect(search.selectedTags.value).not.toContain('Kimura')
      expect(search.selectedTags.value).toContain('Armbar')
    })
  })

  describe('Position Management', () => {
    it('should set position', () => {
      search.setPosition('Closed Guard')
      expect(search.selectedPosition.value).toBe('Closed Guard')
    })

    it('should toggle position off if already selected', () => {
      search.setPosition('Closed Guard')
      search.setPosition('Closed Guard')
      expect(search.selectedPosition.value).toBeNull()
    })

    it('should change position when selecting different one', () => {
      search.setPosition('Closed Guard')
      search.setPosition('Guard Pass')
      expect(search.selectedPosition.value).toBe('Guard Pass')
    })

    it('should have available positions', () => {
      expect(search.availablePositions.value).toContain('Closed Guard')
      expect(search.availablePositions.value).toContain('Guard Pass')
      expect(search.availablePositions.value).toContain('Butterfly Guard')
    })
  })

  describe('Filter Building', () => {
    it('should build filters with tags only', () => {
      search.addTag('Kimura')
      search.addTag('Armbar')
      const filters = search.buildSearchFilters()
      
      expect(filters.tags).toEqual(['Kimura', 'Armbar'])
      expect(filters.position).toBeUndefined()
      // maxVideoLength has default value of 3600
      expect(filters.maxVideoLength).toBe(3600)
    })

    it('should build filters with position only', () => {
      search.setPosition('Closed Guard')
      const filters = search.buildSearchFilters()
      
      expect(filters.tags).toBeUndefined()
      expect(filters.position).toBe('Closed Guard')
      // maxVideoLength has default value of 3600
      expect(filters.maxVideoLength).toBe(3600)
    })

    it('should build filters with maxVideoLength only', () => {
      search.maxVideoLength.value = 1800
      const filters = search.buildSearchFilters()
      
      expect(filters.tags).toBeUndefined()
      expect(filters.position).toBeUndefined()
      expect(filters.maxVideoLength).toBe(1800)
    })

    it('should build filters with all parameters', () => {
      search.addTag('Kimura')
      search.setPosition('Guard Pass')
      search.maxVideoLength.value = 2400
      const filters = search.buildSearchFilters()
      
      expect(filters.tags).toEqual(['Kimura'])
      expect(filters.position).toBe('Guard Pass')
      expect(filters.maxVideoLength).toBe(2400)
    })
  })

  describe('Search Execution', () => {
    it('should execute search with mocked results', async () => {
      const mockResults = [
        {
          id: 1,
          title: 'Kimura Setup',
          tags: 'kimura',
          position: 'Guard Pass'
        },
        {
          id: 2,
          title: 'Kimura Finish',
          tags: 'kimura',
          position: 'Guard Pass'
        }
      ]

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResults)
        })
      )

      search.addTag('Kimura')
      await search.executeSearch()

      expect(search.results.value).toEqual(mockResults)
      expect(search.loading.value).toBe(false)
      expect(search.error.value).toBeNull()
    })

    it('should send correct query parameters', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      )

      search.addTag('Kimura')
      search.addTag('Armbar')
      search.setPosition('Guard Pass')
      search.maxVideoLength.value = 1800

      await search.executeSearch()

      const callUrl = global.fetch.mock.calls[0][0]
      expect(callUrl).toContain('tags=Kimura')
      expect(callUrl).toContain('tags=Armbar')
      expect(callUrl).toContain('position=Guard+Pass')
      expect(callUrl).toContain('maxVideoLength=1800')
    })

    it('should handle search errors', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          statusText: 'Server Error'
        })
      )

      search.addTag('Kimura')
      try {
        await search.executeSearch()
      } catch (e) {
        // Error is expected
      }

      expect(search.error.value).toBe('Search failed: Server Error')
      expect(search.results.value).toEqual([])
      expect(search.loading.value).toBe(false)
    })

    it('should set loading state during search', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      )

      const promise = search.executeSearch()
      expect(search.loading.value).toBe(true)

      await promise
      expect(search.loading.value).toBe(false)
    })
  })

  describe('Clear Filters', () => {
    it('should clear all filters and results', () => {
      search.addTag('Kimura')
      search.setPosition('Guard Pass')
      search.maxVideoLength.value = 1200
      search.results.value = [{ id: 1 }]
      search.error.value = 'Some error'

      search.clearFilters()

      expect(search.selectedTags.value).toEqual([])
      expect(search.selectedPosition.value).toBeNull()
      expect(search.maxVideoLength.value).toBe(600)
      expect(search.results.value).toEqual([])
      expect(search.error.value).toBeNull()
    })
  })
})
