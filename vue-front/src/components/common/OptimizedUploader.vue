<template>
  <div class="optimized-uploader">
    <!-- 上传组件 -->
    <el-upload
      :action="action"
      :auto-upload="autoUpload"
      :accept="accept"
      :multiple="multiple"
      :limit="limit"
      :file-list="fileList"
      :list-type="listType"
      :disabled="disabled"
      :drag="drag"
      :http-request="customUpload"
      :before-upload="beforeUpload"
      :on-exceed="onExceed"
      :on-remove="handleRemove"
      :on-preview="onPreview"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :class="{ 'is-optimizing': optimizing }"
    >
      <!-- 拖拽区域插槽 -->
      <template #trigger>
        <slot name="trigger"></slot>
      </template>

      <!-- 默认插槽 -->
      <template #default>
        <slot>
          <div v-if="drag" class="el-upload-dragger">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <div v-if="optimizing" class="optimizing-indicator">
              <el-icon class="rotating"><loading /></el-icon>
              <span>正在优化图片...</span>
            </div>
          </div>
          <el-button v-else type="primary">点击上传</el-button>
        </slot>
      </template>

      <!-- 文件列表插槽 -->
      <template #file="{ file }">
        <slot name="file" :file="file"></slot>
      </template>

      <!-- 提示插槽 -->
      <template #tip>
        <slot name="tip">
          <div v-if="showTip" class="el-upload__tip">
            {{ tipText }}
          </div>
        </slot>
      </template>
    </el-upload>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="50%">
      <img v-if="previewUrl" :src="previewUrl" class="preview-image" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled, Loading } from '@element-plus/icons-vue';
import { compressImage } from '@/utils/imageUtils';
import { convertToWebP, isWebPSupported } from '@/utils/webpConverter';
import type { UploadFile, UploadUserFile, UploadRequestOptions, UploadProgressEvent } from 'element-plus';

// 自定义 UploadAjaxError 类型
interface UploadAjaxError extends Error {
  status: number;
  method: string;
  url: string;
}

// 定义组件属性
const props = defineProps({
  // 上传地址
  action: {
    type: String,
    default: ''
  },
  // 是否自动上传
  autoUpload: {
    type: Boolean,
    default: true
  },
  // 接受的文件类型
  accept: {
    type: String,
    default: 'image/*'
  },
  // 是否支持多选
  multiple: {
    type: Boolean,
    default: false
  },
  // 最大上传数量
  limit: {
    type: Number,
    default: 1
  },
  // 列表类型
  listType: {
    type: String,
    default: 'picture-card'
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否启用拖拽上传
  drag: {
    type: Boolean,
    default: false
  },
  // 是否显示提示
  showTip: {
    type: Boolean,
    default: true
  },
  // 提示文本
  tipText: {
    type: String,
    default: '支持JPG、PNG、GIF等格式，单个文件不超过5MB'
  },
  // 是否启用WebP转换
  enableWebP: {
    type: Boolean,
    default: true
  },
  // 是否启用图片压缩
  enableCompression: {
    type: Boolean,
    default: true
  },
  // 最大宽度
  maxWidth: {
    type: Number,
    default: 1200
  },
  // 最大高度
  maxHeight: {
    type: Number,
    default: 1200
  },
  // 压缩质量
  quality: {
    type: Number,
    default: 0.8
  },
  // 最大文件大小(MB)
  maxSize: {
    type: Number,
    default: 5
  },
  // 初始文件列表
  initialFileList: {
    type: Array as () => UploadUserFile[],
    default: () => []
  }
});

// 定义事件
const emit = defineEmits([
  'update:fileList',
  'success',
  'error',
  'exceed',
  'remove',
  'preview',
  'progress',
  'change'
]);

// 状态
const fileList = ref<UploadUserFile[]>([...props.initialFileList]);
const optimizing = ref(false);
const previewVisible = ref(false);
const previewUrl = ref('');
const webpSupported = ref(false);

// 检查WebP支持
const checkWebPSupport = async () => {
  webpSupported.value = await isWebPSupported();
};

// 上传前处理
const beforeUpload = async (file: UploadUserFile) => {
  // 将 UploadUserFile 转换为 File 类型
  const fileObj = file as unknown as File;

  // 检查文件类型
  if (fileObj.type && !fileObj.type.startsWith('image/') && props.accept === 'image/*') {
    ElMessage.error('只能上传图片文件!');
    return false;
  }

  // 检查文件大小
  if (fileObj.size !== undefined) {
    const isLessThanLimit = fileObj.size / 1024 / 1024 < props.maxSize;
    if (!isLessThanLimit) {
      ElMessage.error(`文件大小不能超过 ${props.maxSize}MB!`);
      return false;
    }
  }

  // 如果不需要优化，直接返回
  if (!props.enableCompression && !props.enableWebP) {
    return true;
  }

  try {
    optimizing.value = true;

    let processedFile: File = file as File;

    // 压缩图片
    if (props.enableCompression && fileObj.type && fileObj.type.startsWith('image/') && fileObj.type !== 'image/svg+xml') {
      processedFile = await compressImage(
        processedFile,
        props.maxWidth,
        props.maxHeight,
        props.quality
      ) as File;
    }

    // 转换为WebP
    if (props.enableWebP && webpSupported.value && fileObj.type && fileObj.type.startsWith('image/') && fileObj.type !== 'image/webp' && fileObj.type !== 'image/svg+xml') {
      processedFile = await convertToWebP(processedFile, props.quality);
    }

    optimizing.value = false;

    // 返回处理后的文件
    return processedFile;
  } catch (error) {
    optimizing.value = false;
    console.error('图片处理失败:', error);
    ElMessage.error('图片处理失败，请重试');
    return false;
  }
};

// 自定义上传
const customUpload = async (options: UploadRequestOptions) => {
  const { file, onProgress, onSuccess, onError } = options;

  // 如果没有设置action，则不进行实际上传
  if (!props.action) {
    // 模拟上传成功
    setTimeout(() => {
      onSuccess?.({ url: URL.createObjectURL(file) });
    }, 300);
    return;
  }

  try {
    // 创建FormData
    const formData = new FormData();
    formData.append('file', file);

    // 创建XHR
    const xhr = new XMLHttpRequest();
    xhr.open('POST', props.action, true);

    // 上传进度
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded * 100) / e.total);
        // 创建一个符合 UploadProgressEvent 接口的对象
        const progressEvent = e as UploadProgressEvent;
        progressEvent.percent = percent;
        onProgress?.(progressEvent);
      }
    });

    // 上传完成
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          onSuccess?.(response);
        } catch (error) {
          onSuccess?.({ url: URL.createObjectURL(file) });
        }
      } else {
        // 创建一个符合 UploadAjaxError 接口的对象
        const error = new Error(xhr.statusText) as UploadAjaxError;
        error.name = 'UploadError';
        error.status = xhr.status;
        error.method = 'POST';
        error.url = props.action || '';
        onError?.(error);
      }
    };

    // 上传错误
    xhr.onerror = () => {
      // 创建一个符合 UploadAjaxError 接口的对象
      const error = new Error('上传失败') as UploadAjaxError;
      error.name = 'UploadError';
      error.status = xhr.status;
      error.method = 'POST';
      error.url = props.action || '';
      onError?.(error);
    };

    // 发送请求
    xhr.send(formData);
  } catch (err) {
    // 创建一个符合 UploadAjaxError 接口的对象
    const uploadError = new Error('上传失败') as any;
    uploadError.name = 'UploadError';
    uploadError.status = 0;
    uploadError.method = 'POST';
    uploadError.url = props.action || '';
    onError?.(uploadError);
  }
};

// 超出限制
const onExceed = (files: File[]) => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`);
  emit('exceed', files);
};

// 移除文件
const handleRemove = (file: UploadFile, fileList: UploadFile[]) => {
  emit('remove', file, fileList);
  emit('update:fileList', fileList);
  emit('change', fileList);
};

// 预览文件
const onPreview = (file: UploadFile) => {
  previewUrl.value = file.url || '';
  previewVisible.value = true;
  emit('preview', file);
};

// 上传成功
const handleSuccess = (response: any, file: UploadFile, fileList: UploadFile[]) => {
  emit('success', response, file, fileList);
  emit('update:fileList', fileList);
  emit('change', fileList);
};

// 上传失败
const handleError = (error: Error, file: UploadFile, fileList: UploadFile[]) => {
  ElMessage.error('上传失败');
  emit('error', error, file, fileList);
  emit('update:fileList', fileList);
  emit('change', fileList);
};

// 上传进度
const handleProgress = (event: any, file: UploadFile, fileList: UploadFile[]) => {
  emit('progress', event, file, fileList);
};

// 监听初始文件列表变化
watch(() => props.initialFileList, (newVal) => {
  fileList.value = [...newVal];
}, { deep: true });

// 组件挂载时
checkWebPSupport();
</script>

<style scoped>
.optimized-uploader {
  width: 100%;
}

.preview-image {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.optimizing-indicator {
  margin-top: 10px;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rotating {
  animation: rotate 1s linear infinite;
  margin-right: 5px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.is-optimizing {
  opacity: 0.7;
  pointer-events: none;
}
</style>
