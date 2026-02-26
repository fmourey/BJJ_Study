<template>
  <div class="field">
    <div class="label">Position</div>
    <div class="position-autocomplete" ref="wrapper">
      <input
        v-model="search"
        type="text"
        class="input"
        placeholder="Search position..."
        @focus="open = true"
      />

      <div v-if="open" class="position-dropdown">
        <div
          v-for="pos in filteredPositions"
          :key="pos"
          class="position-item"
          @click="selectPosition(pos)"
        >
          {{ formatLabel(pos) }}
        </div>

        <slot
          name="no-results"
          :search="search"
          :select="selectPosition"
        />

        <div
          v-if="filteredPositions.length === 0 && !$slots['no-results']"
          class="position-item muted"
        >
          No results
        </div>
      </div>
    </div>

    <slot
      name="selected"
      :value="props.modelValue"
      :clear="clear"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { API_BASE_URL } from "@/config/api"

const props = defineProps({
  modelValue: {
    type: String,
    default: null
  }
})

const emit = defineEmits(["update:modelValue"])

const positions = ref([])
const search = ref("")
const open = ref(false)
const wrapper = ref(null)

async function fetchPositions() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/positions`)
    const data = await response.json()
    positions.value = data.map(p => p.name)
  } catch (err) {
    console.error("Positions error:", err)
  }
}

const filteredPositions = computed(() => {
  if (!search.value) return positions.value
  return positions.value.filter(p =>
    p.toLowerCase().includes(search.value.toLowerCase())
  )
})

function selectPosition(pos) {
  emit("update:modelValue", pos)
  search.value = pos
  open.value = false
}

function clear() {
  emit("update:modelValue", "")
  search.value = ""
}

function formatLabel(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function handleClickOutside(e) {
  if (wrapper.value && !wrapper.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => {
  fetchPositions()
  document.addEventListener("click", handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside)
})
</script>

<style scoped>

.selected-position {
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
