<template>
  <div class="job-detail-page" v-loading="jobStore.loadingDetail">
    <div class="page-header">
      <el-button @click="goBack" type="primary" plain class="back-button">
        <el-icon class="back-icon"><ArrowLeft /></el-icon>
        <span class="back-text">返回</span>
      </el-button>
      <h2 class="page-title">职位详情</h2>
    </div>
    <el-breadcrumb :separator-icon="ArrowRight" class="breadcrumb-nav">
      <el-breadcrumb-item :to="{ path: '/jobs' }">职位列表</el-breadcrumb-item>
      <el-breadcrumb-item>{{ jobStore.currentJob?.title || '职位详情' }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card v-if="jobStore.currentJob" shadow="never" class="job-detail-card">
      <template #header>
        <div class="card-header">
          <h1 class="job-title">{{ jobStore.currentJob.title }}</h1>
          <span class="salary">{{ jobStore.currentJob.salary_range }}</span>
        </div>
        <div class="job-meta">
          <span class="company-name">{{ jobStore.currentJob.company_name || '未知公司' }}</span>
          <span class="location"><el-icon><Location /></el-icon> {{ jobStore.currentJob.location }}</span>
          <span class="job-type"><el-icon><Briefcase /></el-icon> {{ jobStore.currentJob.job_type }}</span>
          <span class="experience"><el-icon><DataAnalysis /></el-icon> {{ jobStore.currentJob.experience_required || '经验不限' }}</span>
          <span class="education"><el-icon><Reading /></el-icon> {{ jobStore.currentJob.education_required || '学历不限' }}</span>
        </div>
      </template>

      <div class="job-content">
        <section class="section">
          <h2>职位描述</h2>
          <div class="description" v-html="jobDescriptionHtml"></div>
        </section>

        <section class="section">
          <h2>职位要求</h2>
          <div class="requirements" v-html="jobRequirementsHtml"></div>
        </section>

        <section v-if="jobStore.currentJob.company_name" class="section company-info">
           <h2>公司信息</h2>
           <p><strong>{{ jobStore.currentJob.company_name }}</strong></p>
           <el-image v-if="jobStore.currentJob.company_logo" :src="jobStore.currentJob.company_logo" fit="contain" style="width: 100px; height: 50px; margin-top: 10px;">
             <template #error>
               <div class="image-slot"></div>
             </template>
           </el-image>
        </section>
      </div>

       <template #footer>
           <el-button type="primary" size="large" @click="handleApply" :icon="Pointer">立即申请</el-button>
       </template>

    </el-card>

    <el-empty v-else-if="!jobStore.loadingDetail" description="未找到该职位信息"></el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useJobStore } from '@/stores/job';
import { useApplicationStore } from '@/stores/application';
import { useResumeStore } from '@/stores/resume';
import { useUserStore } from '@/stores/user';
import { ElCard, ElButton, ElEmpty, ElIcon, ElBreadcrumb, ElBreadcrumbItem, ElImage } from 'element-plus';
import { Location, Briefcase, DataAnalysis, Reading, ArrowRight, Pointer, ArrowLeft } from '@element-plus/icons-vue';
import { marked } from 'marked'; // Assuming marked is installed for markdown
import DOMPurify from 'dompurify'; // Assuming DOMPurify is installed for security
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter(); // Use router for navigation if needed
const jobStore = useJobStore();
const applicationStore = useApplicationStore();
const resumeStore = useResumeStore();
const userStore = useUserStore();

const jobId = ref<string | null>(null);

// 返回上一页
const goBack = () => {
  router.go(-1); // 返回上一页
  // 如果没有上一页，则返回职位列表
  setTimeout(() => {
    if (router.currentRoute.value.fullPath.startsWith('/jobs/')) {
      router.push('/jobs');
    }
  }, 100);
};

// Sanitize markdown content
const sanitizeHtml = (content: string | undefined | null): string => {
    if (!content) return '';
    // 使用marked.parse的同步模式
    const rawHtml = marked.parse(content, { async: false }) as string;
    return DOMPurify.sanitize(rawHtml);
};

const jobDescriptionHtml = computed(() => sanitizeHtml(jobStore.currentJob?.description));
const jobRequirementsHtml = computed(() => sanitizeHtml(jobStore.currentJob?.requirements));

const fetchJobData = async (id: string) => {
    try {
        await jobStore.fetchJobDetail(id);
    } catch (error) {
        console.error("Failed to fetch job details:", error);
        // Optional: Redirect to not found or show error message
    }
};

const handleApply = async () => {
  if (!jobStore.currentJob?.id) {
    ElMessage.error('无法获取职位信息');
    return;
  }

  // 检查用户是否已登录
  if (!userStore.token || !userStore.userInfo) {
    ElMessage.warning('请先登录后再申请职位');
    // 保存当前页面路径，登录后可以返回
    router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
    return;
  }

  // 检查用户是否是学生角色
  if (userStore.userInfo.user_type !== 'student') {
    ElMessage.warning('只有学生用户才能申请职位');
    return;
  }

  // Fetch resumes if not already loaded
  if (!resumeStore.resumeList.length) {
      await resumeStore.fetchResumeList();
  }

  // Find the default resume
  const defaultResume = resumeStore.resumeList.find(r => r.is_default);
  const resumeIdToUse = defaultResume?.id;

  if (!resumeIdToUse) {
      // TODO: Handle case where no default resume exists - maybe prompt user to select?
      ElMessage.warning('您尚未设置默认简历，请先前往"我的简历"设置。若无简历，请先创建。');
      router.push({ name: 'student-resume' });
      return;
  }

  console.log(`Applying for job ${jobStore.currentJob.id} with resume ${resumeIdToUse}`);

  try {
      // Call the store action to apply
      await applicationStore.applyForJob({
          job_id: jobStore.currentJob.id,
          resume_id: resumeIdToUse
      });
      // Success message is handled within the store action
      // Optionally, disable button or show 'Applied' state after success
      // Maybe navigate to application list?
      // router.push({ name: 'student-applications' });
  } catch (error) {
      // Error message is handled within the store action
      console.error('Application submission failed from component:', error);
  }
};

onMounted(() => {
    jobStore.clearCurrentJob(); // Clear previous details
    const idFromRoute = route.params.id;
    if (typeof idFromRoute === 'string') {
        jobId.value = idFromRoute;
        fetchJobData(jobId.value);
    } else if (Array.isArray(idFromRoute) && typeof idFromRoute[0] === 'string') {
        // Handle array case if router config allows it, take the first one
        jobId.value = idFromRoute[0];
        fetchJobData(jobId.value);
    } else {
        console.error("Invalid job ID in route");
        // Optional: Redirect or show error
        router.push('/student/jobs');
    }
});

// Watch for route changes if the component is reused for different jobs
watch(() => route.params.id, (newId) => {
    jobStore.clearCurrentJob();
    if (typeof newId === 'string') {
         jobId.value = newId;
         fetchJobData(newId);
    } else if (Array.isArray(newId) && typeof newId[0] === 'string') {
        jobId.value = newId[0];
        fetchJobData(newId[0]);
    }
});

</script>

<style scoped>
.job-detail-page {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  height: 32px;
  box-sizing: border-box;
}

.back-icon {
  margin-right: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  height: 14px;
}

.back-text {
  font-size: 14px;
  line-height: 14px;
  height: 14px;
  display: inline-block;
  vertical-align: middle;
}

.page-title {
  margin: 0 0 0 15px;
  font-size: 1.5rem;
  font-weight: 500;
  color: #303133;
}

.breadcrumb-nav {
  margin-bottom: 20px;
}

.job-detail-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.job-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.salary {
  color: #e6a23c;
  font-weight: bold;
  font-size: 1.2rem;
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  color: #606266;
  margin-bottom: 10px;
}

.job-meta span {
  display: inline-flex;
  align-items: center;
}

.job-meta .el-icon {
  margin-right: 5px;
}

.company-name {
  font-weight: 500;
}

.section {
  margin-bottom: 30px;
}

.section h2 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 15px;
  color: #303133;
  border-left: 3px solid var(--el-color-primary);
  padding-left: 10px;
}

.description, .requirements {
  line-height: 1.6;
  color: #606266;
}

/* 移动端适配 */
@media (max-width: 576px) {
  .job-detail-page {
    padding: 10px;
  }

  .card-header {
    flex-direction: column;
  }

  .salary {
    margin-top: 5px;
  }

  .job-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style>