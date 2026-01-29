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

      <form v-if="!loading && user" @submit.prevent="handleSubmit" class="profile-form">
        <!-- User Info Card -->
        <div class="info-card">
          <h2 class="section-title">Informations personnelles</h2>

          <!-- Email (Read-only) -->
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="user.email"
              disabled
              class="form-input disabled"
            />
            <small class="form-hint">Non modifiable</small>
          </div>

          <!-- Name (Required) -->
          <div class="form-group">
            <label for="name">Prénom <span class="required">*</span></label>
            <input
              type="text"
              id="name"
              v-model="user.name"
              placeholder="Votre prénom"
              class="form-input"
              required
            />
          </div>

          <!-- Surname -->
          <div class="form-group">
            <label for="surname">Nom</label>
            <input
              type="text"
              id="surname"
              v-model="user.surname"
              placeholder="Votre nom"
              class="form-input"
            />
          </div>

          <!-- Pseudo -->
          <div class="form-group">
            <label for="pseudo">Pseudo</label>
            <input
              type="text"
              id="pseudo"
              v-model="user.pseudo"
              placeholder="Votre pseudo (optionnel)"
              class="form-input"
            />
          </div>

          <!-- Birthdate -->
          <div class="form-group">
            <label for="birthdate">Date de naissance</label>
            <input
              type="date"
              id="birthdate"
              v-model="user.birthdate"
              class="form-input"
            />
          </div>
        </div>

        <!-- Account Info Card -->
        <div class="info-card">
          <h2 class="section-title">Informations du compte</h2>

          <div class="account-info">
            <div class="info-row">
              <span class="info-label">Compte créé le:</span>
              <span class="info-value">{{ formatDate(user.created_at) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Dernière modification:</span>
              <span class="info-value">{{ formatDate(user.updated_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? 'Sauvegarde...' : 'Sauvegarder les modifications' }}
          </button>
          <button type="button" class="cancel-btn" @click="resetForm">
            Annuler
          </button>
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import { API_BASE_URL } from '../config/api'

const { user: auth0User, isAuthenticated, getAccessTokenSilently } = useAuth0()
const router = useRouter()

const user = ref({
  email: '',
  name: '',
  surname: '',
  pseudo: '',
  birthdate: '',
  created_at: '',
  updated_at: ''
})

const originalUser = ref({})
const loading = ref(true)
const isSubmitting = ref(false)
const error = ref('')
const successMessage = ref('')

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

    // Save original values for reset
    originalUser.value = JSON.parse(JSON.stringify(user.value))
  } catch (err) {
    console.error('Error fetching profile:', err)
    error.value = err.message || 'Erreur lors du chargement du profil'
  } finally {
    loading.value = false
  }
}

// Handle form submission
const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    error.value = ''
    successMessage.value = ''

    if (!user.value.name.trim()) {
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
        name: user.value.name,
        surname: user.value.surname,
        pseudo: user.value.pseudo,
        birthdate: user.value.birthdate
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
    }

    const data = await response.json()
    user.value = data
    originalUser.value = JSON.parse(JSON.stringify(user.value))
    successMessage.value = 'Profil sauvegardé avec succès!'

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

// Reset form to original values
const resetForm = () => {
  user.value = JSON.parse(JSON.stringify(originalUser.value))
  error.value = ''
  successMessage.value = ''
}

// Check authentication
onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/')
    return
  }
  fetchUserProfile()
})
</script>

<style scoped>
.main-content {
  background: #f5f5f5;
  min-height: calc(100vh - 80px);
  padding: 2rem 0;
}

.container {
  max-width: 700px;
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

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #d4af37;
  padding-bottom: 0.5rem;
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

.form-input.disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  color: #999;
}

.form-input.disabled:focus {
  border-color: #ddd;
  box-shadow: none;
}

.form-hint {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 3px solid #d4af37;
}

.info-label {
  font-weight: 600;
  color: #555;
}

.info-value {
  color: #222;
  font-size: 0.95rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
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

  .info-card {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
