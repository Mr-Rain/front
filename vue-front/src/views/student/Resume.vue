<template>
  <div class="resume-manage-page" v-loading="resumeStore.loadingList">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="card-header">
          <span>我的简历</span>
          <el-button type="primary" :icon="UploadFilled" @click="handleUploadResume">上传新简历</el-button>
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
                   <el-button type="primary" link size="small" @click="handleSetDefault(resume.id)" :disabled="resume.is_default">设为默认</el-button>
                   <el-button link size="small" @click="handlePreview(resume)">预览</el-button> 
                   <el-button link size="small" @click="handleEdit(resume.id)">编辑</el-button>
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

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useResumeStore } from '@/stores/resume';
import type { ResumeInfo } from '@/types/resume'; // Assuming types/resume.d.ts exists
import { ElCard, ElButton, ElEmpty, ElRow, ElCol, ElTag, ElPopconfirm, ElDialog, ElMessage, ElInput, ElForm, ElFormItem } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import ResumeUploader from '@/components/common/ResumeUploader.vue'; // Import the uploader component

const resumeStore = useResumeStore();

const dialogVisible = ref(false);
const dialogTitle = ref('上传简历');
const currentResumeId = ref<string | number | null>(null);
const editResumeTitle = ref(''); // Title for editing
const newResumeTitle = ref(''); // Optional title for new upload
const uploaderRef = ref<InstanceType<typeof ResumeUploader>>(); // Ref for uploader component

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
  const resume = resumeStore.resumeList.find(r => r.id === id);
  if (resume) {
    dialogTitle.value = '编辑简历信息';
    currentResumeId.value = id;
    editResumeTitle.value = resume.title || ''; // Populate edit title
    newResumeTitle.value = ''; // Clear new title
    dialogVisible.value = true;
  } else {
    ElMessage.error('找不到要编辑的简历信息');
  }
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
        window.open(resume.file_url, '_blank');
    } else {
        ElMessage.warning('该简历没有可预览的文件链接');
    }
    // Or implement an inline previewer
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

</script>

<style scoped>
.resume-manage-page {
  padding: 20px;
}

.page-card {
  /* Styles for the main card */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resume-card {
  margin-bottom: 20px;
  height: 100%; /* Make cards in a row equal height */
  display: flex;
  flex-direction: column;
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


</style> 