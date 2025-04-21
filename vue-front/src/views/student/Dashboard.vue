<template>
  <div class="student-dashboard">
    <el-row :gutter="20">
      <!-- 个人信息卡片 -->
      <el-col :xs="24" :sm="24" :md="6" :lg="5">
        <el-card class="box-card profile-summary" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">个人信息</span>
              <el-button type="primary" class="edit-button" @click="goToProfile">编辑</el-button>
            </div>
          </template>
          <div v-if="studentStore.loading" class="loading-placeholder">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="studentStore.profile" class="profile-content">
            <div class="avatar-container">
              <UserAvatar :image-url="studentStore.profile.avatar" :size="100" />
            </div>
            <h3 class="profile-name">{{ studentStore.profile.username }}</h3>
            <div class="profile-info">
              <p class="info-item"><i class="el-icon"><School /></i> {{ studentStore.profile.school }}</p>
              <p class="info-item"><i class="el-icon"><OfficeBuilding /></i> {{ studentStore.profile.major }}</p>
              <p class="info-item"><i class="el-icon"><Collection /></i> 学历: {{ studentStore.profile.education }}</p>
            </div>
          </div>
          <div v-else class="error-message">无法加载学生信息</div>
        </el-card>
      </el-col>

      <!-- 主要内容区域 -->
      <el-col :xs="24" :sm="24" :md="18" :lg="19">
        <!-- 申请状态卡片 -->
        <el-card class="box-card application-status" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">最新申请状态</span>
              <el-button type="primary" class="more-button" @click="goToApplications">查看全部</el-button>
            </div>
          </template>
          <div v-if="applicationStore.loadingStudentList" class="loading-placeholder">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="applicationStore.studentApplications.length > 0" class="timeline-container">
             <!-- Display latest applications -->
             <el-timeline>
                <el-timeline-item
                  v-for="app in applicationStore.studentApplications.slice(0, 5)"
                  :key="app.id"
                  :timestamp="formatTimestamp(app.apply_time)"
                  placement="top"
                  class="timeline-item"
                >
                   <el-card shadow="hover" class="app-status-card">
                      <p class="job-title">
                        申请职位：
                        <el-link type="primary" @click="goToJobDetail(app.job_id)">
                          {{ app.job_info?.title || '职位信息加载中...' }}
                        </el-link>
                        <span class="company-name">({{ app.job_info?.company_name }})</span>
                      </p>
                      <p class="job-status">
                        状态：<el-tag :type="getStatusTagType(app.status)" effect="plain">{{ formatStatus(app.status) }}</el-tag>
                      </p>
                      <p v-if="app.feedback" class="job-feedback">企业反馈：{{ app.feedback }}</p>
                   </el-card>
                </el-timeline-item>
             </el-timeline>
          </div>
          <el-empty v-else description="暂无申请记录"></el-empty>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据统计部分 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card class="box-card statistics-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">数据统计</span>
              <el-tooltip content="展示您的申请数据和统计信息" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <student-statistics />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStudentStore } from '@/stores/student';
import { useApplicationStore } from '@/stores/application';
import UserAvatar from '@/components/common/UserAvatar.vue';
import StudentStatistics from '@/components/student/StudentStatistics.vue';
import { School, OfficeBuilding, Collection, InfoFilled } from '@element-plus/icons-vue';
import type { ApplicationStatus } from '@/types/application';

const router = useRouter();
const studentStore = useStudentStore();
const applicationStore = useApplicationStore();

// Fetch data on component mount
onMounted(() => {
  studentStore.fetchProfile();
  applicationStore.fetchStudentApplications({ pageSize: 5, page: 1 }); // Fetch latest 5 applications
});

const goToProfile = () => router.push('/student/profile');
const goToApplications = () => router.push('/student/applications');
const goToJobDetail = (jobId: string | number) => router.push(`/jobs/${jobId}`);

// Helper to format timestamp (adapt as needed)
const formatTimestamp = (isoString: string): string => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString();
    } catch (e) {
        return isoString; // Fallback
    }
};

// Helper to format application status text
const formatStatus = (status: ApplicationStatus): string => {
    const statusMap: Record<ApplicationStatus, string> = {
        pending: '待处理',
        viewed: '已查看',
        interview: '邀请面试',
        offer: '已录用',
        rejected: '未通过',
        withdrawn: '已撤回'
    };
    return statusMap[status] || status;
}

// Helper to get tag type based on status
const getStatusTagType = (status: ApplicationStatus): ('primary' | 'success' | 'info' | 'warning' | 'danger') => {
     switch (status) {
        case 'offer': return 'success';
        case 'interview': return 'primary';
        case 'rejected': return 'danger';
        case 'withdrawn': return 'info';
        case 'viewed': return 'warning';
        case 'pending':
        default: return 'info';
    }
}

</script>

<style scoped>
/* 全局变量 */
:root {
  --primary-color: #409EFF;
  --success-color: #67C23A;
  --warning-color: #E6A23C;
  --danger-color: #F56C6C;
  --info-color: #909399;

  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;

  --border-color: #EBEEF5;
  --bg-color: #F5F7FA;

  --card-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --card-hover-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.student-dashboard {
  padding: 24px;
  background-color: var(--bg-color);
  min-height: calc(100vh - 60px);
}

/* 卡片样式 */
.box-card {
  margin-bottom: 24px;
  border-radius: 8px;
  transition: all 0.3s;
  border: none;
  height: 100%;
}

.box-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--card-hover-shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
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
  height: 16px;
  background: var(--primary-color);
  border-radius: 2px;
}

.edit-button, .more-button {
  font-weight: 500;
}

/* 个人信息样式 */
.profile-summary {
  background: linear-gradient(to bottom, #f7fafc, #fff);
  position: sticky;
  top: 24px;
}

.profile-content {
  text-align: center;
  padding: 10px 0;
}

.avatar-container {
  margin-bottom: 16px;
  position: relative;
}

.avatar-container::after {
  content: '';
  display: block;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 2px solid rgba(64, 158, 255, 0.2);
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translateX(-50%) scale(1);
    opacity: 0.8;
  }
  70% {
    transform: translateX(-50%) scale(1.1);
    opacity: 0;
  }
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 0;
  }
}

.profile-name {
  margin: 16px 0 10px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.profile-info {
  text-align: left;
  padding: 5px 10px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  color: var(--text-regular);
  font-size: 14px;
  border-bottom: 1px solid var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .el-icon {
  margin-right: 10px;
  color: var(--primary-color);
  font-size: 18px;
}

.loading-placeholder {
  padding: 20px 0;
}

.error-message {
  text-align: center;
  color: var(--danger-color);
  padding: 20px 0;
}



/* 申请状态样式 */
.application-status {
  background-color: #fff;
  height: calc(100% - 24px);
}

.timeline-container {
  padding: 0 10px;
  max-height: 600px;
  overflow-y: auto;
}

.timeline-item {
  padding-bottom: 15px;
}

.app-status-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  border-left: 3px solid var(--primary-color);
  margin-bottom: 5px;
}

.app-status-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.job-title {
  margin: 10px 0;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.company-name {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: normal;
  white-space: nowrap;
}

.job-status {
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.job-feedback {
  margin: 10px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  background-color: #f8f8f8;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 2px solid var(--warning-color);
}

/* 时间轴样式优化 */
:deep(.el-timeline-item__node) {
  background-color: var(--primary-color);
}

:deep(.el-timeline-item__tail) {
  border-left-color: var(--border-color);
}

:deep(.el-timeline-item__timestamp) {
  color: var(--text-secondary);
  font-size: 13px;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .student-dashboard {
    padding: 16px;
  }

  .profile-summary {
    position: static;
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .student-dashboard {
    padding: 12px;
  }

  .el-row {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .el-col {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .box-card {
    margin-bottom: 16px;
  }

  .card-title {
    font-size: 16px;
  }

  .profile-name {
    font-size: 18px;
  }

  .avatar-container::after {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 575px) {
  .student-dashboard {
    padding: 10px;
  }

  .card-header {
    padding: 12px 0;
  }

  .avatar-container {
    margin-bottom: 12px;
  }

  .profile-name {
    font-size: 16px;
    margin: 12px 0 8px;
  }

  .job-title, .job-status, .job-feedback {
    font-size: 13px;
    margin: 8px 0;
  }
}
</style>