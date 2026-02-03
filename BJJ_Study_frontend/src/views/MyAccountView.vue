<template>
  <Header />
  <main class="main-content">
    <div class="container">
      <h1 class="page-title">Mon Profil</h1>

      <div v-if="loading" class="loading">
        Chargement des informations...
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="!loading && user" class="profile-container">
        <!-- Section 1: Profil Personnel -->
        <section class="profile-section personal-section">
          <div class="profile-header">
            <div class="profile-photo-container">
              <img
                v-if="user.profile_photo"
                :src="user.profile_photo"
                :alt="user.name"
                class="profile-photo"
              />
              <div v-else class="profile-photo-placeholder">
                {{ getInitials(user.name, user.surname) }}
              </div>
            </div>
            <div class="profile-info">
              <h2 class="user-pseudo">{{ user.pseudo }}</h2>
              <p class="user-email">{{ user.email }}</p>
            </div>
            <button class="edit-btn" @click="toggleEditPersonal">
              {{ editingPersonal ? '✕' : '✎' }} {{ editingPersonal ? 'Fermer' : 'Modifier' }}
            </button>
          </div>

          <!-- Edit Personal Info Form -->
          <form v-if="editingPersonal" @submit.prevent="savePersonalInfo" class="edit-form">
            <div class="form-group">
              <label for="name">Prénom</label>
              <input
                type="text"
                id="name"
                v-model="editUser.name"
                placeholder="Votre prénom"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label for="surname">Nom</label>
              <input
                type="text"
                id="surname"
                v-model="editUser.surname"
                placeholder="Votre nom"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="pseudo">Pseudo</label>
              <input
                type="text"
                id="pseudo"
                v-model="editUser.pseudo"
                placeholder="Votre pseudo (optionnel)"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="birthdate">Date de naissance</label>
              <input
                type="date"
                id="birthdate"
                v-model="editUser.birthdate"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="profile_photo">Photo de profil (URL)</label>
              <input
                type="url"
                id="profile_photo"
                v-model="editUser.profile_photo"
                placeholder="https://..."
                class="form-input"
              />
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-btn" :disabled="isSubmitting">
                {{ isSubmitting ? 'Sauvegarde...' : 'Sauvegarder' }}
              </button>
              <button type="button" class="cancel-btn" @click="toggleEditPersonal">
                Annuler
              </button>
            </div>
          </form>

          <!-- Display Personal Info -->
          <div v-else class="info-display">
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date de naissance:</span>
              <span class="info-value">{{ user.birthdate || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Compte créé le:</span>
              <span class="info-value">{{ formatDate(user.created_at) }}</span>
            </div>
          </div>
        </section>

        <!-- Section 2: Profil BJJ -->
        <section class="profile-section bjj-section">
          <div class="section-header">
            <h2 class="section-title">Mon Profil BJJ</h2>
            <button class="edit-btn" @click="toggleEditBJJ">
              {{ editingBJJ ? '✕' : '✎' }} {{ editingBJJ ? 'Fermer' : 'Modifier' }}
            </button>
          </div>

          <!-- Edit BJJ Info Form -->
          <form v-if="editingBJJ" @submit.prevent="saveBJJInfo" class="edit-form">
            <div class="form-group">
              <label for="bjj_club">Club</label>
              <input
                type="text"
                id="bjj_club"
                v-model="editUser.bjj_club"
                placeholder="Nom de votre club"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="bjj_belt">Ceinture</label>
              <select id="bjj_belt" v-model="editUser.bjj_belt" class="form-input">
                <option value="">Sélectionner une ceinture</option>
                <option value="blanche">Blanche</option>
                <option value="bleu">Bleu</option>
                <option value="pourpre">Pourpre</option>
                <option value="marron">Marron</option>
                <option value="noire">Noire</option>
              </select>
            </div>

            <div class="form-group">
              <label for="bjj_city">Ville</label>
              <input
                type="text"
                id="bjj_city"
                v-model="editUser.bjj_city"
                placeholder="Votre ville"
                class="form-input"
              />
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-btn" :disabled="isSubmitting">
                {{ isSubmitting ? 'Sauvegarde...' : 'Sauvegarder' }}
              </button>
              <button type="button" class="cancel-btn" @click="toggleEditBJJ">
                Annuler
              </button>
            </div>
          </form>

          <!-- Display BJJ Info -->
          <div v-else class="bjj-info">
            <div class="info-row">
              <span class="info-label">Club:</span>
              <span class="info-value">{{ user.bjj_club || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ceinture:</span>
              <span class="info-value bjj-belt" :class="`belt-${user.bjj_belt}`">{{ user.bjj_belt || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ville:</span>
              <span class="info-value">{{ user.bjj_city || '-' }}</span>
            </div>
          </div>
        </section>

        <!-- Section 3: Mes Vidéos -->
        <section class="profile-section videos-section">
          <h2 class="section-title">Mes Vidéos</h2>

          <!-- Toggle Buttons -->
          <div class="videos-toggle">
            <button
              class="toggle-btn"
              :class="{ active: videosView === 'published' }"
              @click="videosView = 'published'"
            >
              📹 Mes Vidéos Publiées ({{ publishedVideos.length }})
            </button>
            <button
              class="toggle-btn"
              :class="{ active: videosView === 'liked' }"
              @click="videosView = 'liked'"
            >
              ❤️ Mes Vidéos Likées ({{ likedVideos.length }})
            </button>
          </div>

          <!-- Videos Grid -->
          <div v-if="videosView === 'published'" class="videos-grid">
            <div v-if="publishedVideos.length === 0" class="no-videos">
              Vous n'avez pas encore publié de vidéos.
            </div>
            <VideoCard
              v-for="video in publishedVideos"
              :key="video.id"
              :video="video"
            />
          </div>

          <div v-if="videosView === 'liked'" class="videos-grid">
            <div v-if="likedVideos.length === 0" class="no-videos">
              Vous n'avez pas encore liké de vidéos.
            </div>
            <VideoCard
              v-for="video in likedVideos"
              :key="video.id"
              :video="video"
            />
          </div>
        </section>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import VideoCard from '../components/VideoCard.vue'
import { API_BASE_URL } from '../config/api'

const { user: auth0User, isAuthenticated, getAccessTokenSilently } = useAuth0()
const router = useRouter()

const user = ref({
  email: '',
  name: '',
  surname: '',
  pseudo: '',
  birthdate: '',
  profile_photo: '',
  bjj_club: '',
  bjj_belt: '',
  bjj_city: '',
  created_at: '',
  updated_at: ''
})

const editUser = ref({})
const loading = ref(true)
const isSubmitting = ref(false)
const error = ref('')
const successMessage = ref('')

const editingPersonal = ref(false)
const editingBJJ = ref(false)
const videosView = ref('published')

const publishedVideos = ref([])
const likedVideos = ref([])

const loadingVideos = computed(() =>
  publishedVideos.value.length === 0 && likedVideos.value.length === 0
)

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get initials for profile placeholder
const getInitials = (name, surname) => {
  const first = (name || '').charAt(0).toUpperCase()
  const last = (surname || '').charAt(0).toUpperCase()
  return first + last
}

// Toggle edit forms
const toggleEditPersonal = () => {
  editingPersonal.value = !editingPersonal.value
  if (editingPersonal.value) {
    editUser.value = JSON.parse(JSON.stringify(user.value))
  }
}

const toggleEditBJJ = () => {
  editingBJJ.value = !editingBJJ.value
  if (editingBJJ.value) {
    editUser.value = JSON.parse(JSON.stringify(user.value))
  }
}

// Fetch user profile
const fetchUserProfile = async () => {
  try {
    loading.value = true
    error.value = ''

    const token = await getAccessTokenSilently()
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        // New user - initialize with Auth0 data
        user.value = {
          email: auth0User.value?.email || '',
          name: auth0User.value?.given_name || auth0User.value?.name || '',
          surname: auth0User.value?.family_name || '',
          pseudo: '',
          birthdate: '',
          profile_photo: auth0User.value?.picture || '',
          bjj_club: '',
          bjj_belt: '',
          bjj_city: '',
          created_at: '',
          updated_at: ''
        }
      } else {
        throw new Error('Erreur lors du chargement du profil')
      }
    } else {
      const data = await response.json()
      user.value = data
    }
  } catch (err) {
    console.error('Error fetching profile:', err)
    error.value = err.message || 'Erreur lors du chargement du profil'
  } finally {
    loading.value = false
  }
}

// Fetch user's videos
const fetchUserVideos = async () => {
  try {
    const token = await getAccessTokenSilently()

    const [publishedRes, likedRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/users/videos/published`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${API_BASE_URL}/api/users/videos/liked`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    ])

    if (publishedRes.ok) {
      publishedVideos.value = await publishedRes.json()
    }

    if (likedRes.ok) {
      likedVideos.value = await likedRes.json()
    }
  } catch (err) {
    console.error('Error fetching videos:', err)
  }
}

// Save personal info
const savePersonalInfo = async () => {
  try {
    isSubmitting.value = true
    error.value = ''
    successMessage.value = ''

    if (!editUser.value.name.trim()) {
      error.value = 'Le prénom est requis'
      return
    }

    const token = await getAccessTokenSilently()
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: editUser.value.name,
        surname: editUser.value.surname,
        pseudo: editUser.value.pseudo,
        birthdate: editUser.value.birthdate,
        profile_photo: editUser.value.profile_photo,
        bjj_club: user.value.bjj_club,
        bjj_belt: user.value.bjj_belt,
        bjj_city: user.value.bjj_city
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
    }

    const data = await response.json()
    user.value = data
    editingPersonal.value = false
    successMessage.value = 'Profil personnel sauvegardé avec succès!'

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    console.error('Error updating profile:', err)
    error.value = err.message || 'Erreur lors de la sauvegarde du profil'
  } finally {
    isSubmitting.value = false
  }
}

// Save BJJ info
const saveBJJInfo = async () => {
  try {
    isSubmitting.value = true
    error.value = ''
    successMessage.value = ''

    const token = await getAccessTokenSilently()
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: user.value.name,
        surname: user.value.surname,
        pseudo: user.value.pseudo,
        birthdate: user.value.birthdate,
        profile_photo: user.value.profile_photo,
        bjj_club: editUser.value.bjj_club,
        bjj_belt: editUser.value.bjj_belt,
        bjj_city: editUser.value.bjj_city
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
    }

    const data = await response.json()
    user.value = data
    editingBJJ.value = false
    successMessage.value = 'Profil BJJ sauvegardé avec succès!'

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    console.error('Error updating BJJ profile:', err)
    error.value = err.message || 'Erreur lors de la sauvegarde du profil BJJ'
  } finally {
    isSubmitting.value = false
  }
}

// Check authentication and load data
onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/')
    return
  }
  fetchUserProfile()
  fetchUserVideos()
})
</script>

<style scoped>
.main-content {
  background: #f5f5f5;
  min-height: calc(100vh - 80px);
  padding: 2rem 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 2rem;
  text-align: left;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Personal Section */
.personal-section {
  padding: 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
}

.profile-photo-container {
  flex-shrink: 0;
}

.profile-photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #d4af37;
}

.profile-photo-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #c49e2e);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  border: 3px solid #d4af37;
}

.profile-info {
  flex: 1;
}

.user-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.user-pseudo {
  font-size: 1.1rem;
  color: #666;
  margin: 0.25rem 0;
}

.user-email {
  font-size: 0.95rem;
  color: #999;
  margin: 0;
}

.edit-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: #d4af37;
  color: #222;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  white-space: nowrap;
}

.edit-btn:hover {
  background: #c49e2e;
  transform: translateY(-2px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #222;
  margin: 0;
  border-bottom: 2px solid #d4af37;
  padding-bottom: 0.5rem;
  flex: 1;
}

/* BJJ Section */
.bjj-section {
  padding: 2rem;
}

.bjj-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bjj-belt {
  font-weight: 700;
  text-transform: capitalize;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
}

.belt-blanche {
  background: #f0f0f0;
  color: #333;
}

.belt-bleu {
  background: #e3f2fd;
  color: #1976d2;
}

.belt-pourpre {
  background: #f3e5f5;
  color: #7b1fa2;
}

.belt-marron {
  background: #ffe0b2;
  color: #e65100;
}

.belt-noire {
  background: #212121;
  color: white;
}

/* Videos Section */
.videos-section {
  padding: 2rem;
}

.videos-toggle {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0 2rem;
  flex-wrap: wrap;
}

.toggle-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #ddd;
  background: white;
  color: #222;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.toggle-btn:hover {
  border-color: #d4af37;
}

.toggle-btn.active {
  background: #d4af37;
  color: #222;
  border-color: #d4af37;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(324px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.no-videos {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #999;
  font-size: 1.1rem;
}

/* Forms */
.edit-form {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #d4af37;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  font-weight: 600;
  color: #222;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.required {
  color: #e63946;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #ddd;
}

.submit-btn,
.cancel-btn {
  flex: 1;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn {
  background: #d4af37;
  color: #222;
}

.submit-btn:hover:not(:disabled) {
  background: #c49e2e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #e0e0e0;
  color: #222;
}

.cancel-btn:hover {
  background: #d0d0d0;
  transform: translateY(-2px);
}

.info-display,
.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 3px solid #d4af37;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-weight: 600;
  color: #555;
}

.info-value {
  color: #222;
  font-size: 0.95rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: #666;
}

.error-message {
  background: #ffe0e0;
  color: #d32f2f;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #d32f2f;
}

.success-message {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  border-left: 4px solid #2e7d32;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .page-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .profile-info {
    text-align: center;
  }

  .edit-btn {
    width: 100%;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .videos-toggle {
    flex-direction: column;
  }

  .toggle-btn {
    width: 100%;
  }

  .videos-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
