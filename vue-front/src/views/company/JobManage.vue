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
        <el-table-column prop="job_type" label="职位类型" width="100"></el-table-column>
        <el-table-column label="申请数" width="100" align="center">
            <template #default="scope">
                <!-- TODO: Link to application list filtered by job id -->
                <el-link type="primary" @click="goToApplicationsForJob(scope.row.id)">{{ scope.row.applications_count || 0 }}</el-link>
            </template>
        </el-table-column>
        <el-table-column prop="publish_time" label="发布时间" width="180">
             <template #default="scope">{{ formatTime(scope.row.publish_time) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
                 <el-tag :type="scope.row.status === 'open' ? 'success' : 'info'" effect="light">{{ scope.row.status === 'open' ? '招聘中' : '已关闭' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="goToEditJob(scope.row.id)">编辑</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useJobStore } from '@/stores/job'; // Assuming job store handles company jobs
import type { JobInfo, JobStatus } from '@/types/job';
import { ElCard, ElButton, ElTable, ElTableColumn, ElTag, ElPopconfirm, ElEmpty, ElMessage, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElLink } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import Pagination from '@/components/common/Pagination.vue';
import TableExport from '@/components/common/TableExport.vue'; // Import table export component

const router = useRouter();
const jobStore = useJobStore();

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

onMounted(() => {
    fetchJobs();
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

// 导出相关方法

// 导出列定义
const exportColumns = computed(() => [
  { prop: 'title', label: '职位名称' },
  { prop: 'location', label: '工作地点' },
  { prop: 'job_type', label: '职位类型' },
  { prop: 'applications_count', label: '申请数' },
  {
    prop: 'publish_time',
    label: '发布时间',
    formatter: (row: any) => formatTime(row.publish_time)
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

.filter-form {
    margin-bottom: 15px;
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

</style>