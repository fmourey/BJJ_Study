<template>
  <Header />

  <main class="container block">
    <h2 class="block">Add a video</h2>

    <form @submit.prevent="handleSubmit" class="card video-form">

      <div class="tabs block">
        <button
          type="button"
          class="btn"
          :class="activeTab === 'youtube' ? 'btn-primary' : 'btn-ghost'"
          @click="switchTab('youtube')"
        >
          YouTube
        </button>
      </div>

      <div class="video-preview block">
        <button
          v-if="activeTab === 'youtube' && youtubeVideoId && !showYoutubePlayer"
          type="button"
          class="thumb"
          @click="playYoutube"
          aria-label="Lire la vidéo YouTube"
        >
          <img
            class="thumb-img"
            :src="`https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`"
            alt="Miniature YouTube"
          />
          <span class="thumb-play">▶</span>
        </button>

        <iframe
          v-if="activeTab === 'youtube' && showYoutubePlayer && youtubeVideoId"
          class="video-frame"
          :src="youtubeEmbedUrl"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>

        <div
          v-if="activeTab === 'youtube' && youtubeUrl && !youtubeVideoId"
          class="state state-error"
        >
          Invalid YouTube URL
        </div>

        <div
          v-if="
            (activeTab === 'youtube' && !youtubeUrl && !youtubeVideoId && !showYoutubePlayer)"
          class="state"
        >
          Video preview
        </div>
      </div>

      <div class="field block" v-if="activeTab === 'youtube'">
        <label for="youtubeUrl">YouTube URL<span class="req">*</span></label>
        <input
          id="youtubeUrl"
          type="url"
          v-model="youtubeUrl"
          placeholder="https://youtube.com/watch?v=..."
          class="input"
        />
      </div>

      <div class="form-grid block">
        <div class="field">
          <label for="title">Title</label>
          <input id="title" type="text" v-model="title" class="input" placeholder="The best bjj fight" />
        </div>

        <div class="field">
          <PositionAutocomplete v-model="position">
            <template #no-results="{ search, select }">
              <div
                v-if="search"
                class="position-item add-new"
                @click="createPosition(search, select)"
              >
                Add "{{ search }}"
              </div>
            </template>
          </PositionAutocomplete>
        </div>

        <div class="field">
          <label for="tags">Tags</label>
          <input id="tags" type="text" v-model="tags" class="input" placeholder="sweep, entry, escape" />
          <small class="hint">Separate tags with commas</small>
        </div>

        <div class="field">
          <label for="startTime">Start time</label>
          <input id="startTime" type="text" v-model="startTime" class="input" placeholder="1:30 or 90s" />
        </div>

        <div class="field">
          <label for="endTime">End time</label>
          <input id="endTime" type="text" v-model="endTime" class="input" placeholder="2:00 ou 120s" />
        </div>

        <div class="field">
          <label>Difficulty</label>

          <div class="position-autocomplete">
            <div
              class="input"
              @click="isDifficultyOpen = !isDifficultyOpen"
              style="cursor:pointer;"
            >
              <span :class="{ 'placeholder-text': !difficulty }">
                {{ difficulty || 'Select a difficulty' }}
              </span>
            </div>

            <div v-if="isDifficultyOpen" class="position-dropdown">
              <div
                v-for="level in difficultyOptions"
                :key="level"
                class="position-item"
                @click="selectDifficulty(level)"
              >
                {{ level }}
              </div>
            </div>
          </div>
        </div>

        <div class="field full">
          <label for="description">Description</label>
          <textarea id="description" v-model="description" class="input" rows="5"></textarea>
        </div>
      </div>

      <button type="submit" class="btn btn-primary submit-btn">
        Submit
      </button>
    </form>
  </main>

  <Footer />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE_URL } from '@/config/api'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { useAuth0 } from '@auth0/auth0-vue'
import PositionAutocomplete from '@/components/PositionAutocomplete.vue'

const { getAccessTokenSilently, loginWithRedirect } = useAuth0()
const activeTab = ref('youtube')
const youtubeUrl = ref('')
const videoFile = ref(null)
const title = ref('')
const position = ref(null)
const tags = ref('')
const startTime = ref('')
const endTime = ref('')
const difficulty = ref('')
const isDifficultyOpen = ref(false)
const difficultyOptions = ['Beginner', 'Intermediate', 'Advanced']
const description = ref('')
const router = useRouter()

const showYoutubePlayer = ref(false)

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

function playYoutube() {
  showYoutubePlayer.value = true
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

async function createPosition(name, select) {
  const newName = name.trim()
  if (!newName) return

  try {
    const token = await getAccessTokenSilently()

    const response = await fetch(`${API_BASE_URL}/api/positions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: newName })
    })

    if (!response.ok) {
      throw new Error('Failed to create')
    }

    select(newName)

  } catch (err) {
    console.error("Create position error:", err)
  }
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

function selectDifficulty(level) {
  difficulty.value = level
  isDifficultyOpen.value = false
}

async function handleSubmit() {
  // Validation frontend
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

  let token
  try {
    token = await getAccessTokenSilently()
  } catch (e) {
    // Auth0 non prêt / session invalide
    alert(`Erreur : ${e.message}`)
    const confirmLogin = window.confirm(
      'Vous devez être connecté pour publier une vidéo.\n\nSouhaitez-vous vous connecter maintenant ?'
    )
    if (confirmLogin) {
      await loginWithRedirect({ appState: { targetUrl: '/addvideo' } })
    }
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(videoData)
    })

    if (response.status === 401 || response.status === 403) {
      const confirmLogin = window.confirm(
        'Connexion requise\n\nVous devez être connecté pour publier une vidéo.\n\nSouhaitez-vous vous connecter maintenant ?'
      )

      if (confirmLogin) {
        await loginWithRedirect({
          appState: { targetUrl: '/addvideo' }
        })
      }
      return
    }

    const result = await response.json()

    if (!response.ok) {
      alert(result.error || 'Erreur lors de la publication')
      return
    }

    router.push(`/video/${result.id}`)

  } catch (error) {
    console.error('Erreur réseau:', error)
    alert('Erreur de connexion au serveur')
  }
}

</script>

<style scoped>
.video-form {
  padding: 24px;
}

.tabs {
  display: flex;
  gap: 12px;
}

.video-preview {
  aspect-ratio: 16 / 9;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.thumb {
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  color: white;
  text-shadow: 0 6px 24px rgba(0,0,0,.35);
  background: rgba(15, 23, 42, 0.25);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: rgba(15,23,42,.85);
}

.req { color: var(--brand); }

.hint {
  color: var(--muted);
  font-size: 12px;
}

.form-grid {
  display: grid;
  gap: 16px;
}

.full { grid-column: 1 / -1; }

textarea.input {
  min-height: 120px;
  resize: vertical;
  border-radius: var(--radius-md);
}

.add-new {
  font-weight: 600;
}

.add-new:hover {
  background: rgba(220,38,38,.08);
}

.submit-btn {
  width: 100%;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
