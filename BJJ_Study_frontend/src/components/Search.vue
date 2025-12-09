<script>
import { ref } from 'vue';

export function useSearch() {
  const selectedTags = ref([]);
  const selectedPosition = ref(null);
  const availablePositions = ref([
    'Closed Guard',
    'Guard Pass',
    'Butterfly Guard'
  ]);

  const maxVideoLength = ref(300);
  const loading = ref(false);
  const error = ref(null);
  const results = ref([]);

  const buildSearchFilters = () => {
    return {
      tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
      position: selectedPosition.value || undefined,
      maxVideoLength: maxVideoLength.value || undefined
    };
  };

  const executeSearch = async () => {
    loading.value = true;
    error.value = null;

    try {
      const filters = buildSearchFilters();
      const queryParams = new URLSearchParams();
      if (filters.tags) {
        filters.tags.forEach(tag => queryParams.append('tags', tag));
      }
      if (filters.position) {
        queryParams.set('position', filters.position);
      }
      if (filters.maxVideoLength) {
        queryParams.set('maxVideoLength', filters.maxVideoLength);
      }

      const response = await fetch(`http://localhost:3000/api/search?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      results.value = data;

      return data;
    } catch (err) {
      error.value = err.message;
      results.value = [];
      // Don't re-throw - error is already handled and stored in error.value
    } finally {
      loading.value = false;
    }
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.value.includes(trimmedTag)) {
      selectedTags.value.push(trimmedTag);
    }
  };

  const removeTag = (tag) => {
    const index = selectedTags.value.indexOf(tag);
    if (index > -1) {
      selectedTags.value.splice(index, 1);
    }
  };

  const clearFilters = () => {
    selectedTags.value = [];
    selectedPosition.value = null;
    maxVideoLength.value = 300;
    results.value = [];
    error.value = null;
  };

  const setPosition = (position) => {
    selectedPosition.value = selectedPosition.value === position ? null : position;
  };

  return {
    selectedTags,
    selectedPosition,
    availablePositions,
    maxVideoLength,
    loading,
    error,
    results,

    buildSearchFilters,
    executeSearch,
    addTag,
    removeTag,
    clearFilters,
    setPosition
  };
}
</script>