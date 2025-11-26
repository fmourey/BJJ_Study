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
          <div class="author">
            <div class="pseudo">Pseudo</div>
          </div>
          <h1 class="title">{{ video.title }}</h1>
        </div>

        <div class="duration-meta">
          <span>🕙{{ duration }}</span>
        </div>
      </fieldset>
    </router-link>

    <div v-else>
      Error loading video...
    </div>
  </div>
</template>

<script setup>
import { computed, ref, toRefs } from 'vue';

const props = defineProps({
        video: {
                type: Object,
                required: true
        }
});

const { video } = toRefs(props);
const play = ref(false);

function timeToSeconds(time) {
    if (!time) return 0;
    const parts = String(time).split(":").map(Number);
    if (parts.length === 1) return parts[0] || 0;
    const [m, s] = parts;
    return (m || 0) * 60 + (s || 0);
}

function extractYouTubeId(v) {
    if (!v) return "";
    if (v.youtube_id) return String(v.youtube_id);
    const url = String(v.youtube_url || "");
    const m = url.match(/[?&]v=([^&]+)/);
    if (m && m[1]) return m[1];
    const s = url.match(/youtu\.be\/([^?&]+)/);
    if (s && s[1]) return s[1];
    const e = url.match(/embed\/([^?&/]+)/);
    if (e && e[1]) return e[1];
    return "";
}

const thumbnailUrl = computed(() => {
    if (!video.value) return "";
    const id = extractYouTubeId(video.value);
    if (!id) return "";
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
});

const duration = computed(() => {
    if (!video.value) return "";
    if (video.value.start_time && video.value.end_time) {
        const seconds = timeToSeconds(video.value.end_time) - timeToSeconds(video.value.start_time);
        if (seconds < 0) return "";
        const minutes = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${minutes}:${String(sec).padStart(2, "0")}`;
    }
    return video.value.duration || "";
});
</script>

<style scoped>
.video-mini-card {
  width: 324px;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.video-image img {
  width: 100%;
  height: 198px;
  border-radius: 12px;
  object-fit: cover;
}

.video-info {
  padding: 6px 4px;
}

.title {
  font-size: 0.85rem;
  font-weight: 600;
  margin: 4px 0;
}

.author .pseudo {
  font-size: 0.75rem;
  color: #666;
}

.duration-meta {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  padding: 0 4px 6px;
  color: #444;
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