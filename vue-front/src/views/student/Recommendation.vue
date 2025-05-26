<template>
  <div class="recommendation-page responsive-padding" v-loading="recommendationStore.loading">
    <el-card shadow="never" class="page-card responsive-card">
      <template #header>
        <div class="card-header">
          <span>智能推荐职位</span>
          <div class="header-actions">
            <!-- 推荐场景选择 -->
            <el-select
              v-model="currentScenario"
              size="small"
              @change="handleScenarioChange"
              class="scenario-select"
            >
              <el-option
                v-for="scenario in scenarios"
                :key="scenario.id"
                :label="scenario.name"
                :value="scenario.id"
              />
            </el-select>

            <!-- 刷新按钮 -->
            <el-button type="primary" link @click="fetchRecommendations" :loading="recommendationStore.loading">
              <el-icon><Refresh /></el-icon>
              <span class="hide-on-mobile">刷新推荐</span>
            </el-button>

            <!-- 重新生成推荐按钮 -->
            <el-button type="success" link @click="regenerateRecommendations" :loading="regenerating">
              <el-icon><RefreshRight /></el-icon>
              <span class="hide-on-mobile">重新生成推荐</span>
            </el-button>

            <!-- 设置按钮 -->
            <el-button type="primary" link @click="goToSettings">
              <el-icon><Setting /></el-icon>
              <span class="hide-on-mobile">推荐设置</span>
            </el-button>

            <!-- 信息提示 -->
            <el-tooltip content="基于您的简历和浏览历史推荐相关职位" placement="top">
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
        </div>
      </template>

      <!-- 推荐简介 -->
      <div class="recommendation-intro" v-if="recommendationStore.recommendedJobs.length > 0">
        <p>根据您的简历和浏览历史，为您推荐了 <strong>{{ recommendationStore.recommendedJobs.length }}</strong> 个可能感兴趣的职位。</p>
      </div>

      <!-- 推荐列表 -->
      <div v-if="recommendationStore.recommendedJobs.length > 0" class="recommendation-list">
        <div v-for="rec in recommendationStore.recommendedJobs" :key="rec.jobId" class="recommendation-item">
          <!-- 推荐分数可视化 -->
          <div class="recommendation-score-bar">
            <div class="score-label">匹配度</div>
            <el-progress
              :percentage="(rec.score || 0) * 100"
              :format="(percentage) => (percentage / 100).toFixed(2)"
              :color="getScoreColor(rec.score || 0)"
              :stroke-width="12"
              class="score-progress"
            />
          </div>

          <!-- 职位卡片 -->
          <JobCard
            :job="convertToJobInfo(rec)"
            class="job-card"
          >
            <!-- 推荐理由和操作 -->
            <template #footer-extra>
              <div class="recommendation-info">
                <div class="reason">
                  <el-icon><MagicStick /></el-icon>
                  <span>推荐理由: {{ rec.reason || '与您的技能匹配度高' }}</span>
                </div>
                <div class="actions">
                  <el-button link type="info" size="small" @click="handleDislike(rec.jobId)">
                    <el-icon><Close /></el-icon>
                    <span class="hide-on-mobile">不感兴趣</span>
                  </el-button>
                </div>
              </div>
            </template>
          </JobCard>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-else description="暂无为你推荐的职位">
        <div class="empty-reason">您已申请了所有可用职位，暂无新的推荐。</div>
        <template #extra>
          <div class="empty-actions">
            <el-button type="primary" @click="goToSettings">更新推荐设置</el-button>
            <el-button @click="goToResume">完善简历</el-button>
          </div>
        </template>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRecommendationStore } from '@/stores/recommendation';
import { getRecommendationScenarios, regenerateRecommendations as regenerateRecommendationsApi } from '@/api/recommendation';
import JobCard from '@/components/common/JobCard.vue';
import type { RecommendationDTO } from '@/types/recommendation';
import type { JobInfo } from '@/types/job';
import {
  ElCard, ElEmpty, ElIcon, ElTooltip, ElButton,
  ElProgress, ElMessage, ElSelect, ElOption
} from 'element-plus';
import {
  MagicStick, Refresh, RefreshRight, InfoFilled, Close, Setting
} from '@element-plus/icons-vue';

const router = useRouter();
const recommendationStore = useRecommendationStore();
const regenerating = ref(false);

// 推荐场景相关变量
const currentScenario = ref('default');
const scenarios = ref([
  { id: 'default', name: '智能推荐' },
  { id: 'skill-based', name: '基于技能' },
  { id: 'history-based', name: '基于浏览历史' }
]);

// 获取推荐场景列表
const fetchScenarios = async () => {
  try {
    const response = await getRecommendationScenarios();
    scenarios.value = response.data.scenarios;
  } catch (error) {
    console.error('Failed to fetch recommendation scenarios:', error);
  }
};

// 处理场景变化
const handleScenarioChange = (value: string) => {
  console.log(`Changing recommendation scenario to: ${value}`);
  recommendationStore.setRecommendationScenario(value);
  fetchRecommendations();
};

// 获取推荐职位
const fetchRecommendations = () => {
  const params = {
    scenario: currentScenario.value
  };
  recommendationStore.fetchRecommendations(params);
};

// 将RecommendationDTO转换为JobInfo格式，供JobCard组件使用
const convertToJobInfo = (rec: RecommendationDTO): JobInfo => {
  return {
    id: rec.jobId,
    title: rec.jobTitle,
    companyId: rec.companyId,
    companyName: rec.companyName,
    companyLogo: rec.companyLogo,
    location: rec.jobLocation,
    salaryRange: rec.salaryRange,
    jobType: rec.jobType as any, // 类型转换，因为后端可能返回字符串
    experienceRequired: rec.experienceRequired,
    educationRequired: rec.educationRequired,
    tags: rec.tags,
    benefits: [], // 推荐DTO中没有benefits字段，使用空数组
    description: '', // 推荐DTO中没有description字段，使用空字符串
    requirements: '', // 推荐DTO中没有requirements字段，使用空字符串
    publishTime: rec.createdAt,
    status: 'open' as any // 默认状态
  };
};

// 根据分数返回颜色
const getScoreColor = (score: number): string => {
  if (score >= 0.9) return '#67C23A'; // 高匹配度 - 绿色
  if (score >= 0.7) return '#E6A23C'; // 中高匹配度 - 黄色
  if (score >= 0.5) return '#F56C6C'; // 中匹配度 - 红色
  return '#909399'; // 低匹配度 - 灰色
};

// 处理"不感兴趣"操作
const handleDislike = async (jobId: string | number) => {
  console.log(`不感兴趣职位 ${jobId}`);
  try {
    // 使用store中的dislikeJob方法
    recommendationStore.dislikeJob(jobId);
    ElMessage.success('已移除该推荐');
  } catch (error) {
    ElMessage.error('操作失败');
    console.error(error);
  }
};

// 跳转到简历页面
const goToResume = () => {
  router.push('/student/resume');
};

// 跳转到推荐设置页面
const goToSettings = () => {
  router.push('/student/recommendations/settings');
};

// 重新生成推荐
const regenerateRecommendations = async () => {
  try {
    regenerating.value = true;
    // 导入的函数名与本地函数名冲突，使用导入的函数需要重命名
    const result = await regenerateRecommendationsApi();
    if (result.success) {
      ElMessage.success('推荐已重新生成');
      // 重新获取推荐列表
      fetchRecommendations();
    } else {
      ElMessage.error('重新生成推荐失败');
    }
  } catch (error) {
    console.error('Failed to regenerate recommendations:', error);
    ElMessage.error('重新生成推荐失败');
  } finally {
    regenerating.value = false;
  }
};

onMounted(() => {
  // 获取推荐场景列表
  fetchScenarios();
  // 获取推荐职位
  fetchRecommendations();
});
</script>

<style scoped>
.recommendation-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.scenario-select {
  min-width: 120px;
}

.recommendation-intro {
  margin-bottom: 20px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  background-color: var(--el-color-info-light-9);
  padding: 10px 15px;
  border-radius: 4px;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.recommendation-item {
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.recommendation-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--el-box-shadow-lighter);
}

.recommendation-score-bar {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 15px;
}

.score-label {
  font-size: 14px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.score-progress {
  flex-grow: 1;
}

.recommendation-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.empty-reason {
  margin: 10px 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.empty-actions {
  display: flex;
  gap: 10px;
}

.reason {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 10px;
}

/* 移动端适配 */
@media (max-width: 576px) {
  .recommendation-page {
    padding: 10px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .scenario-select {
    min-width: 100px;
  }

  .recommendation-score-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .recommendation-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .actions {
    width: 100%;
    justify-content: flex-end;
  }
}

/* 平板设备适配 */
@media (min-width: 577px) and (max-width: 992px) {
  .recommendation-page {
    padding: 15px;
  }
}
</style>