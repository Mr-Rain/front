<template>
  <div class="company-dashboard-page">
    <el-card shadow="never" class="welcome-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">企业工作台</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="welcome-content">
            <h3>欢迎回来，{{ companyName }}</h3>
            <p>今天是 {{ currentDate }}，继续管理您的招聘活动吧！</p>
            <p v-if="lastLoginTime" class="last-login-time">上次登录时间：{{ lastLoginTime }}</p>
            <div class="welcome-actions">
              <el-button type="primary" @click="router.push('/company/jobs/edit')">发布职位</el-button>
              <el-button @click="router.push('/company/applications')">管理申请</el-button>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 概览统计数据 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon pending-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">待处理申请</div>
                <div class="stat-value">{{ stats.pendingApplications || 0 }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon job-icon">
                <el-icon><Briefcase /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">在线职位数</div>
                <div class="stat-value">{{ stats.activeJobs || 0 }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon resume-icon">
                <el-icon><Collection /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">收到简历总数</div>
                <div class="stat-value">{{ stats.totalResumes || 0 }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据统计部分 -->
    <el-card shadow="never" class="statistics-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span class="card-title">数据统计</span>
          <el-tooltip content="展示您的招聘数据和统计信息" placement="top">
            <el-icon><InfoFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <company-statistics />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useCompanyStore } from '@/stores/company';
import CompanyStatistics from '@/components/company/CompanyStatistics.vue';
import { getCompanyDashboardStatistics } from '@/api/statistics';
import { formatDateTime } from '@/utils/dateUtils';
import {
  Document,
  Briefcase,
  Collection,
  InfoFilled
} from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();

// 公司名称
const companyName = computed(() => {
  return userStore.userInfo?.username || '企业用户';
});

// 当前日期
const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
});

// 上次登录时间 - 使用统一的日期格式化函数
const lastLoginTime = computed(() => {
  const companyStore = useCompanyStore();
  // 使用 previousLoginTime 字段，这是真正的上次登录时间
  const lastLogin = companyStore.profile?.previousLoginTime || userStore.userInfo?.previousLoginTime;

  if (!lastLogin) return null;

  const formatted = formatDateTime(lastLogin, { format: 'full' });
  return formatted || null;
});

// 统计数据
const stats = reactive({
    pendingApplications: 0,
    activeJobs: 0,
    totalResumes: 0
});

// 加载状态
const loading = ref(false);

// 获取公司仪表盘统计数据
const fetchDashboardStats = async () => {
    loading.value = true;
    try {
        // 从API获取数据
        const response = await getCompanyDashboardStatistics();
        const data = response.data;

        if (data && data.overview) {
            stats.pendingApplications = data.overview.newApplications || 0;
            stats.activeJobs = data.overview.activeJobs || 0;
            stats.totalResumes = data.overview.totalApplications || 0;
        }
    } catch (error) {
        console.error('Failed to fetch dashboard statistics:', error);
        // 如果API调用失败，使用默认值
        stats.pendingApplications = 0;
        stats.activeJobs = 0;
        stats.totalResumes = 0;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    // 获取公司信息
    const companyStore = useCompanyStore();
    if (!companyStore.profile) {
        companyStore.fetchProfile();
    }

    // 获取统计数据
    fetchDashboardStats();
});

</script>

<style scoped>
.company-dashboard-page {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  position: relative;
  padding-left: 12px;
}

.card-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background-color: var(--el-color-primary);
  border-radius: 2px;
}

.welcome-content {
  padding: 10px 0;
}

.welcome-content h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
}

.welcome-content p {
  color: var(--el-text-color-secondary);
  margin-bottom: 10px;
}

.last-login-time {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 15px;
  font-style: italic;
}

.welcome-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.stat-card {
  height: 100%;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.stat-icon .el-icon {
  font-size: 30px;
  color: white;
}

.pending-icon {
  background-color: var(--el-color-warning);
}

.job-icon {
  background-color: var(--el-color-primary);
}

.resume-icon {
  background-color: var(--el-color-success);
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.statistics-card {
  margin-bottom: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .company-dashboard-page {
    padding: 10px;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
  }

  .stat-icon .el-icon {
    font-size: 24px;
  }

  .stat-value {
    font-size: 20px;
  }

  .welcome-content h3 {
    font-size: 18px;
  }
}
</style>