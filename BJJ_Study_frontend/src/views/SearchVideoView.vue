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
          min="0"
          max="3600"
          step="60"
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
import { ref } from 'vue';
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
  if (secs === 0) return `${minutes}m`;
  return `${minutes}m ${secs}s`;
};
</script>

<style scoped>
.search-video-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #111;
}

input,
button { font-size: 14px; border-radius: 999px; }
button { border: none; cursor: pointer; transition: filter .15s ease, box-shadow .15s ease; }
button:hover { filter: brightness(.95); }

.search-bar { display: flex; gap: 10px; margin-bottom: 16px; }
.search-bar input { flex: 1; padding: 10px 14px; border: 1px solid #ddd; }
.search-bar input:focus { border-color: #ffc107; outline: none; }

.add-tag-btn,
.clear-btn { padding: 8px 16px; }
.add-tag-btn { background: #111; color: #fff; }
.clear-btn { background: #ffc107; color: #111; }

.selected-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.tag,
.position-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px; font-size: 12px; }
.tag { background: #ffd54f; }
.position-badge { margin-top: 2px; background: #f5f5f5; color: #555; }
.remove-btn { background: transparent; padding: 0 4px; }

.filters-container { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; margin-bottom: 18px; }
.filter-group { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
input[type="range"] { width: 220px; }

.dropdown { position: relative; }
.dropdown-toggle { background: #f5f5f5; color: #111; padding: 8px 12px; border-radius: 999px; border: 1px solid #ddd; }
.dropdown-menu { position: absolute; top: 100%; left: 0; margin-top: 4px; min-width: 160px; background: #fff; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 6px 16px rgba(0,0,0,.08); display: none; z-index: 10; }
.dropdown:hover .dropdown-menu { display: block; }
.radio-item { padding: 6px 10px; display: flex; align-items: center; gap: 6px; font-size: 13px; }
.radio-item:hover { background: #f6f6f6; }

.video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(324px, 1fr)); gap: 16px; margin-top: 16px; }
.video-card-link { text-decoration: none; }

.loading,
.no-results,
.error { padding: 16px; margin-top: 12px; font-size: 14px; text-align: center; color: #777; }
.error { text-align: left; background: #ffeef0; border-left: 4px solid #e53935; border-radius: 10px; color: #c62828; }
</style>
