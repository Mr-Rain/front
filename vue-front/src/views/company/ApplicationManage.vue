<template>
  <div class="application-manage-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>收到的申请</span>
          <!-- TODO: Add maybe batch actions or filters -->
        </div>
      </template>

      <!-- Filters -->
       <el-form :inline="true" :model="listQuery" @submit.prevent="handleFilter" class="filter-form">
         <el-form-item label="申请状态">
            <el-select v-model="listQuery.status" placeholder="所有状态" clearable @change="handleFilter">
                 <el-option label="待处理" value="pending"></el-option>
                 <el-option label="已查看" value="viewed"></el-option>
                 <el-option label="面试中" value="interview"></el-option>
                 <el-option label="已录用" value="offer"></el-option>
                 <el-option label="未录用" value="rejected"></el-option>
                 <el-option label="已撤销" value="withdrawn"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="申请职位" prop="jobId">
             <!-- TODO: Fetch job list for company to populate this select -->
             <el-select v-model="listQuery.jobId" placeholder="所有职位" clearable filterable @change="handleFilter">
                <!-- <el-option v-for="job in companyJobs" :key="job.id" :label="job.title" :value="job.id"></el-option> -->
             </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="listQuery.keyword" placeholder="姓名/学校/专业" clearable @clear="handleFilter"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter" :icon="Search">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="applicationStore.companyApplications" v-loading="applicationStore.loadingCompanyList" style="width: 100%">
        <el-table-column label="申请人信息" min-width="200">
            <template #default="scope">
                 <div><strong>{{ scope.row.student_info?.name || '-' }}</strong></div>
                 <div class="sub-info">{{ scope.row.student_info?.school || '-' }} / {{ scope.row.student_info?.major || '-' }}</div>
            </template>
        </el-table-column>
        <el-table-column label="申请职位" min-width="180">
             <template #default="scope">
                {{ scope.row.job_info?.title || '-' }}
             </template>
        </el-table-column>
         <el-table-column label="投递简历" width="150">
             <template #default="scope">
                <el-link type="primary" @click="previewResume(scope.row.resume_id, scope.row.student_id)">{{ scope.row.resume_snapshot?.title || '查看简历' }}</el-link>
             </template>
        </el-table-column>
        <el-table-column prop="apply_time" label="申请时间" width="180">
            <template #default="scope">{{ formatTime(scope.row.apply_time) }}</template>
        </el-table-column>
         <el-table-column prop="status" label="状态" width="120" align="center">
            <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" effect="light">{{ formatStatus(scope.row.status) }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleViewDetail(scope.row.id)">查看详情</el-button>
            <!-- TODO: Add actions like Mark as Interview, Offer, Reject based on status -->
             <el-dropdown @command="(command) => handleUpdateStatus(scope.row.id, command)">
                <el-button link type="primary" size="small">
                更新状态<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="viewed" :disabled="scope.row.status !== 'pending'">标记为已查看</el-dropdown-item>
                    <el-dropdown-item command="interview" :disabled="!canProgress(scope.row.status)">邀请面试</el-dropdown-item>
                    <el-dropdown-item command="offer" :disabled="!canProgress(scope.row.status)">发放Offer</el-dropdown-item>
                    <el-dropdown-item command="rejected" :disabled="!canProgress(scope.row.status)">标记不合适</el-dropdown-item>
                </el-dropdown-menu>
                </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template #empty>
            <el-empty description="暂无相关申请记录"></el-empty>
         </template>
      </el-table>

      <!-- Pagination -->
      <Pagination 
        v-if="applicationStore.companyApplicationsTotal > 0"
        :total="applicationStore.companyApplicationsTotal"
        v-model:page="listQuery.page"
        v-model:limit="listQuery.pageSize"
        @pagination="fetchApplications"
        class="list-pagination"
      />

    </el-card>

    <!-- Application Detail Modal/Drawer -->
    <el-drawer v-model="detailDrawerVisible" title="申请详情" direction="rtl" size="50%">
        <div v-if="applicationStore.loadingDetail">加载中...</div>
        <div v-else-if="applicationStore.currentApplicationDetail" class="detail-content">
             <h4>申请信息</h4>
             <el-descriptions :column="1" border size="small">
                 <el-descriptions-item label="申请人">{{ applicationStore.currentApplicationDetail.student_info?.name }}</el-descriptions-item>
                 <el-descriptions-item label="申请职位">{{ applicationStore.currentApplicationDetail.job_info?.title }}</el-descriptions-item>
                 <el-descriptions-item label="申请时间">{{ formatTime(applicationStore.currentApplicationDetail.apply_time) }}</el-descriptions-item>
                  <el-descriptions-item label="当前状态">
                     <el-tag :type="getStatusTagType(applicationStore.currentApplicationDetail.status)">{{ formatStatus(applicationStore.currentApplicationDetail.status) }}</el-tag>
                  </el-descriptions-item>
             </el-descriptions>

            <h4>简历信息</h4>
            <el-link type="primary" @click="previewResume(applicationStore.currentApplicationDetail.resume_id, applicationStore.currentApplicationDetail.student_id)">
                {{ applicationStore.currentApplicationDetail.resume_snapshot?.title || '点击预览简历' }}
            </el-link>
            <!-- Or Embed Resume Preview Component -->
             <!-- <ResumeViewer :resumeId="applicationStore.currentApplicationDetail.resume_id" /> -->

             <h4>沟通/反馈记录 (待实现)</h4>
             <!-- Display feedback/interview notes -->
             <!-- Add input for new feedback -->
             <el-input type="textarea" placeholder="添加备注或面试反馈..."></el-input>
             <el-button type="primary" size="small" style="margin-top: 10px;">添加记录</el-button>

             <div style="margin-top: 20px; text-align: right;">
                 <el-button @click="detailDrawerVisible = false">关闭</el-button>
                 <!-- Quick status update buttons -->
             </div>
        </div>
         <el-empty v-else description="无法加载申请详情"></el-empty>
    </el-drawer>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApplicationStore } from '@/stores/application';
import { useJobStore } from '@/stores/job'; // For fetching job list filter
import type { ApplicationInfo, ApplicationStatus, UpdateApplicationStatusPayload } from '@/types/application';
import { ElCard, ElTable, ElTableColumn, ElTag, ElButton, ElEmpty, ElMessage, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElLink, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon, ElDrawer, ElDescriptions, ElDescriptionsItem } from 'element-plus';
import { Search, ArrowDown } from '@element-plus/icons-vue';
import Pagination from '@/components/common/Pagination.vue';

const route = useRoute();
const router = useRouter();
const applicationStore = useApplicationStore();
const jobStore = useJobStore(); // Inject job store

const detailDrawerVisible = ref(false);

const listQuery = reactive({
    page: 1,
    pageSize: 10,
    status: undefined as ApplicationStatus | undefined,
    jobId: undefined as string | number | undefined,
    keyword: ''
});

// Watch for route query changes (e.g., coming from JobManage link)
watch(() => route.query.jobId,
    (newJobId) => {
        if (newJobId && typeof newJobId === 'string') {
            listQuery.jobId = newJobId;
            listQuery.page = 1; // Reset page when filter changes
            fetchApplications();
        } else if (!newJobId && listQuery.jobId) {
             // Clear filter if route query is removed
            listQuery.jobId = undefined;
            fetchApplications();
        }
    },
    { immediate: true } // Run on initial load too
);

const fetchApplications = () => {
    // TODO: Filter out jobId if it's empty before sending to API?
    const params = { ...listQuery };
    if (!params.jobId) delete params.jobId;
    applicationStore.fetchCompanyApplications(params);
};

onMounted(() => {
   // Fetch initial data - handled by watch now
   // fetchApplications(); 
   // Fetch job list for filter dropdown
   // TODO: Ensure fetchCompanyJobList exists and returns needed data
   jobStore.fetchCompanyJobList({ pageSize: 1000 }); // Fetch all jobs for filter for now
});

const handleFilter = () => {
  listQuery.page = 1;
  fetchApplications();
};

const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return '-';
  try {
    return new Date(timeStr).toLocaleString();
  } catch (e) {
    return timeStr;
  }
};

const formatStatus = (status: ApplicationStatus | undefined): string => {
    if (!status) return '未知';
    const statusMap: Record<ApplicationStatus, string> = { 
        pending: '待处理', viewed: '已查看', interview: '面试中', 
        offer: '已录用', rejected: '未录用', withdrawn: '已撤销' 
    };
    return statusMap[status] || status;
};

const getStatusTagType = (status: ApplicationStatus | undefined): ('primary' | 'success' | 'info' | 'warning' | 'danger' | undefined) => {
    switch (status) {
        case 'offer': return 'success';
        case 'interview': return 'primary';
        case 'rejected': return 'danger';
        case 'withdrawn': return 'info';
        case 'viewed': return 'warning';
        case 'pending': return 'info';
        default: return undefined;
    }
};

// Check if status can be updated (e.g., cannot reject an offered application directly)
const canProgress = (status: ApplicationStatus | undefined): boolean => {
    return status !== 'offer' && status !== 'rejected' && status !== 'withdrawn';
};

const handleViewDetail = (id: string | number) => {
    console.log(`Viewing detail for application ${id}`);
    applicationStore.clearCurrentApplicationDetail(); // Clear previous
    detailDrawerVisible.value = true;
    applicationStore.fetchCompanyApplicationDetail(id);
};

const handleUpdateStatus = async (id: string | number, status: ApplicationStatus) => {
    console.log(`Updating application ${id} to status ${status}`);
    // TODO: Maybe prompt for feedback/notes depending on status change
    const payload: UpdateApplicationStatusPayload = { status };
    // if (status === 'interview' || status === 'rejected') {
    //    // Prompt for feedback
    // }
    try {
        await applicationStore.updateApplicationStatus(id, payload);
        ElMessage.success('状态更新成功');
        // List should refresh automatically from store action
    } catch (error) {
        // Error handled in store
    }
};

const previewResume = (resumeId: string | number | undefined, studentId: string | number | undefined) => {
    if (!resumeId) {
        ElMessage.warning('无法获取简历信息');
        return;
    }
    console.log(`Previewing resume ${resumeId} for student ${studentId}`);
    // TODO: Implement resume preview logic
    // Option 1: Fetch resume URL via API call
    // Option 2: If resume data/snapshot is available in application detail, display it
    // Option 3: Open a dedicated resume viewer component/route
    ElMessage.info('简历预览功能待实现');
};

</script>

<style scoped>
.application-manage-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
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

.sub-info {
    font-size: 12px;
    color: #909399;
}

.el-dropdown .el-button {
    margin-left: 8px; /* Space between buttons */
}

.detail-content h4 {
    margin-top: 25px;
    margin-bottom: 10px;
    font-size: 1.1em;
}
.detail-content h4:first-child {
    margin-top: 0;
}

</style> 