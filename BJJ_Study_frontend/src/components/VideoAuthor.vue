<template>
  <button
    v-if="authorId"
    class="video-author-btn"
    type="button"
    @click="goToProfile"
  >
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
  </button>
  <div v-else class="video-author">
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
import { useRouter } from "vue-router"
import { getInitials } from "../composables/useVideoInfo"

const router = useRouter()

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

const authorId = computed(() =>
  props.author?.auth0_id ?? props.author?.user_auth0_id ?? null
)

function goToProfile() {
  if (!authorId.value) return
  router.push({ name: "user-profile", params: { auth0_id: authorId.value } }).catch(() => {})
}

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

/* Rend le bouton visuellement neutre */
.video-author-btn {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: inline;
}
</style>
