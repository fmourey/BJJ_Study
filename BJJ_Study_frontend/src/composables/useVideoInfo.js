import { ref } from 'vue'
import { API_BASE_URL } from '../config/api'

export function useVideoInfo(videoId, { getAccessTokenSilently, isAuthenticated }) {
  const author = ref(null)
  const likesCount = ref(0)
  const isLiked = ref(false)

  const fetchAuthor = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/author`)
      if (response.ok) {
        author.value = await response.json()
      }
    } catch (error) {
      console.error('Error fetching author:', error)
    }
  }

  const fetchLikesCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/likes-count`)
      if (response.ok) {
        const data = await response.json()
        likesCount.value = data.likesCount
      }
    } catch (error) {
      console.error('Error fetching likes count:', error)
    }
  }

  const checkIfLiked = async () => {
    if (!isAuthenticated.value) return
    try {
      const token = await getAccessTokenSilently()
      const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/is-liked`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        isLiked.value = data.isLiked
      }
    } catch (error) {
      console.error('Error checking if liked:', error)
    }
  }

  const toggleLike = async () => {
    if (!isAuthenticated.value) {
      alert('Veuillez vous connecter pour liker une vidéo')
      return
    }

    try {
      const token = await getAccessTokenSilently()

      if (isLiked.value) {
        // Unlike
        const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/like`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          isLiked.value = false
          likesCount.value = Math.max(0, likesCount.value - 1)
        }
      } else {
        // Like
        const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/like`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          isLiked.value = true
          likesCount.value += 1
        } else if (response.status === 409) {
          isLiked.value = true
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  return {
    author,
    likesCount,
    isLiked,
    fetchAuthor,
    fetchLikesCount,
    checkIfLiked,
    toggleLike
  }
}
