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
  align-items: center;
  margin-bottom: 10px;
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  /* Allow title to wrap */
  word-break: break-word;
  margin-right: 10px; /* Space between title and salary */
}

.salary {
  color: #e6a23c; /* Salary color */
  font-weight: bold;
  white-space: nowrap; /* Prevent salary from wrapping */
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
}

.details .el-icon {
  margin-right: 5px;
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
    }
    .title {
        font-size: 15px;
    }
    .details {
        gap: 10px;
        font-size: 13px;
    }
}
</style> 