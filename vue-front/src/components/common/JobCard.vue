<template>
  <el-card shadow="hover" class="job-card" @click="handleClick">
    <div class="card-content">
      <div class="header">
        <span class="title">{{ job.title }}</span>
        <span class="salary">{{ job.salary_range }}</span>
      </div>
      <div class="details">
        <span><el-icon><Location /></el-icon>{{ job.location }}</span>
        <span><el-icon><Briefcase /></el-icon>{{ job.experience_required }}</span>
        <span><el-icon><Reading /></el-icon>{{ job.education_required }}</span>
      </div>
      <div class="tags" v-if="job.tags && job.tags.length">
        <el-tag v-for="tag in job.tags" :key="tag" size="small" effect="plain" class="tag-item">{{ tag }}</el-tag>
      </div>
      <el-divider v-if="job.company_name" />
      <div class="company-info" v-if="job.company_name">
        <el-avatar :size="30" :src="job.company_logo || defaultCompanyLogo" class="company-logo" />
        <span class="company-name">{{ job.company_name }}</span>
        <!-- Add more company details like industry/scale if needed -->
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PropType } from 'vue';
import { useRouter } from 'vue-router';
import type { JobInfo } from '@/types/job';
import { Location, Briefcase, Reading } from '@element-plus/icons-vue';

const props = defineProps({
  job: {
    type: Object as PropType<JobInfo>,
    required: true,
  },
});

const router = useRouter();

// Provide a default logo if company logo is missing
const defaultCompanyLogo = ref('https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png');

const handleClick = () => {
  // Navigate to job detail page
  router.push(`/jobs/${props.job.id}`); // TODO: Adjust route path if needed
};
</script>

<style scoped>
.job-card {
  cursor: pointer;
  margin-bottom: 15px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.job-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--el-box-shadow-lighter);
}

.card-content {
  font-size: 14px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* 改为顶部对齐，避免标题和薪资不对齐 */
  margin-bottom: 10px;
  gap: 10px; /* 添加间距，确保标题和薪资之间有足够空间 */
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  /* Allow title to wrap */
  word-break: break-word;
  flex: 1; /* 让标题占据剩余空间 */
  min-width: 0; /* 确保flex项可以正确缩小 */
}

.salary {
  color: #e6a23c; /* Salary color */
  font-weight: bold;
  white-space: nowrap; /* Prevent salary from wrapping */
  flex-shrink: 0; /* 防止薪资被压缩 */
}

.details {
  display: flex;
  flex-wrap: wrap; /* Allow details to wrap on smaller screens */
  gap: 15px; /* Spacing between detail items */
  color: #606266;
  margin-bottom: 10px;
}

.details span {
  display: inline-flex;
  align-items: center;
  white-space: nowrap; /* 防止内容换行 */
}

.details .el-icon {
  margin-right: 5px;
  flex-shrink: 0; /* 防止图标被压缩 */
}

.tags {
  margin-bottom: 10px;
}

.tag-item {
  margin-right: 5px;
  margin-bottom: 5px; /* Allow tags to wrap nicely */
}

.company-info {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.company-logo {
  margin-right: 10px;
}

.company-name {
  color: #909399;
}

/* Responsive adjustments */
@media (max-width: 576px) {
    .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
    .salary {
        font-size: 15px;
        margin-top: 2px; /* 增加与标题的间距 */
    }
    .title {
        font-size: 15px;
        width: 100%; /* 确保标题占据整行 */
    }
    .details {
        gap: 10px;
        font-size: 13px;
        margin-top: 8px; /* 增加与上方内容的间距 */
    }
    .company-info {
        margin-top: 8px; /* 调整公司信息的上边距 */
    }
}
</style>