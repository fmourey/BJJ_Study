<template>
  <Header />

  <main class="container block">

    <h1 class="block">My profile</h1>

    <div v-if="loading" class="state">Chargement...</div>
    <div v-if="error" class="state state-error">{{ error }}</div>

    <div v-if="!loading && user">

      <section class="card profile-hero">
        <div v-if="!editing">

          <div class="hero-top">
            <div class="avatar-xl">
              <img v-if="user.profile_photo" :src="user.profile_photo" />
              <span v-else>{{ initials }}</span>
            </div>

            <div class="hero-info">
              <h2>{{ user.pseudo || user.name }}</h2>

              <p v-if="age !== null" class="muted">
                {{ age }} ans
              </p>
            </div>

            <button v-if="canEdit" class="btn btn-ghost" @click="startEdit">
              Modifier
            </button>
          </div>

          <div class="hero-stats">
            <div class="stat">
              <div class="stat-icon">
                🏠
              </div>
              <div class="stat-value">{{ user.bjj_club || "-" }}</div>
            </div>

            <div class="stat">
              <div class="stat-icon">
                🥋
              </div>
              <div class="stat-value">{{ user.bjj_belt || "-" }}</div>
            </div>

            <div class="stat">
              <div class="stat-icon">
                🎥
              </div>
              <div class="stat-value">{{ publishedVideos.length }}</div>
            </div>
          </div>

        </div>

        <form v-else-if="canEdit" @submit.prevent="saveProfile" class="edit-grid">

          <div class="field">
            <label>Name</label>
            <input v-model="form.name" class="input" required />
          </div>

          <div class="field">
            <label>Surname</label>
            <input v-model="form.surname" class="input" />
          </div>

          <div class="field">
            <label>Email</label>
            <input v-model="form.email" type="email" class="input" required />
          </div>

          <div class="field">
            <label>Birthdate</label>
            <input v-model="form.birthdate" type="date" class="input" />
          </div>

          <div class="field">
            <label>Pseudo</label>
            <input v-model="form.pseudo" class="input" />
          </div>

          <div class="field">
            <label>Club</label>
            <input v-model="form.bjj_club" class="input" />
          </div>

          <div class="field">
            <label>Belt</label>
            <select v-model="form.bjj_belt" class="input">
              <option value="">Select</option>
              <option value="blanche">White</option>
              <option value="bleu">Blue</option>
              <option value="pourpre">Purple</option>
              <option value="marron">Brown</option>
              <option value="noire">Black</option>
            </select>
          </div>

          <div class="field">
            <label>City</label>
            <input v-model="form.bjj_city" class="input" />
          </div>

          <div class="field full">
            <label>Picture URL</label>
            <input v-model="form.profile_photo" class="input" />
          </div>

          <div class="form-actions full">
            <button class="btn btn-primary" :disabled="saving">
              {{ saving ? "Sauvegarde..." : "Sauvegarder" }}
            </button>

            <button type="button" class="btn btn-ghost" @click="cancelEdit">
              Annuler
            </button>
          </div>

        </form>

        <div v-else class="state state-error">
          You don't have permission to edit this profile.
        </div>

      </section>

      <div class="card profile-studies">
        <h2>My studies</h2>
        <div class="tabs block">
          <button
            class="btn"
            :class="view === 'published' ? 'btn-primary' : 'btn-ghost'"
            @click="view = 'published'"
          >
            Mes vidéos ({{ publishedVideos.length }})
          </button>

          <button
            class="btn"
            :class="view === 'liked' ? 'btn-primary' : 'btn-ghost'"
            @click="view = 'liked'"
          >
            Vidéos likées ({{ likedVideos.length }})
          </button>
      </div>

      <div class="grid">
        <VideoCard
          v-for="video in currentVideos"
          :key="video.id"
          :video="video"
        />
      </div>

      <div v-if="currentVideos.length === 0" class="state">
        Aucune vidéo.
      </div>
      </div>

    </div>

  </main>

  <Footer />
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"
import { useRouter, useRoute } from "vue-router"
import Header from "@/components/Header.vue"
import Footer from "@/components/Footer.vue"
import VideoCard from "@/components/VideoCard.vue"
import { API_BASE_URL } from "@/config/api"

const { getAccessTokenSilently, isAuthenticated, user: currentUser } = useAuth0()
const router = useRouter()
const route = useRoute()

const user = ref(null)
const form = ref({})
const loading = ref(true)
const error = ref("")
const editing = ref(false)
const saving = ref(false)

const publishedVideos = ref([])
const likedVideos = ref([])
const view = ref("published")

watch(
  () => route.params.auth0_id,
  () => {
    loading.value = true
    error.value = ""
    fetchProfile()
  }
)

// Determine if we're viewing the current user's profile
const isOwnProfile = computed(() => {
  if (!currentUser.value || !user.value) return false
  return currentUser.value.sub === user.value.auth0_id
})

const canEdit = computed(() => isOwnProfile.value)

const currentVideos = computed(() =>
  view.value === "published" ? publishedVideos.value : likedVideos.value
)

const initials = computed(() => {
  if (!user.value) return ""
  return (
    (user.value.name?.[0] || "") +
    (user.value.surname?.[0] || "")
  ).toUpperCase()
})

const age = computed(() => {
  if (!user.value?.birthdate) return null

  const today = new Date()
  const birth = new Date(user.value.birthdate)

  let years = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    years--
  }

  return years
})

function startEdit() {
  if (!canEdit.value) return
  form.value = { ...user.value }
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function fetchProfile() {
  try {
    const userId = route.params.auth0_id

    if (userId && userId !== currentUser.value?.sub) {
      // Fetching another user's public profile
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`)
      user.value = await res.json()
    } else {
      // Fetching current user's profile
      const token = await getAccessTokenSilently()
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
            if (res.status === 404) {
        user.value = {
          auth0_id: currentUser.value.sub,
          name: currentUser.value.name || "",
          email: currentUser.value.email || ""
        }
        editing.value = true
        return
      }

      user.value = await res.json()
    }
  } catch (e) {
    error.value = e + " - Erreur chargement profil"
  } finally {
    loading.value = false
  }
}

async function fetchVideos() {
  const token = await getAccessTokenSilently()

  const [pub, liked] = await Promise.all([
    fetch(`${API_BASE_URL}/api/users/videos/published`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    fetch(`${API_BASE_URL}/api/users/videos/liked`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  ])

  if (pub.ok) publishedVideos.value = await pub.json()
  if (liked.ok) likedVideos.value = await liked.json()
}

async function saveProfile() {
  saving.value = true
  try {
    const token = await getAccessTokenSilently()
    const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form.value)
    })

    user.value = await res.json()
    editing.value = false
  } catch {
    error.value = "Erreur sauvegarde"
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (!isAuthenticated.value) {
    router.push("/")
    return
  }
  fetchProfile()
  fetchVideos()
})
</script>

<style scoped>

.profile-hero {
  padding: 32px;
}

.profile-studies {
  margin-top: 32px;
  padding: 24px;
}

.hero-top {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.avatar-xl {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: var(--surface-2);
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 28px;
  overflow: hidden;
}

.avatar-xl img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.muted {
  color: var(--muted);
}

.hero-stats {
  margin-top: 32px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 20px;
}

.stat {
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 18px;
  text-align: center;
}

.stat-value {
  font-weight: 900;
  font-size: 20px;
}

.stat-icon {
  font-size: 22px;
  margin-bottom: 8px;
}

.hero-description {
  margin-top: 28px;
  padding: 20px;
  background: var(--surface-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
}

.edit-grid {
  margin-top: 24px;
  display: grid;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.full {
  grid-column: 1 / -1;
}

.tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .edit-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

</style>
