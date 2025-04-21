<template>
  <el-dialog
    v-model="dialogVisible"
    title="复制职位"
    width="500px"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <div class="job-copy-content">
      <p class="job-copy-description">
        您正在复制职位 <strong>{{ jobTitle }}</strong>。
        复制后将创建一个新的职位，您可以在发布前进行修改。
      </p>
      
      <el-form :model="formData" label-position="top" :rules="formRules" ref="formRef">
        <el-form-item label="新职位名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入新职位名称"></el-input>
        </el-form-item>
        
        <el-form-item label="工作地点" prop="location">
          <el-input v-model="formData.location" placeholder="请输入工作地点"></el-input>
        </el-form-item>
        
        <el-form-item label="复制内容选项">
          <el-checkbox-group v-model="formData.copyOptions">
            <el-checkbox label="description">职位描述</el-checkbox>
            <el-checkbox label="requirements">职位要求</el-checkbox>
            <el-checkbox label="tags">职位标签</el-checkbox>
            <el-checkbox label="salary">薪资范围</el-checkbox>
            <el-checkbox label="education">学历要求</el-checkbox>
            <el-checkbox label="experience">经验要求</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">
          创建副本
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { JobInfo } from '@/types/job';
import { ElMessage } from 'element-plus';

// 定义组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  job: {
    type: Object as () => JobInfo | null,
    default: null
  }
});

// 定义事件
const emit = defineEmits(['update:visible', 'copy-confirmed', 'copy-cancelled']);

// 表单引用
const formRef = ref<FormInstance>();

// 对话框可见状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

// 获取职位标题
const jobTitle = computed(() => props.job?.title || '未知职位');

// 加载状态
const loading = ref(false);

// 表单数据
const formData = reactive({
  title: '',
  location: '',
  copyOptions: ['description', 'requirements', 'tags', 'salary', 'education', 'experience']
});

// 表单验证规则
const formRules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入新职位名称', trigger: 'blur' },
    { min: 2, max: 50, message: '职位名称长度应在2-50个字符之间', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入工作地点', trigger: 'blur' }
  ]
});

// 监听对话框打开，初始化表单数据
const initForm = () => {
  if (props.job) {
    formData.title = `${props.job.title}（副本）`;
    formData.location = props.job.location;
  }
};

// 处理关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
  emit('copy-cancelled');
};

// 处理确认复制
const handleConfirm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid && props.job) {
      loading.value = true;
      
      try {
        // 创建新职位对象
        const newJob: Partial<JobInfo> = {
          title: formData.title,
          location: formData.location,
          job_type: props.job.job_type
        };
        
        // 根据选项复制其他字段
        if (formData.copyOptions.includes('description')) {
          newJob.description = props.job.description;
        }
        
        if (formData.copyOptions.includes('requirements')) {
          newJob.requirements = props.job.requirements;
        }
        
        if (formData.copyOptions.includes('tags')) {
          newJob.tags = [...(props.job.tags || [])];
        }
        
        if (formData.copyOptions.includes('salary')) {
          newJob.salary_range = props.job.salary_range;
        }
        
        if (formData.copyOptions.includes('education')) {
          newJob.education_required = props.job.education_required;
        }
        
        if (formData.copyOptions.includes('experience')) {
          newJob.experience_required = props.job.experience_required;
        }
        
        // 发送复制确认事件
        emit('copy-confirmed', newJob);
        
        // 关闭对话框
        dialogVisible.value = false;
        ElMessage.success('职位复制成功，请继续编辑');
      } catch (error) {
        console.error('Failed to copy job:', error);
        ElMessage.error('职位复制失败');
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.warning('请完善表单信息');
    }
  });
};

// 暴露方法
defineExpose({
  initForm
});
</script>

<style scoped>
.job-copy-content {
  padding: 0 10px;
}

.job-copy-description {
  margin-bottom: 20px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
