import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import {
  globalSearch,
  getSearchSuggestions,
  getSearchHistory,
  getSearchHistoryByType,
  saveSearchHistory,
  deleteSearchHistory,
  clearSearchHistory
} from '@/api/search';
import type {
  SearchParams,
  SearchResult,
  SearchType,
  SearchHistory
} from '@/api/search';
import { ElMessage } from 'element-plus';

export const useSearchStore = defineStore('search', () => {
  // 搜索状态
  const loading = ref(false);
  const suggestionsLoading = ref(false);
  const historyLoading = ref(false);

  // 搜索结果
  const searchResults = reactive<SearchResult>({
    jobs: [],
    companies: [],
    students: [],
    total: 0
  });

  // 搜索建议
  const searchSuggestions = ref<string[]>([]);

  // 搜索历史
  const searchHistory = ref<SearchHistory[]>([]);

  // 搜索参数
  const searchParams = reactive<SearchParams>({
    keyword: '',
    type: 'all',
    page: 1,
    pageSize: 10,
    filters: {}
  });

  // 执行全局搜索
  const performSearch = async (params?: Partial<SearchParams>) => {
    // 合并搜索参数
    if (params) {
      Object.assign(searchParams, params);
    }

    // 如果关键词为空，则不执行搜索
    if (!searchParams.keyword.trim()) {
      searchResults.jobs = [];
      searchResults.companies = [];
      searchResults.students = [];
      searchResults.total = 0;
      return;
    }

    loading.value = true;

    try {
      const response = await globalSearch(searchParams);

      // 更新搜索结果
      searchResults.jobs = response.data.jobs || [];
      searchResults.companies = response.data.companies || [];
      searchResults.students = response.data.students || [];
      searchResults.total = response.data.total;

      // 保存搜索历史
      await saveSearchHistory(searchParams.keyword, searchParams.type);

      // 重新获取搜索历史
      await fetchSearchHistory();

      return response.data;
    } catch (error) {
      console.error('Search failed:', error);
      ElMessage.error('搜索失败，请稍后重试');
      return null;
    } finally {
      loading.value = false;
    }
  };

  // 获取搜索建议
  const fetchSearchSuggestions = async (keyword: string) => {
    if (!keyword.trim()) {
      searchSuggestions.value = [];
      return;
    }

    suggestionsLoading.value = true;

    try {
      const response = await getSearchSuggestions(keyword);
      searchSuggestions.value = response.data;
      return response.data;
    } catch (error) {
      console.error('Failed to fetch search suggestions:', error);
      searchSuggestions.value = [];
      return [];
    } finally {
      suggestionsLoading.value = false;
    }
  };

  // 获取搜索历史
  const fetchSearchHistory = async () => {
    historyLoading.value = true;

    try {
      const response = await getSearchHistory();
      searchHistory.value = response.data;
      return response.data;
    } catch (error) {
      console.error('Failed to fetch search history:', error);
      searchHistory.value = [];
      return [];
    } finally {
      historyLoading.value = false;
    }
  };

  // 删除单条搜索历史
  const deleteHistory = async (historyId: string | number) => {
    historyLoading.value = true;

    try {
      await deleteSearchHistory(historyId);
      // 从本地列表中移除
      searchHistory.value = searchHistory.value.filter(item => item.id !== historyId);
      ElMessage.success('搜索历史已删除');
    } catch (error) {
      console.error('Failed to delete search history:', error);
      ElMessage.error('删除搜索历史失败');
    } finally {
      historyLoading.value = false;
    }
  };

  // 获取分类搜索历史
  const fetchSearchHistoryByType = async (type: SearchType) => {
    historyLoading.value = true;

    try {
      const response = await getSearchHistoryByType(type);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch search history by type:', error);
      return [];
    } finally {
      historyLoading.value = false;
    }
  };

  // 清除搜索历史
  const clearHistory = async () => {
    historyLoading.value = true;

    try {
      await clearSearchHistory();
      searchHistory.value = [];
      ElMessage.success('搜索历史已清除');
    } catch (error) {
      console.error('Failed to clear search history:', error);
      ElMessage.error('清除搜索历史失败');
    } finally {
      historyLoading.value = false;
    }
  };

  // 重置搜索参数
  const resetSearchParams = () => {
    searchParams.keyword = '';
    searchParams.type = 'all';
    searchParams.page = 1;
    searchParams.pageSize = 10;
    searchParams.filters = {};
  };

  // 更新搜索类型
  const updateSearchType = (type: SearchType) => {
    searchParams.type = type;
    searchParams.page = 1; // 切换类型时重置页码
    return performSearch();
  };

  // 更新页码
  const updatePage = (page: number) => {
    searchParams.page = page;
    return performSearch();
  };

  // 更新每页数量
  const updatePageSize = (pageSize: number) => {
    searchParams.pageSize = pageSize;
    searchParams.page = 1; // 更改每页数量时重置页码
    return performSearch();
  };

  // 更新筛选条件
  const updateFilters = (filters: Record<string, any>) => {
    searchParams.filters = { ...searchParams.filters, ...filters };
    searchParams.page = 1; // 更改筛选条件时重置页码
    return performSearch();
  };

  // 重置筛选条件
  const resetFilters = () => {
    searchParams.filters = {};
    searchParams.page = 1;
    return performSearch();
  };

  return {
    // 状态
    loading,
    suggestionsLoading,
    historyLoading,

    // 数据
    searchResults,
    searchSuggestions,
    searchHistory,
    searchParams,

    // 方法
    performSearch,
    fetchSearchSuggestions,
    fetchSearchHistory,
    fetchSearchHistoryByType,
    deleteHistory,
    clearHistory,
    resetSearchParams,
    updateSearchType,
    updatePage,
    updatePageSize,
    updateFilters,
    resetFilters
  };
});
