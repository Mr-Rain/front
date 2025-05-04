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
import { computed, onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import AdminStatistics from '@/components/admin/AdminStatistics.vue';
import { InfoFilled } from '@element-plus/icons-vue';
import { clearCacheByTags } from '@/utils/cacheInterceptor';

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

const goToAudit = () => {
  router.push({ name: 'admin-company-audit' }); // 企业审核路由
};

// 上次清除缓存的时间
let lastCacheClearTime = 0;

// 在组件挂载时，检查是否需要清除缓存
onMounted(() => {
  const now = Date.now();
  // 如果距离上次清除缓存超过30秒，则清除缓存
  if (now - lastCacheClearTime > 30 * 1000) {
    console.log('Dashboard组件挂载，清除缓存');
    clearCacheByTags(['admin-stats', 'dashboard']);
    lastCacheClearTime = now;
  } else {
    console.log('Dashboard组件挂载，使用缓存数据，距离上次清除缓存:', Math.round((now - lastCacheClearTime) / 1000), '秒');
  }
});

// 在组件被keep-alive激活时，检查是否需要清除缓存
onActivated(() => {
  const now = Date.now();
  // 如果距离上次清除缓存超过30秒，则清除缓存
  if (now - lastCacheClearTime > 30 * 1000) {
    console.log('Dashboard组件激活，清除缓存');
    clearCacheByTags(['admin-stats', 'dashboard']);
    lastCacheClearTime = now;
  } else {
    console.log('Dashboard组件激活，使用缓存数据，距离上次清除缓存:', Math.round((now - lastCacheClearTime) / 1000), '秒');
  }
});

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