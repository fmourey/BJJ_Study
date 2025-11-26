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

  const maxVideoLength = ref(3600);
  const loading = ref(false);
  const error = ref(null);
  const results = ref([]);

  const buildSQLQuery = () => {
    const conditions = [];
    const params = [];

    if (selectedTags.value.length > 0) {
      const tagConditions = selectedTags.value.map(() => "tags LIKE ?");
      conditions.push(`(${tagConditions.join(' OR ')})`);
      selectedTags.value.forEach(tag => {
        params.push(`%${tag}%`);
      });
    }

    if (selectedPosition.value) {
      conditions.push("position = ?");
      params.push(selectedPosition.value);
    }
    if (maxVideoLength.value) {
      conditions.push(
        "CAST((julianday(end_time) - julianday(start_time)) * 86400 AS INTEGER) <= ?"
      );
      params.push(maxVideoLength.value);
    }

    const whereClause = conditions.length > 0 ? conditions.join(' AND ') : '1=1';

    return {
      whereClause,
      params
    };
  };

  const executeSearch = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { whereClause, params } = buildSQLQuery();

      const queryParams = new URLSearchParams({
        whereClause,
        params: JSON.stringify(params)
      });

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
      throw err;
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
    maxVideoLength.value = 600;
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

    buildSQLQuery,
    executeSearch,
    addTag,
    removeTag,
    clearFilters,
    setPosition
  };
}
</script>