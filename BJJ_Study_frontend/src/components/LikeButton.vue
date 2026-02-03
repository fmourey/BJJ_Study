<template>
  <div class="like-container">
    <span class="likes-count">{{ likesCount }} likes</span>
    <button
      class="like-button"
      :class="{ liked: isLiked }"
      @click="toggleLike"
      :title="isLiked ? 'Retirer le like' : 'Aimer cette vidéo'"
    >
      {{ isLiked ? '❤️' : '🤍' }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  likesCount: {
    type: Number,
    default: 0
  },
  isLiked: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-like'])

const toggleLike = () => {
  emit('toggle-like')
}
</script>

<style scoped>
.like-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  background: transparent;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.25s ease;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.like-button:hover {
  transform: scale(1.2);
}

.like-button:active {
  transform: scale(1.1);
}

.like-button.liked {
  animation: heartBeat 0.3s ease;
}

@keyframes heartBeat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(1.1);
  }
}

.likes-count {
  min-width: 60px;
}
</style>
