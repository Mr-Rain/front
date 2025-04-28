<template>
  <div class="application-list-page" v-loading="applicationStore.loadingStudentList">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="card-header">
          <span>我的申请</span>
          <div class="header-actions">
            <table-export
              :data="applicationStore.studentApplications"
              :columns="exportColumns"
              :file-name="'申请列表_' + formatDate(new Date())"
              title="申请列表导出"
              :subtitle="`导出时间：${formatDateTime(new Date())}`"
              :support-types="['excel', 'pdf', 'csv']"
            />
          </div>
        </div>
      </template>

      <el-table :data="applicationStore.studentApplications" style="width: 100%" empty-text="暂无申请记录">
        <el-table-column prop="jobTitle" label="职位名称" min-width="180">
           <template #default="scope">
                <!-- Link to job detail -->
                <el-link type="primary" @click="goToJobDetail(scope.row.jobId)">
                  {{ scope.row.jobTitle || '职位信息加载中...' }}
                </el-link>
           </template>
        </el-table-column>
        <el-table-column prop="companyName" label="公司名称" min-width="150">
             <template #default="scope">
                {{ scope.row.companyName || '-' }}
             </template>
        </el-table-column>
         <el-table-column prop="resumeTitle" label="投递简历" min-width="150">
             <template #default="scope">
                {{ scope.row.resumeTitle || '-' }}
                <!-- Optionally link to preview resume -->
             </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.applyTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="申请状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" effect="light">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
             <el-button link type="primary" size="small" @click="viewApplicationDetail(scope.row.id)">查看详情</el-button>
             <el-button link type="danger" size="small" @click="handleWithdraw(scope.row.id)" :disabled="!canWithdraw(scope.row.status)">撤销申请</el-button>
          </template>
        </el-table-column>
      </el-table>

       <!-- Pagination -->
        <Pagination
            v-if="applicationStore.studentApplicationsTotal > 0"
            :total="applicationStore.studentApplicationsTotal"
            v-model:page="listQuery.page"
            v-model:limit="listQuery.pageSize"
            @pagination="fetchApplications"
            class="list-pagination"
         />

    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useApplicationStore } from '@/stores/application';
import type { ApplicationStatus } from '@/types/application'; // Assuming types/application.d.ts exists
import { ElCard, ElTable, ElTableColumn, ElTag, ElButton, ElMessageBox, ElMessage, ElLink } from 'element-plus';
import Pagination from '@/components/common/Pagination.vue'; // Import pagination component
import TableExport from '@/components/common/TableExport.vue'; // Import table export component

const router = useRouter();
const applicationStore = useApplicationStore();

// Pagination and filtering state
const listQuery = reactive({
    page: 1,
    pageSize: 10,
    // Add other filters like status if needed
});

const fetchApplications = () => {
  // Pass query params to store action
  applicationStore.fetchStudentApplications(listQuery);
};

onMounted(() => {
  console.log('Application component mounted, fetching applications...');
  fetchApplications();
});

const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return '-';
  try {
    return new Date(timeStr).toLocaleString();
  } catch (e) {
    return timeStr;
  }
};

// Helper to format status text (customize as needed)
const formatStatus = (status: ApplicationStatus | undefined): string => {
    if (!status) return '未知';
    const statusMap: Record<ApplicationStatus, string> = {
        pending: '处理中',
        viewed: '已查看',
        interview: '面试中',
        offer: '已录用',
        accepted: '已录用',
        rejected: '未录用',
        withdrawn: '已撤销'
    };
    return statusMap[status] || status;
};

// Helper to determine tag type based on status
const getStatusTagType = (status: ApplicationStatus | undefined): ('success' | 'info' | 'warning' | 'danger' | 'primary' | undefined) => {
    if (!status) return undefined;
    switch (status) {
        case 'pending': return 'info';
        case 'viewed': return 'info';
        case 'interview': return 'primary';
        case 'offer': return 'success';
        case 'rejected': return 'danger';
        case 'withdrawn': return 'info';
        default: return undefined;
    }
};

// Check if application can be withdrawn
const canWithdraw = (status: ApplicationStatus | undefined): boolean => {
    // Define which statuses allow withdrawal
    return status === 'pending' || status === 'viewed';
};

const handleWithdraw = async (id: string | number) => {
  try {
    await ElMessageBox.confirm(
      '确定要撤销这份工作申请吗？此操作不可恢复。',
      '确认撤销',
      {
        confirmButtonText: '确定撤销',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    // Call store action to withdraw
    await applicationStore.withdrawApplication(id);
    ElMessage.success('申请已撤销');
    // List should refresh automatically or call fetchApplications()

  } catch (error) {
    // If error is 'cancel' from confirmation box, do nothing
    if (error !== 'cancel') {
        // Error handled in store action, or show generic message
        console.error('Failed to withdraw application:', error);
        // ElMessage.error('撤销失败');
    }
  }
};

const goToJobDetail = (jobId: string | number | undefined) => {
    if(!jobId) return;
    router.push({ name: 'student-job-detail', params: { id: jobId } });
};

// 查看申请详情
const viewApplicationDetail = (id: string | number) => {
    console.log(`Viewing application detail for id: ${id}`);
    router.push({ name: 'student-application-detail', params: { id } });
};

// 导出相关方法

// 导出列定义
const exportColumns = computed(() => [
  { prop: 'jobTitle', label: '职位名称' },
  { prop: 'companyName', label: '公司名称' },
  { prop: 'resumeTitle', label: '投递简历' },
  {
    prop: 'applyTime',
    label: '申请时间',
    formatter: (row: any) => formatTime(row.applyTime)
  },
  {
    prop: 'status',
    label: '申请状态',
    formatter: (row: any) => formatStatus(row.status)
  }
]);

// 格式化日期（用于文件名）
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
};

// 格式化日期时间（用于导出标题，在TableExport组件中使用）
const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.list-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>