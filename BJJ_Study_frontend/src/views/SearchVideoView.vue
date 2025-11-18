<template>
  <Header />
  <div class="search-video-view">
    <!-- Search Bar for Tags -->
    <div class="search-bar">
      <input
        v-model="tagInput"
        placeholder="Add a tag... (press Enter)"
        @keyup.enter="handleAddTag"
      />
      <button @click="handleAddTag" class="add-tag-btn">Add Tag</button>
    </div>

    <!-- Selected Tags Display -->
    <div v-if="selectedTags.length > 0" class="selected-tags">
      <div class="tag" v-for="tag in selectedTags" :key="tag">
        <span>{{ tag }}</span>
        <button @click="removeTag(tag)" class="remove-btn">&times;</button>
      </div>
    </div>

    <!-- Filters Container -->
    <div class="filters-container">
      <!-- Position Dropdown (Single Selection) -->
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

      <!-- Max Video Length Slider -->
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

      <!-- Clear Filters Button -->
      <button @click="clearFilters" class="clear-btn">Clear Filters</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      Searching...
    </div>

    <!-- Error State -->
    <div v-if="error" class="error">
      {{ error }}
    </div>

    <!-- Results -->
    <div v-if="!loading && results.length > 0" class="results">
      <h3>{{ results.length }} result(s) found</h3>
      <ul>
        <li v-for="video in results" :key="video.id">
          <router-link :to="{ name: 'video-detail', params: { id: video.id } }">
            <strong>{{ video.title }}</strong>
            <p v-if="video.position" class="position-badge">{{ video.position }}</p>
          </router-link>
        </li>
      </ul>
    </div>

    <!-- No Results -->
    <div v-if="!loading && results.length === 0 && !error" class="no-results">
      No videos found. Try adjusting your filters.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useSearch } from '../components/Search.vue';
import Header from '../components/Header.vue';

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

// Handle adding a tag from the search bar
const handleAddTag = () => {
  if (tagInput.value.trim()) {
    addTag(tagInput.value);
    tagInput.value = '';
    executeSearch();
  }
};

// Helper function to format duration
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
  padding: 20px;
  font-family: Arial, sans-serif;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-bar input {
  flex: 1;
  padding: 12px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
}

.search-bar input:focus {
  outline: none;
  border-color: #4CAF50;
}

.add-tag-btn {
  padding: 12px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.add-tag-btn:hover {
  background-color: #45a049;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.tag {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #4CAF50;
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.remove-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: opacity 0.2s;
}

.remove-btn:hover {
  opacity: 0.7;
}

.filters-container {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: bold;
  font-size: 14px;
  color: #333;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  min-width: 150px;
  text-align: left;
  transition: border-color 0.3s;
}

.dropdown-toggle:hover {
  border-color: #4CAF50;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 2px solid #ddd;
  border-radius: 6px;
  margin-top: 4px;
  min-width: 150px;
  z-index: 10;
  display: none;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dropdown:hover .dropdown-menu {
  display: flex;
}

.radio-item {
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.radio-item:hover {
  background-color: #f5f5f5;
}

.radio-item input {
  cursor: pointer;
}

.filter-group input[type="range"] {
  width: 150px;
  cursor: pointer;
}

.clear-btn {
  padding: 10px 16px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.clear-btn:hover {
  background-color: #ff5252;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 16px;
}

.error {
  background-color: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 4px solid #c62828;
}

.results {
  margin-top: 20px;
}

.results h3 {
  margin-bottom: 15px;
  color: #333;
}

.results ul {
  list-style: none;
  padding: 0;
}

.results li {
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.results li:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.results a {
  display: block;
  padding: 15px;
  text-decoration: none;
  color: inherit;
}

.results strong {
  display: block;
  color: #4CAF50;
  font-size: 16px;
  margin-bottom: 8px;
}

.position-badge {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: inline-block;
  margin: 0;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 16px;
}
</style>

<style scoped>
.search-video-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
}

.search-bar input:focus {
  outline: none;
  border-color: #4CAF50;
}

.filters-container {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: bold;
  font-size: 14px;
  color: #333;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  min-width: 150px;
  text-align: left;
  transition: border-color 0.3s;
}

.dropdown-toggle:hover {
  border-color: #4CAF50;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 2px solid #ddd;
  border-radius: 6px;
  margin-top: 4px;
  min-width: 150px;
  z-index: 10;
  display: none;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dropdown:hover .dropdown-menu {
  display: flex;
}

.checkbox-item,
.radio-item {
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.checkbox-item:hover,
.radio-item:hover {
  background-color: #f5f5f5;
}

.checkbox-item input,
.radio-item input {
  cursor: pointer;
}

.filter-group input[type="range"] {
  width: 150px;
  cursor: pointer;
}

.clear-btn {
  padding: 10px 16px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.clear-btn:hover {
  background-color: #ff5252;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 16px;
}

.error {
  background-color: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 4px solid #c62828;
}

.results {
  margin-top: 20px;
}

.results h3 {
  margin-bottom: 15px;
  color: #333;
}

.results ul {
  list-style: none;
  padding: 0;
}

.results li {
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.results li:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.results a {
  display: block;
  padding: 15px;
  text-decoration: none;
  color: inherit;
}

.results strong {
  display: block;
  color: #4CAF50;
  font-size: 16px;
  margin-bottom: 8px;
}

.position-badge {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: inline-block;
  margin: 0;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 16px;
}
</style>
