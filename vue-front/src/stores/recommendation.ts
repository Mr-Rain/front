import { defineStore } from 'pinia';
import type { RecommendedJob } from '@/types/recommendation';
import { getRecommendedJobs } from '@/api/recommendation';
import { ElMessage } from 'element-plus';

interface RecommendationState {
  recommendedJobs: RecommendedJob[];
  loading: boolean;
}

export const useRecommendationStore = defineStore('recommendation', {
  state: (): RecommendationState => ({
    recommendedJobs: [],
    loading: false,
  }),

  actions: {
    // 获取推荐职位
    async fetchRecommendations(params: any = {}) {
      this.loading = true;
      try {
        const response = await getRecommendedJobs(params);
        this.recommendedJobs = response.data.list;
      } catch (error) {
        console.error('Failed to fetch recommended jobs:', error);
        ElMessage.error('获取推荐职位失败');
        this.recommendedJobs = [];
      } finally {
        this.loading = false;
      }
    },

    clearRecommendations() {
      this.recommendedJobs = [];
    },
  },
}); 