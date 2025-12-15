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
    const response = await fetch('http://localhost:3000/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(videoData)
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
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: 
    radial-gradient(ellipse at top right, rgba(220, 38, 38, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at bottom left, rgba(0, 0, 0, 0.05) 0%, transparent 50%),
    linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%);
  background-attachment: fixed;
  color: #0f0f0f;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* Effet tatami en background */
body::before {
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

/* Navbar avec glassmorphism */
.navbar {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  padding: 1.2rem 2rem;
  box-shadow: 
    0 4px 16px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.9);
  border-bottom: 1px solid rgba(255,255,255,0.18);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: 1.6rem;
  font-weight: 900;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 3px;
  transition: all 0.25s ease;
}

.nav-logo:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 0 15px rgba(220, 38, 38, 0.4));
}

.nav-menu {
  display: flex;
  gap: 2.5rem;
}

.nav-link {
  color: #475569;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  transition: all 0.25s ease;
  position: relative;
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #dc2626, #b91c1c);
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.4);
  transition: width 0.25s ease;
  border-radius: 2px;
}

.nav-link:hover {
  color: #dc2626;
}

.nav-link:hover::before {
  width: 100%;
}

.profile-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid #dc2626;
  object-fit: cover;
  box-shadow: 
    0 4px 12px rgba(220, 38, 38, 0.3),
    0 0 20px rgba(220, 38, 38, 0.2);
  transition: all 0.25s ease;
  cursor: pointer;
}

.profile-img:hover {
  transform: scale(1.1);
  box-shadow: 
    0 6px 20px rgba(220, 38, 38, 0.5),
    0 0 30px rgba(220, 38, 38, 0.3);
}

/* Main Content */
.main-content {
  padding: 3rem 1.5rem;
  position: relative;
  z-index: 1;
}

.container {
  max-width: 850px;
  margin: 0 auto;
}

.page-title {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: #0f172a;
  position: relative;
  padding-bottom: 1rem;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 4px;
  background: linear-gradient(90deg, #dc2626, #fbbf24);
  border-radius: 2px;
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.4);
}

/* Form avec glassmorphism BJJ */
.video-form {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  padding: 2.5rem;
  border-radius: 24px;
  box-shadow: 
    0 12px 48px rgba(0,0,0,0.1),
    inset 0 1px 0 rgba(255,255,255,0.9);
  border: 1px solid rgba(255,255,255,0.18);
  position: relative;
  overflow: hidden;
}

/* Bordure accent rouge */
.video-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #dc2626, #fbbf24);
}

/* Tabs avec style BJJ */
.tab-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: rgba(248, 250, 252, 0.6);
  backdrop-filter: blur(8px);
  padding: 0.6rem;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  position: relative;
  z-index: 1;
}

.tab-btn {
  flex: 1;
  padding: 1rem 2rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.25s ease;
  font-family: 'Outfit', sans-serif;
}

.tab-btn.active {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  box-shadow: 
    0 4px 15px rgba(220, 38, 38, 0.4),
    inset 0 1px 0 rgba(255,255,255,0.2);
}

.tab-btn:hover:not(.active) {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

/* Video Preview avec bordure dorée */
.video-preview {
  background: linear-gradient(135deg, rgba(15, 15, 30, 0.95) 0%, rgba(26, 26, 40, 0.98) 100%);
  border-radius: 18px;
  margin-bottom: 2rem;
  overflow: hidden;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(251, 191, 36, 0.4);
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.12),
    0 0 40px rgba(251, 191, 36, 0.15),
    inset 0 0 40px rgba(251, 191, 36, 0.05);
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
  filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.6));
  transition: all 0.25s ease;
}

.play-icon:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.8));
}

.play-icon circle {
  stroke: #fbbf24;
  stroke-width: 3;
}

.play-icon polygon {
  fill: #fbbf24;
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
  background: rgba(0, 0, 0, 0.5);
  transition: all 0.25s ease;
}

.thumbnail-wrapper:hover .play-overlay {
  background: rgba(0, 0, 0, 0.65);
}

.play-icon-overlay {
  width: 90px;
  height: 90px;
  filter: drop-shadow(0 5px 25px rgba(251, 191, 36, 0.8));
  transition: transform 0.25s ease;
}

.thumbnail-wrapper:hover .play-icon-overlay {
  transform: scale(1.15);
  filter: drop-shadow(0 5px 35px rgba(251, 191, 36, 1));
}

.video-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 14px;
  background: #000;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #dc2626;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 2rem;
  background: rgba(254, 242, 242, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
}

/* Form Groups avec labels style BJJ */
.form-group {
  margin-bottom: 1.8rem;
  position: relative;
  z-index: 1;
}

.form-group label {
  display: block;
  margin-bottom: 0.7rem;
  color: #1e293b;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.required {
  color: #dc2626;
  font-weight: 900;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 1rem 1.2rem;
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 14px;
  font-size: 1rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  background: rgba(248, 250, 252, 0.7);
  backdrop-filter: blur(8px);
  color: #0f172a;
  transition: all 0.25s ease;
  box-shadow: 
    0 2px 8px rgba(0,0,0,0.04),
    inset 0 1px 0 rgba(255,255,255,0.8);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #dc2626;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 
    0 0 0 4px rgba(220, 38, 38, 0.1),
    0 0 20px rgba(220, 38, 38, 0.15),
    inset 0 2px 4px rgba(0,0,0,0.02);
  transform: translateY(-1px);
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath fill='%23dc2626' d='M7 10L2 5h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1.2rem center;
  padding-right: 2.8rem;
}

.form-select option {
  background: white;
  color: #0f172a;
  font-weight: 600;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.form-hint {
  display: block;
  margin-top: 0.6rem;
  color: #64748b;
  font-size: 0.85rem;
  font-style: italic;
  font-weight: 500;
}

/* Submit Button avec style BJJ */
.submit-btn {
  width: 100%;
  padding: 1.4rem;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-top: 1.5rem;
  font-family: 'Outfit', sans-serif;
  box-shadow: 
    0 6px 25px rgba(220, 38, 38, 0.4),
    inset 0 1px 0 rgba(255,255,255,0.2);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 8px 35px rgba(220, 38, 38, 0.5),
    inset 0 1px 0 rgba(255,255,255,0.25);
  filter: brightness(1.05);
}

.submit-btn:active {
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .nav-menu {
    gap: 1.2rem;
  }
  
  .nav-link {
    font-size: 0.85rem;
    letter-spacing: 0.8px;
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
    letter-spacing: 1px;
  }
  
  .form-input,
  .form-select,
  .form-textarea {
    font-size: 16px; /* Empêche le zoom sur iOS */
  }

  .video-preview {
    aspect-ratio: 16/10;
  }

  .play-icon,
  .play-icon-overlay {
    width: 70px;
    height: 70px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 2rem 1rem;
  }

  .container {
    max-width: 100%;
  }

  .video-form {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .nav-logo {
    font-size: 1.3rem;
  }

  .profile-img {
    width: 40px;
    height: 40px;
  }

  .tab-container {
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .tab-btn {
    padding: 0.8rem 0.6rem;
    font-size: 0.8rem;
  }
}

/* Scrollbar style BJJ */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: #f0f0f0;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #dc2626, #b91c1c);
  border-radius: 10px;
  border: 2px solid #f0f0f0;
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.3);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #b91c1c, #991b1b);
  box-shadow: 0 0 15px rgba(220, 38, 38, 0.5);
}
</style>
