<template>
  <div class="student-dashboard">
    <el-row :gutter="20">
      <!-- Left Column: Profile Summary & Quick Links -->
      <el-col :xs="24" :sm="8" :md="6">
        <el-card class="box-card profile-summary" shadow="never">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
              <el-button type="primary" link @click="goToProfile">编辑</el-button>
            </div>
          </template>
          <div v-if="studentStore.loading">加载中...</div>
          <div v-else-if="studentStore.profile" class="profile-content">
            <UserAvatar :image-url="studentStore.profile.avatar" :size="80" style="margin-bottom: 15px;" />
            <h4>{{ studentStore.profile.username }}</h4>
            <p>{{ studentStore.profile.school }} - {{ studentStore.profile.major }}</p>
            <p>学历: {{ studentStore.profile.education }}</p>
            <!-- Add more summary details -->
          </div>
           <div v-else>无法加载学生信息</div>
        </el-card>

        <el-card class="box-card quick-links" shadow="never">
            <template #header><span>快速导航</span></template>
            <el-menu default-active="/student/dashboard">
                <el-menu-item index="/student/jobs" @click="() => router.push('/student/jobs')">
                    <el-icon><Briefcase /></el-icon> 浏览职位
                </el-menu-item>
                <el-menu-item index="/student/resume" @click="() => router.push('/student/resume')">
                   <el-icon><Document /></el-icon> 我的简历
                </el-menu-item>
                 <el-menu-item index="/student/applications" @click="() => router.push('/student/applications')">
                   <el-icon><Memo /></el-icon> 我的申请
                </el-menu-item>
                 <el-menu-item index="/student/recommendations" @click="() => router.push('/student/recommendations')">
                   <el-icon><Opportunity /></el-icon> 推荐职位
                </el-menu-item>
            </el-menu>
        </el-card>
      </el-col>

      <!-- Right Column: Recommendations & Application Status -->
      <el-col :xs="24" :sm="16" :md="18">
        <el-card class="box-card recommended-jobs" shadow="never">
          <template #header>
            <div class="card-header">
              <span>推荐职位</span>
              <el-button type="primary" link @click="goToRecommendations">查看更多</el-button>
            </div>
          </template>
          <div v-if="recommendationStore.loading">加载中...</div>
          <div v-else-if="recommendationStore.recommendedJobs.length > 0">
            <!-- Limit the number of recommendations shown on dashboard -->
            <JobCard v-for="rec in recommendationStore.recommendedJobs.slice(0, 3)" :key="rec.job_info.id" :job="rec.job_info" />
          </div>
          <el-empty v-else description="暂无推荐职位"></el-empty>
        </el-card>

        <el-card class="box-card application-status" shadow="never">
          <template #header>
            <div class="card-header">
              <span>最新申请状态</span>
               <el-button type="primary" link @click="goToApplications">查看全部</el-button>
            </div>
          </template>
           <div v-if="applicationStore.loadingStudentList">加载中...</div>
            <div v-else-if="applicationStore.studentApplications.length > 0">
               <!-- Display latest applications -->
               <el-timeline style="padding-left: 10px; margin-top: 10px;">
                  <el-timeline-item
                    v-for="app in applicationStore.studentApplications.slice(0, 4)" 
                    :key="app.id"
                    :timestamp="formatTimestamp(app.apply_time)" 
                    placement="top"
                  >
                     <el-card shadow="hover" class="app-status-card">
                        <p>申请职位：<el-link type="primary" @click="goToJobDetail(app.job_id)">{{ app.job_info?.title || '职位信息加载中...' }}</el-link> ({{ app.job_info?.company_name }})</p>
                        <p>状态：<el-tag :type="getStatusTagType(app.status)">{{ formatStatus(app.status) }}</el-tag></p>
                        <p v-if="app.feedback">企业反馈：{{ app.feedback }}</p>
                     </el-card>
                  </el-timeline-item>
               </el-timeline>
            </div>
           <el-empty v-else description="暂无申请记录"></el-empty>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStudentStore } from '@/stores/student';
import { useRecommendationStore } from '@/stores/recommendation';
import { useApplicationStore } from '@/stores/application';
import UserAvatar from '@/components/common/UserAvatar.vue';
import JobCard from '@/components/common/JobCard.vue';
import { Briefcase, Document, Memo, Opportunity } from '@element-plus/icons-vue';
import type { ApplicationStatus } from '@/types/application';

const router = useRouter();
const studentStore = useStudentStore();
const recommendationStore = useRecommendationStore();
const applicationStore = useApplicationStore();

// Fetch data on component mount
onMounted(() => {
  studentStore.fetchProfile();
  recommendationStore.fetchRecommendations(); 
  applicationStore.fetchStudentApplications({ pageSize: 4, page: 1 }); // Fetch latest 4 applications
});

const goToProfile = () => router.push('/student/profile');
const goToRecommendations = () => router.push('/student/recommendations');
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
.student-dashboard {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-summary .profile-content {
  text-align: center;
}

.profile-summary h4 {
    margin: 10px 0 5px 0;
    font-size: 1.1em;
}

.profile-summary p {
    color: #606266;
    font-size: 0.9em;
    margin: 3px 0;
}

.quick-links .el-menu {
    border-right: none; /* Remove default menu border */
}

.quick-links .el-menu-item {
    height: 45px;
}

.quick-links .el-icon {
    margin-right: 8px;
}

.recommended-jobs .job-card {
    margin-bottom: 10px;
}

.app-status-card {
    margin-bottom: 10px; /* Add space between cards in timeline */
}

.app-status-card p {
    margin: 5px 0;
    font-size: 14px;
}

.app-status-card .el-tag {
    margin-left: 5px;
}

/* Remove default padding from el-timeline-item content if needed */
:deep(.el-timeline-item__content) {
    /* padding-bottom: 5px; */ 
}

</style> 