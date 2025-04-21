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
import { ref, defineProps, defineEmits } from 'vue';
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
  
  // 创建预览URL
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    emit('update:modelValue', result);
    emit('upload', file); // 触发上传事件，传递文件对象
  };
  reader.readAsDataURL(file);
  
  // 重置文件输入，以便可以再次选择同一文件
  resetFileInput();
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
