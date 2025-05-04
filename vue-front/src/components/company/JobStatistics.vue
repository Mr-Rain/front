<template>
  <div class="job-statistics">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6" v-for="(stat, index) in statistics" :key="index">
        <el-card shadow="hover" class="stat-card" :class="stat.class">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="32">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">
                <!-- 如果是申请数量，添加链接 -->
                <template v-if="stat.type === 'applications'">
                  <el-link type="primary" @click="goToApplications">{{ stat.value }}</el-link>
                </template>
                <template v-else>
                  {{ stat.value }}
                </template>
              </div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
          <div class="stat-footer" v-if="stat.trend">
            <span :class="['trend', stat.trend > 0 ? 'up' : stat.trend < 0 ? 'down' : '']">
              <el-icon v-if="stat.trend > 0"><ArrowUp /></el-icon>
              <el-icon v-else-if="stat.trend < 0"><ArrowDown /></el-icon>
              {{ Math.abs(stat.trend) }}%
              {{ stat.trend > 0 ? '增长' : stat.trend < 0 ? '下降' : '持平' }}
            </span>
            <span class="period">较上月</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  Briefcase,
  View,
  User,
  Bell,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue';

const router = useRouter();

// 定义组件属性
const props = defineProps({
  totalJobs: {
    type: Number,
    default: 0
  },
  activeJobs: {
    type: Number,
    default: 0
  },
  totalApplications: {
    type: Number,
    default: 0
  },
  pendingApplications: {
    type: Number,
    default: 0
  },
  jobViews: {
    type: Number,
    default: 0
  },
  // 趋势数据（百分比）
  trends: {
    type: Object,
    default: () => ({
      totalJobs: 0,
      activeJobs: 0,
      totalApplications: 0,
      pendingApplications: 0
    })
  }
});

// 跳转到申请管理页面
const goToApplications = () => {
  // 跳转到申请管理页面，不带筛选条件
  router.push({ name: 'company-application-manage' });
};

// 计算统计数据
const statistics = computed(() => [
  {
    label: '发布职位',
    value: props.totalJobs,
    icon: Briefcase,
    class: 'jobs-card',
    trend: props.trends.totalJobs,
    type: 'jobs'
  },
  {
    label: '招聘中',
    value: props.activeJobs,
    icon: Bell,
    class: 'active-card',
    trend: props.trends.activeJobs,
    type: 'active'
  },
  {
    label: '收到申请',
    value: props.totalApplications,
    icon: User,
    class: 'applications-card',
    trend: props.trends.totalApplications,
    type: 'applications'
  },
  {
    label: '待处理',
    value: props.pendingApplications,
    icon: Bell,
    class: 'pending-card',
    trend: props.trends.pendingApplications,
    type: 'pending'
  }
]);
</script>

<style scoped>
.job-statistics {
  margin-bottom: 20px;
}

.stat-card {
  height: 100%;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  color: white;
}

.jobs-card .stat-icon {
  background-color: var(--el-color-primary);
}

.active-card .stat-icon {
  background-color: var(--el-color-success);
}

.applications-card .stat-icon {
  background-color: var(--el-color-warning);
}

.pending-card .stat-icon {
  background-color: var(--el-color-danger);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.stat-footer {
  margin-top: 10px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend {
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend.up {
  color: var(--el-color-success);
}

.trend.down {
  color: var(--el-color-danger);
}

.period {
  color: var(--el-text-color-secondary);
}

@media (max-width: 768px) {
  .el-col {
    margin-bottom: 15px;
  }
}
</style>
