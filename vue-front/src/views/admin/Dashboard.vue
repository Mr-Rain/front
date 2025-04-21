<template>
  <div class="admin-dashboard-page">
    <el-card shadow="never" class="welcome-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">管理工作台</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="welcome-content">
            <h3>欢迎回来，{{ adminName }}</h3>
            <p>今天是 {{ currentDate }}，继续管理平台吧！</p>
            <div class="welcome-actions">
              <el-button type="primary" @click="goToAudit">企业审核</el-button>
              <el-button @click="router.push('/admin/users')">用户管理</el-button>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 概览统计数据 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon user-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">注册用户总数</div>
                <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon company-icon">
                <el-icon><OfficeBuilding /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">入驻企业总数</div>
                <div class="stat-value">{{ stats.totalCompanies || 0 }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon job-icon">
                <el-icon><Briefcase /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">发布职位总数</div>
                <div class="stat-value">{{ stats.totalJobs || 0 }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon pending-icon">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">待审核企业</div>
                <div class="stat-value">
                  {{ stats.pendingCompanies || 0 }}
                  <el-button v-if="stats.pendingCompanies > 0" type="primary" link @click="goToAudit" style="margin-left: 5px;">去审核</el-button>
                </div>
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
          <el-tooltip content="展示平台数据和统计信息" placement="top">
            <el-icon><InfoFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <admin-statistics />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import AdminStatistics from '@/components/admin/AdminStatistics.vue';
import {
  User,
  OfficeBuilding,
  Briefcase,
  Warning,
  InfoFilled
} from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();

// 管理员名称
const adminName = computed(() => {
  return userStore.userInfo?.username || '管理员';
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

// 统计数据
const stats = reactive({
    totalUsers: 0,
    totalCompanies: 0,
    totalJobs: 0,
    pendingCompanies: 0
});

onMounted(() => {
    // 模拟数据
    setTimeout(() => {
      stats.totalUsers = 1250;
      stats.totalCompanies = 85;
      stats.totalJobs = 320;
      stats.pendingCompanies = 15;
    }, 500);

    // TODO: 从实际API获取数据
    // const adminStore = useAdminStore();
    // stats.totalUsers = await adminStore.fetchTotalUsers();
});

const goToAudit = () => {
    router.push({ name: 'admin-company-audit' }); // 企业审核路由
};

</script>

<style scoped>
.admin-dashboard-page {
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
  margin-bottom: 20px;
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

.user-icon {
  background-color: var(--el-color-primary);
}

.company-icon {
  background-color: var(--el-color-success);
}

.job-icon {
  background-color: var(--el-color-info);
}

.pending-icon {
  background-color: var(--el-color-warning);
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
  display: flex;
  align-items: center;
}

.statistics-card {
  margin-bottom: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .admin-dashboard-page {
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