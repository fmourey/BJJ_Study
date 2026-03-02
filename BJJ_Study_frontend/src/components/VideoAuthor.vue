<template>
  <div class="video-author">
      <div
        class="avatar"
        :style="beltColor ? { borderColor: beltColor } : undefined"
      >
      <img
        v-if="author?.profile_photo"
        :src="author.profile_photo"
        :alt="author.pseudo"
      />
      <span v-else>
        {{ getInitials(author?.name, author?.surname) }}
      </span>
    </div>

    <div v-if="showName" class="pseudo">
      {{ author?.pseudo || author?.name || 'Anonyme' }}
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { getInitials } from "../composables/useVideoInfo"

const props = defineProps({
  author: {
    type: Object,
    default: null
  },
  showName: {
    type: Boolean,
    default: true
  }
})

const beltColor = computed(() => {
  const belt = props.author?.bjj_belt
  if (!belt) return null
  return {
    blanche: "#e5e7eb",
    bleu: "#2563eb",
    pourpre: "#7c3aed",
    marron: "#92400e",
    noire: "#111827"
  }[belt] || null
})
console.log("belt =", props.author?.pseudo, props.author?.bjj_belt)
</script>

<style scoped>

.video-author {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface-2);
  border: 2px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  overflow: hidden;
  transition: border-color .2s ease;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pseudo {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  text-align: center;
}

</style>
