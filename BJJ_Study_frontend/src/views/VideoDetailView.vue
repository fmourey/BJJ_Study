<template>
  <Header />

  <div class="container">

    <main class="block">
      <div v-if="video" class="card video-card">

        <iframe
          class="video-player"
          :src="embedUrl"
          frameborder="0"
          allowfullscreen
        ></iframe>

        <div class="video-info">

          <div class="video-header">
            <VideoAuthor :author="author" />

            <LikeButton
              :likes-count="likesCount"
              :is-liked="isLiked"
              @toggle-like="toggleLike"
            />
          </div>

          <h1>{{ video.title }}</h1>

          <div class="tags block">
            <span class="tag tag-position">{{ video.position }}</span>
            <span
              v-for="(tag, i) in video.tags"
              :key="i"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>

          <p class="description block">
            {{ video.description }}
          </p>

          <div class="meta">
            <span>Durée : {{ duration }}</span>
            <span>
              Ajoutée le {{ new Date(video.created_at).toLocaleDateString() }}
            </span>
          </div>

        </div>
      </div>

      <div v-else class="state">
        Chargement...
      </div>
    </main>

    <section class="block">
      <h2>Vidéos similaires</h2>

      <div class="grid">
        <VideoCard
          v-for="v in results"
          :key="v.id"
          :video="v"
        />
      </div>
    </section>

  </div>

  <Footer />
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuth0 } from '@auth0/auth0-vue';
import VideoCard from "../components/VideoCard.vue";
import VideoAuthor from "../components/VideoAuthor.vue";
import LikeButton from "../components/LikeButton.vue";
import Header from '../components/Header.vue';
import { useSearch } from "../components/Search.vue";
import { useVideoInfo } from "../composables/useVideoInfo";
import { API_BASE_URL } from '@/config/api'
import Footer from "@/components/Footer.vue";

const { selectedTags, selectedPosition, executeSearch, results } = useSearch();
const route = useRoute();
const { getAccessTokenSilently, isAuthenticated } = useAuth0();
const video = ref(null);

const currentVideoId = ref(null);
const author = ref(null);
const likesCount = ref(0);
const isLiked = ref(false);
let videoInfoComposable = null;

const toggleLike = async () => {
  if (videoInfoComposable) {
    await videoInfoComposable.toggleLike();
    isLiked.value = videoInfoComposable.isLiked.value;
    likesCount.value = videoInfoComposable.likesCount.value;
  }
};

async function loadVideo(id) {
    if (!id) return;

    const res = await fetch(`${API_BASE_URL}/api/videos/${id}`);
    const data = await res.json();

    if (data.tags && typeof data.tags === "string") {
        data.tags = data.tags.split(",").map(tag => tag.trim());
    }

    video.value = data;
    currentVideoId.value = id;

    videoInfoComposable = useVideoInfo(id, { getAccessTokenSilently, isAuthenticated });
    await videoInfoComposable.fetchAuthor();
    author.value = videoInfoComposable.author.value;

    await videoInfoComposable.fetchLikesCount();
    likesCount.value = videoInfoComposable.likesCount.value;

    await videoInfoComposable.checkIfLiked();
    isLiked.value = videoInfoComposable.isLiked.value;

    selectedTags.value = [];
    selectedPosition.value = null;

    await executeSearch();

    let allVideos = results.value;

    allVideos = allVideos.filter(v => v.id !== data.id);

    results.value = allVideos
        .map(v => {
            const vTags = typeof v.tags === "string"
                ? v.tags.split(",").map(t => t.trim())
                : v.tags || [];

            const dTags = data.tags || [];

            let score = 0;

            if (v.position === data.position) score += 2;

            const commonTags = vTags.filter(t => dTags.includes(t));
            score += commonTags.length;

            return { ...v, score };
        })
        .filter(v => v.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
}

onMounted(() => {
    loadVideo(route.params.id);
});

watch(() => route.params.id, (newId, oldId) => {
    if (newId && newId !== oldId) {
        loadVideo(newId);
    }
});

const embedUrl = computed(() => {
  if (!video.value || !video.value.youtube_url) return "";

  const url = new URL(video.value.youtube_url);
  const videoId = url.searchParams.get("v");
  if (!videoId) return "";

  const start = timeToSeconds(video.value.start_time || "0:00");
  const end = timeToSeconds(video.value.end_time || "0:00");

  return `https://www.youtube.com/embed/${videoId}?start=${start}&end=${end}`;
});


function timeToSeconds(time) {
  const [m, s] = time.split(":").map(Number);
  return m * 60 + s;
}

const duration = computed(() => {
  if (video.value.start_time > video.value.end_time) return null;
  const seconds = timeToSeconds(video.value.end_time) - timeToSeconds(video.value.start_time);
  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${minutes}:${sec.toString().padStart(2, "0")}`;
});
</script>

<style scoped>

.video-card {
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 480px;
  border: none;
  border-bottom: 1px solid var(--line);
}


.video-info {
  padding: 24px;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

h1 {
  margin-bottom: 16px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 700;
  background: var(--surface-2);
  border: 1px solid var(--line);
  color: var(--text);
}

.tag-position {
  background: var(--brand);
  color: var(--text-inverse);
  border: none;
}

.description {
  color: var(--muted);
  line-height: 1.6;
}

.meta {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 14px;
  color: var(--muted);
  border-top: 1px solid var(--line);
  padding-top: 16px;
}

@media (max-width: 768px) {

  .video-player {
    height: 260px;
  }

  .video-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .meta {
    flex-direction: column;
  }
}

</style>
