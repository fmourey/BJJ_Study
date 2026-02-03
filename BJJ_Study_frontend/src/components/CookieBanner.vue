<template>
  <div v-if="!hasConsent" class="cookie-banner">
    <div class="cookie-content">
      <p>
        Ce site utilise des cookies pour améliorer votre expérience. 
        <a href="/privacy" target="_blank">En savoir plus</a>
      </p>
      <div class="cookie-buttons">
        <button @click="refuse" class="btn-refuse">Refuser</button>
        <button @click="accept" class="btn-accept">Accepter</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const hasConsent = ref(true); // masqué par défaut

onMounted(() => {
  // Vérifie si l'utilisateur a déjà répondu
  const consent = localStorage.getItem('cookie_consent');
  if (!consent) {
    hasConsent.value = false; // affiche le bandeau
  }
});

function accept() {
  localStorage.setItem('cookie_consent', 'accepted');
  hasConsent.value = true;
  // Ici tu peux charger Google Analytics, etc.
}

function refuse() {
  localStorage.setItem('cookie_consent', 'refused');
  hasConsent.value = true;
  // Ne charge rien
}
</script>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 2px solid #ddd;
  padding: 1rem 2rem;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 9999;
}

.cookie-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.cookie-content p {
  margin: 0;
  flex: 1;
}

.cookie-buttons {
  display: flex;
  gap: 1rem;
}

.btn-refuse, .btn-accept {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-refuse {
  background: #f0f0f0;
  color: #333;
}

.btn-refuse:hover {
  background: #e0e0e0;
}

.btn-accept {
  background: black;
  color: white;
}

.btn-accept:hover {
  background: #333;
}
</style>
