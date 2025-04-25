<template>
  <div class="resume-manage-page responsive-padding" v-loading="resumeStore.loadingList">
    <el-card shadow="never" class="page-card responsive-card">
      <template #header>
        <div class="card-header">
          <span>我的简历</span>
          <div class="header-actions">
            <el-button type="primary" :icon="UploadFilled" @click="handleUploadResume">
              <span class="hide-on-mobile">上传新简历</span>
              <span class="show-on-mobile">上传</span>
            </el-button>
            <el-button type="success" @click="createNewResume">
              <el-icon><Plus /></el-icon>
              <span class="hide-on-mobile">创建简历</span>
              <span class="show-on-mobile">创建</span>
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="resumeStore.resumeList.length > 0">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" v-for="resume in resumeStore.resumeList" :key="resume.id">
            <el-card shadow="hover" class="resume-card">
              <template #header>
                <div class="resume-card-header">
                  <span class="resume-title">{{ resume.title || '未命名简历' }}</span>
                  <el-tag v-if="resume.is_default" type="success" size="small">默认</el-tag>
                </div>
              </template>
              <div class="resume-meta">
                <p v-if="resume.file_name">文件名: {{ resume.file_name }}</p>
                <p v-if="resume.upload_time">上传时间: {{ formatTime(resume.upload_time) }}</p>
                 <!-- Add more details like file size if available -->
              </div>
              <template #footer>
                 <div class="resume-actions">
                   <el-button type="primary" link size="small" @click="handleSetDefault(resume.id)" :disabled="resume.is_default">
                     <span class="hide-on-mobile">设为默认</span>
                     <span class="show-on-mobile">默认</span>
                   </el-button>
                   <el-button link size="small" @click="handlePreview(resume)">预览</el-button>
                   <el-button link size="small" @click="handleEdit(resume.id)">编辑</el-button>
                   <el-button link size="small" @click="handleExport(resume)">
                     <span class="hide-on-mobile">导出</span>
                     <span class="show-on-mobile"><el-icon><Download /></el-icon></span>
                   </el-button>
                   <el-popconfirm title="确定删除这份简历吗?" @confirm="handleDelete(resume.id)">
                     <template #reference>
                       <el-button type="danger" link size="small">删除</el-button>
                     </template>
                   </el-popconfirm>
                 </div>
              </template>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <el-empty v-else description="您还没有上传任何简历"></el-empty>

    </el-card>

    <!-- Upload/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :close-on-click-modal="false">
       <!-- Upload Section (only for new resumes) -->
        <div v-if="!currentResumeId">
             <ResumeUploader
                ref="uploaderRef"
                @upload-success="handleUploadSuccess"
                :limit="1"
                drag
             />
             <el-input
                v-model="newResumeTitle"
                placeholder="请输入简历标题 (可选，默认为文件名)"
                style="margin-top: 15px;"
             />
        </div>

       <!-- Edit Section (only for existing resumes) -->
       <div v-else>
          <el-form label-position="top">
              <el-form-item label="简历标题">
                  <el-input v-model="editResumeTitle" placeholder="简历标题"></el-input>
              </el-form-item>
              <!-- Add other editable fields if needed -->
          </el-form>
       </div>

       <template #footer>
            <el-button @click="closeDialog">取消</el-button>
            <!-- Hide default submit for upload, let uploader handle it -->
            <el-button type="primary" @click="handleSubmitResume" v-if="currentResumeId" :loading="resumeStore.loadingDetail">保存</el-button>
            <!-- Upload button integrated within ResumeUploader, or trigger manually if needed -->
       </template>
    </el-dialog>

    <!-- 导出对话框 -->
    <el-dialog v-model="exportDialogVisible" title="导出简历" width="500px">
      <div class="export-dialog-content">
        <p>请选择导出格式：</p>
        <div class="export-options">
          <el-radio-group v-model="exportFormat">
            <el-radio label="pdf">PDF文档</el-radio>
            <el-radio label="image" v-if="selectedResume?.type === 'online'">图片</el-radio>
          </el-radio-group>
        </div>

        <el-form label-position="top">
          <el-form-item label="文件名">
            <el-input v-model="exportFileName" placeholder="请输入文件名（不含扩展名）"></el-input>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="exportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmExport" :loading="exporting">导出</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 简历导出组件 -->
    <resume-export ref="resumeExportRef" :use-current-user="false" :resume-data="exportResumeData" :file-name="exportFileName" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useResumeStore } from '@/stores/resume';
import { useStudentStore } from '@/stores/student';
import type { ResumeInfo } from '@/types/resume'; // Assuming types/resume.d.ts exists
import { ElCard, ElButton, ElEmpty, ElRow, ElCol, ElTag, ElPopconfirm, ElDialog, ElMessage, ElInput, ElForm, ElFormItem, ElRadioGroup, ElRadio } from 'element-plus';
import { UploadFilled, Plus, Download } from '@element-plus/icons-vue';
import ResumeUploader from '@/components/common/ResumeUploader.vue'; // Import the uploader component
import ResumeExport from '@/components/student/ResumeExport.vue'; // Import the resume export component

const resumeStore = useResumeStore();
const studentStore = useStudentStore();
const router = useRouter();

const dialogVisible = ref(false);
const dialogTitle = ref('上传简历');
const currentResumeId = ref<string | number | null>(null);
const editResumeTitle = ref(''); // Title for editing
const newResumeTitle = ref(''); // Optional title for new upload
const uploaderRef = ref<InstanceType<typeof ResumeUploader>>(); // Ref for uploader component

// 导出相关

const exportDialogVisible = ref(false);
const exportFormat = ref('pdf');
const exportFileName = ref('');
const exporting = ref(false);
const selectedResume = ref<ResumeInfo | null>(null);
const resumeExportRef = ref<InstanceType<typeof ResumeExport>>();

// 导出简历数据
const exportResumeData = reactive({
  name: '',
  phone: '',
  email: '',
  location: '',
  school: '',
  major: '',
  education: '',
  grade: '',
  bio: '',
  skills: [] as string[],
  education_experiences: [] as any[],
  work_experiences: [] as any[],
  expected_salary: '',
  expected_location: ''
});

const fetchResumes = () => {
  resumeStore.fetchResumeList();
};

onMounted(() => {
  fetchResumes();
});

const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return '未知';
  try {
    // More user-friendly format
    return new Date(timeStr).toLocaleString();
  } catch (e) {
    return timeStr;
  }
};

const handleUploadResume = () => {
  dialogTitle.value = '上传新简历';
  currentResumeId.value = null;
  editResumeTitle.value = ''; // Clear edit title
  newResumeTitle.value = ''; // Clear new title
  uploaderRef.value?.clearFiles(); // Clear uploader state if component instance exists
  dialogVisible.value = true;
};

const handleEdit = (id: string | number) => {
  // 跳转到简历编辑页面
  router.push(`/student/resume/${id}/edit`);
};

const handleSetDefault = async (id: string | number) => {
  console.log(`Setting resume ${id} as default - Calling store action`);
  try {
    await resumeStore.setDefaultResume(id);
    ElMessage.success('默认简历设置成功');
    // List should automatically update if store state is reactive
  } catch (error) {
     // Error should be handled in store
  }
};

const handleDelete = async (id: string | number) => {
  console.log(`Deleting resume ${id} - Calling store action`);
  try {
    await resumeStore.deleteResume(id);
    ElMessage.success('简历删除成功');
     // List should automatically update if store state is reactive
  } catch (error) {
     // Error should be handled in store
  }
};

const handlePreview = (resume: ResumeInfo) => {
    console.log("Previewing resume:", resume);
    if(resume.file_url) {
        // 如果是附件简历，直接打开文件链接
        window.open(resume.file_url, '_blank');
    } else {
        // 如果是在线简历，跳转到简历预览页面
        router.push(`/student/resume/${resume.id}/preview`);
    }
};

// 处理导出简历
const handleExport = async (resume: ResumeInfo) => {
  selectedResume.value = resume;

  // 设置默认文件名
  if (studentStore.profile) {
    exportFileName.value = `${studentStore.profile.username || 'resume'}_简历`;
  } else {
    exportFileName.value = `简历_${resume.id}`;
  }

  // 如果是文件类型的简历，直接下载
  if (resume.type === 'file' && resume.file_url) {
    window.open(resume.file_url, '_blank');
    return;
  }

  // 如果是在线简历，显示导出对话框
  if (resume.type === 'online') {
    // 获取简历详情
    if (resume.id) {
      try {
        await resumeStore.fetchResumeDetail(resume.id);

        // 如果没有用户信息，获取用户信息
        if (!studentStore.profile) {
          await studentStore.fetchProfile();
        }

        // 准备导出数据
        if (resumeStore.currentResume && studentStore.profile) {
          // 合并简历数据和用户信息
          Object.assign(exportResumeData, {
            name: studentStore.profile.username || '',
            phone: studentStore.profile.phone || '',
            email: studentStore.profile.email || '',
            location: studentStore.profile.location || '',
            school: studentStore.profile.school || '',
            major: studentStore.profile.major || '',
            education: studentStore.profile.education || '',
            grade: studentStore.profile.grade || '',
            bio: resumeStore.currentResume.bio || (studentStore.profile as any).bio || '',
            skills: resumeStore.currentResume.skills || studentStore.profile.skills || [],
            education_experiences: resumeStore.currentResume.education_experiences || (studentStore.profile as any).education_experiences || [],
            work_experiences: resumeStore.currentResume.work_experiences || (studentStore.profile as any).work_experiences || [],
            expected_salary: resumeStore.currentResume.expected_salary || studentStore.profile.expected_salary || '',
            expected_location: resumeStore.currentResume.expected_location || studentStore.profile.expected_location || ''
          });
        }

        // 显示导出对话框
        exportDialogVisible.value = true;
      } catch (error) {
        console.error('Failed to fetch resume details:', error);
        ElMessage.error('获取简历详情失败');
      }
    }
  }
};

// 确认导出
const confirmExport = async () => {
  if (!resumeExportRef.value) {
    ElMessage.error('导出组件未初始化');
    return;
  }

  try {
    exporting.value = true;

    // 调用导出组件的导出方法
    await resumeExportRef.value.exportResume();

    // 关闭对话框
    exportDialogVisible.value = false;
    ElMessage.success('简历导出成功');
  } catch (error) {
    console.error('Failed to export resume:', error);
    ElMessage.error('简历导出失败，请重试');
  } finally {
    exporting.value = false;
  }
};

// Handle successful upload from ResumeUploader component
const handleUploadSuccess = (response: any) => { // Argument type depends on uploader implementation
    ElMessage.success('简历上传成功');
    dialogVisible.value = false;
    fetchResumes(); // Refresh the list
    // Optionally pass the title if the uploader doesn't handle it
    // resumeStore.updateResume(response.id, { title: newResumeTitle.value });
};

const handleSubmitResume = async () => {
  if (currentResumeId.value && editResumeTitle.value.trim()) {
    // Editing existing resume title
    console.log(`Updating resume ${currentResumeId.value} with title: ${editResumeTitle.value}`);
    try {
        await resumeStore.updateResume(currentResumeId.value, { title: editResumeTitle.value });
        // Success message handled in store action? Or show here:
        ElMessage.success('简历信息更新成功');
        dialogVisible.value = false;
        // List should update automatically if store is reactive, otherwise call fetchResumes()
    } catch (error) {
        // Error message handled in store action? Or show here:
        // ElMessage.error('更新失败');
    }
  } else if (currentResumeId.value) {
      ElMessage.warning('简历标题不能为空');
  } else {
      // Upload case is handled by ResumeUploader's success event
      // If ResumeUploader requires manual triggering:
      // uploaderRef.value?.submit(); // Assuming uploader has a submit method
      console.warn('handleSubmitResume called in upload mode - should be handled by uploader event.');
  }
};

const closeDialog = () => {
    dialogVisible.value = false;
    // Optionally clear uploader state
    // uploaderRef.value?.clearFiles();
}

// 创建新简历
const createNewResume = () => {
    router.push('/student/resume/new/edit');
};

</script>

<style scoped>
.resume-manage-page {
  padding: 20px;
}

/* 暂时移除空的.page-card样式，需要时再添加 */

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.resume-card {
  margin-bottom: 20px;
  height: 100%; /* Make cards in a row equal height */
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.resume-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--el-box-shadow-lighter);
}

.resume-card :deep(.el-card__body) {
  flex-grow: 1; /* Allow body to grow */
}

.resume-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resume-title {
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 10px; /* Space before tag */
}

.resume-meta p {
  font-size: 0.9em;
  color: #606266;
  margin: 5px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resume-actions {
  display: flex;
  justify-content: space-around; /* Distribute buttons evenly */
  align-items: center;
  flex-wrap: wrap; /* Wrap buttons if needed */
  gap: 5px; /* Spacing between buttons */
}

.resume-actions .el-button {
  padding: 0 5px; /* Adjust padding for link buttons */
}

/* 移动端显示/隐藏类 */
.show-on-mobile {
  display: none;
}

/* 移动端适配 */
@media (max-width: 576px) {
  .resume-manage-page {
    padding: 10px;
  }

  .card-header {
    flex-wrap: wrap;
    gap: 10px;
  }

  .header-actions {
    display: flex;
    gap: 5px;
    margin-left: auto;
  }

  .resume-card {
    margin-bottom: 15px;
  }

  .resume-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .resume-title {
    margin-right: 0;
    margin-bottom: 5px;
  }

  .resume-actions {
    justify-content: flex-start;
    padding: 5px 0;
  }

  /* 调整对话框宽度 */
  :deep(.el-dialog) {
    width: 90% !important;
    max-width: 600px;
  }
}

/* 平板设备适配 */
@media (min-width: 577px) and (max-width: 992px) {
  .resume-card-header {
    flex-wrap: wrap;
  }

  .resume-title {
    width: 100%;
    margin-bottom: 5px;
  }
}

/* 导出对话框样式 */
.export-dialog-content {
  padding: 10px 0;
}

.export-options {
  margin: 15px 0;
}

.hide-on-mobile {
  display: inline;
}

@media (max-width: 576px) {
  .hide-on-mobile {
    display: none;
  }

  .show-on-mobile {
    display: inline;
  }
}
</style>