<template>
  <Header />
  <div class="search-video-view">
    <div class="search-bar">
      <input
        v-model="tagInput"
        placeholder="Add a tag... (press Enter)"
        @keyup.enter="handleAddTag"
      />
      <button @click="handleAddTag" class="add-tag-btn">Add Tag</button>
    </div>

    <div v-if="selectedTags.length > 0" class="selected-tags">
      <div class="tag" v-for="tag in selectedTags" :key="tag">
        <span>{{ tag }}</span>
        <button @click="removeTag(tag)" class="remove-btn">&times;</button>
      </div>
    </div>
    <div class="filters-container">
      <div class="filter-group">
        <label>Position</label>
        <div class="dropdown">
          <button class="dropdown-toggle">
            {{ selectedPosition || 'Select position...' }}
          </button>
          <div class="dropdown-menu">
            <label v-for="position in availablePositions" :key="position" class="radio-item">
              <input
                type="radio"
                :value="position"
                :checked="selectedPosition === position"
                @change="setPosition(position);executeSearch()"
              />
              {{ position }}
            </label>
            <label v-if="selectedPosition" class="radio-item">
              <input
                type="radio"
                :value="null"
                @change="setPosition(null);executeSearch()"
              />
              Clear selection
            </label>
          </div>
        </div>
      </div>

      <div class="filter-group">
        <label>Max Video Length: {{ formatDuration(maxVideoLength) }}</label>
        <input
          type="range"
          v-model.number="maxVideoLength"
          min="1"
          max="301"
          step="15"
          @input="executeSearch"
        />
      </div>

      <button @click="clearFilters" class="clear-btn">Clear Filters</button>
    </div>
    <div v-if="loading" class="loading">
      Searching...
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>
    <div v-if="!loading && results.length > 0" class="results">
      <h3>{{ results.length }} result(s) found</h3>
      <div class="video-grid">
        <VideoCard v-for="video in results" :key="video.id" :video="video" />
      </div>
    </div>
    <div v-if="!loading && results.length === 0 && !error" class="no-results">
      No videos found. Try adjusting your filters.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSearch } from '../components/Search.vue';
import Header from '../components/Header.vue';
import VideoCard from '../components/VideoCard.vue';

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

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes === 0) return `${secs}s`;
  if (secs === 0) return `${minutes}:00`;
  if (secs < 10) return `${minutes}:0${secs}`;
  return `${minutes}:${secs}`;
};
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.search-video-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #0f0f0f;
  background: 
    radial-gradient(ellipse at top right, rgba(220, 38, 38, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at bottom left, rgba(0, 0, 0, 0.05) 0%, transparent 50%),
    linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* Effet tatami en background */
.search-video-view::before {
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

.search-video-view > * {
  position: relative;
  z-index: 1;
}

input,
button { 
  font-size: 15px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
}

button { 
  border: none; 
  cursor: pointer; 
  transition: all .25s ease;
  position: relative;
  overflow: hidden;
}

button:hover { 
  transform: translateY(-2px);
  filter: brightness(1.05);
}

button:active {
  transform: translateY(0);
}

/* Search Bar - Glassmorphism */
.search-bar { 
  display: flex; 
  gap: 12px; 
  margin-bottom: 28px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  padding: 10px;
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.08),
    inset 0 1px 0 rgba(255,255,255,0.9),
    0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid rgba(255,255,255,0.18);
}

.search-bar input { 
  flex: 1; 
  padding: 16px 24px; 
  border: 2px solid transparent;
  background: rgba(248, 250, 252, 0.6);
  font-weight: 500;
  transition: all .3s ease;
  border-radius: 18px;
  backdrop-filter: blur(10px);
}

.search-bar input:focus { 
  border-color: #dc2626;
  outline: none;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 
    0 0 0 4px rgba(220, 38, 38, 0.1),
    0 0 20px rgba(220, 38, 38, 0.15),
    inset 0 2px 4px rgba(0,0,0,0.02);
}

.search-bar input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

/* Boutons avec effet subtil */
.add-tag-btn,
.clear-btn { 
  padding: 16px 32px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 13px;
  border-radius: 18px;
  position: relative;
  z-index: 1;
}

.add-tag-btn { 
  background: linear-gradient(135deg, #0f0f0f 0%, #1f1f1f 100%);
  color: #fff;
  box-shadow: 
    0 4px 15px rgba(0,0,0,0.2),
    inset 0 1px 0 rgba(255,255,255,0.1);
}

.add-tag-btn:hover {
  box-shadow: 
    0 6px 20px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.15);
}

.clear-btn { 
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  box-shadow: 
    0 4px 20px rgba(220, 38, 38, 0.4),
    inset 0 1px 0 rgba(255,255,255,0.2);
}

.clear-btn:hover {
  box-shadow: 
    0 6px 25px rgba(220, 38, 38, 0.5),
    inset 0 1px 0 rgba(255,255,255,0.25);
}

/* Tags - Effet 3D léger */
.selected-tags { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 12px; 
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(16px) saturate(180%);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.8);
  border: 1px solid rgba(255,255,255,0.18);
}

.tag {
  display: inline-flex; 
  align-items: center; 
  gap: 10px; 
  padding: 10px 18px; 
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #78350f;
  box-shadow: 
    0 4px 15px rgba(251, 191, 36, 0.3),
    inset 0 1px 0 rgba(255,255,255,0.4),
    inset 0 -2px 0 rgba(0,0,0,0.1);
  transition: all .25s ease;
  perspective: 1000px;
}

.tag:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 
    0 8px 25px rgba(251, 191, 36, 0.5),
    inset 0 1px 0 rgba(255,255,255,0.6);
}

.position-badge { 
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px; 
  padding: 8px 16px;
  background: rgba(241, 245, 249, 0.8);
  backdrop-filter: blur(8px);
  color: #334155;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 
    0 2px 12px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.7);
  border: 1px solid rgba(255,255,255,0.5);
}

.remove-btn { 
  background: rgba(0,0,0,0.15);
  padding: 4px 10px;
  border-radius: 10px;
  color: #78350f;
  font-size: 20px;
  font-weight: 900;
  transition: all .25s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.remove-btn:hover {
  background: rgba(220, 38, 38, 0.9);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

/* Filtres - Glass card avec bordure subtile */
.filters-container { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 24px; 
  align-items: flex-end; 
  margin-bottom: 32px;
  padding: 28px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.08),
    inset 0 1px 0 rgba(255,255,255,0.9);
  border: 1px solid rgba(255,255,255,0.18);
  position: relative;
  overflow: hidden;
}

/* Bordure accent rouge */
.filters-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #dc2626, #b91c1c);
  border-radius: 24px 0 0 24px;
}

.filter-group { 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
  font-size: 14px;
  flex: 1;
  min-width: 220px;
}

.filter-group label {
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 12px;
  text-shadow: 0 1px 2px rgba(255,255,255,0.8);
}

/* Slider custom avec effet néon */
input[type="range"] { 
  width: 100%;
  height: 10px;
  background: linear-gradient(to right, 
    #dc2626 0%, 
    #dc2626 50%, 
    rgba(226, 232, 240, 0.6) 50%, 
    rgba(226, 232, 240, 0.6) 100%);
  border-radius: 10px;
  outline: none;
  -webkit-appearance: none;
  box-shadow: 
    inset 0 1px 3px rgba(0,0,0,0.1),
    0 1px 0 rgba(255,255,255,0.6);
  transition: all .3s ease;
}

input[type="range"]:hover {
  box-shadow: 
    inset 0 1px 3px rgba(0,0,0,0.15),
    0 0 15px rgba(220, 38, 38, 0.3);
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 
    0 4px 12px rgba(220, 38, 38, 0.5),
    0 0 0 4px rgba(255,255,255,0.8),
    0 0 20px rgba(220, 38, 38, 0.4);
  transition: all .25s ease;
  border: 2px solid white;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 
    0 6px 20px rgba(220, 38, 38, 0.6),
    0 0 0 6px rgba(255,255,255,0.9),
    0 0 30px rgba(220, 38, 38, 0.6);
}

input[type="range"]::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  cursor: pointer;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 
    0 4px 12px rgba(220, 38, 38, 0.5),
    0 0 0 4px rgba(255,255,255,0.8);
}

/* Dropdown avec animation fluide */
.dropdown { 
  position: relative;
  width: 100%;
}

.dropdown-toggle { 
  background: rgba(248, 250, 252, 0.7);
  backdrop-filter: blur(8px);
  color: #0f172a;
  padding: 14px 22px;
  border-radius: 16px;
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
  border-color: #dc2626;
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
  border-radius: 16px;
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

.radio-item { 
  padding: 14px 18px;
  display: flex; 
  align-items: center; 
  gap: 12px; 
  font-size: 14px;
  cursor: pointer;
  transition: all .2s ease;
  font-weight: 600;
  position: relative;
}

.radio-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(90deg, rgba(220, 38, 38, 0.1), transparent);
  transition: width 0.2s ease;
}

.radio-item:hover::before {
  width: 100%;
}

.radio-item:hover { 
  background: rgba(254, 242, 242, 0.6);
  padding-left: 24px;
}

.radio-item input[type="radio"] {
  accent-color: #dc2626;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

/* Grille de vidéos */
.video-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 28px; 
  margin-top: 28px;
}

.results h3 {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 20px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  border-radius: 18px;
  border-left: 6px solid #dc2626;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.9);
}

/* États avec micro-animations */
.loading,
.no-results,
.error { 
  padding: 40px;
  margin-top: 28px;
  font-size: 16px;
  text-align: center;
  border-radius: 20px;
  font-weight: 600;
  backdrop-filter: blur(20px);
}

.loading {
  background: rgba(255, 255, 255, 0.8);
  color: #334155;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.08),
    inset 0 1px 0 rgba(255,255,255,1);
  border: 1px solid rgba(255,255,255,0.18);
}

.no-results {
  background: rgba(248, 250, 252, 0.8);
  color: #64748b;
  border: 2px dashed rgba(203, 213, 225, 0.8);
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.04);
}

.error { 
  text-align: left;
  background: rgba(254, 242, 242, 0.9);
  border-left: 8px solid #dc2626;
  border-radius: 16px;
  color: #991b1b;
  box-shadow: 
    0 8px 32px rgba(220, 38, 38, 0.2),
    inset 0 1px 0 rgba(255,255,255,0.8);
}

/* Responsive */
@media (max-width: 768px) {
  .search-video-view {
    padding: 24px 16px;
  }
  
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .video-grid {
    grid-template-columns: 1fr;
  }
}
</style>
