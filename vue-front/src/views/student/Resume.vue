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
            <el-button type="info" :icon="Download" @click="handleExportDefaultTemplate">
              <span class="hide-on-mobile">导出默认模板</span>
              <span class="show-on-mobile">导出模板</span>
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
                  <el-tag v-if="resume.isDefault" type="success" size="small">默认</el-tag>
                </div>
              </template>
              <div class="resume-meta">
                <!-- 根据简历类型显示不同信息 -->
                <template v-if="resume.fileName"> <!-- 附件简历 -->
                  <p>文件名: {{ resume.fileName }}</p>
                  <p>上传时间: {{ formatTime(resume.uploadTime) }}</p>
                </template>
                <template v-else> <!-- 在线简历 -->
                  <p v-if="resume.name">姓名: {{ resume.name }}</p>
                  <p v-else>类型: 在线简历</p> <!-- 如果连姓名都没有，显示类型 -->
                  <p v-if="resume.updateTime">更新时间: {{ formatTime(resume.updateTime) }}</p>
                  <p v-else-if="resume.createTime">创建时间: {{ formatTime(resume.createTime) }}</p>
                </template>
                <!-- Add more details like file size if available -->
              </div>
              <template #footer>
                 <div class="resume-actions">
                   <el-button type="primary" link size="small" @click="handleSetDefault(resume.id)" :disabled="resume.isDefault">
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
import { ElCard, ElButton, ElEmpty, ElRow, ElCol, ElTag, ElPopconfirm, ElDialog, ElMessage, ElInput, ElForm, ElFormItem, ElRadioGroup, ElRadio, type UploadUserFile } from 'element-plus';
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
  // location: '', // 学生地址不一定在简历中，考虑从studentStore获取
  // school: '', // 学生学校不一定在简历中
  // major: '', // 学生专业不一定在简历中
  // education: '', // 学历应在 educationList 中
  // grade: '', // 年级不一定在简历中
  bio: '', // 个人简介
  skills: [] as string[], // 技能标签
  educationList: [] as any[], // 教育经历
  workList: [] as any[], // 工作经历
  projectList: [] as any[], // 项目经历
  skillsDescription: '', // 技能描述
  selfEvaluation: '', // 自我评价
  expectedSalary: '', // 期望薪资
  expectedLocation: '' // 期望地点
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

  // 1. 处理在线简历预览
  if (!resume.fileName && resume.id) { // 假设在线简历没有 fileName 但有 id
    console.log("Navigating to online resume preview page:", `/student/resume/${resume.id}/preview`);
    router.push(`/student/resume/${resume.id}/preview`);
    return;
  }

  // 2. 处理附件简历预览
  if (resume.fileName) {
    const lowerFileName = resume.fileName.toLowerCase();
    const fileExtension = lowerFileName.split('.').pop();

    // 尝试获取公开可访问的 URL (重要假设: resume.fileUrl 是公开链接)
    const publicFileUrl = resume.fileUrl; // 如果 fileUrl 不是公开链接，需要修改这里

    if (!publicFileUrl) {
        ElMessage.error('无法获取简历文件的有效链接进行预览。');
        return;
    }

    if (fileExtension === 'pdf') {
      // PDF 使用后端接口（如果需要认证）或直接用 fileUrl
      // 这里我们假设如果 fileUrl 有，可以直接预览
      console.log("Opening PDF preview URL:", publicFileUrl);
      window.open(publicFileUrl, '_blank');
    } else {
      // 非 PDF 文件，仅提示用户
      console.log(`Preview not supported for .${fileExtension}, showing message.`);
      ElMessage.info('该文件暂不支持预览，请下载到本地后打开');
    }
    return;
  }

  // 如果既不是在线简历，也没有文件名，则无法处理
  console.error("Cannot preview resume: Unknown type or missing information.", resume);
  ElMessage.error("无法预览此简历，信息不完整。");
};

// 处理导出简历 (修改以直接下载附件简历)
const handleExport = async (resume: ResumeInfo) => {
  selectedResume.value = resume;
  exporting.value = true; // 开始导出状态

  try {
    // 1. 判断简历类型
    // @ts-ignore
    if (resume.fileName || (resume.fileBucket && resume.filePath)) { // 附件简历
      ElMessage.info('正在准备下载附件简历...');
      let downloadUrl = resume.fileUrl;
      // @ts-ignore
      if (!downloadUrl && resume.fileBucket && resume.filePath) {
        // @ts-ignore
        const bucket = encodeURIComponent(resume.fileBucket);
        // @ts-ignore
        const path = encodeURIComponent(resume.filePath);
        downloadUrl = `/api/files/download?bucket=${bucket}&path=${path}&disposition=attachment`;
      }

      if (downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = resume.fileName || 'resume_attachment'; // 使用原始文件名
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        ElMessage.success('附件简历下载已开始');
      } else {
        ElMessage.error('无法获取附件简历的下载链接');
      }
      exporting.value = false; // 附件下载结束
      return; // 直接下载，不再打开对话框
    }

    // --- 以下为在线简历的处理逻辑 ---
    ElMessage.info('正在准备导出在线简历...');

    // 2. 设置默认文件名 (在线简历)
    if (studentStore.profile) {
      exportFileName.value = `${studentStore.profile.username || 'resume'}_${resume.title || resume.id}_简历`;
    } else {
      exportFileName.value = `${resume.title || '简历'}_${resume.id}`;
    }

    // 3. 获取在线简历详情
    if (!resume.id) {
      ElMessage.error('在线简历缺少ID，无法导出');
      throw new Error('Missing resume ID for online export');
    }
    await resumeStore.fetchResumeDetail(resume.id);
    if (!resumeStore.currentResume) {
      ElMessage.error('获取简历详情失败，无法导出');
      throw new Error('Failed to fetch resume detail for export');
    }

    // 4. 填充导出数据
    Object.assign(exportResumeData, {
      name: resumeStore.currentResume.name,
      phone: resumeStore.currentResume.phone,
      email: resumeStore.currentResume.email,
      school: resumeStore.currentResume.studentSchool,
      major: resumeStore.currentResume.studentMajor,
      bio: resumeStore.currentResume.bio,
      skillsDescription: resumeStore.currentResume.skillsDescription,
      selfEvaluation: resumeStore.currentResume.selfEvaluation,
      educationList: resumeStore.currentResume.educationList,
      workList: resumeStore.currentResume.workList,
      projectList: resumeStore.currentResume.projectList,
      expectedSalary: resumeStore.currentResume.expectedSalary,
      expectedLocation: resumeStore.currentResume.expectedLocation
    });

    // 5. 打开导出对话框
    exportFormat.value = 'pdf'; // 默认 PDF
    exportDialogVisible.value = true;

  } catch (error) {
    console.error('处理导出请求失败:', error);
    // 具体错误已在前面步骤提示
  } finally {
    // exporting.value = false; // 在线简历导出状态由 confirmExport 控制
  }
};

// 确认导出 (在线简历)
const confirmExport = async () => {
  if (!resumeExportRef.value) {
    ElMessage.error('导出组件未初始化');
    return;
  }

  try {
    exporting.value = true;

    // 调用导出组件的导出方法
    await resumeExportRef.value?.exportResume();

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

// 处理导出默认模板 (修改为导出实际设置的默认简历)
const handleExportDefaultTemplate = async () => {
  // 1. 查找默认简历
  const defaultResume = resumeStore.resumeList.find(resume => resume.isDefault);

  if (!defaultResume) {
    ElMessage.warning('请先设置一份默认简历');
    return;
  }

  exporting.value = true; // 开始导出状态
  try {
    // 2. 判断简历类型并处理
    // @ts-ignore - 假设 ResumeInfo 可能有 fileBucket 和 filePath
    if (defaultResume.fileName || (defaultResume.fileBucket && defaultResume.filePath)) { // 认为是附件简历
      ElMessage.info('正在准备下载附件简历...');
      let downloadUrl = defaultResume.fileUrl; // 优先使用 fileUrl
      // 如果没有 fileUrl，尝试构造下载链接
      // @ts-ignore
      if (!downloadUrl && defaultResume.fileBucket && defaultResume.filePath) {
          // @ts-ignore
          const bucket = encodeURIComponent(defaultResume.fileBucket);
          // @ts-ignore
          const path = encodeURIComponent(defaultResume.filePath);
          // 构造指向后端文件下载接口的 URL (注意：需要后端支持 disposition=attachment)
          downloadUrl = `/api/files/download?bucket=${bucket}&path=${path}&disposition=attachment`;
      }

      if (downloadUrl) {
        console.log("Initiating download for attachment resume:", downloadUrl);
        // 使用 <a> 标签强制下载
        const link = document.createElement('a');
        link.href = downloadUrl;
        // 设置下载的文件名，优先使用简历本身的 fileName
        link.download = defaultResume.fileName || 'default_resume_attachment';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // 注意：附件简历导出状态可能无法精确跟踪，因为下载在浏览器中进行
        // 这里仅标记开始，并假设下载会成功
        ElMessage.success('附件简历下载已开始');
      } else {
        ElMessage.error('无法获取附件简历的下载链接');
      }
    } else if (defaultResume.id) { // 认为是在线简历
      ElMessage.info('正在准备导出在线简历...');
      // 3. 获取在线简历详情
      await resumeStore.fetchResumeDetail(defaultResume.id);

      if (!resumeStore.currentResume) {
        ElMessage.error('获取默认简历详情失败');
        throw new Error('Failed to fetch current resume detail');
      }

      // 4. 填充导出数据
      Object.assign(exportResumeData, {
        name: resumeStore.currentResume.name,
        phone: resumeStore.currentResume.phone,
        email: resumeStore.currentResume.email,
        school: resumeStore.currentResume.studentSchool,
        major: resumeStore.currentResume.studentMajor,
        bio: resumeStore.currentResume.bio,
        skillsDescription: resumeStore.currentResume.skillsDescription,
        selfEvaluation: resumeStore.currentResume.selfEvaluation,
        educationList: resumeStore.currentResume.educationList,
        workList: resumeStore.currentResume.workList,
        projectList: resumeStore.currentResume.projectList,
        expectedSalary: resumeStore.currentResume.expectedSalary,
        expectedLocation: resumeStore.currentResume.expectedLocation
        // skills 数组可能需要单独处理，如果它是从 skillsDescription 生成的
      });

      // 5. 设置文件名
      exportFileName.value = defaultResume.title || `${exportResumeData.name || 'resume'}_简历`;

      // 6. 触发导出
      if (!resumeExportRef.value) {
        ElMessage.error('导出组件未初始化');
        throw new Error('Export component not initialized');
      }
      await resumeExportRef.value.exportResume();
      ElMessage.success('默认简历导出成功');
    } else {
      ElMessage.error('无法确定默认简历的类型或缺少必要信息');
    }
  } catch (error) {
    console.error('Failed to export default resume:', error);
    // ElMessage.error('导出默认简历失败，请重试'); // 错误消息已在相应步骤中提示
  } finally {
    exporting.value = false; // 结束导出状态
  }
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