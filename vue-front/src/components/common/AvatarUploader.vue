<template>
  <div class="avatar-uploader">
    <div class="avatar-container" @click="triggerUpload" :class="{ 'is-disabled': disabled }">
      <img v-if="modelValue" :src="modelValue" class="avatar-image" alt="用户头像" />
      <div v-else class="avatar-placeholder">
        <el-icon><UserFilled /></el-icon>
      </div>
      <div v-if="!disabled" class="avatar-overlay">
        <el-icon><Camera /></el-icon>
        <span>更换头像</span>
      </div>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="file-input"
      @change="handleFileChange"
    />
    <div class="avatar-tip" v-if="!disabled">
      点击头像上传，支持JPG、PNG格式，大小不超过2MB
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UserFilled, Camera } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'upload']);

const fileInput = ref<HTMLInputElement | null>(null);

// 触发文件选择
const triggerUpload = () => {
  if (props.disabled) return;
  fileInput.value?.click();
};

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // 验证文件类型
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    ElMessage.error('只支持JPG和PNG格式的图片');
    resetFileInput();
    return;
  }

  // 验证文件大小（2MB）
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过2MB');
    resetFileInput();
    return;
  }

  // 压缩图片
  compressImage(file).then(compressedDataUrl => {
    // 更新模型值
    emit('update:modelValue', compressedDataUrl);

    // 从DataURL创建Blob对象
    const blob = dataURLtoBlob(compressedDataUrl);
    const compressedFile = new File([blob], file.name, { type: file.type });

    // 触发上传事件，传递压缩后的文件对象
    emit('upload', compressedFile);
  }).catch(error => {
    console.error('图片压缩失败:', error);
    ElMessage.error('图片处理失败，请重试');
  });

  // 重置文件输入，以便可以再次选择同一文件
  resetFileInput();
};

// 压缩图片
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 计算压缩后的尺寸，最大宽高为200px
        let width = img.width;
        let height = img.height;
        const maxSize = 200;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        // 创建Canvas并绘制压缩后的图片
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('无法创建Canvas上下文'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // 转换为DataURL，使用较低的质量
        const quality = 0.7; // 70%质量，可以根据需要调整
        const dataUrl = canvas.toDataURL(file.type, quality);

        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsDataURL(file);
  });
};

// 将DataURL转换为Blob对象
const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
};

// 重置文件输入
const resetFileInput = () => {
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};
</script>

<style scoped>
.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  background-color: #f5f7fa;
  cursor: pointer;
  border: 2px solid #dcdfe6;
  transition: all 0.3s;
}

.avatar-container:hover {
  border-color: #409EFF;
}

.avatar-container.is-disabled {
  cursor: default;
  opacity: 0.7;
}

.avatar-container.is-disabled:hover {
  border-color: #dcdfe6;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
}

.avatar-placeholder .el-icon {
  font-size: 40px;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .el-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.avatar-overlay span {
  font-size: 12px;
}

.file-input {
  display: none;
}

.avatar-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
  text-align: center;
  max-width: 200px;
}
</style>
