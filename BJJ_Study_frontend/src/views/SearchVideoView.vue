<template>
  <Header />
  <div class="container">
    <div class="presentation">
      <h1>Welcome to BJJ Study !</h1>
      <p>BJJ Study is a platform created by Brazilian Jiu-Jitsu enthusiasts for practitioners of all levels. Our aim is to facilitate learning and technical progression through video analysis, experience sharing and collaboration between members of the community.
Here, users can review their fights, discover new techniques, take part in challenges and follow the latest news from the world of JJB.
BJJ Study is much more than an analysis tool: it's a space for exchange and progression for all those who want to understand, learn and improve on the tatami.</p>
    </div>

    <h2 class="section-title">Search for videos</h2>

    <div class="searchbar block">
      <input
        v-model="tagInput"
        class="input"
        placeholder="Add a tag... (press Enter)"
        @keyup.enter="handleAddTag"
      />
      <button class="btn btn-dark" @click="handleAddTag">Add Tag</button>
      <button class="btn btn-primary" @click="navigateToAddVideo">Add Video</button>
    </div>

    <div v-if="selectedTags.length > 0" class="chips block">
      <div class="chip" v-for="tag in selectedTags" :key="tag">
        <span>{{ tag }}</span>
        <button @click="removeTag(tag)" aria-label="Remove tag">&times;</button>
      </div>
    </div>

    <div class="panel block">
      <div class="filters">
        <div class="field">
          <div class="label">Position</div>
          <div class="dropdown">
            <button class="btn dropdown-toggle">
              {{ selectedPosition || 'Select position...' }}
            </button>
            <div class="dropdown-menu">
              <label v-for="position in availablePositions" :key="position" class="menu-item">
                <input
                  type="radio"
                  :value="position"
                  :checked="selectedPosition === position"
                  @change="setPosition(position);executeSearch()"
                />
                {{ position }}
              </label>

              <label v-if="selectedPosition" class="menu-item">
                <input type="radio" :value="null" @change="setPosition(null);executeSearch()" />
                Clear selection
              </label>
            </div>
          </div>
        </div>

        <div class="field">
          <div class="label">Max video length: {{ formatDuration(maxVideoLength) }}</div>
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

        <button class="btn btn-primary" @click="clearFilters">Clear Filters</button>
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

const router = useRouter();
const tagInput = ref('');

const {
  selectedTags,
  selectedPosition,
  availablePositions,
  maxVideoLength,
  loading,
  error,
  results,
  executeSearch,
  clearFilters,
  addTag,
  removeTag,
  setPosition
} = useSearch();

onMounted(() => {
  executeSearch();
});

const handleAddTag = () => {
  if (tagInput.value.trim()) {
    addTag(tagInput.value);
    tagInput.value = '';
    executeSearch();
  }
};
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

/* Dropdown avec animation fluide */
.dropdown {
  position: relative;
  width: 100%;
}

.dropdown-toggle {
  background: rgba(248, 250, 252, 0.7);
  backdrop-filter: blur(8px);
  color: var(--text);
  padding: 14px 22px;
  border-radius: var(--radius-md);
  border: 2px solid rgba(226, 232, 240, 0.6);
  width: 100%;
  text-align: left;
  font-weight: 600;
  transition: all .3s ease;
  box-shadow:
    0 2px 8px rgba(0,0,0,0.04),
    inset 0 1px 0 rgba(255,255,255,0.8);
}

.dropdown-toggle:hover {
  border-color: var(--brand);
  background: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 4px 20px rgba(220, 38, 38, 0.15),
    inset 0 1px 0 rgba(255,255,255,1);
  transform: translateY(-2px);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: var(--radius-md);
  box-shadow:
    0 20px 60px rgba(0,0,0,0.15),
    inset 0 1px 0 rgba(255,255,255,1);
  display: none;
  z-index: 100;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-10px);
  transition: all .3s ease;
}

.dropdown:hover .dropdown-menu {
  display: block;
  opacity: 1;
  transform: translateY(0);
}

.searchbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 999px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
}

.searchbar .input {
  border: none;
  background: transparent;
  box-shadow: none;
  padding: 12px 14px;
}

.searchbar .input:focus {
  border: none;
  box-shadow: none;
  background: transparent;
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
  align-items: flex-end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 220px;
  flex: 1;
}

.label {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: rgba(15,23,42,.85);
}

.dropdown { position: relative; width: 100%; }
.dropdown-toggle { width: 100%; text-align: left; }

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  padding: 8px;
  z-index: 50;
  display: none;
}

.dropdown:hover .dropdown-menu { display: block; }

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

.menu-item:hover { background: rgba(15,23,42,.04); }

.menu-item input[type="radio"] {
  accent-color: var(--brand);
  width: 18px;
  height: 18px;
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

</style>
