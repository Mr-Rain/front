<template>
  <div class="resume-uploader">
    <el-upload
      ref="uploadRef"
      :action="uploadUrl" 
      :headers="uploadHeaders"
      :before-upload="beforeResumeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :on-exceed="handleExceed"
      :file-list="internalFileList"
      :limit="limit"
      :accept="acceptedTypes.join(',')"
      :drag="drag"
      :disabled="disabled || uploading"
      :multiple="multiple"
      :auto-upload="autoUpload"
      :http-request="customHttpRequest" 
    >
      <template #trigger>
        <el-button type="primary" :loading="uploading" :disabled="disabled || uploading">
            <el-icon class="el-icon--left"><UploadFilled /></el-icon>
            {{ uploading ? '上传中...' : (drag ? '点击或拖拽上传' : '选择文件') }}
        </el-button>
      </template>

      <template v-if="!drag" #tip>
        <div class="el-upload__tip">
          {{ tipText }}
        </div>
      </template>

       <!-- Custom content for drag area -->
      <template v-if="drag" #default>
           <el-icon class="el-icon--upload"><upload-filled /></el-icon>
           <div class="el-upload__text">
             将文件拖到此处，或 <em>点击上传</em>
           </div>
           <div class="el-upload__tip">
                {{ tipText }}
           </div>
      </template>

      <!-- Custom file list rendering -->
      <template #file="{ file }">
         <div class="custom-file-item">
           <el-icon><Document /></el-icon>
           <span class="file-name">{{ file.name }}</span>
           <span class="file-status">({{ getStatusText(file.status) }})</span>
           <el-progress v-if="file.status === 'uploading' && file.percentage" :percentage="file.percentage" :stroke-width="2" :show-text="false" />
           <el-button type="danger" link :icon="Close" @click="handleRemove(file)" class="remove-btn"></el-button>
         </div>
      </template>

    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { PropType } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadInstance, UploadProps, UploadUserFile, UploadRawFile, UploadRequestOptions } from 'element-plus';
import { UploadFilled, Document, Close } from '@element-plus/icons-vue';
// Import your actual resume upload API function
import { uploadResumeFile } from '@/api/resume'; // Corrected import name
import { useUserStore } from '@/stores/user'; // For getting token

const props = defineProps({
  // Model binding for file list (if needed outside)
  modelValue: { 
    type: Array as PropType<UploadUserFile[]>,
    default: () => []
  },
  limit: {
    type: Number,
    default: 1,
  },
  maxSizeMb: {
    type: Number,
    default: 10, // Max resume size in MB
  },
  acceptedTypes: {
    type: Array as PropType<string[]>,
    default: () => ['.pdf', '.doc', '.docx', '.wps'], // Allowed extensions
  },
  drag: { // Whether to use drag and drop
    type: Boolean,
    default: false,
  },
  disabled: {
      type: Boolean,
      default: false,
  },
  multiple: {
      type: Boolean,
      default: false,
  },
  autoUpload: { // Automatically upload when file is selected
      type: Boolean,
      default: true,
  },
  // Optional: Pass API url directly or use customHttpRequest
  uploadUrl: {
      type: String,
      default: '/api/student/resumes/upload' // Mock URL, customHttpRequest is preferred
  }
});

const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error', 'remove']);

const userStore = useUserStore();
const uploadRef = ref<UploadInstance>();
const uploading = ref(false);
const internalFileList = ref<UploadUserFile[]>([]); // Internal state for file list

// Sync modelValue with internalFileList
watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(internalFileList.value)) {
      internalFileList.value = newVal;
  }
}, { deep: true, immediate: true });

watch(internalFileList, (newVal) => {
    emit('update:modelValue', newVal);
}, { deep: true });

// Computed header for authorization
const uploadHeaders = computed(() => ({
    Authorization: `Bearer ${userStore.token}`
}));

const tipText = computed(() => {
  return `请上传 ${props.acceptedTypes.join('/')} 格式文件，大小不超过 ${props.maxSizeMb}MB`;
});

const beforeResumeUpload: UploadProps['beforeUpload'] = (rawFile: UploadRawFile) => {
  const fileExtension = rawFile.name.substring(rawFile.name.lastIndexOf('.')).toLowerCase();
  const isValidType = props.acceptedTypes.includes(fileExtension);
  const isValidSize = rawFile.size / 1024 / 1024 < props.maxSizeMb;

  if (!isValidType) {
    ElMessage.error(`文件格式不正确！请上传 ${props.acceptedTypes.join('/')} 格式。`);
    return false;
  }
  if (!isValidSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSizeMb}MB!`);
    return false;
  }
  uploading.value = true; // Set uploading state early
  return true;
};

const handleSuccess: UploadProps['onSuccess'] = (response: any, uploadFile: UploadUserFile /*, uploadFiles: UploadUserFile[] */ ) => {
  uploading.value = false;
  ElMessage.success('简历上传成功');
  const uploadedFileInfo = response.data; // Assuming success response structure
  emit('upload-success', uploadedFileInfo, uploadFile);

  const fileIndex = internalFileList.value.findIndex(f => f.uid === uploadFile.uid);
  if (fileIndex > -1) {
      internalFileList.value[fileIndex].status = 'success';
      internalFileList.value[fileIndex].response = response;
      // Assign URL if returned by API and needed in file list
      internalFileList.value[fileIndex].url = uploadedFileInfo?.url || uploadFile.url;
  }
};

const handleError: UploadProps['onError'] = (error: Error, uploadFile: UploadUserFile /*, uploadFiles: UploadUserFile[] */) => {
  uploading.value = false;
  console.error('Resume upload failed:', error);
  let message = '简历上传失败';
  try {
      // Try to get message from a structured error response
      const errorData = (error as any).response?.data;
      if (errorData?.message) {
          message = errorData.message;
      } else {
          // Fallback for plain error messages or network errors
          message = error.message || message;
      }
  } catch (e) { /* Ignore potential parsing issues */ }
  ElMessage.error(message);
  emit('upload-error', error, uploadFile);

  const fileIndex = internalFileList.value.findIndex(f => f.uid === uploadFile.uid);
    if (fileIndex > -1) {
        internalFileList.value[fileIndex].status = 'fail';
    }
};

const handleProgress: UploadProps['onProgress'] = (event: any, uploadFile: UploadUserFile, uploadFiles: UploadUserFile[]) => {
  // Update percentage for the specific file
  const fileIndex = internalFileList.value.findIndex(f => f.uid === uploadFile.uid);
  if (fileIndex > -1) {
      internalFileList.value[fileIndex].percentage = event.percent;
      internalFileList.value[fileIndex].status = 'uploading'; // Ensure status is uploading
  }
};

const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
  ElMessage.warning(
    `当前限制选择 ${props.limit} 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + uploadFiles.length} 个文件`
  );
};

// Custom request function using your API util
const customHttpRequest = async (options: UploadRequestOptions) => {
  const { file, onSuccess, onError, onProgress } = options;
  const formData = new FormData();
  formData.append('file', file); // Adjust field name if needed by your API

  // Find the corresponding file in the internal list to update its progress/status
  const internalFile = internalFileList.value.find(f => f.uid === (file as any).uid);
  if (!internalFile) {
      console.error('Cannot find internal file state for UID:', (file as any).uid);
      onError(new Error('Internal file state error') as any);
      return; 
  }

  uploading.value = true; 
  internalFile.status = 'uploading';
  internalFile.percentage = 0; // Initialize percentage

  try {
    // --- Replace mock with actual API call --- 
    // Pass the File object directly, assuming API function handles FormData creation
    const response = await uploadResumeFile(file);
    // Pass the actual response data to el-upload's onSuccess handler
    onSuccess(response); 

  } catch (error: any) {
    console.error('Actual resume upload failed:', error);
    // Pass the error to el-upload's onError handler
    onError(error);

  } finally {
      // Ensure uploading state is reset even if API call fails early
      uploading.value = false;
      // Reset percentage on error (success status/percentage handled in onSuccess)
      // if (internalFile && internalFile.status !== 'success') {
      //      internalFile.percentage = undefined;
      // }
  }
};

// Handle removal from the internal list and emit event
const handleRemove = (file: UploadUserFile) => {
  const fileIndex = internalFileList.value.findIndex(f => f.uid === file.uid);
  if (fileIndex > -1) {
    internalFileList.value.splice(fileIndex, 1);
    emit('remove', file);
    // If the removed file was uploading, reset state
    if (file.status === 'uploading') {
        uploading.value = false;
    }
  }
};

// Helper to get status text
const getStatusText = (status: UploadUserFile['status']) => {
    switch(status) {
        case 'ready': return '准备就绪';
        case 'uploading': return '上传中';
        case 'success': return '成功';
        case 'fail': return '失败';
        default: return '';
    }
}

// Expose clearFiles method if needed
const clearFiles = () => {
  uploadRef.value?.clearFiles();
  internalFileList.value = [];
};

defineExpose({ clearFiles });

</script>

<style scoped>
.resume-uploader {
  width: 100%;
}

/* Style the drag area */
:deep(.el-upload-dragger) {
    padding: 20px;
    text-align: center;
}
:deep(.el-upload-dragger .el-icon--upload) {
    font-size: 50px;
    color: var(--el-color-primary);
    margin-bottom: 10px;
}
:deep(.el-upload-dragger .el-upload__text) {
    margin-bottom: 5px;
}
:deep(.el-upload-dragger .el-upload__tip) {
    font-size: 12px;
    color: #909399;
}


.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 7px;
}

.custom-file-item {
    display: flex;
    align-items: center;
    padding: 5px 0;
    font-size: 14px;
    color: #606266;
    width: 100%;
}

.custom-file-item .el-icon {
    margin-right: 8px;
    font-size: 16px;
}

.file-name {
    flex-grow: 1;
    margin-right: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.file-status {
    font-size: 12px;
    color: #909399;
    margin-right: 10px;
}

.custom-file-item .el-progress {
    width: 80px; /* Adjust width */
    margin-right: 10px;
}

.remove-btn {
    margin-left: auto;
    padding: 0 5px; /* Adjust padding */
}

</style> 