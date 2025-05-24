<template>
  <el-dialog
    v-model="dialogVisible"
    title="简历预览"
    width="800px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    class="resume-preview-dialog"
  >
    <div v-loading="loading">
      <!-- 简历不存在的提示 -->
      <el-empty v-if="!resumeExists" description="简历已被删除或不存在">
        <template #description>
          <div>
            <p>简历已被删除或不存在</p>
            <p v-if="deletedResumeTitle" class="deleted-resume-title">原简历标题: {{ deletedResumeTitle }}</p>
          </div>
        </template>
      </el-empty>

      <!-- 简历内容 -->
      <div v-else-if="resumeData" class="resume-content">
        <!-- 简历标题 -->
        <h1 class="resume-title">{{ resumeData.title || '简历' }}</h1>

        <!-- 基本信息 -->
        <div class="resume-section basic-info">
          <div class="info-row">
            <div class="avatar-container" v-if="resumeData.avatar">
              <img :src="resumeData.avatar" alt="头像" class="avatar" />
            </div>
            <div class="info-details">
              <h2 class="name">{{ resumeData.name }}</h2>
              <div class="contact-info">
                <p v-if="resumeData.phone">
                  <el-icon><Phone /></el-icon> {{ resumeData.phone }}
                </p>
                <p v-if="resumeData.email">
                  <el-icon><Message /></el-icon> {{ resumeData.email }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 个人简介 -->
        <div class="resume-section" v-if="resumeData.bio">
          <h2 class="section-title">个人简介</h2>
          <div class="section-content">
            <div v-html="formatMarkdown(resumeData.bio)"></div>
          </div>
        </div>

        <!-- 教育经历 -->
        <div class="resume-section" v-if="resumeData.educationList?.length">
          <h2 class="section-title">教育经历</h2>
          <div class="section-content">
            <div v-for="(edu, index) in resumeData.educationList" :key="index" class="experience-item">
              <div class="experience-header">
                <h3>{{ edu.school }}</h3>
                <span class="time-period">{{ formatSimpleDate(edu.startDate) }} - {{ formatSimpleDate(edu.endDate) }}</span>
              </div>
              <div class="experience-details">
                <p><strong>{{ edu.degree }} · {{ edu.major }}</strong></p>
                <div class="description" v-if="edu.description" v-html="formatMarkdown(edu.description)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 工作经历 -->
        <div class="resume-section" v-if="resumeData.workList?.length">
          <h2 class="section-title">工作经历</h2>
          <div class="section-content">
            <div v-for="(work, index) in resumeData.workList" :key="index" class="experience-item">
              <div class="experience-header">
                <h3>{{ work.company }}</h3>
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
        <div class="resume-section" v-if="resumeData.projectList?.length">
          <h2 class="section-title">项目经历</h2>
          <div class="section-content">
            <div v-for="(project, index) in resumeData.projectList" :key="index" class="experience-item">
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
        <div class="resume-section" v-if="resumeData.skillsDescription || resumeData.skills?.length">
          <h2 class="section-title">专业技能</h2>
          <div class="section-content">
            <div class="skills-tags" v-if="resumeData.skills?.length">
              <el-tag v-for="(skill, index) in resumeData.skills" :key="index" class="skill-tag">{{ skill }}</el-tag>
            </div>
            <div v-if="resumeData.skillsDescription" v-html="formatMarkdown(resumeData.skillsDescription)" class="skills-description"></div>
          </div>
        </div>

        <!-- 自我评价 -->
        <div class="resume-section" v-if="resumeData.selfEvaluation">
          <h2 class="section-title">自我评价</h2>
          <div class="section-content">
            <div v-html="formatMarkdown(resumeData.selfEvaluation)"></div>
          </div>
        </div>

        <!-- 附件简历信息 -->
        <div class="resume-section" v-if="resumeData.fileName">
          <h2 class="section-title">附件简历</h2>
          <div class="section-content">
            <p>
              <el-icon><Document /></el-icon>
              <span>{{ resumeData.fileName }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- 加载中或错误提示 -->
      <el-empty v-else-if="!loading" description="无法加载简历信息"></el-empty>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button 
          v-if="resumeExists && resumeData" 
          type="primary" 
          @click="handleDownload" 
          :loading="downloading"
        >
          <el-icon><Download /></el-icon> 下载简历
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Phone, Message, Document, Download } from '@element-plus/icons-vue';
import { marked } from 'marked';
import { getResumeDetail, downloadResume, checkResumeExists } from '@/api/resume';
import type { ResumeInfo } from '@/types/resume';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  resumeId: {
    type: [String, Number],
    default: ''
  },
  deletedResumeTitle: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:visible']);

const dialogVisible = ref(props.visible);
const loading = ref(false);
const downloading = ref(false);
const resumeData = ref<ResumeInfo | null>(null);
const resumeExists = ref(true);

// 监听对话框可见性变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal && props.resumeId) {
    fetchResumeData();
  }
});

// 监听对话框内部可见性变化，同步到父组件
watch(() => dialogVisible.value, (newVal) => {
  emit('update:visible', newVal);
});

// 获取简历数据
const fetchResumeData = async () => {
  if (!props.resumeId) {
    resumeExists.value = false;
    return;
  }

  loading.value = true;
  resumeData.value = null;

  try {
    // 首先检查简历是否存在
    const checkResponse = await checkResumeExists(props.resumeId);
    
    if (checkResponse.data && checkResponse.data.exists) {
      resumeExists.value = true;
      // 获取简历详情
      const response = await getResumeDetail(props.resumeId);
      resumeData.value = response.data;
    } else {
      resumeExists.value = false;
    }
  } catch (error) {
    console.error('Failed to fetch resume data:', error);
    ElMessage.error('获取简历信息失败');
    resumeExists.value = false;
  } finally {
    loading.value = false;
  }
};

// 下载简历
const handleDownload = async () => {
  if (!resumeData.value || !resumeData.value.id) {
    ElMessage.warning('无法获取简历信息');
    return;
  }

  downloading.value = true;

  try {
    // 处理附件简历下载
    if (resumeData.value.fileName && resumeData.value.fileUrl) {
      // 直接使用文件URL下载
      const link = document.createElement('a');
      link.href = resumeData.value.fileUrl;
      link.download = resumeData.value.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      ElMessage.success('简历下载已开始');
    } else {
      // 使用API下载在线简历
      const response = await downloadResume(resumeData.value.id);
      
      // 创建Blob对象
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.value.title || '简历'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      ElMessage.success('简历下载成功');
    }
  } catch (error) {
    console.error('Failed to download resume:', error);
    ElMessage.error('简历下载失败');
  } finally {
    downloading.value = false;
  }
};

// 格式化日期
const formatSimpleDate = (timeStr: string | undefined): string => {
  if (!timeStr) return '至今';
  try {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) {
      return '未知日期';
    }
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2);
  } catch (e) {
    console.error('Error formatting date:', e);
    return timeStr;
  }
};

// 格式化Markdown内容
const formatMarkdown = (content: string | undefined): string => {
  if (!content) return '';
  try {
    return marked.parse(content, { async: false }) as string;
  } catch (e) {
    console.error('Failed to parse markdown:', e);
    return content;
  }
};
</script>

<style scoped>
.resume-preview-dialog :deep(.el-dialog__body) {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.resume-content {
  max-width: 100%;
  margin: 0 auto;
  padding: 10px;
}

.resume-title {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: var(--el-color-primary);
}

.resume-section {
  margin-bottom: 25px;
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
  width: 80px;
  height: 80px;
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
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.skill-tag {
  margin-right: 5px;
}

.skills-description {
  margin-top: 10px;
}

.deleted-resume-title {
  color: #909399;
  font-style: italic;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
}
</style>
