<template>
  <div class="application-detail-page responsive-padding" v-loading="applicationStore.loadingDetail">
    <el-card shadow="never" class="page-card responsive-card">
      <template #header>
        <div class="card-header">
          <el-button @click="goBack" type="primary" plain class="back-button">
            <el-icon class="back-icon"><ArrowLeft /></el-icon>
            <span class="back-text">返回</span>
          </el-button>
          <span class="page-title">申请详情</span>
        </div>
      </template>

      <div v-if="applicationStore.currentApplicationDetail" class="application-content">
        <!-- 申请状态 -->
        <div class="status-section">
          <el-tag :type="getStatusTagType(applicationStore.currentApplicationDetail.status)" size="large">
            {{ formatStatus(applicationStore.currentApplicationDetail.status) }}
          </el-tag>
          <span class="update-time" v-if="applicationStore.currentApplicationDetail.updateTime">
            更新于: {{ formatTime(applicationStore.currentApplicationDetail.updateTime) }}
          </span>
        </div>

        <!-- 职位信息 -->
        <div class="info-section">
          <h2 class="section-title">职位信息</h2>
          <div class="info-content">
            <div class="info-item">
              <span class="label">职位名称:</span>
              <span class="value">
                <el-link type="primary" @click="goToJobDetail(applicationStore.currentApplicationDetail.jobId)">
                  {{ applicationStore.currentApplicationDetail.jobTitle || '未知职位' }}
                </el-link>
              </span>
            </div>
            <div class="info-item">
              <span class="label">公司名称:</span>
              <span class="value">{{ applicationStore.currentApplicationDetail.companyName || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">申请时间:</span>
              <span class="value">{{ formatTime(applicationStore.currentApplicationDetail.applyTime) }}</span>
            </div>
            <div class="info-item">
              <span class="label">投递简历:</span>
              <!-- 有简历ID -->
              <template v-if="applicationStore.currentApplicationDetail.resumeId">
                <el-link
                  type="primary"
                  @click="checkAndGoToResume(applicationStore.currentApplicationDetail.resumeId, applicationStore.currentApplicationDetail.resumeTitle)"
                  :underline="false"
                  class="value"
                >
                  {{ applicationStore.currentApplicationDetail.resumeTitle || '查看简历' }}
                </el-link>
              </template>
              <!-- 简历已被删除但有删除前的标题 -->
              <template v-else-if="applicationStore.currentApplicationDetail.deletedResumeTitle">
                <span class="value deleted-resume">
                  {{ applicationStore.currentApplicationDetail.deletedResumeTitle }}
                  <el-tag size="small" type="info">已删除</el-tag>
                </span>
              </template>
              <!-- 没有简历ID且没有删除前标题 -->
              <template v-else>
                <span class="value deleted-resume">未知简历</span>
              </template>
            </div>
          </div>
        </div>

        <!-- 面试安排 -->
        <div class="info-section" v-if="hasInterviewInfo">
          <h2 class="section-title">面试安排</h2>
          <div class="info-content">
            <div class="interview-card">
              <div class="interview-header">
                <el-icon><Calendar /></el-icon>
                <span class="interview-time">{{ formatInterviewTime(applicationStore.currentApplicationDetail.interviewTime) }}</span>
              </div>
              <div class="interview-body">
                <div class="info-item" v-if="applicationStore.currentApplicationDetail.interviewLocation">
                  <span class="label">面试地点:</span>
                  <span class="value">{{ applicationStore.currentApplicationDetail.interviewLocation }}</span>
                </div>
                <div class="info-item" v-if="applicationStore.currentApplicationDetail.interviewType">
                  <span class="label">面试方式:</span>
                  <span class="value">{{ formatInterviewType(applicationStore.currentApplicationDetail.interviewType) }}</span>
                </div>
                <div class="info-item" v-if="applicationStore.currentApplicationDetail.interviewContact">
                  <span class="label">联系人:</span>
                  <span class="value">{{ applicationStore.currentApplicationDetail.interviewContact }}</span>
                </div>
                <div class="info-item" v-if="applicationStore.currentApplicationDetail.interviewContactInfo">
                  <span class="label">联系方式:</span>
                  <span class="value">{{ applicationStore.currentApplicationDetail.interviewContactInfo }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 企业反馈 -->
        <div class="info-section" v-if="applicationStore.currentApplicationDetail.feedback">
          <h2 class="section-title">企业反馈</h2>
          <div class="info-content">
            <div class="feedback-content" v-html="formatMarkdown(applicationStore.currentApplicationDetail.feedback)"></div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-section" v-if="canWithdraw(applicationStore.currentApplicationDetail.status)">
          <el-button type="danger" @click="handleWithdraw(applicationStore.currentApplicationDetail.id)">
            撤销申请
          </el-button>
        </div>

        <!-- 已提交的反馈内容 -->
        <div class="info-section" v-if="hasSubmittedFeedback">
          <h2 class="section-title">{{ getFeedbackTitle }}</h2>
          <div class="info-content">
            <div class="feedback-display">
              <div class="rating-display">
                <span class="label">{{ getRatingLabel }}：</span>
                <el-rate v-model="applicationStore.currentApplicationDetail.rating" disabled show-score></el-rate>
              </div>
              <div class="feedback-content" v-if="applicationStore.currentApplicationDetail.feedback">
                <div class="label">{{ getFeedbackLabel }}：</div>
                <div class="content">{{ applicationStore.currentApplicationDetail.feedback }}</div>
              </div>
              <div class="feedback-time" v-if="applicationStore.currentApplicationDetail.updateTime">
                <small class="text-muted">提交时间：{{ formatDateTime(applicationStore.currentApplicationDetail.updateTime) }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- 反馈表单 -->
        <div class="info-section" v-if="showFeedbackForm">
          <h2 class="section-title">{{ getFeedbackTitle }}</h2>
          <div class="info-content">
            <el-form ref="feedbackFormRef" :model="feedbackForm" label-position="top">
              <el-form-item :label="getRatingLabel">
                <el-rate v-model="feedbackForm.rating" :max="5" show-score></el-rate>
              </el-form-item>
              <el-form-item :label="getFeedbackLabel">
                <el-input
                  v-model="feedbackForm.content"
                  type="textarea"
                  :rows="4"
                  :placeholder="getFeedbackPlaceholder"
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitFeedback" :loading="submitting">提交反馈</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>

      <el-empty v-else description="申请详情加载中或不存在"></el-empty>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApplicationStore } from '@/stores/application';
import type { ApplicationStatus } from '@/types/application';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, Calendar } from '@element-plus/icons-vue';
import { marked } from 'marked'; // 需要安装: pnpm add marked

// 不再需要isDev变量

const router = useRouter();
const route = useRoute();
const applicationStore = useApplicationStore();

// 获取申请ID
const applicationIdRaw = route.params.id;
const applicationId = Array.isArray(applicationIdRaw) ? applicationIdRaw[0] : applicationIdRaw;

// 面试反馈表单
const feedbackFormRef = ref();
const feedbackForm = ref({
  rating: 0,
  content: ''
});
const submitting = ref(false);

// 是否显示反馈表单
const showFeedbackForm = computed(() => {
  const application = applicationStore.currentApplicationDetail;
  if (!application) return false;

  // 检查申请状态是否允许反馈
  const status = application.status;
  const statusAllowsFeedback = status === 'interview' || status === 'offer' || status === 'rejected';

  // 检查是否已经提交过反馈（有评分或反馈内容）
  const hasExistingFeedback = application.rating > 0 || (application.feedback && application.feedback.trim() !== '');

  // 只有状态允许且没有已存在的反馈时才显示表单
  return statusAllowsFeedback && !hasExistingFeedback;
});

// 是否有面试信息
const hasInterviewInfo = computed(() => {
  const application = applicationStore.currentApplicationDetail;
  return application && (
    application.interviewTime ||
    application.interviewLocation ||
    application.interviewType
  );
});

// 根据申请状态获取反馈表单标题
const getFeedbackTitle = computed(() => {
  const status = applicationStore.currentApplicationDetail?.status;
  if (status === 'interview') return '面试反馈';
  if (status === 'offer' || status === 'accepted') return '录用反馈';
  if (status === 'rejected') return '申请反馈';
  return '反馈';
});

// 根据申请状态获取评分标签
const getRatingLabel = computed(() => {
  const status = applicationStore.currentApplicationDetail?.status;
  if (status === 'interview') return '面试评分';
  if (status === 'offer' || status === 'accepted') return '满意度评分';
  if (status === 'rejected') return '企业评分';
  return '评分';
});

// 根据申请状态获取反馈内容标签
const getFeedbackLabel = computed(() => {
  const status = applicationStore.currentApplicationDetail?.status;
  if (status === 'interview') return '面试感受';
  if (status === 'offer' || status === 'accepted') return '录用感受';
  if (status === 'rejected') return '申请体验';
  return '反馈内容';
});

// 根据申请状态获取反馈输入框占位符
const getFeedbackPlaceholder = computed(() => {
  const status = applicationStore.currentApplicationDetail?.status;
  if (status === 'interview') return '请分享您的面试体验和感受...';
  if (status === 'offer' || status === 'accepted') return '请分享您对录用过程的感受和建议...';
  if (status === 'rejected') return '请分享您对该企业招聘流程的评价和建议...';
  return '请输入您的反馈...';
});

// 是否已提交反馈
const hasSubmittedFeedback = computed(() => {
  const application = applicationStore.currentApplicationDetail;
  if (!application) return false;

  // 检查是否已经提交过反馈（有评分或反馈内容）
  return application.rating > 0 || (application.feedback && application.feedback.trim() !== '');
});

onMounted(async () => {
  if (applicationId) {
    try {
      console.log('正在获取申请详情，ID:', applicationId);

      await applicationStore.fetchApplicationDetail(applicationId);

      if (!applicationStore.currentApplicationDetail) {
        console.error('获取申请详情后数据为空');
        ElMessage.error('找不到该申请记录');
        goBack();
      } else {
        console.log('成功加载申请详情:', applicationStore.currentApplicationDetail);

        // 检查简历标题
        if (!applicationStore.currentApplicationDetail.resumeTitle) {
          console.warn('申请详情中缺少简历标题');
        }

        // 检查简历ID
        if (!applicationStore.currentApplicationDetail.resumeId) {
          console.warn('申请详情中缺少简历ID');
        }
      }
    } catch (error) {
      console.error('获取申请详情失败:', error);
      ElMessage.error('获取申请详情失败');
      goBack();
    }
  } else {
    console.error('申请ID不存在');
    ElMessage.error('申请ID不存在');
    goBack();
  }
});

// 返回上一页
const goBack = () => {
  router.push('/student/applications');
};

// 格式化时间
const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return '未知';
  try {
    return new Date(timeStr).toLocaleString();
  } catch (e) {
    return timeStr;
  }
};

// 格式化面试时间
const formatInterviewTime = (timeStr: string | undefined): string => {
  if (!timeStr) return '未安排';
  try {
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long'
    });
  } catch (e) {
    return timeStr;
  }
};

// 格式化面试方式
const formatInterviewType = (type: string | undefined): string => {
  if (!type) return '未知';
  const typeMap: Record<string, string> = {
    'onsite': '现场面试',
    'video': '视频面试',
    'phone': '电话面试'
  };
  return typeMap[type] || type;
};

// 格式化状态文本
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

// 获取状态标签类型
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

// 检查是否可以撤回申请
const canWithdraw = (status: ApplicationStatus | undefined): boolean => {
  return status === 'pending' || status === 'viewed';
};

// 撤回申请
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
    // 调用store action撤回申请
    await applicationStore.withdrawApplication(id);
    ElMessage.success('申请已撤销');
    goBack();
  } catch (error) {
    // 如果是用户取消确认，不做处理
    if (error !== 'cancel') {
      console.error('Failed to withdraw application:', error);
    }
  }
};

// 跳转到职位详情
const goToJobDetail = (jobId: string | number | undefined) => {
  if (!jobId) return;
  router.push({ name: 'student-job-detail', params: { id: jobId } });
};

// 检查简历是否存在并跳转
const checkAndGoToResume = async (resumeId: string | number, resumeTitle: string) => {
  if(!resumeId) return;

  try {
    // 导入简历API
    const { checkResumeExists } = await import('@/api/resume');

    // 检查简历是否存在
    const response = await checkResumeExists(resumeId);

    if (response.data && response.data.exists) {
      // 简历存在，跳转到预览页面
      console.log(`Viewing resume preview for id: ${resumeId}`);
      router.push(`/student/resume/${resumeId}/preview`);
    } else {
      // 简历不存在，显示提示
      ElMessage.warning(`简历"${resumeTitle}"已被删除或不存在`);
    }
  } catch (error) {
    console.error('Failed to check resume existence:', error);
    ElMessage.error('无法验证简历是否存在，请稍后重试');
  }
};

// 格式化Markdown内容
const formatMarkdown = (content: string | undefined): string => {
  if (!content) return '';
  try {
    // 使用marked.parse的同步模式
    return marked.parse(content, { async: false }) as string;
  } catch (e) {
    console.error('Failed to parse markdown:', e);
    return content;
  }
};

// 格式化日期时间
const formatDateTime = (timeStr: string | undefined): string => {
  if (!timeStr) return '未知';
  try {
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    console.error('Failed to format date time:', e);
    return timeStr;
  }
};

// 提交反馈
const submitFeedback = async () => {
  if (feedbackForm.value.rating === 0) {
    ElMessage.warning('请先进行评分');
    return;
  }

  submitting.value = true;
  try {
    // 调用store方法提交反馈
    await applicationStore.submitInterviewFeedback(
      applicationId,
      feedbackForm.value.rating,
      feedbackForm.value.content
    );

    // 强制刷新申请详情，确保获取最新数据
    applicationStore.clearCurrentApplicationDetail(); // 先清除当前详情
    await applicationStore.fetchApplicationDetail(applicationId); // 重新获取

    // 清空表单
    feedbackForm.value.rating = 0;
    feedbackForm.value.content = '';

    // 根据申请状态显示不同的成功消息
    const status = applicationStore.currentApplicationDetail?.status;
    if (status === 'interview') {
      ElMessage.success('面试反馈提交成功，感谢您的分享！');
    } else if (status === 'offer' || status === 'accepted') {
      ElMessage.success('录用反馈提交成功，感谢您的分享！');
    } else if (status === 'rejected') {
      ElMessage.success('申请反馈提交成功，感谢您的宝贵意见！');
    } else {
      ElMessage.success('反馈提交成功，感谢您的分享！');
    }
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    ElMessage.error('提交反馈失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.application-detail-page {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
}

.back-button {
  margin-right: 15px;
}

.back-icon {
  margin-right: 5px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  flex-grow: 1;
}

.application-content {
  max-width: 800px;
  margin: 0 auto;
}

.status-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.update-time {
  margin-left: 15px;
  font-size: 0.9rem;
  color: #909399;
}

.info-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
}

.info-content {
  padding: 0 10px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
}

.label {
  font-weight: 600;
  color: #606266;
  width: 100px;
  flex-shrink: 0;
}

.value {
  color: #303133;
  flex-grow: 1;
}

/* 确保链接样式与普通文本一致 */
.el-link.value {
  font-size: inherit;
  font-weight: inherit;
}

/* 已删除简历样式 */
.deleted-resume {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #909399;
}

.deleted-resume .el-tag {
  margin-left: 5px;
}

.interview-card {
  background-color: #f0f9ff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.interview-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: #409eff;
}

.debug-info {
  margin-left: 10px;
  font-size: 0.8rem;
  color: #909399;
  font-style: italic;
  font-weight: 600;
}

.interview-header .el-icon {
  margin-right: 10px;
  font-size: 1.2rem;
}

.interview-time {
  font-size: 1.1rem;
}

.interview-body {
  padding-left: 10px;
}

.feedback-content {
  line-height: 1.6;
  white-space: pre-line;
}

.feedback-display {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;

  .rating-display {
    margin-bottom: 12px;
    display: flex;
    align-items: center;

    .label {
      font-weight: bold;
      margin-right: 8px;
      width: auto;
    }
  }

  .feedback-content {
    margin-bottom: 12px;

    .label {
      font-weight: bold;
      margin-bottom: 8px;
      width: 100%;
    }

    .content {
      line-height: 1.6;
      white-space: pre-line;
    }
  }

  .feedback-time {
    text-align: right;
    color: #909399;
    font-size: 12px;
  }
}

.action-section {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

/* 移动端适配 */
@media (max-width: 576px) {
  .application-detail-page {
    padding: 10px;
  }

  .card-header {
    flex-wrap: wrap;
  }

  .page-title {
    order: -1;
    width: 100%;
    margin-bottom: 10px;
  }

  .info-section {
    padding: 15px;
  }

  .info-item {
    flex-direction: column;
    margin-bottom: 15px;
  }

  .label {
    width: 100%;
    margin-bottom: 5px;
  }
}
</style>
