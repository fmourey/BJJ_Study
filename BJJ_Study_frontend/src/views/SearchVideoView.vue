<template>
  <Header />
  <div class="container">
    <div class="presentation">
      <h1>Welcome to BJJ Study !</h1>
      <p>BJJ Study is a platform created by Brazilian Jiu-Jitsu enthusiasts for practitioners of all levels. Our aim is to facilitate learning and technical progression through video analysis, experience sharing and collaboration between members of the community.
Here, users can review their fights, discover new techniques, take part in challenges and follow the latest news from the world of JJB.
BJJ Study is much more than an analysis tool: it's a space for exchange and progression for all those who want to understand, learn and improve on the tatami.</p>
    </div>

    <button class="btn btn-primary big-button" @click="navigateToAddVideo">Add video</button>

    <h2 class="section-title">Search for videos</h2>

    <div class="panel block">
      <div class="filters">
        <PositionAutocomplete v-model="selectedPosition">
          <template #selected="{ value, clear }">
            <div v-if="value" class="chips">
              <div class="chip chip-position">
                <span>{{ value }}</span>
                <button @click="clear" aria-label="Remove position">
                  &times;
                </button>
              </div>
            </div>
          </template>
        </PositionAutocomplete>

        <div class="field tag-field">
          <div class="field-header">
            <div class="label">Tags</div>
          </div>

            <input
              v-model="tagInput"
              class="input"
              placeholder="Add a tag..."
              @keydown.enter.prevent="handleAddTag"
              @keydown.,.prevent="handleAddTag"
              @keydown.backspace="handleBackspace"
            />

            <div v-if="selectedTags.length > 0" class="chips">
              <div class="chip" v-for="tag in selectedTags" :key="tag">
                <span>{{ tag }}</span>
                <button @click="removeTag(tag)" aria-label="Remove tag">
                  &times;
                </button>
              </div>
            </div>

          </div>

        <div class="field">
          <div class="label">
            Max video length: {{ formatDuration(maxVideoLength) }}
          </div>
          <div class="slider-field">
            <input
              type="range"
              class="range"
              v-model.number="maxVideoLength"
              min="1"
              max="301"
              step="15"
              :style="{ background: sliderBackground }"
              @input="executeSearch"
            />
          </div>
        </div>

        <button class="btn btn-dark btn-clear" @click="clearFilters">
          Clear filters
        </button>

      </div>
    </div>

    <div v-if="loading" class="state block">Searching...</div>
    <div v-if="error" class="state state-error block">{{ error }}</div>

    <div v-if="!loading && results.length > 0" class="block">
      <h3>{{ results.length }} result(s) found</h3>
      <div class="grid">
        <VideoCard v-for="video in results" :key="video.id" :video="video" />
      </div>
    </div>

    <div v-if="!loading && results.length === 0 && !error" class="state block">
      No videos found. Try adjusting your filters.
    </div>
  </div>
  <Footer />
</template>

<script setup>


import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';  // ← NOUVELLE ligne à ajouter
import { useSearch } from '../components/Search.vue';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import VideoCard from '../components/VideoCard.vue';
import PositionAutocomplete from '../components/PositionAutocomplete.vue';

const router = useRouter();
const tagInput = ref('');

const {
  selectedTags,
  selectedPosition,
  maxVideoLength,
  loading,
  error,
  results,
  executeSearch,
  clearFilters,
  addTag,
  removeTag,
} = useSearch();

onMounted(() => {
  executeSearch();
});

const handleAddTag = () => {
  const rawValue = tagInput.value
  if (!rawValue) return
  const cleaned = rawValue.replace(/,/g, '').trim()
  if (!cleaned) {
    tagInput.value = ''
    return
  }
  const normalizedTag = cleaned.toLowerCase()
  if (!selectedTags.value.includes(normalizedTag)) {
    addTag(normalizedTag)
    executeSearch()
  }
  tagInput.value = ''
}

const handleBackspace = () => {
  if (tagInput.value === '' && selectedTags.value.length > 0) {
    selectedTags.value.pop()
    executeSearch()
  }
}

const navigateToAddVideo = () => {
  router.push('/addvideo');
};

const sliderBackground = computed(() => {
  const percent = ((maxVideoLength.value - 1) / (301 - 1)) * 100;
  return `linear-gradient(to right, #dc2626 0%, #dc2626 ${percent}%, rgba(226, 232, 240, 0.6) ${percent}%, rgba(226, 232, 240, 0.6) 100%)`;
});

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes === 0) return `${secs}s`;
  if (secs === 0) return `${minutes}:00`;
  if (secs < 10) return `${minutes}:0${secs}`;
  return `${minutes}:${secs}`;
};
;

</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.presentation {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 10px;
  text-align: center;
}

.big-button {
  display: block;
  margin: 0 auto;
}

.slider-field {
  margin-top: 15px;
}

.btn-clear {
  margin-top: 25px;
  margin-left: 20px;
}


.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  background: var(--tag-bg);
  color: var(--tag-text);
  border: 1px solid var(--tag-border);
  box-shadow: var(--shadow-sm);
  font-weight: 800;
  font-size: 13px;
}

.chip-position {
  background: rgba(220, 38, 38, 0.08);
  color: var(--brand);
  border: 1px solid rgba(220, 38, 38, 0.25);
}

.chip-position button {
  border: 1px solid rgba(220, 38, 38, 0.2);
  background: rgba(220, 38, 38, 0.06);
  color: var(--brand);
}

.chip-position button:hover {
  background: rgba(220, 38, 38, 0.15);
}

.chip button {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(15,23,42,.04);
  color: var(--text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.chip button:hover {
  background: rgba(220,38,38,.10);
  border-color: rgba(220,38,38,.25);
  color: var(--brand);
  transform: none;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: flex-start;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 220px;
}

.range {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  outline: none;
  -webkit-appearance: none;
  background: rgba(226, 232, 240, 0.8);
}

.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--brand);
  border: 3px solid var(--surface);
  box-shadow: 0 8px 18px rgba(220,38,38,.28);
  cursor: pointer;
}

.range::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--brand);
  border: 3px solid var(--surface);
  box-shadow: 0 8px 18px rgba(220,38,38,.28);
  cursor: pointer;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 6px;
}

</style>
