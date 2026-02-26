<script>
import { ref } from 'vue';
import { API_BASE_URL } from '@/config/api';
import { watch } from 'vue';

export function useSearch() {
  const selectedTags = ref([]);
  const selectedPosition = ref(null);
  const maxVideoLength = ref(300);
  const loading = ref(false);
  const error = ref(null);
  const results = ref([]);

  watch(selectedPosition, () => {
    executeSearch()
  });

  const buildSearchFilters = () => {
    return {
      tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
      position: selectedPosition.value || undefined,
      maxVideoLength:
        maxVideoLength.value < 300 ? maxVideoLength.value : undefined
    };
  };

  const executeSearch = async () => {
    loading.value = true;
    error.value = null;

    try {
      const filters = buildSearchFilters();

      const noFilters =
        !filters.tags &&
        !filters.position &&
        !filters.maxVideoLength;

      let response;

      if (noFilters) {
        response = await fetch(`${API_BASE_URL}/api/videos`);
      } else {
        const queryParams = new URLSearchParams();

        if (filters.tags) {
          filters.tags.forEach(tag =>
            queryParams.append('tags', tag)
          );
        }

        if (filters.position) {
          queryParams.set('position', filters.position);
        }

        if (filters.maxVideoLength) {
          queryParams.set('maxVideoLength', filters.maxVideoLength);
        }

        response = await fetch(
          `${API_BASE_URL}/api/search?${queryParams}`
        );
      }

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      results.value = data;
      return data;

    } catch (err) {
      error.value = err.message;
      results.value = [];
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

  const clearFilters = async () => {
    selectedTags.value = [];
    selectedPosition.value = null;
    maxVideoLength.value = 301;

    error.value = null;

    await executeSearch();
  };

  const setPosition = (position) => {
    selectedPosition.value = selectedPosition.value === position ? null : position;
  };

  return {
    selectedTags,
    selectedPosition,
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
