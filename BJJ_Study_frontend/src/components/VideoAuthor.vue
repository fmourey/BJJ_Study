<template>
  <div class="video-author">
    <div
      class="avatar"
      :class="beltClass"
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

    <div class="pseudo">
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
  }
})

const beltClass = computed(() => {
  const belt = props.author?.bjj_belt
  if (!belt) return "belt-default"
  return `belt-${belt}`
})
</script>

<style scoped>

.video-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Avatar */
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
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
}

.belt-blanche {
  border-color: #e5e7eb;
}

.belt-bleu {
  border-color: #2563eb;
}

.belt-pourpre {
  border-color: #7c3aed;
}

.belt-marron {
  border-color: #92400e;
}

.belt-noire {
  border-color: #111827;
}

.belt-default {
  border-color: var(--line);
}

</style>
