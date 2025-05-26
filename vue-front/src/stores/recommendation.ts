import { defineStore } from 'pinia';
import type { RecommendationDTO } from '@/types/recommendation';
import { getRecommendedJobs } from '@/api/recommendation';
import { ElMessage } from 'element-plus';

interface RecommendationState {
  recommendedJobs: RecommendationDTO[];
  dislikedJobIds: (string | number)[];
  loading: boolean;
  lastFetchTime: string | null;
  recommendationScenario: string;
}

export const useRecommendationStore = defineStore('recommendation', {
  state: (): RecommendationState => ({
    recommendedJobs: [],
    dislikedJobIds: [],
    loading: false,
    lastFetchTime: null,
    recommendationScenario: 'default', // default, skill-based, history-based
  }),

  getters: {
    // 获取推荐职位数量
    recommendationCount: (state) => state.recommendedJobs.length,

    // 获取平均推荐分数
    averageScore: (state) => {
      if (state.recommendedJobs.length === 0) return 0;
      const totalScore = state.recommendedJobs.reduce(
        (sum: number, job: RecommendedJob) => sum + (job.recommendationScore || 0),
        0
      );
      return totalScore / state.recommendedJobs.length;
    },

    // 获取最后更新时间的格式化字符串
    lastUpdateTime: (state) => {
      if (!state.lastFetchTime) return '从未更新';
      try {
        return new Date(state.lastFetchTime).toLocaleString();
      } catch (e) {
        return state.lastFetchTime;
      }
    },
  },

  actions: {
    // 获取推荐职位
    async fetchRecommendations(params: any = {}) {
      this.loading = true;
      try {
        // 合并场景参数
        const requestParams = {
          ...params,
          scenario: params.scenario || this.recommendationScenario,
        };

        const response = await getRecommendedJobs(requestParams);
        this.recommendedJobs = response.data.list;
        this.lastFetchTime = new Date().toISOString();

        // 过滤掉已经不感兴趣的职位
        if (this.dislikedJobIds.length > 0) {
          this.recommendedJobs = this.recommendedJobs.filter(
            (job: RecommendationDTO) => !this.dislikedJobIds.includes(job.jobId)
          );
        }
      } catch (error) {
        console.error('Failed to fetch recommended jobs:', error);
        ElMessage.error('获取推荐职位失败');
        this.recommendedJobs = [];
      } finally {
        this.loading = false;
      }
    },

    // 清除推荐列表
    clearRecommendations() {
      this.recommendedJobs = [];
    },

    // 标记职位不感兴趣
    dislikeJob(jobId: string | number) {
      // 将职位 ID 添加到不感兴趣列表
      if (!this.dislikedJobIds.includes(jobId)) {
        this.dislikedJobIds.push(jobId);
      }

      // 从推荐列表中移除该职位
      this.recommendedJobs = this.recommendedJobs.filter(
        (job: RecommendedJob) => job.jobInfo.id !== jobId
      );
    },

    // 设置推荐场景
    setRecommendationScenario(scenario: string) {
      this.recommendationScenario = scenario;
      // 可以选择立即重新获取推荐
      // this.fetchRecommendations();
    },

    // 重置不感兴趣列表
    resetDislikes() {
      this.dislikedJobIds = [];
      ElMessage.success('已重置不感兴趣列表');
    },
  },

  persist: true
});