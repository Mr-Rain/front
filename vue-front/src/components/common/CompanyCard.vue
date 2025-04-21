<template>
  <el-card shadow="hover" class="company-card" @click="handleClick">
    <div class="card-content">
      <div class="logo-section">
        <el-avatar :size="60" :src="company.logo || defaultLogo" shape="square" />
      </div>
      <div class="info-section">
        <div class="name">{{ company.company_name }}</div>
        <div class="details">
          <span v-if="company.industry"><el-icon><OfficeBuilding /></el-icon>{{ company.industry }}</span>
          <span v-if="company.scale"><el-icon><User /></el-icon>{{ company.scale }}</span>
          <span v-if="company.location"><el-icon><Location /></el-icon>{{ company.location }}</span>
        </div>
        <div class="tags" v-if="companyTags && companyTags.length">
            <!-- Example: Extract tags from description or add specific tags field -->
             <el-tag v-for="tag in companyTags" :key="tag" size="small" type="info" effect="plain" class="tag-item">{{ tag }}</el-tag>
        </div>
        <!-- Optional: Display number of open positions -->
        <!-- <div class="job-count">{{ company.open_jobs_count || 0 }} 个在招职位</div> -->
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PropType } from 'vue';
import { useRouter } from 'vue-router';
import type { CompanyProfile } from '@/types/company';
import { Location, OfficeBuilding, User } from '@element-plus/icons-vue';
import { DEFAULT_COMPANY_LOGO } from '@/utils/defaultImages';

const props = defineProps({
  company: {
    type: Object as PropType<Partial<CompanyProfile>>, // Allow partial data for list views
    required: true,
  },
});

const router = useRouter();

const defaultLogo = ref(DEFAULT_COMPANY_LOGO);

// Example computed property for tags (adapt based on your data model)
const companyTags = computed(() => {
    // Placeholder: return an empty array or extract from description/other fields
    return [];
});

const handleClick = () => {
  if (!props.company.id) return;
  // Navigate to company detail page
  router.push(`/companies/${props.company.id}`); // TODO: Define company detail route
};
</script>

<style scoped>
.company-card {
  cursor: pointer;
  margin-bottom: 15px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.company-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--el-box-shadow-lighter);
}

.card-content {
  display: flex;
  align-items: flex-start; /* Align items to the top */
  gap: 15px;
  font-size: 14px;
}

.logo-section {
  flex-shrink: 0; /* Prevent logo from shrinking */
}

.info-section {
  flex-grow: 1;
  min-width: 0; /* Allow text to wrap correctly */
}

.name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
  /* Allow name to wrap */
  word-break: break-word;
}

.details {
  display: flex;
  flex-wrap: wrap;
  gap: 10px; /* Spacing between detail items */
  color: #606266;
  margin-bottom: 8px;
}

.details span {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
}

.details .el-icon {
  margin-right: 4px;
}

.tags {
  margin-bottom: 8px;
}

.tag-item {
  margin-right: 5px;
  margin-bottom: 5px;
}

.job-count {
    color: var(--el-color-primary);
    font-size: 13px;
    margin-top: 5px;
}

/* Responsive adjustments */
@media (max-width: 576px) {
    .card-content {
        flex-direction: column;
        align-items: center; /* Center items in column layout */
        text-align: center;
    }
    .info-section {
        width: 100%; /* Take full width */
    }
    .details {
        justify-content: center; /* Center details */
        gap: 8px;
    }
    .tags {
        text-align: center;
    }
}

</style>