<template>
  <div class="user-avatar-container">
    <el-upload
      v-if="editable"
      class="avatar-uploader"
      action="#"
      :show-file-list="false"
      :before-upload="beforeAvatarUpload"
      :http-request="handleUpload"
      :disabled="uploading"
    >
      <el-tooltip content="点击更换头像" placement="top">
         <el-avatar :size="size" :src="imageUrl || defaultAvatar" :shape="shape">
            <el-icon v-if="uploading"><Loading /></el-icon>
         </el-avatar>
      </el-tooltip>
       <div v-if="uploading" class="upload-overlay">
         <el-progress type="circle" :percentage="uploadProgress" :width="size * 0.8" />
       </div>
    </el-upload>
    <el-avatar v-else :size="size" :src="imageUrl || defaultAvatar" :shape="shape" />

    <!-- Display error message -->
    <div v-if="uploadError" class="el-upload__tip error-tip">
      {{ uploadError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadProps, UploadRequestOptions } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { DEFAULT_AVATAR } from '@/utils/defaultImages';
// TODO: Import your actual API function for uploading avatar
// import { uploadAvatarApi } from '@/api/user';

const props = defineProps({
  imageUrl: {
    type: String,
    default: '',
  },
  editable: {
    type: Boolean,
    default: false, // Whether the avatar can be uploaded/changed
  },
  size: {
    type: Number,
    default: 100, // Default avatar size
  },
  shape: {
      type: String as () => 'circle' | 'square',
      default: 'circle',
  },
  maxSizeMb: {
    type: Number,
    default: 2, // Max file size in MB
  },
  allowedTypes: {
      type: Array as () => string[],
      default: () => ['image/jpeg', 'image/png', 'image/gif'] // Allowed mime types
  }
});

const emit = defineEmits(['upload-success']); // Emit event on successful upload

const defaultAvatar = ref(DEFAULT_AVATAR);
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadError = ref('');

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  uploadError.value = ''; // Clear previous error
  if (!props.allowedTypes.includes(rawFile.type)) {
    const errorMsg = `头像图片必须是 ${props.allowedTypes.join('/')} 格式!`;
    ElMessage.error(errorMsg);
    uploadError.value = errorMsg;
    return false;
  }
  if (rawFile.size / 1024 / 1024 > props.maxSizeMb) {
    const errorMsg = `头像图片大小不能超过 ${props.maxSizeMb}MB!`;
    ElMessage.error(errorMsg);
    uploadError.value = errorMsg;
    return false;
  }
  return true;
};

// Custom upload handler - replace with your API call
const handleUpload = async (options: UploadRequestOptions) => {
  uploading.value = true;
  uploadProgress.value = 0;
  uploadError.value = '';
  const file = options.file;
  const formData = new FormData();
  formData.append('avatarFile', file); // Adjust field name based on your API

  try {
    // --- Replace with your actual API upload call ---
    console.warn('Using mock avatar upload. Replace with actual API call.');
    // Example structure:
    // const response = await uploadAvatarApi(formData, {
    //   onUploadProgress: (progressEvent) => {
    //     if (progressEvent.total) {
    //         uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    //     }
    //   }
    // });
    // const newImageUrl = response.data.url; // Assuming API returns the new URL

    // Mock Upload Simulation
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000)); // Simulate network delay
    uploadProgress.value = 100;
    const mockImageUrl = URL.createObjectURL(file); // Use local URL for mock display
    // --- End Mock ---

    ElMessage.success('头像上传成功!');
    emit('upload-success', mockImageUrl); // Emit the new image URL
  } catch (error: any) {
    console.error('Avatar upload failed:', error);
    const errorMsg = error?.response?.data?.message || '头像上传失败';
    ElMessage.error(errorMsg);
    uploadError.value = errorMsg;
  } finally {
    uploading.value = false;
  }
};

</script>

<style scoped>
.user-avatar-container {
  display: inline-block; /* Allows positioning */
  position: relative;
}

.avatar-uploader :deep(.el-upload) { /* Deep selector to target internal element */
  border: 1px dashed var(--el-border-color-darker);
  border-radius: 50%; /* Ensure border matches shape */
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

/* Style for square shape */
.avatar-uploader[shape="square"] :deep(.el-upload) {
    border-radius: 6px;
}

.avatar-uploader .el-avatar {
  display: block; /* Prevent extra space below avatar inside uploader */
}

.upload-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%; /* Match avatar shape */
    z-index: 1;
}

.upload-overlay[shape="square"] {
    border-radius: 6px; /* Match avatar shape */
}


/* Use deep selector for progress text color if needed */
.upload-overlay :deep(.el-progress__text) {
    color: #fff;
}

.error-tip {
    color: var(--el-color-danger);
    font-size: 12px;
    margin-top: 5px;
    text-align: center;
}
</style>