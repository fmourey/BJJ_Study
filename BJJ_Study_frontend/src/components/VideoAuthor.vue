<template>
  <div class="video-author">
    <img
      v-if="author?.profile_photo"
      :src="author.profile_photo"
      :alt="author.pseudo"
      class="author-photo"
    />
    <div v-else class="author-photo-placeholder">
      {{ getInitials(author?.name, author?.surname) }}
    </div>
    <div class="pseudo">{{ author?.pseudo || author?.name || 'Anonyme' }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  author: {
    type: Object,
    default: null
  }
})

const getInitials = (name, surname) => {
  const first = (name || '').charAt(0).toUpperCase()
  const last = (surname || '').charAt(0).toUpperCase()
  return first + last
}
</script>

<style scoped>
.video-author {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.author-photo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid #d4af37;
}

.author-photo-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #c49e2e);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  border: 1.5px solid #d4af37;
}

.pseudo {
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
}
</style>
