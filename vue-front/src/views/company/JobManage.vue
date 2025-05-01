<template>
  <div class="job-manage-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>职位管理</span>
          <div class="header-actions">
            <table-export
              :data="jobStore.companyJobList"
              :columns="exportColumns"
              :file-name="'职位列表_' + formatDate(new Date())"
              title="职位列表导出"
              subtitle="导出时间：{{ formatDateTime(new Date()) }}"
              :support-types="['excel', 'pdf', 'csv']"
            />
            <el-button type="primary" :icon="Plus" @click="goToCreateJob">发布新职位</el-button>
          </div>
        </div>
      </template>

      <!-- 统计数据展示 -->
      <job-statistics
        :total-jobs="jobStatistics.totalJobs"
        :active-jobs="jobStatistics.activeJobs"
        :total-applications="jobStatistics.totalApplications"
        :pending-applications="jobStatistics.pendingApplications"
        :trends="jobStatistics.trends"
        class="job-statistics-section"
      />

      <!-- Filters -->
      <div class="filter-card">
        <el-form :inline="true" :model="listQuery" @submit.prevent="handleFilter" class="filter-form">
          <div class="search-form-container">
            <div class="search-inputs-group">
              <el-form-item label="职位状态" class="search-form-item">
                <el-select
                  v-model="listQuery.status"
                  placeholder="所有状态"
                  clearable
                  @change="handleFilter"
                  class="search-select"
                >
                  <el-option label="招聘中" value="open"></el-option>
                  <el-option label="已关闭" value="closed"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="关键词" class="search-form-item">
                <el-input
                  v-model="listQuery.keyword"
                  placeholder="职位名称"
                  clearable
                  @clear="handleFilter"
                />
              </el-form-item>
            </div>
            <div class="search-button-group">
              <el-form-item class="search-button-item">
                <el-button type="primary" @click="handleFilter" :icon="Search" class="search-button">搜索</el-button>
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <el-table :data="jobStore.companyJobList" v-loading="jobStore.loadingCompanyList" style="width: 100%">
        <el-table-column prop="title" label="职位名称" min-width="200">
            <template #default="scope">
                <el-link type="primary" @click="goToEditJob(scope.row.id)">{{ scope.row.title }}</el-link>
            </template>
        </el-table-column>
        <el-table-column prop="location" label="工作地点" width="150"></el-table-column>
        <el-table-column prop="jobType" label="职位类型" width="100"></el-table-column>
        <el-table-column label="申请数" width="100" align="center">
            <template #default="scope">
                <!-- TODO: Link to application list filtered by job id -->
                <el-link type="primary" @click="goToApplicationsForJob(scope.row.id)">{{ scope.row.applicationsCount || 0 }}</el-link>
            </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="180">
             <template #default="scope">{{ formatTime(scope.row.publishTime) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
                 <el-tag :type="scope.row.status === 'open' ? 'success' : 'info'" effect="light">{{ scope.row.status === 'open' ? '招聘中' : '已关闭' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="250" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="goToEditJob(scope.row.id)">编辑</el-button>
            <el-button link type="info" size="small" @click="handleCopyJob(scope.row)" :icon="CopyDocument">复制</el-button>
            <el-button v-if="scope.row.status === 'open'" link type="warning" size="small" @click="handleCloseJob(scope.row.id)">关闭</el-button>
            <el-button v-else link type="success" size="small" @click="handleOpenJob(scope.row.id)">开启</el-button>
             <el-popconfirm title="确定删除这个职位吗? (不可恢复)" @confirm="handleDeleteJob(scope.row.id)">
                 <template #reference>
                     <el-button link type="danger" size="small">删除</el-button>
                 </template>
            </el-popconfirm>
          </template>
        </el-table-column>
         <template #empty>
            <el-empty description="暂未发布任何职位"></el-empty>
         </template>
      </el-table>

       <!-- Pagination -->
        <Pagination
            v-if="jobStore.companyJobTotal > 0"
            :total="jobStore.companyJobTotal"
            v-model:page="listQuery.page"
            v-model:limit="listQuery.pageSize"
            @pagination="fetchJobs"
            class="list-pagination"
         />

    </el-card>

    <!-- 职位复制对话框 -->
    <job-copy-dialog
      ref="copyDialogRef"
      v-model:visible="copyDialogVisible"
      :job="selectedJob"
      @copy-confirmed="handleCopyConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useJobStore } from '@/stores/job'; // Assuming job store handles company jobs
import { useApplicationStore } from '@/stores/application'; // For application statistics
import type { JobInfo, JobStatus } from '@/types/job';
import { ElCard, ElButton, ElTable, ElTableColumn, ElTag, ElPopconfirm, ElEmpty, ElMessage, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElLink } from 'element-plus';
import { Plus, Search, CopyDocument } from '@element-plus/icons-vue';
import Pagination from '@/components/common/Pagination.vue';
import TableExport from '@/components/common/TableExport.vue'; // Import table export component
import JobStatistics from '@/components/company/JobStatistics.vue'; // Import job statistics component
import JobCopyDialog from '@/components/company/JobCopyDialog.vue'; // Import job copy dialog

const router = useRouter();
const jobStore = useJobStore();
const applicationStore = useApplicationStore();

// 复制对话框引用
const copyDialogRef = ref<InstanceType<typeof JobCopyDialog>>();
const copyDialogVisible = ref(false);
const selectedJob = ref<JobInfo | null>(null);

const listQuery = reactive({
    page: 1,
    pageSize: 10,
    status: undefined as JobStatus | undefined,
    keyword: ''
});

const fetchJobs = () => {
    // Assuming fetchCompanyJobList exists and accepts query parameters
    jobStore.fetchCompanyJobList(listQuery);
};

// 统计数据
const jobStatistics = computed(() => {
  const totalJobs = jobStore.companyJobTotal;
  const activeJobs = jobStore.companyJobList.filter(job => job.status === 'open').length;
  const totalApplications = applicationStore.totalApplications;
  const pendingApplications = applicationStore.pendingApplications;

  return {
    totalJobs,
    activeJobs,
    totalApplications,
    pendingApplications,
    // 趋势数据 - 实际项目中可以从后端获取
    trends: {
      totalJobs: 0,
      activeJobs: 0,
      totalApplications: 0,
      pendingApplications: 0
    }
  };
});

onMounted(() => {
    fetchJobs();
    // 获取申请统计数据
    applicationStore.fetchApplicationStatistics();
});

const handleFilter = () => {
  listQuery.page = 1;
  fetchJobs();
};

const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return '-';
  try {
    return new Date(timeStr).toLocaleString();
  } catch (e) {
    return timeStr;
  }
};

const goToCreateJob = () => {
    // Assuming route name is company-job-edit with no ID for create
    router.push({ name: 'company-job-edit' });
};

const goToEditJob = (id: string | number) => {
     router.push({ name: 'company-job-edit', params: { id } });
};

const goToApplicationsForJob = (jobId: string | number) => {
    // Navigate to application manage page with filter
    router.push({ name: 'company-application-manage', query: { jobId: jobId } });
};

const handleCloseJob = async (id: string | number) => {
    console.log(`Closing job ${id}`);
    // TODO: Call store action to update job status to 'closed'
    try {
        await jobStore.updateJobStatus(id, 'closed');
        ElMessage.success('职位已关闭');
        // fetchJobs(); // Refresh handled by store?
    } catch(e) { ElMessage.error('操作失败'); }
};

const handleOpenJob = async (id: string | number) => {
     console.log(`Opening job ${id}`);
    // TODO: Call store action to update job status to 'open'
     try {
        await jobStore.updateJobStatus(id, 'open');
        ElMessage.success('职位已开启招聘');
        // fetchJobs(); // Refresh handled by store?
    } catch(e) { ElMessage.error('操作失败'); }
};

const handleDeleteJob = async (id: string | number) => {
    console.log(`Deleting job ${id}`);
    // TODO: Call store action to delete job
     try {
        await jobStore.deleteJob(id);
        ElMessage.success('职位已删除');
        // fetchJobs(); // Refresh handled by store?
    } catch(e) { ElMessage.error('删除失败'); }
};

// 复制职位相关方法
const handleCopyJob = (job: JobInfo) => {
    selectedJob.value = job;
    copyDialogVisible.value = true;
    // 初始化表单
    setTimeout(() => {
        copyDialogRef.value?.initForm();
    }, 100);
};

const handleCopyConfirmed = async (newJobData: Partial<JobInfo>) => {
    try {
        // 创建新职位
        await jobStore.createJob(newJobData);
        // 刷新列表
        fetchJobs();
    } catch (error) {
        console.error('Failed to create copied job:', error);
        ElMessage.error('复制职位失败');
    }
};

// 导出相关方法

// 导出列定义
const exportColumns = computed(() => [
  { prop: 'title', label: '职位名称' },
  { prop: 'location', label: '工作地点' },
  { prop: 'jobType', label: '职位类型' },
  { prop: 'applicationsCount', label: '申请数' },
  {
    prop: 'publishTime',
    label: '发布时间',
    formatter: (row: any) => formatTime(row.publishTime)
  },
  {
    prop: 'status',
    label: '状态',
    formatter: (row: any) => row.status === 'open' ? '招聘中' : '已关闭'
  }
]);

// 格式化日期（用于文件名）
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
};

// 格式化日期时间（用于显示）
const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

</script>

<style scoped>
.job-manage-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.job-statistics-section {
  margin: 10px 0 25px;
}

.filter-form {
  margin-bottom: 15px;
}

.filter-card {
  background-color: var(--el-fill-color-light);
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.search-form-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 10px;
}

.search-inputs-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  flex: 1;
}

.search-button-group {
  display: flex;
  gap: 10px;
}

.list-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* Adjust link color/style within table */
.el-table .el-link {
  font-size: inherit;
}

@media (max-width: 768px) {
  .search-form-container {
    flex-direction: column;
  }

  .search-inputs-group {
    width: 100%;
  }

  .search-button-group {
    width: 100%;
    justify-content: flex-end;
  }

  .search-form-item {
    margin-bottom: 10px;
  }
}
</style>