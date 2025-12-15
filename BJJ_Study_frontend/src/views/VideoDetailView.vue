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
const { selectedTags, selectedPosition, executeSearch, results } = useSearch();


const route = useRoute();
const video = ref(null);

async function loadVideo(id) {
    if (!id) return;

    const res = await fetch(`http://localhost:3000/api/videos/${id}`);
    const data = await res.json();

    if (data.tags && typeof data.tags === "string") {
        data.tags = data.tags.split(",").map(tag => tag.trim());
    }

    video.value = data;

    // Reset search filters and refresh list to compute related videos
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
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.page {
  background: 
    radial-gradient(ellipse at top right, rgba(220, 38, 38, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at bottom left, rgba(0, 0, 0, 0.05) 0%, transparent 50%),
    linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%);
  min-height: 100vh;
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #0f0f0f;
  position: relative;
  overflow-x: hidden;
}

/* Effet tatami en background */
.page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(0,0,0,0.015) 35px, rgba(0,0,0,0.015) 36px),
    repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(0,0,0,0.015) 35px, rgba(0,0,0,0.015) 36px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
}

.page > * {
  position: relative;
  z-index: 1;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}

.login {
  background: linear-gradient(135deg, #0f0f0f 0%, #1f1f1f 100%);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 12px 28px;
  cursor: pointer;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 13px;
  box-shadow: 
    0 4px 15px rgba(0,0,0,0.2),
    inset 0 1px 0 rgba(255,255,255,0.1);
  transition: all .25s ease;
}

.login:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.15);
  filter: brightness(1.05);
}

.login:active {
  transform: translateY(0);
}

.content {
  display: flex;
  justify-content: center;
  padding: 2.5rem 2rem;
}

/* Card principale - Glassmorphism */
.video-card {
  width: 100%;
  max-width: 900px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 
    0 12px 48px rgba(0,0,0,0.1),
    inset 0 1px 0 rgba(255,255,255,0.9);
  overflow: hidden;
  padding: 0;
  position: relative;
}

/* Bordure accent rouge */
.video-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #dc2626, #b91c1c);
}

.video-player {
  width: calc(100% - 2rem);
  height: 500px;
  border: none;
  border-radius: 18px;
  margin: 1.5rem 1rem 1rem 1rem;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.12),
    0 2px 8px rgba(0,0,0,0.08);
  transition: all .3s ease;
}

.video-player:hover {
  box-shadow: 
    0 12px 48px rgba(0,0,0,0.15),
    0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.video-info {
  padding: 1.5rem 2rem 2rem 2rem;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid rgba(226, 232, 240, 0.5);
}

.video-main {
  text-align: center;
  margin: 1.5rem 0;
}

.author {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 8px 16px;
  background: rgba(248, 250, 252, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 50px;
  transition: all .25s ease;
}

.author:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 2px solid white;
}

.pseudo {
  font-weight: 700;
  color: #1e293b;
  font-size: 15px;
}

.likes {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 8px 16px;
  background: rgba(254, 242, 242, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 50px;
  font-weight: 600;
  color: #991b1b;
  font-size: 14px;
}

.like-button {
  border: none;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  font-size: 1.2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 
    0 4px 12px rgba(220, 38, 38, 0.4),
    inset 0 1px 0 rgba(255,255,255,0.2);
  transition: all .25s ease;
}

.like-button:hover {
  transform: scale(1.15);
  box-shadow: 
    0 6px 20px rgba(220, 38, 38, 0.5),
    inset 0 1px 0 rgba(255,255,255,0.25);
}

.like-button:active {
  transform: scale(1.05);
}

.title {
  font-size: 2rem;
  font-weight: 800;
  margin-top: 0;
  margin-bottom: 1.2rem;
  color: #0f172a;
  line-height: 1.3;
  text-shadow: 0 1px 2px rgba(255,255,255,0.8);
}

.tags {
  justify-content: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 1.5rem;
}

.tag {
  background: rgba(241, 245, 249, 0.8);
  backdrop-filter: blur(8px);
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  box-shadow: 
    0 2px 12px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.7);
  border: 1px solid rgba(255,255,255,0.5);
  transition: all .25s ease;
}

.tag:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 
    0 4px 16px rgba(0,0,0,0.1),
    inset 0 1px 0 rgba(255,255,255,0.9);
}

.tag-yellow {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #78350f;
  box-shadow: 
    0 4px 15px rgba(251, 191, 36, 0.3),
    inset 0 1px 0 rgba(255,255,255,0.4),
    inset 0 -2px 0 rgba(0,0,0,0.1);
  border: none;
}

.tag-yellow:hover {
  box-shadow: 
    0 6px 20px rgba(251, 191, 36, 0.5),
    inset 0 1px 0 rgba(255,255,255,0.6);
}

.description {
  font-size: 1rem;
  color: #475569;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: rgba(248, 250, 252, 0.5);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  border-left: 4px solid #dc2626;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
}

.meta {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  border-top: 2px solid rgba(226, 232, 240, 0.5);
  padding-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta span {
  padding: 6px 12px;
  background: rgba(241, 245, 249, 0.6);
  border-radius: 8px;
}

/* Section vidéos similaires */
.related-videos {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.related-videos h2 {
  grid-column: 1 / -1;
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 1rem;
  padding: 20px 28px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  border-left: 6px solid #dc2626;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.9);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

/* État de chargement */
.content > div {
  padding: 50px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #64748b;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.08),
    inset 0 1px 0 rgba(255,255,255,1);
  border: 1px solid rgba(255,255,255,0.18);
}

/* Responsive */
@media (max-width: 768px) {
  .content {
    padding: 1.5rem 1rem;
  }

  .video-card {
    max-width: 100%;
  }

  .video-player {
    height: 250px;
  }

  .video-info {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .video-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .related-videos {
    grid-template-columns: 1fr;
    padding: 1.5rem 1rem;
  }

  .tags {
    gap: 8px;
  }

  .tag {
    font-size: 12px;
    padding: 6px 12px;
  }
}

@media (max-width: 480px) {
  .video-player {
    height: 200px;
    margin: 1rem 0.5rem;
    width: calc(100% - 1rem);
  }

  .author,
  .likes {
    padding: 6px 12px;
    font-size: 13px;
  }

  .avatar {
    width: 36px;
    height: 36px;
  }
}
</style>
