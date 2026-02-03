<template>
  <div>
    <router-link
      v-if="video && video.id"
      :to="{ name: 'video-detail', params: { id: video.id } }"
      class="video-card-link"
    >
      <fieldset class="video-mini-card">
        <div class="video-image">
          <img
            class="video-player thumbnail"
            :src="thumbnailUrl"
            :alt="video.title"
          />
        </div>

        <div class="video-info">
          <VideoAuthor :author="author" />
          <h1 class="title">{{ video.title }}</h1>
        </div>

        <div class="duration-meta">
          <span class="duration">🕙{{ duration }}</span>
          <span class="likes">❤️ {{ likesCount }}</span>
        </div>
      </fieldset>
    </router-link>

    <div v-else>
      Error loading video...
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { toRefs } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import VideoAuthor from './VideoAuthor.vue'
import { useVideoInfo } from '../composables/useVideoInfo'

const props = defineProps({
  video: {
    type: Object,
    required: true
  }
})

const { video } = toRefs(props)
const { getAccessTokenSilently, isAuthenticated } = useAuth0()
const { author, likesCount, fetchAuthor, fetchLikesCount } = useVideoInfo(video.value?.id, { getAccessTokenSilently, isAuthenticated })

function timeToSeconds(time) {
  if (!time) return 0
  const parts = String(time).split(':').map(Number)
  if (parts.length === 1) return parts[0] || 0
  const [m, s] = parts
  return (m || 0) * 60 + (s || 0)
}

function extractYouTubeId(v) {
  if (!v) return ''
  if (v.youtube_id) return String(v.youtube_id)
  const url = String(v.youtube_url || '')
  const m = url.match(/[?&]v=([^&]+)/)
  if (m && m[1]) return m[1]
  const s = url.match(/youtu\.be\/([^?&]+)/)
  if (s && s[1]) return s[1]
  const e = url.match(/embed\/([^?&/]+)/)
  if (e && e[1]) return e[1]
  return ''
}

const thumbnailUrl = computed(() => {
  if (!video.value) return ''
  const id = extractYouTubeId(video.value)
  if (!id) return ''
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
})

const duration = computed(() => {
  if (!video.value) return ''
  if (video.value.start_time && video.value.end_time) {
    const seconds = timeToSeconds(video.value.end_time) - timeToSeconds(video.value.start_time)
    if (seconds < 0) return ''
    const minutes = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${minutes}:${String(sec).padStart(2, '0')}`
  }
  return video.value.duration || ''
})

onMounted(() => {
  if (video.value?.id) {
    fetchAuthor()
    fetchLikesCount()
  }
})

// Re-fetch when video changes
watch(() => video.value?.id, (newId) => {
  if (newId) {
    fetchAuthor()
    fetchLikesCount()
  }
})
</script>

<style scoped>
.video-mini-card {
  width: 324px;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  border: none;
}

.video-image img {
  width: 100%;
  height: 198px;
  border-radius: 12px;
  object-fit: cover;
}

.video-info {
  padding: 8px 6px;
}

.title {
  font-size: 0.85rem;
  font-weight: 600;
  margin: 4px 0 0 0;
  line-height: 1.2;
}

.duration-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  padding: 6px 6px;
  color: #444;
  gap: 8px;
}

.duration,
.likes {
  display: flex;
  align-items: center;
  gap: 3px;
}

.video-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.video-card-link:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.18);
  border-radius: 12px;
}
</style>
