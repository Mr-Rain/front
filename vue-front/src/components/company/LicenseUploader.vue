<template>
  <div class="license-uploader">
    <el-upload
      class="license-upload"
      :action="action"
      :auto-upload="false"
      :show-file-list="true"
      :limit="1"
      :on-exceed="handleExceed"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :before-upload="beforeUpload"
      :disabled="disabled || uploading"
      :file-list="fileList"
      accept=".jpg,.jpeg,.png,.pdf"
    >
      <template #trigger>
        <el-button :disabled="disabled || uploading" type="primary">
          {{ buttonText }}
        </el-button>
      </template>

      <template #tip>
        <div class="el-upload__tip">
          {{ tipText }}
        </div>
      </template>
    </el-upload>

    <div v-if="previewUrl" class="license-preview">
      <div class="preview-header">
        <span>{{ previewTitle }}</span>
        <el-button v-if="!disabled" type="danger" size="small" @click="removeLicense" :disabled="uploading">
          删除
        </el-button>
      </div>
      <div class="preview-content">
        <template v-if="isPdf">
          <div class="pdf-preview">
            <el-button type="primary" size="small" @click="openPdf">查看PDF文件</el-button>
            <span class="file-name">{{ fileName }}</span>
          </div>
        </template>
        <template v-else>
          <el-image
            :src="previewUrl"
            fit="contain"
            :preview-src-list="[previewUrl]"
            class="preview-image"
          />
        </template>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="资质审核说明" width="500px">
      <div class="license-info">
        <p>企业资质审核是确保平台企业真实性和合法性的重要环节。请上传以下资质文件之一：</p>
        <ul>
          <li>营业执照（加盖公章）</li>
          <li>事业单位法人证书</li>
          <li>社会团体法人登记证书</li>
          <li>民办非企业单位登记证书</li>
        </ul>
        <p>要求：</p>
        <ul>
          <li>文件格式：JPG、JPEG、PNG或PDF</li>
          <li>文件大小：不超过10MB</li>
          <li>文件内容：证件信息清晰可见，与填写的企业信息一致</li>
        </ul>
        <p>审核流程：</p>
        <ol>
          <li>上传资质文件</li>
          <li>提交审核申请</li>
          <li>等待平台审核（1-3个工作日）</li>
          <li>审核通过后即可发布职位</li>
        </ol>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useCompanyStore } from '@/stores/company';
import { deleteFile, getPathFromUrl, getBucketFromUrl } from '@/api/file';
import type { UploadFile, UploadUserFile, UploadRequestOptions } from 'element-plus';

// 使用Vue的编译器宏defineProps，不需要导入
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  buttonText: {
    type: String,
    default: '上传营业执照'
  },
  tipText: {
    type: String,
    default: '支持JPG、PNG、PDF格式，文件大小不超过10MB'
  },
  previewTitle: {
    type: String,
    default: '已上传的营业执照'
  },
  fileName: {
    type: String,
    default: '营业执照.pdf'
  }
});

// 使用Vue的编译器宏defineEmits，不需要导入
const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error', 'remove']);

const companyStore = useCompanyStore();
const action = ''; // 实际上不会使用这个action，因为我们使用自定义上传
const uploading = ref(false);
const fileList = ref<UploadUserFile[]>([]);
const previewUrl = ref(props.modelValue || '');
const selectedFile = ref<File | null>(null);
const localObjectUrl = ref<string | null>(null);
const dialogVisible = ref(false);

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  if (!selectedFile.value) {
    previewUrl.value = newValue || '';
    if (localObjectUrl.value) {
      URL.revokeObjectURL(localObjectUrl.value);
      localObjectUrl.value = null;
    }
  }
  if (!newValue) {
    fileList.value = [];
  }
}, { immediate: true });

// 判断是否为PDF文件
const isPdf = computed(() => {
  return previewUrl.value?.toLowerCase().endsWith('.pdf');
});

// 处理文件超出限制
const handleExceed = () => {
  ElMessage.warning('只能上传一个文件');
};

// 处理文件变化
const handleChange = (file: UploadFile, currentFileList: UploadUserFile[]) => {
  if (localObjectUrl.value) {
    URL.revokeObjectURL(localObjectUrl.value);
    localObjectUrl.value = null;
  }

  if (file.status === 'ready') {
    if (beforeUpload(file.raw as File)) {
      selectedFile.value = file.raw as File;
      fileList.value = currentFileList;
      localObjectUrl.value = URL.createObjectURL(selectedFile.value);
      previewUrl.value = localObjectUrl.value;
      console.log('LicenseUploader: File selected and local preview generated:', previewUrl.value);
    } else {
      fileList.value = currentFileList.filter(f => f.uid !== file.uid);
      selectedFile.value = null;
    }
  }
};

// 处理文件移除
const handleRemove = (file: UploadFile, currentFileList: UploadUserFile[]) => {
  if (localObjectUrl.value) {
    URL.revokeObjectURL(localObjectUrl.value);
    localObjectUrl.value = null;
  }
  selectedFile.value = null;
  previewUrl.value = '';
  fileList.value = currentFileList;
  emit('remove');
};

// 上传前验证
const beforeUpload = (file: File): boolean => {
  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const isValidType = validTypes.includes(file.type);
  if (!isValidType) {
    ElMessage.error('只支持JPG、PNG和PDF格式的文件');
    return false;
  }

  // 验证文件大小（10MB）
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB');
    return false;
  }

  return true;
};

// 移除已上传的执照
const removeLicense = async () => {
  // 如果是本地预览的文件，直接清除
  if (localObjectUrl.value) {
    URL.revokeObjectURL(localObjectUrl.value);
    localObjectUrl.value = null;
    selectedFile.value = null;
    previewUrl.value = '';
    fileList.value = [];
    emit('remove');
    return;
  }

  // 如果是已上传到服务器的文件，需要确认是否删除
  if (props.modelValue) {
    try {
      await ElMessageBox.confirm(
        '确定要删除已上传的营业执照吗？此操作需要点击保存按钮后才会生效。',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );

      // 用户确认删除，清除本地状态
      selectedFile.value = null;
      previewUrl.value = '';
      fileList.value = [];

      // 发出删除事件，让父组件知道文件已被删除
      emit('update:modelValue', '');
      emit('remove');

      ElMessage.success('营业执照已删除，点击保存按钮后生效');
    } catch (e) {
      // 用户取消删除，不做任何操作
      console.log('用户取消删除营业执照');
    }
  } else {
    // 没有文件，直接清除状态
    selectedFile.value = null;
    previewUrl.value = '';
    fileList.value = [];
    emit('remove');
  }
};

// 打开PDF文件
const openPdf = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank');
  }
};

// 清除预览状态（给父组件调用）
const clearPreview = () => {
  if (localObjectUrl.value) {
    URL.revokeObjectURL(localObjectUrl.value);
    localObjectUrl.value = null;
  }
  previewUrl.value = props.modelValue || '';
  fileList.value = [];
  selectedFile.value = null;
};

// 显示帮助对话框
const showHelpDialog = () => {
  dialogVisible.value = true;
};

// 获取待上传的文件
const getPendingFile = (): File | null => {
  return selectedFile.value;
};

// 暴露方法
defineExpose({
  showHelpDialog,
  clearPreview,
  getPendingFile
});
</script>

<style scoped>
.license-uploader {
  margin-bottom: 20px;
}

.license-upload {
  margin-bottom: 15px;
}

.el-upload__tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 5px;
}

.license-preview {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  padding: 15px;
  margin-top: 15px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: bold;
}

.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.pdf-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.file-name {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.license-info {
  font-size: 14px;
  line-height: 1.6;
}

.license-info ul, .license-info ol {
  padding-left: 20px;
  margin: 10px 0;
}

@media (max-width: 768px) {
  .license-preview {
    padding: 10px;
  }

  .preview-image {
    max-height: 200px;
  }
}
</style>
