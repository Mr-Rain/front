<template>
  <div class="resume-export">
    <!-- 导出按钮 -->
    <el-button type="primary" @click="exportResume" :loading="exporting">
      <el-icon><Download /></el-icon>
      导出简历
    </el-button>

    <!-- 简历预览（用于导出，默认隐藏） -->
    <div id="resume-export-container" ref="resumeContainer" class="resume-container" :style="{ display: 'none' }">
      <div class="resume-header">
        <h1 class="resume-name">{{ resumeData.name }}</h1>
        <div class="resume-contact">
          <p v-if="resumeData.phone"><i class="el-icon"><Phone /></i> {{ resumeData.phone }}</p>
          <p v-if="resumeData.email"><i class="el-icon"><Message /></i> {{ resumeData.email }}</p>
          <p v-if="resumeData.location"><i class="el-icon"><Location /></i> {{ resumeData.location }}</p>
        </div>
      </div>

      <div class="resume-section">
        <h2 class="section-title">个人信息</h2>
        <div class="section-content">
          <p v-if="resumeData.school"><strong>学校：</strong>{{ resumeData.school }}</p>
          <p v-if="resumeData.major"><strong>专业：</strong>{{ resumeData.major }}</p>
          <p v-if="resumeData.education"><strong>学历：</strong>{{ resumeData.education }}</p>
          <p v-if="resumeData.grade"><strong>年级：</strong>{{ resumeData.grade }}</p>
        </div>
      </div>

      <div v-if="resumeData.bio" class="resume-section">
        <h2 class="section-title">个人简介</h2>
        <div class="section-content">
          <p>{{ resumeData.bio }}</p>
        </div>
      </div>

      <div v-if="resumeData.skills && resumeData.skills.length > 0" class="resume-section">
        <h2 class="section-title">技能标签</h2>
        <div class="section-content skills-container">
          <span v-for="(skill, index) in resumeData.skills" :key="index" class="skill-tag">
            {{ skill }}
          </span>
        </div>
      </div>

      <div v-if="resumeData.education_experiences && resumeData.education_experiences.length > 0" class="resume-section">
        <h2 class="section-title">教育经历</h2>
        <div class="section-content">
          <div v-for="(edu, index) in resumeData.education_experiences" :key="index" class="experience-item">
            <div class="experience-header">
              <h3>{{ edu.school }}</h3>
              <span class="experience-time">{{ formatDateRange(edu.start_date, edu.end_date) }}</span>
            </div>
            <p><strong>{{ edu.degree }}</strong> - {{ edu.major }}</p>
            <p v-if="edu.description">{{ edu.description }}</p>
          </div>
        </div>
      </div>

      <div v-if="resumeData.work_experiences && resumeData.work_experiences.length > 0" class="resume-section">
        <h2 class="section-title">工作经历</h2>
        <div class="section-content">
          <div v-for="(work, index) in resumeData.work_experiences" :key="index" class="experience-item">
            <div class="experience-header">
              <h3>{{ work.company }}</h3>
              <span class="experience-time">{{ formatDateRange(work.start_date, work.end_date) }}</span>
            </div>
            <p><strong>{{ work.position }}</strong></p>
            <div v-if="work.description" class="work-description" v-html="sanitizeHTML(work.description)"></div>
          </div>
        </div>
      </div>

      <div v-if="resumeData.expected_salary || resumeData.expected_location" class="resume-section">
        <h2 class="section-title">求职意向</h2>
        <div class="section-content">
          <p v-if="resumeData.expected_salary"><strong>期望薪资：</strong>{{ resumeData.expected_salary }}</p>
          <p v-if="resumeData.expected_location"><strong>期望地点：</strong>{{ resumeData.expected_location }}</p>
        </div>
      </div>

      <div class="resume-footer">
        <p>简历生成时间：{{ formatDate(new Date()) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, defineExpose } from 'vue';
import { useStudentStore } from '@/stores/student';
import { exportResumeToPDF } from '@/utils/exportUtils';
import { Download, Phone, Message, Location } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

const props = defineProps({
  // 是否使用当前用户的简历数据
  useCurrentUser: {
    type: Boolean,
    default: true
  },
  // 自定义简历数据
  resumeData: {
    type: Object,
    default: () => ({})
  },
  // 自定义文件名
  fileName: {
    type: String,
    default: ''
  }
});

const studentStore = useStudentStore();
const resumeContainer = ref<HTMLElement | null>(null);
const exporting = ref(false);

// 合并简历数据
const mergedResumeData = computed(() => {
  if (props.useCurrentUser && studentStore.profile) {
    return {
      name: studentStore.profile.username || '',
      phone: studentStore.profile.phone || '',
      email: studentStore.profile.email || '',
      location: studentStore.profile.expectedLocation || '',
      school: studentStore.profile.school || '',
      major: studentStore.profile.major || '',
      education: studentStore.profile.education || '',
      grade: studentStore.profile.grade || '',
      bio: studentStore.profile.bio || '',
      skills: studentStore.profile.skills || [],
      education_experiences: studentStore.profile.educationExperiences || [],
      work_experiences: studentStore.profile.workExperiences || [],
      expected_salary: studentStore.profile.expectedSalary || '',
      expected_location: studentStore.profile.expectedLocation || ''
    };
  } else {
    return props.resumeData;
  }
});

// 初始化
onMounted(() => {
  if (props.useCurrentUser && !studentStore.profile) {
    studentStore.fetchProfile();
  }
});

// 格式化日期范围
const formatDateRange = (startDate: string, endDate: string | null): string => {
  if (!startDate) return '';

  const start = formatDate(new Date(startDate));
  const end = endDate ? formatDate(new Date(endDate)) : '至今';

  return `${start} - ${end}`;
};

// 格式化日期
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
};

// 净化HTML内容
const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  try {
    // 将Markdown转换为HTML，使用同步模式
    const rawHTML = marked.parse(html, { async: false }) as string;
    // 净化HTML以防止XSS攻击
    return DOMPurify.sanitize(rawHTML);
  } catch (e) {
    console.error('Failed to sanitize HTML:', e);
    return DOMPurify.sanitize(html);
  }
};

// 导出简历
const exportResume = async () => {
  if (!resumeContainer.value) {
    ElMessage.error('简历容器不存在');
    return;
  }

  try {
    exporting.value = true;

    // 临时显示简历容器以便导出
    resumeContainer.value.style.display = 'block';

    // 生成文件名
    const fileName = props.fileName || `${mergedResumeData.value.name || 'resume'}_简历`;

    // 导出为PDF
    await exportResumeToPDF(resumeContainer.value, fileName, {
      name: mergedResumeData.value.name,
      id: studentStore.profile?.id
    });

    ElMessage.success('简历导出成功');
  } catch (error) {
    console.error('简历导出失败:', error);
    ElMessage.error('简历导出失败，请重试');
  } finally {
    // 隐藏简历容器
    if (resumeContainer.value) {
      resumeContainer.value.style.display = 'none';
    }
    exporting.value = false;
  }
};

// 暴露导出方法
defineExpose({
  exportResume
});
</script>

<style scoped>
.resume-container {
  width: 210mm; /* A4宽度 */
  padding: 20mm;
  background-color: white;
  font-family: 'Arial', 'Microsoft YaHei', sans-serif;
  color: #333;
  line-height: 1.5;
}

.resume-header {
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 20px;
}

.resume-name {
  font-size: 24px;
  margin: 0 0 10px;
  color: #333;
}

.resume-contact {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
}

.resume-contact p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.resume-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  margin: 0 0 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
  color: #2c3e50;
}

.section-content {
  padding: 0 10px;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag {
  background-color: #f0f2f5;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.experience-item {
  margin-bottom: 15px;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.experience-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.experience-time {
  font-size: 14px;
  color: #666;
}

.work-description {
  margin-top: 5px;
  font-size: 14px;
}

.resume-footer {
  margin-top: 30px;
  text-align: center;
  font-size: 12px;
  color: #999;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

/* 打印样式 */
@media print {
  .resume-container {
    padding: 0;
    width: 100%;
  }
}
</style>
