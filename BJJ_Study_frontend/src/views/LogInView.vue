<template>
  <Header />

  <main class="main-content">
    <div class="container">
      <h1 class="page-title">Créer un compte</h1>
      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="form-group">
          <label for="email">E-mail<span class="required">*</span></label>
          <input type="text" id="email" v-model="email" placeholder="jeannette.dasilva@example.com" class="form-input"/>
        </div>

        <div class="form-group">
          <label for="password">Mot de passe<span class="required">*</span></label>
          <input type="password" id="password" v-model="password" placeholder="**********" class="form-input"/>
        </div>

        <button type="submit" class="submit-btn">Soumettre</button>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref} from 'vue'
import { API_BASE_URL } from '@/config/api'
import Header from '@/components/Header.vue'

const name = ref('')
const surname = ref('')
const pseudo = ref('')
const birthdate = ref('')
const email = ref('')
const password = ref('')

async function handleSubmit() {
  // Validation
  if (!email.value) {
    alert('Veuillez entrer un e-mail')
    return
  }
  if (!password.value) {
    alert('Veuillez entrer un mot de passe')
    return
  }

  // Préparer les données pour l'inscription
  const userData = {
    name: name.value,
    surname: surname.value,
    pseudo: pseudo.value,
    birthdate: birthdate.value,
    email: email.value,
    password: password.value
  }


  try {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })

    const result = await response.json()

    if (response.ok) {
      alert('Compte créé avec succès !')
      console.log('Compte créé:', result.user)

      // Reinitialiser le formulaire
      name.value = ''
      surname.value = ''
      pseudo.value = ''
      birthdate.value = ''
      email.value = ''
      password.value = ''
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

.register-form {
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

.register-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #dc2626, #fbbf24);
}
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

.form-input {
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
    0 4px 12px rgba(0,0,0,0.05),
    inset 0 1px 2px rgba(0,0,0,0.02);
}

.form-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.form-input:focus {
  outline: none;
  border-color: #dc2626;
  background: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 0 0 4px rgba(220, 38, 38, 0.1),
    0 0 20px rgba(220, 38, 38, 0.15),
    inset 0 2px 4px rgba(0,0,0,0.02);
  transform: translateY(-1px);
}

.form-hint {
  display: block;
  margin-top: 0.6rem;
  color: #64748b;
  font-size: 0.85rem;
  font-style: italic;
  font-weight: 500;
}

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
    0 8px 24px rgba(220, 38, 38, 0.3),
    inset 0 1px 0 rgba(255,255,255,0.2);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow:
    0 12px 32px rgba(220, 38, 38, 0.4),
    inset 0 1px 0 rgba(255,255,255,0.25);
  filter: brightness(1.05);
}

.submit-btn:active {
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: 2rem 1rem;
  }

  .container {
    padding: 0 1rem;
  }

  .page-title {
    font-size: 2.2rem;
    margin-bottom: 2rem;
  }

  .register-form {
    padding: 2rem;
  }

  .form-input {
    padding: 0.9rem 1rem;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 1.5rem 1rem;
  }

  .container {
    padding: 0;
  }

  .page-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    letter-spacing: 2px;
  }

  .register-form {
    padding: 1.5rem;
    border-radius: 18px;
  }

  .form-group {
    margin-bottom: 1.4rem;
  }

  .form-group label {
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
  }

  .form-input {
    padding: 0.8rem 1rem;
    font-size: 16px;
    border-radius: 12px;
  }

  .submit-btn {
    padding: 1.2rem;
    font-size: 0.95rem;
    letter-spacing: 1px;
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
