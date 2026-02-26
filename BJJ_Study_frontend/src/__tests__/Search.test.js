import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSearch } from '../components/Search.vue'

describe('useSearch Composable - Complete Test Suite', () => {
  let search

  beforeEach(() => {
    search = useSearch()
    global.fetch = vi.fn()
    vi.clearAllMocks()
  })

  describe('Tag Management', () => {
    it('should initialize with empty selected tags', () => {
      expect(search.selectedTags.value).toEqual([])
    })

    it('should add a tag', () => {
      search.addTag('kimura')
      expect(search.selectedTags.value).toContain('kimura')
    })

    it('should not add duplicate tags', () => {
      search.addTag('armbar')
      search.addTag('armbar')
      expect(search.selectedTags.value.length).toBe(1)
    })

    it('should trim whitespace when adding tags', () => {
      search.addTag('  guard escape  ')
      expect(search.selectedTags.value).toContain('guard escape')
    })

    it('should not add empty tags', () => {
      search.addTag('')
      search.addTag('   ')
      expect(search.selectedTags.value.length).toBe(0)
    })

    it('should remove a tag', () => {
      search.addTag('kimura')
      search.addTag('armbar')
      search.removeTag('kimura')

      expect(search.selectedTags.value).not.toContain('kimura')
      expect(search.selectedTags.value).toContain('armbar')
    })
  })

  describe('Position Management', () => {
    it('should initialize with null position', () => {
      expect(search.selectedPosition.value).toBeNull()
    })

    it('should display available positions', () => {
      expect(search.availablePositions.value).toContain('Closed Guard')
      expect(search.availablePositions.value).toContain('Guard Pass')
      expect(search.availablePositions.value).toContain('Butterfly Guard')
    })

    it('should set position', () => {
      search.setPosition('Closed Guard')
      expect(search.selectedPosition.value).toBe('Closed Guard')
    })

    it('should toggle position off if already selected', () => {
      search.setPosition('Guard Pass')
      search.setPosition('Guard Pass')
      expect(search.selectedPosition.value).toBeNull()
    })

    it('should change position when selecting different one', () => {
      search.setPosition('Closed Guard')
      search.setPosition('Guard Pass')
      expect(search.selectedPosition.value).toBe('Guard Pass')
    })
  })

  describe('Video Duration Filter', () => {
    it('should initialize with default max duration (5 minutes)', () => {
      expect(search.maxVideoLength.value).toBe(300)
    })

    it('should allow changing max duration', () => {
      search.maxVideoLength.value = 180
      expect(search.maxVideoLength.value).toBe(180)
    })
  })

  describe('Filter Building', () => {
    it('should build empty filters initially', () => {
      const filters = search.buildSearchFilters()
      expect(filters.tags).toBeUndefined()
      expect(filters.position).toBeUndefined()
      expect(filters.maxVideoLength).toBe(300)
    })

    it('should build filters with tags only', () => {
      search.addTag('kimura')
      search.addTag('armbar')
      const filters = search.buildSearchFilters()

      expect(filters.tags).toEqual(['kimura', 'armbar'])
      expect(filters.position).toBeUndefined()
    })

    it('should build filters with position only', () => {
      search.setPosition('Closed Guard')
      const filters = search.buildSearchFilters()

      expect(filters.tags).toBeUndefined()
      expect(filters.position).toBe('Closed Guard')
    })

    it('should build filters with all parameters', () => {
      search.addTag('submission')
      search.setPosition('Mount')
      search.maxVideoLength.value = 240
      const filters = search.buildSearchFilters()

      expect(filters.tags).toEqual(['submission'])
      expect(filters.position).toBe('Mount')
      expect(filters.maxVideoLength).toBe(240)
    })
  })

  describe('Search Execution', () => {
    it('should execute search successfully', async () => {
      const mockResults = [
        { id: 1, title: 'Video 1' },
        { id: 2, title: 'Video 2' }
      ]

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResults)
        })
      )

      await search.executeSearch()

      expect(search.results.value).toEqual(mockResults)
      expect(search.error.value).toBeNull()
    })

    it('should send correct query parameters', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      )

      search.addTag('kimura')
      search.setPosition('Guard Pass')
      await search.executeSearch()

      expect(global.fetch).toHaveBeenCalled()
      const callUrl = global.fetch.mock.calls[0][0]
      expect(callUrl).toContain('/api/search')
    })

    it('should handle search errors', async () => {
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('Network error'))
      )

      await search.executeSearch()

      expect(search.error.value).toBeTruthy()
      expect(search.results.value).toEqual([])
    })

    it('should handle non-200 responses', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          statusText: 'Server Error'
        })
      )

      await search.executeSearch()

      expect(search.error.value).toBeTruthy()
    })
  })

  describe('Clear Filters', () => {
    it('should clear all filters', () => {
      search.addTag('kimura')
      search.setPosition('Guard Pass')
      search.maxVideoLength.value = 180
      search.results.value = [{ id: 1 }]

      search.clearFilters()

      expect(search.selectedTags.value).toEqual([])
      expect(search.selectedPosition.value).toBeNull()
      expect(search.maxVideoLength.value).toBe(300)
      expect(search.results.value).toEqual([])
      expect(search.error.value).toBeNull()
    })
  })

  describe('State Initialization', () => {
    it('should initialize with correct defaults', () => {
      const newSearch = useSearch()

      expect(newSearch.selectedTags.value).toEqual([])
      expect(newSearch.selectedPosition.value).toBeNull()
      expect(newSearch.maxVideoLength.value).toBe(300)
      expect(newSearch.loading.value).toBe(false)
      expect(newSearch.error.value).toBeNull()
      expect(newSearch.results.value).toEqual([])
    })
  })
})
