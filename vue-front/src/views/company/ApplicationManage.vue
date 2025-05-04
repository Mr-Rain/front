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
      <div class="filter-card">
        <el-form :inline="true" :model="listQuery" @submit.prevent="handleFilter" class="filter-form">
          <div class="search-form-container">
            <div class="search-inputs-group">
              <el-form-item label="申请状态" class="search-form-item">
                <el-select
                  v-model="listQuery.status"
                  placeholder="所有状态"
                  clearable
                  @change="handleFilter"
                  class="search-select"
                >
                  <el-option label="待处理" value="pending"></el-option>
                  <el-option label="已查看" value="viewed"></el-option>
                  <el-option label="面试中" value="interview"></el-option>
                  <el-option label="已录用" value="offer"></el-option>
                  <el-option label="未录用" value="rejected"></el-option>
                  <el-option label="已撤销" value="withdrawn"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="申请职位" prop="jobId" class="search-form-item">
                <el-select
                  v-model="listQuery.jobId"
                  placeholder="所有职位"
                  clearable
                  filterable
                  @change="handleFilter"
                  :filter-method="handleJobFilter"
                  class="search-select"
                >
                  <!-- 如果有选中的职位名称，则显示该名称 -->
                  <el-option
                    v-if="selectedJobTitle && listQuery.jobId"
                    :key="listQuery.jobId"
                    :label="selectedJobTitle"
                    :value="listQuery.jobId"
                  ></el-option>
                  <!-- 显示所有职位 -->
                  <el-option
                    v-for="job in jobStore.companyJobList"
                    :key="job.id"
                    :label="job.title"
                    :value="job.id"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="关键词" class="search-form-item">
                <el-input
                  v-model="listQuery.keyword"
                  placeholder="姓名/学校/专业/职位"
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

      <!-- 批量操作栏 -->
      <batch-action-bar
        :selected-items="multipleSelection"
        @batch-action="handleBatchAction"
        @clear-selection="handleClearSelection"
      />

      <el-table
        :data="applicationStore.companyApplications"
        v-loading="applicationStore.loadingCompanyList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column label="申请人信息" min-width="200">
            <template #default="scope">
                 <div><strong>{{ scope.row.studentName || scope.row.studentInfo?.realName || '-' }}</strong></div>
                 <div class="sub-info">{{ scope.row.studentSchool || scope.row.studentInfo?.school || '-' }} / {{ scope.row.studentMajor || scope.row.studentInfo?.major || '-' }}</div>
            </template>
        </el-table-column>
        <el-table-column label="申请职位" min-width="180">
             <template #default="scope">
                {{ scope.row.jobTitle || scope.row.jobInfo?.title || '-' }}
             </template>
        </el-table-column>
         <el-table-column label="投递简历" width="150">
             <template #default="scope">
                <el-link type="primary" @click="previewResume(scope.row.resumeId, scope.row.studentId)">{{ scope.row.resumeTitle || scope.row.resumeSnapshot?.title || '查看简历' }}</el-link>
             </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="180">
            <template #default="scope">{{ formatTime(scope.row.applyTime) }}</template>
        </el-table-column>
         <el-table-column prop="status" label="状态" width="120" align="center">
            <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" effect="light">{{ formatStatus(scope.row.status) }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="250" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleViewDetail(scope.row.id)">
              <el-icon><View /></el-icon> 详情
            </el-button>

            <el-dropdown trigger="click">
              <el-button link type="primary" size="small">
                <el-icon><Calendar /></el-icon> 面试
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleScheduleInterview(scope.row)" :disabled="!canScheduleInterview(scope.row.status)">
                    安排面试
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleAddFeedback(scope.row, 'interview')" :disabled="scope.row.status !== 'interview'">
                    添加面试反馈
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-dropdown @command="(command) => handleUpdateStatus(scope.row.id, command)">
              <el-button link type="primary" size="small">
                <el-icon><ChatLineRound /></el-icon> 状态
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="viewed" :disabled="scope.row.status !== 'pending'">标记为已查看</el-dropdown-item>
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
                 <el-descriptions-item label="申请人">{{ applicationStore.currentApplicationDetail.studentName || applicationStore.currentApplicationDetail.studentInfo?.realName || '-' }}</el-descriptions-item>
                 <el-descriptions-item label="学校/专业">{{ (applicationStore.currentApplicationDetail.studentSchool || applicationStore.currentApplicationDetail.studentInfo?.school || '-') + ' / ' + (applicationStore.currentApplicationDetail.studentMajor || applicationStore.currentApplicationDetail.studentInfo?.major || '-') }}</el-descriptions-item>
                 <el-descriptions-item label="申请职位">{{ applicationStore.currentApplicationDetail.jobTitle || applicationStore.currentApplicationDetail.jobInfo?.title || '-' }}</el-descriptions-item>
                 <el-descriptions-item label="申请时间">{{ formatTime(applicationStore.currentApplicationDetail.applyTime) }}</el-descriptions-item>
                  <el-descriptions-item label="当前状态">
                     <el-tag :type="getStatusTagType(applicationStore.currentApplicationDetail.status)">{{ formatStatus(applicationStore.currentApplicationDetail.status) }}</el-tag>
                  </el-descriptions-item>
             </el-descriptions>

            <h4>简历信息</h4>
            <el-link type="primary" @click="previewResume(applicationStore.currentApplicationDetail.resumeId, applicationStore.currentApplicationDetail.studentId)">
                {{ applicationStore.currentApplicationDetail.resumeTitle || applicationStore.currentApplicationDetail.resumeSnapshot?.title || '点击预览简历' }}
            </el-link>
            <!-- Or Embed Resume Preview Component -->
             <!-- <ResumeViewer :resumeId="applicationStore.currentApplicationDetail.resume_id" /> -->

             <h4>面试信息</h4>
             <div v-if="applicationStore.currentApplicationDetail.status === 'interview' || applicationStore.currentApplicationDetail.interviewTime">
               <el-descriptions :column="1" border size="small">
                 <el-descriptions-item label="面试时间">
                   {{ formatTime(applicationStore.currentApplicationDetail.interviewTime) || '未设置' }}
                 </el-descriptions-item>
                 <el-descriptions-item label="面试方式">
                   {{ formatInterviewType(applicationStore.currentApplicationDetail.interviewType) || '未设置' }}
                 </el-descriptions-item>
                 <el-descriptions-item v-if="applicationStore.currentApplicationDetail.interviewType === 'onsite'" label="面试地点">
                   {{ applicationStore.currentApplicationDetail.interviewLocation || '未设置' }}
                 </el-descriptions-item>
                 <el-descriptions-item label="面试联系人">
                   {{ applicationStore.currentApplicationDetail.interviewContact || '未设置' }}
                 </el-descriptions-item>
                 <el-descriptions-item label="联系方式">
                   {{ applicationStore.currentApplicationDetail.interviewContactInfo || '未设置' }}
                 </el-descriptions-item>
               </el-descriptions>
               <div class="action-buttons" style="margin-top: 10px;">
                 <el-button
                   type="primary"
                   size="small"
                   @click="handleScheduleInterview(applicationStore.currentApplicationDetail)"
                   :disabled="!canScheduleInterview(applicationStore.currentApplicationDetail?.status)"
                 >
                   {{ applicationStore.currentApplicationDetail.interviewTime ? '修改面试安排' : '安排面试' }}
                 </el-button>
                 <el-button v-if="applicationStore.currentApplicationDetail.status === 'interview'" type="success" size="small" @click="handleAddFeedback(applicationStore.currentApplicationDetail, 'interview')">
                   添加面试反馈
                 </el-button>
               </div>
             </div>
             <el-empty v-else description="暂无面试信息" :image-size="100"></el-empty>

             <h4>反馈记录</h4>
             <div v-if="applicationStore.currentApplicationDetail.feedback" class="feedback-content">
               <div v-if="applicationStore.currentApplicationDetail.rating" class="feedback-rating">
                 <span class="rating-label">评分：</span>
                 <el-rate
                   v-model="applicationStore.currentApplicationDetail.rating"
                   disabled
                   :colors="['#F56C6C', '#E6A23C', '#67C23A']"
                   :texts="['不合适', '一般', '合格', '良好', '优秀']"
                   show-text
                 />
               </div>
               <div class="feedback-text">
                 {{ applicationStore.currentApplicationDetail.feedback }}
               </div>
               <div class="feedback-time">
                 更新时间：{{ formatTime(applicationStore.currentApplicationDetail.updateTime) }}
               </div>
             </div>
             <el-empty v-else description="暂无反馈记录" :image-size="100"></el-empty>

             <div class="action-buttons" style="margin-top: 15px;">
               <el-button type="primary" size="small" @click="handleAddFeedback(applicationStore.currentApplicationDetail, 'general')">
                 添加反馈
               </el-button>
             </div>

             <div style="margin-top: 20px; text-align: right;">
                 <el-button @click="detailDrawerVisible = false">关闭</el-button>
                 <!-- Quick status update buttons -->
             </div>
        </div>
         <el-empty v-else description="无法加载申请详情"></el-empty>
    </el-drawer>

    <!-- 面试安排对话框 -->
    <interview-scheduler
      ref="interviewSchedulerRef"
      v-model:visible="interviewDialogVisible"
      :application="selectedApplication"
      @submit="handleInterviewSubmit"
    />

    <!-- 批量面试安排对话框 -->
    <batch-interview-dialog
      ref="batchInterviewDialogRef"
      v-model:visible="batchInterviewDialogVisible"
      :applications="multipleSelection"
      @submit="handleBatchInterviewSubmit"
    />

    <!-- 反馈表单对话框 -->
    <el-dialog v-model="feedbackDialogVisible" :title="getFeedbackTitle" width="500px">
      <feedback-form
        :type="feedbackType"
        :initial-content="selectedApplication?.feedback || ''"
        :loading="applicationStore.submitting"
        @submit="handleFeedbackSubmit"
        @cancel="feedbackDialogVisible = false"
      />
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useApplicationStore } from '@/stores/application';
import { useJobStore } from '@/stores/job'; // For fetching job list filter
import type { ApplicationInfo, ApplicationStatus, UpdateApplicationStatusPayload } from '@/types/application';
import { ElCard, ElTable, ElTableColumn, ElTag, ElButton, ElEmpty, ElMessage, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElLink, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon, ElDrawer, ElDescriptions, ElDescriptionsItem, ElMessageBox } from 'element-plus';
import { Search, Calendar, ChatLineRound, View } from '@element-plus/icons-vue';
import Pagination from '@/components/common/Pagination.vue';
import BatchActionBar from '@/components/company/BatchActionBar.vue';
import InterviewScheduler from '@/components/company/InterviewScheduler.vue';
import BatchInterviewDialog from '@/components/company/BatchInterviewDialog.vue';
import FeedbackForm from '@/components/company/FeedbackForm.vue';

const route = useRoute();
const applicationStore = useApplicationStore();
const jobStore = useJobStore(); // Inject job store

const detailDrawerVisible = ref(false);
const interviewDialogVisible = ref(false);
const batchInterviewDialogVisible = ref(false);
const feedbackDialogVisible = ref(false);
const selectedApplication = ref<ApplicationInfo | null>(null);
const multipleSelection = ref<ApplicationInfo[]>([]);
const interviewSchedulerRef = ref<InstanceType<typeof InterviewScheduler>>();
const batchInterviewDialogRef = ref<InstanceType<typeof BatchInterviewDialog>>();
const feedbackType = ref<'interview' | 'rejection' | 'offer' | 'general'>('general');

const listQuery = reactive({
    page: 1,
    pageSize: 10,
    status: undefined as ApplicationStatus | undefined,
    jobId: undefined as string | number | undefined,
    keyword: ''
});

// 反馈对话框标题
const getFeedbackTitle = computed(() => {
  switch (feedbackType.value) {
    case 'interview':
      return '面试反馈';
    case 'rejection':
      return '拒绝原因';
    case 'offer':
      return '录用信息';
    default:
      return '添加反馈';
  }
});

// 定义获取申请列表的函数
const fetchApplications = () => {
    // 构建查询参数
    const params = { ...listQuery };

    // 移除空值参数
    if (!params.jobId) delete params.jobId;
    if (!params.status) delete params.status;
    if (!params.keyword || params.keyword.trim() === '') delete params.keyword;

    // 如果用户在职位筛选框中输入了文本，但没有选择具体职位
    // 确保这个文本被作为关键词传递给后端
    const jobFilterInput = document.querySelector('.search-select input') as HTMLInputElement;
    if (jobFilterInput && jobFilterInput.value && jobFilterInput.value.trim() !== '' && !params.jobId && !params.keyword) {
        params.keyword = jobFilterInput.value.trim();
    }

    console.log('Fetching applications with params:', params);
    applicationStore.fetchCompanyApplications(params);
};

// 创建一个ref来存储选中的职位名称
const selectedJobTitle = ref<string | null>(null);

// Watch for route query changes (e.g., coming from JobManage link)
watch(() => route.query.jobId,
    async (newJobId) => {
        if (newJobId && typeof newJobId === 'string') {
            // 确保职位列表已加载
            if (jobStore.companyJobList.length === 0) {
                await jobStore.fetchCompanyJobList({ pageSize: 1000 });
            }

            // 从localStorage中获取职位名称
            const storedJobId = localStorage.getItem('selectedJobId');
            const storedJobTitle = localStorage.getItem('selectedJobTitle');

            // 如果localStorage中的jobId与当前jobId匹配，则使用localStorage中的职位名称
            if (storedJobId === newJobId && storedJobTitle) {
                selectedJobTitle.value = storedJobTitle;
            } else {
                // 否则，尝试从职位列表中查找职位名称
                const job = jobStore.companyJobList.find(job => String(job.id) === newJobId);
                selectedJobTitle.value = job?.title || `职位ID: ${newJobId}`;
            }

            listQuery.jobId = newJobId;
            listQuery.page = 1; // Reset page when filter changes
            fetchApplications();
        } else if (!newJobId && listQuery.jobId) {
             // Clear filter if route query is removed
            listQuery.jobId = undefined;
            selectedJobTitle.value = null;
            fetchApplications();
        }
    },
    { immediate: true } // Run on initial load too
);

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

// 处理职位下拉框的筛选方法
const handleJobFilter = (value: string) => {
  // 将用户输入的筛选文本保存到关键词中
  if (value && value.trim() !== '') {
    listQuery.keyword = value.trim();
  }

  // 返回true表示所有选项都显示，因为我们只是想捕获用户输入
  return true;
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
        offer: '已录用', accepted: '已录用', rejected: '未录用', withdrawn: '已撤销'
    };
    return statusMap[status] || status;
};

const getStatusTagType = (status: ApplicationStatus | undefined): ('primary' | 'success' | 'info' | 'warning' | 'danger' | undefined) => {
    switch (status) {
        case 'offer': return 'success';
        case 'accepted': return 'success'; // 添加'accepted'状态
        case 'interview': return 'primary';
        case 'rejected': return 'danger';
        case 'withdrawn': return 'info';
        case 'viewed': return 'warning';
        case 'pending': return 'info';
        default: return undefined;
    }
};

const formatInterviewType = (type: 'onsite' | 'video' | 'phone' | undefined): string => {
    if (!type) return '';
    const typeMap: Record<string, string> = {
        'onsite': '现场面试',
        'video': '视频面试',
        'phone': '电话面试'
    };
    return typeMap[type] || type;
};

// Check if status can be updated (e.g., cannot reject an offered application directly)
const canProgress = (status: ApplicationStatus | undefined): boolean => {
    return status !== 'offer' && status !== 'accepted' && status !== 'rejected' && status !== 'withdrawn';
};

// 检查是否可以安排面试（已确定状态不允许修改面试信息）
const canScheduleInterview = (status: ApplicationStatus | undefined): boolean => {
    return status === 'pending' || status === 'viewed' || status === 'interview';
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

// 多选相关方法
const handleSelectionChange = (selection: ApplicationInfo[]) => {
    multipleSelection.value = selection;
};

const handleClearSelection = () => {
    // 清除表格选择
    const table = document.querySelector('.el-table__header-wrapper th.el-table-column--selection .el-checkbox');
    if (table) {
        (table as HTMLElement).click();
    }
};

// 批量操作方法
const handleBatchAction = async (data: { action: ApplicationStatus; items: ApplicationInfo[] }) => {
    const { action, items } = data;

    if (items.length === 0) {
        ElMessage.warning('请选择要操作的申请');
        return;
    }

    if (action === 'interview') {
        // 过滤掉已确定状态的申请
        const validItems = items.filter(item => canScheduleInterview(item.status));

        if (validItems.length === 0) {
            ElMessage.warning('选中的申请中没有可以安排面试的申请（已录用或未录用状态的申请不能安排面试）');
            return;
        }

        if (validItems.length < items.length) {
            ElMessage.warning(`选中的${items.length}条申请中，只有${validItems.length}条可以安排面试（已录用或未录用状态的申请不能安排面试）`);
        }

        // 更新选中的申请列表
        multipleSelection.value = validItems;

        // 打开批量面试安排对话框
        batchInterviewDialogVisible.value = true;
        nextTick(() => {
            batchInterviewDialogRef.value?.initForm();
        });
    } else {
        // 其他状态更新
        let confirmMessage = '';
        switch (action) {
            case 'viewed':
                confirmMessage = `确定将选中的 ${items.length} 条申请标记为已查看吗？`;
                break;
            case 'offer':
            case 'accepted':
                confirmMessage = `确定向选中的 ${items.length} 名候选人发放Offer吗？`;
                break;
            case 'rejected':
                confirmMessage = `确定将选中的 ${items.length} 条申请标记为不合适吗？`;
                break;
            default:
                confirmMessage = `确定更新选中的 ${items.length} 条申请状态吗？`;
        }

        try {
            await ElMessageBox.confirm(confirmMessage, '批量操作确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            });

            // 执行批量更新
            let status = action;
            // 如果是offer状态，转换为accepted状态
            if (status === 'offer') {
                status = 'accepted';
            }
            const payload: UpdateApplicationStatusPayload = { status };
            const applicationIds = items.map(item => item.id);

            try {
                await applicationStore.batchUpdateApplicationStatus(applicationIds, payload);
                ElMessage.success(`成功更新 ${items.length} 条申请状态`);
                handleClearSelection();
            } catch (error) {
                console.error('Failed to batch update applications:', error);
                ElMessage.error('批量更新失败');
            }
        } catch {
            // 用户取消操作
        }
    }
};

// 面试安排相关方法
const handleScheduleInterview = (application: ApplicationInfo) => {
    selectedApplication.value = application;

    // 检查申请状态
    if (application.status === 'interview') {
        // 如果已经是面试状态，显示提示
        ElMessageBox.confirm(
            '该申请已经安排过面试，您可以更新面试信息。',
            '更新面试信息',
            {
                confirmButtonText: '更新',
                cancelButtonText: '取消',
                type: 'info'
            }
        ).then(() => {
            // 用户确认更新
            interviewDialogVisible.value = true;
            nextTick(() => {
                interviewSchedulerRef.value?.initForm(true); // 传入true表示是更新模式
            });
        }).catch(() => {
            // 用户取消
            ElMessage({
                type: 'info',
                message: '已取消更新面试信息'
            });
        });
    } else {
        // 如果不是面试状态，直接打开对话框
        interviewDialogVisible.value = true;
        nextTick(() => {
            interviewSchedulerRef.value?.initForm(false); // 传入false表示是新安排模式
        });
    }
};

const handleInterviewSubmit = async (data: any) => {
    if (!selectedApplication.value) return;

    try {
        // 直接使用API调用，而不是通过store
        import('@/api/application').then(async (module) => {
            const { scheduleInterview } = module;
            await scheduleInterview(selectedApplication.value.id, data);
            ElMessage.success('面试安排成功');
            interviewDialogVisible.value = false;

            // 刷新申请列表
            applicationStore.fetchCompanyApplications();
        });
    } catch (error) {
        console.error('Failed to schedule interview:', error);
        ElMessage.error('面试安排失败');
    }
};

const handleBatchInterviewSubmit = async (data: any) => {
    try {
        // 直接使用API调用，而不是通过store
        import('@/api/application').then(async (module) => {
            const { scheduleInterview } = module;

            // 为每个申请单独调用面试安排API
            const promises = data.applicationIds.map((id: string | number) =>
                scheduleInterview(id, {
                    interviewTime: data.interviewTime,
                    interviewType: data.interviewType,
                    interviewLocation: data.interviewLocation,
                    interviewContact: data.interviewContact,
                    interviewContactInfo: data.interviewContactInfo,
                    feedback: data.feedback
                })
            );

            await Promise.all(promises);

            ElMessage.success(`成功为 ${data.applicationIds.length} 名候选人安排面试`);
            batchInterviewDialogVisible.value = false;
            handleClearSelection();

            // 刷新申请列表
            applicationStore.fetchCompanyApplications();
        });
    } catch (error) {
        console.error('Failed to batch schedule interviews:', error);
        ElMessage.error('批量安排面试失败');
    }
};

// 反馈相关方法
const handleAddFeedback = (application: ApplicationInfo, type: 'interview' | 'rejection' | 'offer' | 'general') => {
    selectedApplication.value = application;
    feedbackType.value = type;
    feedbackDialogVisible.value = true;
};

const handleFeedbackSubmit = async (data: any) => {
    if (!selectedApplication.value) return;

    try {
        let status: ApplicationStatus | undefined;

        // 根据反馈类型设置状态
        if (feedbackType.value === 'interview' && data.result) {
            if (data.result === 'pass') {
                status = 'accepted'; // 使用'accepted'而不是'offer'
            } else if (data.result === 'fail') {
                status = 'rejected';
            }
        } else if (feedbackType.value === 'rejection') {
            status = 'rejected';
        } else if (feedbackType.value === 'offer') {
            status = 'accepted'; // 使用'accepted'而不是'offer'
        }

        // 如果需要更新状态，使用updateApplicationStatus
        if (status && status !== selectedApplication.value.status) {
            await applicationStore.updateApplicationStatus(selectedApplication.value.id, {
                status: status,
                feedback: data.content,
                rating: data.rating
            });
        } else {
            // 如果只是提交反馈，使用submitCompanyFeedback
            await applicationStore.submitCompanyFeedback(
                selectedApplication.value.id,
                data.content,
                data.rating
            );
        }

        ElMessage.success('反馈提交成功');
        feedbackDialogVisible.value = false;

        // 刷新申请列表
        await applicationStore.fetchCompanyApplications();
    } catch (error) {
        console.error('Failed to submit feedback:', error);
        ElMessage.error('反馈提交失败');
    }
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

.filter-card {
  background-color: var(--el-fill-color-light);
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 15px;
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

.sub-info {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.el-dropdown .el-button {
  margin-left: 8px; /* Space between buttons */
}

.detail-content h4 {
  margin-top: 25px;
  margin-bottom: 10px;
  font-size: 1.1em;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.detail-content h4:first-child {
  margin-top: 0;
}

.feedback-content {
  background-color: var(--el-fill-color-light);
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.feedback-rating {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.rating-label {
  margin-right: 10px;
  font-weight: 500;
}

.feedback-text {
  white-space: pre-line;
  line-height: 1.5;
  margin-bottom: 10px;
}

.feedback-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .application-manage-page {
    padding: 10px;
  }

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

  .action-buttons {
    flex-wrap: wrap;
  }

  .feedback-rating {
    flex-direction: column;
    align-items: flex-start;
  }

  .rating-label {
    margin-bottom: 5px;
  }
}
</style>