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
      @change="handleInternalFileChange"
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
import type { UploadInstance, UploadProps, UploadUserFile, UploadRawFile, UploadRequestOptions, UploadFile, UploadFiles } from 'element-plus';
import { UploadFilled, Document, Close } from '@element-plus/icons-vue';
// Import your actual resume upload API function
import { uploadResumeFile } from '@/api/resume'; // Corrected import name
import { useUserStore } from '@/stores/user'; // For getting token

const props = defineProps({
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

const emit = defineEmits(['upload-success', 'upload-error', 'remove']);

const userStore = useUserStore();
const uploadRef = ref<UploadInstance>();
const uploading = ref(false);
const internalFileList = ref<UploadUserFile[]>([]); // 内部状态，不再依赖 prop

// 添加 @change 事件处理器
const handleInternalFileChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log('handleInternalFileChange triggered. Updating internalFileList.');
  internalFileList.value = uploadFiles;
};

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
  // --- BEGIN EDIT ---
  // 增加对 response 和其核心字段的检查，防止无效调用导致错误
  // 如果 response 不存在，或者 code 不是 200，或者 data 不存在，则直接返回
  if (!response || response.code !== 200 || response.data === undefined || response.data === null) {
    // 可以在这里添加一个静默的日志，用于调试为什么会被无效调用
    // console.warn('handleSuccess called with invalid response:', response);
    // 如果第二次调用时 response 是 undefined，可能不需要重置 uploading 状态
    // uploading.value = false; // 可能需要根据情况决定是否在这里设置
    return; // 直接退出，不处理无效的调用
  }
  // --- END EDIT ---

  // Log 1: 'response' is likely the backend Result object { code, message, data }
  console.log("handleSuccess triggered. response (expected backend Result):", response);
  uploading.value = false;
  // ElMessage.success('简历上传成功'); // 移动到条件判断成功之后

  // Log 3: 直接检查 response 的属性 (此处的 if 检查在上面的防御性检查后实际已冗余，但保留也无妨)
  console.log("handleSuccess: Checking condition (response && response.code === 200 && response.data)");
  if (response && response.code === 200 && response.data) {
    ElMessage.success('简历上传成功'); // 在确认后端成功后再提示
    console.log("handleSuccess: Condition met. response:", response); // Log 4
    const backendData = response.data; // 获取 Result 对象中的 data 字段
    console.log("handleSuccess: backendData (response.data):", backendData); // Log 5
    emit('upload-success', backendData, uploadFile);

    console.log("handleSuccess: Finding file index. internalFileList:", internalFileList.value, "uploadFile:", uploadFile); // Log 6
    const fileIndex = internalFileList.value.findIndex(f => f.uid === uploadFile.uid);
    console.log("handleSuccess: fileIndex:", fileIndex); // Log 7

    if (fileIndex > -1) {
        console.log("handleSuccess: Updating file in internalFileList."); // Log 8
        internalFileList.value[fileIndex].status = 'success';
        // 保存后端返回的 Result 对象作为响应
        internalFileList.value[fileIndex].response = response; 
        // 从 backendData 中读取 fileUrl
        internalFileList.value[fileIndex].url = backendData.fileUrl || uploadFile.url;
        console.log("handleSuccess: File updated:", internalFileList.value[fileIndex]); // Log 9
    } else {
      console.log("handleSuccess: File not found in internalFileList for update."); // Log 10
    }
  } else {
      console.error("handleSuccess: Condition not met or backend error. response:", response); // Log 11
      const errorMessage = response?.message || '上传失败或响应数据格式不正确';
      ElMessage.error(errorMessage);
      emit('upload-error', new Error(errorMessage), uploadFile);
      // 尝试更新文件状态为失败
      const fileIndex = internalFileList.value.findIndex(f => f.uid === uploadFile.uid);
        if (fileIndex > -1) {
            internalFileList.value[fileIndex].status = 'fail';
        }
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
  // ---- 保持注释掉，让 API 函数处理 FormData ----
  // const formData = new FormData();
  // formData.append('file', file);
  // ---- 保持注释掉 ----

  uploading.value = true; 
  // ---- 移除手动设置状态和进度的逻辑 START ----
  // internalFile.status = 'uploading';
  // internalFile.percentage = 0; // Initialize percentage
  // ---- 移除手动设置状态和进度的逻辑 END ----

  try {
    // --- 调用实际 API，直接传递 File 对象 ---
    const response = await uploadResumeFile(file as File); // 传递 File 对象，类型匹配
    
    // ---- 调用 el-upload 的 onSuccess 回调 ----
    onSuccess(response); 

  } catch (error: any) {
    console.error('Actual resume upload failed:', error);
    // ---- 调用 el-upload 的 onError 回调 ----
    onError(error);

  } finally {
      uploading.value = false;
      // 进度条和最终状态让 el-upload 通过 onSuccess/onError 处理
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