<template>
  <div class="resume-preview-page responsive-padding" v-loading="resumeStore.loadingDetail">
    <el-card shadow="never" class="page-card responsive-card">
      <template #header>
        <div class="card-header">
          <el-button @click="goBack" type="primary" plain class="back-button">
            <el-icon class="back-icon"><ArrowLeft /></el-icon>
            <span class="back-text">返回</span>
          </el-button>
          <span class="page-title">简历预览</span>
          <div class="header-actions">
            <el-button type="primary" @click="handlePrint">
              <el-icon><Printer /></el-icon>
              <span class="hide-on-mobile">打印</span>
            </el-button>
            <el-button type="success" @click="handleEdit">
              <el-icon><Edit /></el-icon>
              <span class="hide-on-mobile">编辑</span>
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="resumeStore.currentResume" class="resume-content">
        <!-- 简历标题 -->
        <h1 class="resume-title">{{ resumeStore.currentResume.title || '我的简历' }}</h1>

        <!-- 基本信息 -->
        <div class="resume-section basic-info">
          <div class="info-row">
            <div class="avatar-container" v-if="resumeStore.currentResume.avatar">
              <img :src="resumeStore.currentResume.avatar" alt="头像" class="avatar" />
            </div>
            <div class="info-details">
              <h2 class="name">{{ resumeStore.currentResume.name }}</h2>
              <div class="contact-info">
                <p v-if="resumeStore.currentResume.phone">
                  <el-icon><Phone /></el-icon> {{ resumeStore.currentResume.phone }}
                </p>
                <p v-if="resumeStore.currentResume.email">
                  <el-icon><Message /></el-icon> {{ resumeStore.currentResume.email }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 教育经历 -->
        <div class="resume-section" v-if="resumeStore.currentResume.educationList?.length">
          <h2 class="section-title">教育经历</h2>
          <div class="section-content">
            <div v-for="(edu, index) in resumeStore.currentResume.educationList" :key="index" class="experience-item">
              <div class="experience-header">
                <h3>{{ edu.school }}</h3>
                <span class="time-period">{{ formatSimpleDate(edu.startDate) }} - {{ formatSimpleDate(edu.endDate) }}</span>
              </div>
              <div class="experience-details">
                <p><strong>{{ edu.major }}</strong> | {{ edu.degree }}</p>
                <p v-if="edu.description" class="description">{{ edu.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 工作经历 -->
        <div class="resume-section" v-if="resumeStore.currentResume.workList?.length">
          <h2 class="section-title">工作/实习经历</h2>
          <div class="section-content">
            <div v-for="(work, index) in resumeStore.currentResume.workList" :key="index" class="experience-item">
              <div class="experience-header">
                <h3>{{ work.companyName }}</h3>
                <span class="time-period">{{ formatSimpleDate(work.startDate) }} - {{ formatSimpleDate(work.endDate) }}</span>
              </div>
              <div class="experience-details">
                <p><strong>{{ work.position }}</strong></p>
                <div class="description" v-html="formatMarkdown(work.description)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 项目经历 -->
        <div class="resume-section" v-if="resumeStore.currentResume.projectList?.length">
          <h2 class="section-title">项目经历</h2>
          <div class="section-content">
            <div v-for="(project, index) in resumeStore.currentResume.projectList" :key="index" class="experience-item">
              <div class="experience-header">
                <h3>{{ project.projectName }}</h3>
                <span class="time-period">{{ formatSimpleDate(project.startDate) }} - {{ formatSimpleDate(project.endDate) }}</span>
              </div>
              <div class="experience-details">
                <p><strong>{{ project.role }}</strong></p>
                <div class="description" v-html="formatMarkdown(project.description)"></div>
                <p v-if="project.projectLink" class="project-link">
                  <el-link type="primary" :href="project.projectLink" target="_blank">项目链接</el-link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 技能描述 -->
        <div class="resume-section" v-if="resumeStore.currentResume.skillsDescription">
          <h2 class="section-title">专业技能</h2>
          <div class="section-content">
            <div class="skills-content" v-html="formatMarkdown(resumeStore.currentResume.skillsDescription)"></div>
          </div>
        </div>

        <!-- 自我评价 -->
        <div class="resume-section" v-if="resumeStore.currentResume.selfEvaluation">
          <h2 class="section-title">自我评价</h2>
          <div class="section-content">
            <div class="self-evaluation" v-html="formatMarkdown(resumeStore.currentResume.selfEvaluation)"></div>
          </div>
        </div>

        <!-- 求职期望 -->
        <div class="resume-section" v-if="resumeStore.currentResume.expectedSalary || resumeStore.currentResume.expectedLocation">
          <h2 class="section-title">求职期望</h2>
          <div class="section-content">
            <div class="job-expectations">
              <p v-if="resumeStore.currentResume.expectedSalary">
                <strong>期望薪资：</strong>{{ resumeStore.currentResume.expectedSalary }}
              </p>
              <p v-if="resumeStore.currentResume.expectedLocation">
                <strong>期望地点：</strong>{{ resumeStore.currentResume.expectedLocation }}
              </p>
            </div>
          </div>
        </div>

        <!-- 更新时间 -->
        <div class="resume-footer">
          <p class="update-time">最后更新: {{ formatTime(resumeStore.currentResume.updateTime) }}</p>
        </div>
      </div>

      <el-empty v-else description="简历不存在或正在加载中"></el-empty>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useResumeStore } from '@/stores/resume';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Printer, Edit, Phone, Message } from '@element-plus/icons-vue';
import { marked } from 'marked'; // 需要安装: pnpm add marked

const router = useRouter();
const route = useRoute();
const resumeStore = useResumeStore();

// 获取简历ID
const resumeId = route.params.id;

onMounted(async () => {
  if (resumeId) {
    try {
      await resumeStore.fetchResumeDetail(resumeId.toString());
      if (!resumeStore.currentResume) {
        ElMessage.error('找不到该简历');
        goBack();
      }
    } catch (error) {
      console.error('Failed to fetch resume:', error);
      ElMessage.error('获取简历详情失败');
      goBack();
    }
  } else {
    ElMessage.error('简历ID不存在');
    goBack();
  }
});

// 返回上一页
const goBack = () => {
  router.push('/student/resume');
};

// 格式化时间
const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return '未知';
  try {
    // 尝试更健壮的日期解析和格式化
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) { // 检查日期是否有效
        return '无效日期';
    }
    // 返回年月日 时分秒 格式
    return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  } catch (e) {
    console.error('Error formatting time:', e);
    return timeStr; // 解析失败则返回原始字符串
  }
};

// 新增：格式化经历中的日期 (仅年月)
const formatSimpleDate = (timeStr: string | undefined): string => {
  if (!timeStr) return '至今'; // 或其他默认值
  try {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) {
        return '未知日期';
    }
    // 返回 YYYY-MM 格式
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2);
  } catch (e) {
    console.error('Error formatting simple date:', e);
    return timeStr;
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

// 打印简历
const handlePrint = () => {
  window.print();
};

// 编辑简历
const handleEdit = () => {
  if (resumeId) {
    router.push(`/student/resume/${resumeId}/edit`);
  }
};
</script>

<style scoped>
.resume-preview-page {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.header-actions {
  display: flex;
  gap: 10px;
}

.resume-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.resume-title {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 30px;
  color: var(--el-color-primary);
}

.resume-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #303133;
  border-bottom: 2px solid var(--el-color-primary-light-5);
  padding-bottom: 8px;
  margin-bottom: 15px;
}

.section-content {
  padding: 0 10px;
}

.basic-info .info-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-container {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 50%;
  border: 2px solid var(--el-color-primary-light-5);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-details {
  flex: 1;
}

.name {
  font-size: 1.5rem;
  margin: 0 0 10px 0;
}

.contact-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.contact-info p {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  color: #606266;
}

.experience-item {
  margin-bottom: 20px;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.experience-header h3 {
  font-size: 1.1rem;
  margin: 0;
  color: #303133;
}

.time-period {
  color: #909399;
  font-size: 0.9rem;
}

.experience-details {
  padding-left: 10px;
}

.description {
  margin-top: 5px;
  color: #606266;
  white-space: pre-line;
}

.project-link {
  margin-top: 5px;
}

.job-expectations p {
  margin: 8px 0;
  color: #606266;
}

.job-expectations strong {
  color: #303133;
  margin-right: 8px;
}

.resume-footer {
  text-align: right;
  margin-top: 30px;
  color: #909399;
  font-size: 0.8rem;
}

/* 打印样式 */
@media print {
  .back-button,
  .header-actions,
  .el-card__header {
    display: none !important;
  }

  .resume-content {
    box-shadow: none;
    padding: 0;
  }

  .el-card {
    box-shadow: none !important;
    border: none !important;
  }
}

/* 移动端适配 */
@media (max-width: 576px) {
  .resume-preview-page {
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

  .header-actions {
    margin-left: auto;
  }

  .basic-info .info-row {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .contact-info {
    justify-content: center;
  }

  .experience-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .time-period {
    margin-top: 5px;
  }
}
</style>
