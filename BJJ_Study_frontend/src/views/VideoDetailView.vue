<template>
    <div class="page">

    <Header />

    <main class="content">
        <fieldset v-if="video" class="video-card">

        <iframe
        class="video-player"
        :src="embedUrl"
        frameborder="0"
        allowfullscreen
        ></iframe>

        <div class="video-info">
            <div class="video-header">
                <div class="author">
                    <img
                    src="https://api.dicebear.com/7.x/thumbs/svg?seed=User"
                    alt="avatar"
                    class="avatar"
                    />
                    <div class="pseudo">Pseudo</div>
                </div>
                <div class="likes">
                    <span>1000 likes</span>
                    <button class="like-button">♡</button>
                </div>
            </div>

            <div class="video-main">
                <h1 class="title">{{video.title}}</h1>

                <div class="tags">
                    <span class="tag tag-yellow">{{ video.position }}</span>
                    <span v-for="(tag, i) in video.tags" :key="i" class="tag">
                        {{ tag }}
                    </span>
                </div>
            </div>

            <p class="description">
                {{ video.description }}
            </p>

            <div class="meta">
                <span>Durée : {{duration}}</span>
                <span>Ajoutée le {{ new Date(video.created_at).toLocaleDateString() }}</span>
            </div>
        </div>
        </fieldset>

        <div v-else>
            Chargement...
        </div>
    </main>

    <aside class="related-videos">
        <h2>Vidéos similaires</h2>
        <VideoCard v-for="v in results" :key="v.id" :video="v" />
    </aside>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import VideoCard from "../components/VideoCard.vue";
import Header from '../components/Header.vue';
import { useSearch } from "../components/Search.vue";
import { API_BASE_URL } from '@/config/api'
const { selectedTags, selectedPosition, executeSearch, results } = useSearch();


const route = useRoute();
const video = ref(null);

async function loadVideo(id) {
    if (!id) return;

    const res = await fetch(`${API_BASE_URL}/api/videos/${id}`);
    const data = await res.json();

    if (data.tags && typeof data.tags === "string") {
        data.tags = data.tags.split(",").map(tag => tag.trim());
    }

    video.value = data;

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

// Re-load video when the route id changes (e.g. clicking a related video)
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
.page {
    background-color: #f7f7f7;
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
    color: #333;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: white;
    border-bottom: 1px solid #ddd;
}

.login {
    background: black;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    cursor: pointer;
}

.login:hover {
    background: #333;
}

.content {
    display: flex;
    justify-content: center;
    padding: 2rem;
}

.video-card {
    width: 800px;
    background: rgb(255, 255, 255);
    border-radius: 12px;
    border: 1px solid #ddd;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    padding: 0;
}

.video-player {
  width: calc(100% - 2rem);
  height: 400px;
  border: none;
  border-radius: 12px;
  margin: 1rem;
}

.video-info {
    padding: 1.5rem;
}

.video-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.video-main {
    text-align: center;
}

.author {
    display: flex;
    align-items: center;
    gap: 0.6rem;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.likes {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.like-button {
    border: none;
    background: none;
    font-size: 1.3rem;
    cursor: pointer;
}

.title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 0.8rem;
    margin-bottom: 0.5rem;
}

.tags {
    justify-content: center;
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.tag {
    background: #eee;
    padding: 0.3rem 0.6rem;
    border-radius: 8px;
    font-size: 0.85rem;
}

.tag-yellow {
    background: #f9b233;
    color: white;
}

.description {
    font-size: 0.95rem;
    color: #555;
    line-height: 1.5;
    margin-bottom: 1rem;
}

.meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #777;
    border-top: 1px solid #eee;
    padding-top: 0.5rem;
}

.related-videos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(324px, 1fr));
  gap: 16px;
}

.related-videos h2 {
  grid-column: 1 / -1;
}

</style>
