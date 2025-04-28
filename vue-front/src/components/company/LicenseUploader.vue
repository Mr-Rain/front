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
      :http-request="customUpload"
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
import { ElMessage } from 'element-plus';
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

const action = ''; // 实际上不会使用这个action，因为我们使用自定义上传
const uploading = ref(false);
const fileList = ref<UploadUserFile[]>([]);
const previewUrl = ref(props.modelValue || '');
const dialogVisible = ref(false);

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  previewUrl.value = newValue || '';
  if (!newValue) {
    fileList.value = [];
  }
});

// 判断是否为PDF文件
const isPdf = computed(() => {
  return previewUrl.value?.toLowerCase().endsWith('.pdf');
});

// 处理文件超出限制
const handleExceed = () => {
  ElMessage.warning('只能上传一个文件');
};

// 处理文件变化
const handleChange = (file: UploadFile) => {
  if (file.status === 'ready') {
    fileList.value = [file];
  }
};

// 处理文件移除
const handleRemove = () => {
  fileList.value = [];
};

// 上传前验证
const beforeUpload = (file: File) => {
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

// 自定义上传
const customUpload = async (options: UploadRequestOptions) => {
  const { file } = options;
  if (!file || !(file instanceof File)) {
    console.error('文件上传失败: 无效的文件对象');
    ElMessage.error('文件上传失败');
    return;
  }

  console.log('开始上传文件:', file.name, '大小:', file.size, '类型:', file.type);
  uploading.value = true;

  try {
    // 直接调用API上传文件，不经过store的保存逻辑
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'company-licenses');

    // 生成文件路径
    const ext = file.name.substring(file.name.lastIndexOf('.'));
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 10);
    const path = `licenses/${date}_${randomStr}${ext}`;
    formData.append('path', path);

    console.log('准备发送文件上传请求，路径:', path);

    // 使用fetch API直接发送请求，确保请求被发送
    console.log('发送文件上传请求，表单数据:', {
      file: file.name,
      bucket: 'company-licenses',
      path: path
    });

    const token = localStorage.getItem('token');
    console.log('使用的Token:', token ? token.substring(0, 10) + '...' : 'null');

    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`上传失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('文件上传API响应:', result);

    if (!result.data || !result.data.url) {
      throw new Error('上传响应缺少URL');
    }

    const licenseUrl = result.data.url;
    console.log('文件上传成功，获取到URL:', licenseUrl);
    console.log('URL类型:', typeof licenseUrl);
    console.log('URL长度:', licenseUrl ? licenseUrl.length : 0);

    // 确保URL是有效的字符串
    if (!licenseUrl || typeof licenseUrl !== 'string' || licenseUrl.trim() === '') {
      console.error('获取到的URL无效');
      throw new Error('获取到的URL无效');
    }

    previewUrl.value = licenseUrl;
    console.log('设置previewUrl:', previewUrl.value);

    // 更新父组件的v-model值
    emit('update:modelValue', licenseUrl);
    console.log('已触发update:modelValue事件，值:', licenseUrl);

    // 触发上传成功事件
    emit('upload-success', licenseUrl);
    console.log('已触发upload-success事件，值:', licenseUrl);

    // 显示成功消息，并提示用户需要点击编辑按钮
    ElMessage({
      message: '文件上传成功！请点击"编辑"按钮，然后点击"保存营业执照"按钮完成保存。',
      type: 'success',
      duration: 5000,
      showClose: true
    });
  } catch (error) {
    console.error('文件上传失败，详细错误:', error);
    emit('upload-error', error);
    ElMessage.error('文件上传失败');
  } finally {
    uploading.value = false;
  }
};

// 移除已上传的执照
const removeLicense = () => {
  previewUrl.value = '';
  fileList.value = [];
  emit('update:modelValue', '');
  emit('remove');
};

// 打开PDF文件
const openPdf = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank');
  }
};

// 显示帮助对话框
const showHelpDialog = () => {
  dialogVisible.value = true;
};

// 暴露方法
defineExpose({
  showHelpDialog
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
