import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useVideoInfo, getInitials } from '../../composables/useVideoInfo'

describe('useVideoInfo composable', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    vi.clearAllMocks()
  })

  const mockAuth = {
    getAccessTokenSilently: vi.fn(() => Promise.resolve('mock-token')),
    isAuthenticated: { value: true }
  }

  describe('getInitials utility function', () => {
    it('should return initials from name and surname', () => {
      expect(getInitials('Jean', 'Dupont')).toBe('JD')
    })

    it('should handle empty name gracefully', () => {
      expect(getInitials('', 'Dupont')).toBe('D')
      expect(getInitials('Jean', '')).toBe('J')
      expect(getInitials('', '')).toBe('')
    })

    it('should handle null/undefined values', () => {
      expect(getInitials(null, 'Dupont')).toBe('D')
      expect(getInitials('Jean', null)).toBe('J')
      expect(getInitials(null, null)).toBe('')
    })

    it('should convert to uppercase', () => {
      expect(getInitials('jean', 'dupont')).toBe('JD')
      expect(getInitials('JEAN', 'DUPONT')).toBe('JD')
    })
  })

  describe('Author fetching', () => {
    it('should fetch author successfully', async () => {
      const mockAuthor = {
        id: 1,
        name: 'John',
        surname: 'Doe',
        pseudo: 'johndoe',
        profile_photo: 'https://example.com/photo.jpg'
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAuthor)
        })
      )

      const composable = useVideoInfo(1, mockAuth)
      await composable.fetchAuthor()

      expect(composable.author.value).toEqual(mockAuthor)
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/author'))
    })

    it('should handle fetch error gracefully', async () => {
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('Network error'))
      )

      const composable = useVideoInfo(1, mockAuth)
      await composable.fetchAuthor()

      expect(composable.author.value).toBeNull()
    })

    it('should handle non-200 response', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404
        })
      )

      const composable = useVideoInfo(1, mockAuth)
      await composable.fetchAuthor()

      expect(composable.author.value).toBeNull()
    })
  })

  describe('Likes management', () => {
    it('should fetch likes count', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ likesCount: 42 })
        })
      )

      const composable = useVideoInfo(1, mockAuth)
      await composable.fetchLikesCount()

      expect(composable.likesCount.value).toBe(42)
    })

    it('should check if video is liked by user', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ isLiked: true })
        })
      )

      const composable = useVideoInfo(1, mockAuth)
      await composable.checkIfLiked()

      expect(composable.isLiked.value).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/is-liked'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token'
          })
        })
      )
    })

    it('should not check if liked when not authenticated', async () => {
      const unauthAuth = {
        ...mockAuth,
        isAuthenticated: { value: false }
      }

      const composable = useVideoInfo(1, unauthAuth)
      await composable.checkIfLiked()

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('Toggle like action', () => {
    it('should like a video when not yet liked', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ likesCount: 43 })
        })
      )

      const composable = useVideoInfo(1, mockAuth)
      composable.isLiked.value = false
      composable.likesCount.value = 42

      await composable.toggleLike()

      expect(composable.isLiked.value).toBe(true)
      expect(composable.likesCount.value).toBe(43)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/like'),
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('should unlike a video when already liked', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ likesCount: 41 })
        })
      )

      const composable = useVideoInfo(1, mockAuth)
      composable.isLiked.value = true
      composable.likesCount.value = 42

      await composable.toggleLike()

      expect(composable.isLiked.value).toBe(false)
      expect(composable.likesCount.value).toBe(41)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/like'),
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('should alert user if not authenticated', async () => {
      const alertSpy = vi.spyOn(global, 'alert')
      const unauthAuth = {
        ...mockAuth,
        isAuthenticated: { value: false }
      }

      const composable = useVideoInfo(1, unauthAuth)
      await composable.toggleLike()

      expect(alertSpy).toHaveBeenCalled()
      alertSpy.mockRestore()
    })

    it('should handle conflict on like (409)', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 409,
          json: () => Promise.resolve({})
        })
      )

      const composable = useVideoInfo(1, mockAuth)
      composable.isLiked.value = false

      await composable.toggleLike()

      expect(composable.isLiked.value).toBe(true)
    })
  })

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('Network error'))
      )

      const composable = useVideoInfo(1, mockAuth)
      await composable.fetchLikesCount()

      expect(composable.likesCount.value).toBe(0)
    })
  })
})
