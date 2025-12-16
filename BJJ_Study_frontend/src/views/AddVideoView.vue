<template>
  <!-- ... navbar identique ... -->

  <main class="main-content">
    <div class="container">
      <h1 class="page-title">Ajouter une vidéo</h1>
      <form @submit.prevent="handleSubmit" class="video-form">
        
        <!-- Tabs -->
        <div class="tab-container">
          <button type="button" class="tab-btn" :class="{ active: activeTab === 'youtube' }" @click="switchTab('youtube')">Youtube</button>
          <button type="button" class="tab-btn" :class="{ active: activeTab === 'local' }" @click="switchTab('local')">Local</button>
        </div>

        <!-- Video Preview -->
        <div class="video-preview">
          <div class="preview-placeholder">
            
            <!-- YouTube Thumbnail -->
            <div v-if="activeTab === 'youtube' && youtubeVideoId && !showYoutubePlayer" class="thumbnail-wrapper" @click="playYoutube">
              <img :src="`https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`" alt="Miniature" class="video-thumbnail"/>
              <div class="play-overlay">
                <svg class="play-icon-overlay" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="35" fill="rgba(212, 175, 55, 0.9)" stroke="white" stroke-width="3"/>
                  <polygon points="40,32 40,68 68,50" fill="white"/>
                </svg>
              </div>
            </div>

            <!-- YouTube Player -->
            <iframe v-if="activeTab === 'youtube' && showYoutubePlayer && youtubeVideoId"
              class="video-iframe"
              width="100%"
              height="100%"
              :src="youtubeEmbedUrl"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>

            <!-- YouTube Error -->
            <div v-if="activeTab === 'youtube' && youtubeUrl && !youtubeVideoId" class="error-message">
              <p>❌ URL YouTube invalide</p>
            </div>

            <!-- Local Thumbnail -->
            <div v-if="activeTab === 'local' && localThumbnail && !showLocalPlayer" class="thumbnail-wrapper" @click="playLocal">
              <img :src="localThumbnail" alt="Miniature" class="video-thumbnail"/>
              <div class="play-overlay">
                <svg class="play-icon-overlay" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="35" fill="rgba(212, 175, 55, 0.9)" stroke="white" stroke-width="3"/>
                  <polygon points="40,32 40,68 68,50" fill="white"/>
                </svg>
              </div>
            </div>

            <!-- Local Player -->
            <video v-if="activeTab === 'local' && showLocalPlayer && videoFile" 
              ref="localVideoPlayer"
              class="video-iframe" 
              width="100%" 
              height="100%" 
              controls
              :src="localVideoUrl"
              @loadedmetadata="seekLocalVideo">
            </video>

            <!-- Placeholder SVG -->
            <svg v-if="!youtubeVideoId && !localThumbnail" class="play-icon" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#666" stroke-width="2"/>
              <polygon points="40,30 40,70 70,50" fill="#666"/>
            </svg>

          </div>
        </div>

        <!-- YouTube URL Input -->
        <div class="form-group" v-if="activeTab === 'youtube'">
          <label for="youtubeUrl">URL YouTube <span class="required">*</span></label>
          <input type="url" id="youtubeUrl" v-model="youtubeUrl" placeholder="https://youtube.com/watch?v=..." class="form-input"/>
        </div>

        <!-- Local File Upload -->
        <div class="form-group" v-if="activeTab === 'local'">
          <label for="videoFile">Fichier vidéo <span class="required">*</span></label>
          <input type="file" id="videoFile" @change="handleFileChange" accept="video/*" class="form-input"/>
        </div>

        <!-- Autres champs identiques -->
        <div class="form-group">
          <label for="title">Titre de la technique</label>
          <input type="text" id="title" v-model="title" placeholder="Ex: Armbar depuis la garde fermée" class="form-input"/>
        </div>

        <div class="form-group">
          <label for="position">Position</label>
          <select id="position" v-model="position" class="form-select">
            <option value="">Sélectionner position</option>
            <option value="garde-fermee">Garde fermée</option>
            <option value="garde-ouverte">Garde ouverte</option>
            <option value="half-guard">Half guard</option>
            <option value="side-control">Side control</option>
            <option value="mount">Mount</option>
            <option value="back-control">Back control</option>
            <option value="turtle">Turtle</option>
            <option value="standing">Standing</option>
          </select>
        </div>

        <div class="form-group">
          <label for="tags">Tags</label>
          <input type="text" id="tags" v-model="tags" placeholder="sweep, entry, escape" class="form-input"/>
          <small class="form-hint">Séparez les tags par des virgules</small>
        </div>

        <div class="form-group">
          <label for="startTime">Heure de début</label>
          <input type="text" id="startTime" v-model="startTime" placeholder="1:30 ou 90s" class="form-input"/>
        </div>

        <div class="form-group">
          <label for="endTime">Heure de fin</label>
          <input type="text" id="endTime" v-model="endTime" placeholder="2:00 ou 120s" class="form-input"/>
        </div>

        <div class="form-group">
          <label for="difficulty">Difficulté</label>
          <select id="difficulty" v-model="difficulty" class="form-select">
            <option value="">Sélectionner difficulté</option>
            <option value="debutant">Débutant</option>
            <option value="intermediaire">Intermédiaire</option>
            <option value="avance">Avancé</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" v-model="description" rows="4" placeholder="Décrivez la technique, les points clés, les erreurs communes..." class="form-textarea"></textarea>
        </div>

        <button type="submit" class="submit-btn">Soumettre</button>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { API_BASE_URL } from '@/config/api'

const activeTab = ref('youtube')
const youtubeUrl = ref('')
const videoFile = ref(null)
const localThumbnail = ref(null)
const localVideoUrl = ref(null)
const title = ref('')
const position = ref('')
const tags = ref('')
const startTime = ref('')
const endTime = ref('')
const difficulty = ref('')
const description = ref('')

const showYoutubePlayer = ref(false)
const showLocalPlayer = ref(false)
const localVideoPlayer = ref(null)

// YouTube ID extraction
const youtubeVideoId = computed(() => {
  if (!youtubeUrl.value) return null
  return extractYouTubeId(youtubeUrl.value)
})

// YouTube embed URL with start/end
const youtubeEmbedUrl = computed(() => {
  if (!youtubeVideoId.value) return ''
  const start = timeToSeconds(startTime.value)
  const end = timeToSeconds(endTime.value)
  let url = `https://www.youtube.com/embed/${youtubeVideoId.value}?autoplay=1&rel=0`
  if (start > 0) url += `&start=${start}`
  if (end > 0) url += `&end=${end}`
  return url
})

// Watch YouTube URL to reset player
watch(youtubeUrl, () => {
  showYoutubePlayer.value = false
})

function switchTab(tab) {
  activeTab.value = tab
  showYoutubePlayer.value = false
  showLocalPlayer.value = false
  localThumbnail.value = null
  localVideoUrl.value = null
  videoFile.value = null
}

function playYoutube() {
  showYoutubePlayer.value = true
}

function playLocal() {
  showLocalPlayer.value = true
}

function seekLocalVideo() {
  const start = timeToSeconds(startTime.value)
  const end = timeToSeconds(endTime.value)
  if (localVideoPlayer.value && start > 0) {
    localVideoPlayer.value.currentTime = start
  }
  if (end > 0 && localVideoPlayer.value) {
    localVideoPlayer.value.addEventListener('timeupdate', () => {
      if (localVideoPlayer.value.currentTime >= end) {
        localVideoPlayer.value.pause()
      }
    })
  }
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('video/')) {
    videoFile.value = file
    localVideoUrl.value = URL.createObjectURL(file)
    showLocalPlayer.value = false
    generateThumbnail(file)
  } else {
    videoFile.value = null
    localThumbnail.value = null
    localVideoUrl.value = null
  }
}

function generateThumbnail(file) {
  const video = document.createElement('video')
  video.preload = 'metadata'
  video.src = URL.createObjectURL(file)
  video.muted = true
  video.playsInline = true

  video.onloadedmetadata = () => {
    video.currentTime = Math.min(2, video.duration)
  }

  video.onseeked = () => {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    localThumbnail.value = canvas.toDataURL('image/jpeg', 0.85)
    URL.revokeObjectURL(video.src)
  }

  video.onerror = () => {
    localThumbnail.value = null
  }
}

function extractYouTubeId(urlString) {
  if (!urlString) return null
  try {
    if (!urlString.startsWith('http')) urlString = 'https://' + urlString
    const url = new URL(urlString)
    if (url.hostname.includes('youtube.com')) {
      const videoId = url.searchParams.get('v')
      if (videoId && videoId.length === 11) return videoId
    }
    if (url.hostname.includes('youtu.be')) {
      const videoId = url.pathname.slice(1).split('?')[0]
      if (videoId && videoId.length === 11) return videoId
    }
    return null
  } catch { return null }
}

function timeToSeconds(time) {
  if (!time || time === "" || time === "0:00") return 0
  const parts = time.split(":").map(Number)
  if (parts.length === 2) {
    const [m, s] = parts
    return m * 60 + s
  } else if (parts.length === 3) {
    const [h, m, s] = parts
    return h * 3600 + m * 60 + s
  }
  if (/^\d+$/.test(time)) return Number(time)
  return 0
}

/*function handleSubmit() {
  if (activeTab.value === 'youtube' && !youtubeUrl.value) {
    alert('Veuillez entrer une URL YouTube')
    return
  }
  if (activeTab.value === 'local' && !videoFile.value) {
    alert('Veuillez sélectionner un fichier vidéo')
    return
  }
  if (!title.value) {
    alert('Veuillez entrer un titre')
    return
  }
  
  const videoId = youtubeVideoId.value
  const startSeconds = timeToSeconds(startTime.value)
  const endSeconds = timeToSeconds(endTime.value)
  
  const data = {
    source: activeTab.value,
    youtubeUrl: youtubeUrl.value,
    title: title.value,
    position: position.value,
    tags: tags.value.split(',').map(x => x.trim()).filter(Boolean),
    startTime: startTime.value,
    endTime: endTime.value,
    startTimeSeconds: startSeconds,
    endTimeSeconds: endSeconds,
    duration: endSeconds - startSeconds,
    difficulty: difficulty.value,
    description: description.value,
    videoId,
    thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : localThumbnail.value,
    uploadDate: new Date().toISOString()
  }
  
  console.log('Form data:', data)
  alert('Vidéo soumise avec succès !')
  
  // Reset
  youtubeUrl.value = ''
  videoFile.value = null
  localThumbnail.value = null
  localVideoUrl.value = null
  title.value = ''
  position.value = ''
  tags.value = ''
  startTime.value = ''
  endTime.value = ''
  difficulty.value = ''
  description.value = ''
  showYoutubePlayer.value = false
  showLocalPlayer.value = false
  activeTab.value = 'youtube'

*/
async function handleSubmit() {
  // Validation
  if (activeTab.value === 'youtube' && !youtubeUrl.value) {
    alert('Veuillez entrer une URL YouTube')
    return
  }
  if (activeTab.value === 'local' && !videoFile.value) {
    alert('Veuillez sélectionner un fichier vidéo')
    return
  }
  if (!title.value) {
    alert('Veuillez entrer un titre')
    return
  }
  
  // Préparer les données selon la source
  const videoData = {
    title: title.value,
    youtube_url: activeTab.value === 'youtube' ? youtubeUrl.value : '',
    local_file: activeTab.value === 'local' ? videoFile.value.name : '',
    position: position.value,
    tags: tags.value.split(',').map(x => x.trim()).filter(Boolean),
    start_time: startTime.value || '0:00',
    end_time: endTime.value || '0:00',
    description: description.value
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(videoData != null ? videoData : {})
    })
    const result = await response.json()
    
    if (response.ok) {
      alert('Vidéo ajoutée avec succès !')
      console.log('Vidéo créée:', result.video)
      
      // Reset...
      youtubeUrl.value = ''
      videoFile.value = null
      localThumbnail.value = null
      localVideoUrl.value = null
      title.value = ''
      position.value = ''
      tags.value = ''
      startTime.value = ''
      endTime.value = ''
      difficulty.value = ''
      description.value = ''
      showYoutubePlayer.value = false
      showLocalPlayer.value = false
      activeTab.value = 'youtube'
    } else {
      alert(`Erreur : ${result.error}`)
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi:', error)
    alert('Erreur de connexion au serveur')
  }
}


</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --bg-dark: #0f0f1e;
    --bg-darker: #080812;
    --neon-cyan: #00d9ff;
    --neon-purple: #b900ff;
    --neon-pink: #ff006e;
    --text-white: #ffffff;
    --text-gray: #c7c7c7;
    --card-bg: rgba(15, 15, 30, 0.85);
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #0f0f1e 0%, #1a0b2e 50%, #080812 100%);
    background-attachment: fixed;
    color: var(--text-white);
    min-height: 100vh;
    position: relative;
}

body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
        radial-gradient(circle at 20% 30%, rgba(0, 217, 255, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(185, 0, 255, 0.08) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
}

/* Navbar avec effet néon */
.navbar {
    background: rgba(8, 8, 18, 0.9);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: 1rem 2rem;
    box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.5),
        0 1px 0 rgba(0, 217, 255, 0.3);
    border-bottom: 2px solid rgba(0, 217, 255, 0.2);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-logo {
    font-size: 1.6rem;
    font-weight: 900;
    background: linear-gradient(135deg, var(--neon-cyan) 0%, var(--neon-purple) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 3px;
    filter: drop-shadow(0 0 15px rgba(0, 217, 255, 0.5));
    transition: all 0.3s ease;
}

.nav-logo:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 0 25px rgba(0, 217, 255, 0.8));
}

.nav-menu {
    display: flex;
    gap: 2.5rem;
}

.nav-link {
    color: var(--text-gray);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    transition: all 0.3s ease;
    position: relative;
}

.nav-link::before {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--neon-cyan), var(--neon-purple));
    box-shadow: 0 0 10px var(--neon-cyan);
    transition: width 0.3s ease;
}

.nav-link:hover {
    color: var(--neon-cyan);
    text-shadow: 0 0 15px rgba(0, 217, 255, 0.6);
}

.nav-link:hover::before {
    width: 100%;
}

.profile-img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid var(--neon-cyan);
    object-fit: cover;
    box-shadow: 
        0 0 20px rgba(0, 217, 255, 0.5),
        0 0 40px rgba(185, 0, 255, 0.3);
    transition: all 0.3s ease;
    cursor: pointer;
}

.profile-img:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 
        0 0 30px rgba(0, 217, 255, 0.8),
        0 0 60px rgba(185, 0, 255, 0.6);
}

/* Main Content */
.main-content {
    padding: 3rem 1.5rem;
    position: relative;
    z-index: 1;
}

.container {
    max-width: 750px;
    margin: 0 auto;
}

.page-title {
    font-size: 3.2rem;
    text-align: center;
    margin-bottom: 3rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 4px;
    background: linear-gradient(135deg, var(--neon-cyan) 0%, var(--neon-purple) 50%, var(--neon-pink) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 20px rgba(0, 217, 255, 0.6));
    animation: neonPulse 3s ease-in-out infinite;
}

@keyframes neonPulse {
    0%, 100% {
        filter: drop-shadow(0 0 20px rgba(0, 217, 255, 0.6));
    }
    50% {
        filter: drop-shadow(0 0 35px rgba(185, 0, 255, 0.8));
    }
}

/* Form avec effet glassmorphism + néon */
.video-form {
    background: var(--card-bg);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    padding: 2.5rem;
    border-radius: 24px;
    box-shadow: 
        0 8px 40px rgba(0, 0, 0, 0.6),
        inset 0 0 0 1px rgba(0, 217, 255, 0.2),
        0 0 60px rgba(0, 217, 255, 0.1);
    border: 1px solid rgba(0, 217, 255, 0.3);
    position: relative;
    overflow: hidden;
}

.video-form::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(0, 217, 255, 0.05) 50%,
        transparent 70%
    );
    animation: shimmer 6s linear infinite;
}

@keyframes shimmer {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Tabs avec effet néon */
.tab-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    background: rgba(0, 0, 0, 0.4);
    padding: 0.6rem;
    border-radius: 16px;
    border: 1px solid rgba(0, 217, 255, 0.2);
    position: relative;
    z-index: 1;
}

.tab-btn {
    flex: 1;
    padding: 1rem 2rem;
    border: none;
    background: transparent;
    color: var(--text-gray);
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    cursor: pointer;
    border-radius: 12px;
    transition: all 0.3s ease;
    position: relative;
}

.tab-btn.active {
    background: linear-gradient(135deg, rgba(0, 217, 255, 0.3), rgba(185, 0, 255, 0.3));
    color: var(--text-white);
    box-shadow: 
        0 0 20px rgba(0, 217, 255, 0.6),
        0 0 40px rgba(185, 0, 255, 0.4),
        inset 0 0 20px rgba(0, 217, 255, 0.2);
    text-shadow: 0 0 10px rgba(0, 217, 255, 0.8);
    border: 1px solid rgba(0, 217, 255, 0.5);
}

.tab-btn:hover:not(.active) {
    background: rgba(0, 217, 255, 0.1);
    color: var(--neon-cyan);
    text-shadow: 0 0 8px rgba(0, 217, 255, 0.5);
    border: 1px solid rgba(0, 217, 255, 0.3);
}

/* Video Preview avec bordure néon */
.video-preview {
    background: linear-gradient(135deg, rgba(15, 15, 30, 0.95) 0%, rgba(8, 8, 18, 0.98) 100%);
    border-radius: 16px;
    margin-bottom: 2rem;
    overflow: hidden;
    aspect-ratio: 16/9;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(0, 217, 255, 0.4);
    box-shadow: 
        0 0 30px rgba(0, 217, 255, 0.3),
        0 0 60px rgba(185, 0, 255, 0.2),
        inset 0 0 40px rgba(0, 217, 255, 0.05);
    position: relative;
    z-index: 1;
}

.preview-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.play-icon {
    width: 100px;
    height: 100px;
    filter: drop-shadow(0 0 20px rgba(0, 217, 255, 0.6));
    transition: all 0.3s ease;
}

.play-icon:hover {
    transform: scale(1.15);
    filter: drop-shadow(0 0 40px rgba(0, 217, 255, 0.9));
}

.play-icon circle {
    stroke: var(--neon-cyan);
    stroke-width: 3;
}

.play-icon polygon {
    fill: var(--neon-cyan);
}

.thumbnail-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
    overflow: hidden;
}

.video-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
}

.thumbnail-wrapper:hover .video-thumbnail {
    transform: scale(1.05);
}

.play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    transition: all 0.3s ease;
}

.thumbnail-wrapper:hover .play-overlay {
    background: rgba(0, 0, 0, 0.6);
}

.play-icon-overlay {
    width: 80px;
    height: 80px;
    filter: drop-shadow(0 5px 20px rgba(0, 217, 255, 0.8));
    transition: transform 0.3s ease;
}

.thumbnail-wrapper:hover .play-icon-overlay {
    transform: scale(1.2);
    filter: drop-shadow(0 5px 30px rgba(0, 217, 255, 1));
}

.video-iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 12px;
    background: #000;
}

.error-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--neon-pink);
    font-weight: 600;
    text-shadow: 0 0 10px rgba(255, 0, 110, 0.6);
}

/* Form Groups avec labels néon */
.form-group {
    margin-bottom: 1.8rem;
    position: relative;
    z-index: 1;
}

.form-group label {
    display: block;
    margin-bottom: 0.7rem;
    color: var(--neon-cyan);
    font-weight: 700;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    text-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
}

.required {
    color: var(--neon-pink);
    text-shadow: 0 0 10px rgba(255, 0, 110, 0.6);
}

.form-input,
.form-select,
.form-textarea {
    width: 100%;
    padding: 1rem 1.2rem;
    border: 2px solid rgba(0, 217, 255, 0.3);
    border-radius: 12px;
    font-size: 1rem;
    font-family: inherit;
    background: rgba(0, 0, 0, 0.5);
    color: var(--text-white);
    transition: all 0.3s ease;
}

.form-input::placeholder,
.form-textarea::placeholder {
    color: rgba(199, 199, 199, 0.5);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
    outline: none;
    border-color: var(--neon-cyan);
    background: rgba(0, 0, 0, 0.7);
    box-shadow: 
        0 0 20px rgba(0, 217, 255, 0.4),
        inset 0 0 20px rgba(0, 217, 255, 0.1);
    transform: translateY(-2px);
}

.form-select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300d9ff' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1.2rem center;
    padding-right: 2.8rem;
}

.form-select option {
    background: var(--bg-darker);
    color: var(--text-white);
}

.form-textarea {
    resize: vertical;
    min-height: 110px;
}

.form-hint {
    display: block;
    margin-top: 0.5rem;
    color: rgba(199, 199, 199, 0.7);
    font-size: 0.85rem;
    font-style: italic;
}

/* Submit Button avec effet néon intense */
.submit-btn {
    width: 100%;
    padding: 1.3rem;
    background: linear-gradient(135deg, var(--neon-cyan) 0%, var(--neon-purple) 100%);
    color: var(--text-white);
    border: none;
    border-radius: 12px;
    font-size: 1.15rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 2px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1.5rem;
    box-shadow: 
        0 0 30px rgba(0, 217, 255, 0.6),
        0 0 60px rgba(185, 0, 255, 0.4),
        inset 0 0 20px rgba(255, 255, 255, 0.2);
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
    position: relative;
    overflow: hidden;
    z-index: 1;
}

.submit-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.submit-btn:hover::before {
    width: 400px;
    height: 400px;
}

.submit-btn:hover {
    transform: translateY(-3px);
    box-shadow: 
        0 0 40px rgba(0, 217, 255, 0.9),
        0 0 80px rgba(185, 0, 255, 0.7),
        inset 0 0 30px rgba(255, 255, 255, 0.3);
}

.submit-btn:active {
    transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
    .nav-menu {
        gap: 1rem;
    }
    
    .nav-link {
        font-size: 0.8rem;
    }
    
    .page-title {
        font-size: 2.2rem;
        letter-spacing: 2px;
    }
    
    .video-form {
        padding: 1.8rem;
    }
    
    .tab-btn {
        padding: 0.9rem 1rem;
        font-size: 0.9rem;
    }
    
    .form-input,
    .form-select,
    .form-textarea {
        font-size: 16px;
    }
}

/* Scrollbar néon */
::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    background: var(--bg-darker);
}

::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--neon-cyan), var(--neon-purple));
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
}

::-webkit-scrollbar-thumb:hover {
    box-shadow: 0 0 20px rgba(0, 217, 255, 0.8);
}

/* Animations d'entrée */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.video-form {
    animation: fadeInUp 0.8s ease-out;
}
</style>
