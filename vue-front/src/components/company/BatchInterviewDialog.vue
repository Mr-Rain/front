<template>
  <el-dialog
    v-model="dialogVisible"
    title="批量安排面试"
    width="600px"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <div class="batch-interview-dialog">
      <div class="selected-candidates">
        <h4>已选择的候选人 ({{ applications.length }})</h4>
        <el-scrollbar height="150px">
          <div class="candidate-list">
            <div v-for="app in applications" :key="app.id" class="candidate-item">
              <div class="candidate-info">
                <div class="candidate-name">{{ app.student_info?.name || '未知候选人' }}</div>
                <div class="candidate-job">应聘: {{ app.job_title || '未知职位' }}</div>
              </div>
              <el-tag size="small" :type="getStatusType(app.status)">
                {{ formatStatus(app.status) }}
              </el-tag>
            </div>
          </div>
        </el-scrollbar>
      </div>

      <el-divider content-position="center">面试安排</el-divider>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        :disabled="loading"
      >
        <el-form-item label="面试时间" prop="interview_time" required>
          <el-date-picker
            v-model="formData.interview_time"
            type="datetime"
            placeholder="选择面试时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="disabledDate"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="面试方式" prop="interview_type" required>
          <el-radio-group v-model="formData.interview_type">
            <el-radio label="onsite">现场面试</el-radio>
            <el-radio label="video">视频面试</el-radio>
            <el-radio label="phone">电话面试</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="面试地点" prop="interview_location" :required="formData.interview_type === 'onsite'">
          <el-input
            v-model="formData.interview_location"
            placeholder="请输入面试地点"
            :disabled="formData.interview_type !== 'onsite'"
          />
        </el-form-item>

        <el-form-item label="面试联系人" prop="interview_contact" required>
          <el-input v-model="formData.interview_contact" placeholder="请输入面试联系人姓名" />
        </el-form-item>

        <el-form-item label="联系方式" prop="interview_contact_info" required>
          <el-input v-model="formData.interview_contact_info" placeholder="请输入联系方式（电话/邮箱）" />
        </el-form-item>

        <el-form-item label="候选人评分" prop="rating">
          <el-rate
            v-model="formData.rating"
            :colors="['#F56C6C', '#E6A23C', '#67C23A']"
            :texts="['不合适', '一般', '合格', '良好', '优秀']"
            show-text
          />
        </el-form-item>

        <el-form-item label="面试说明" prop="feedback">
          <el-input
            v-model="formData.feedback"
            type="textarea"
            :rows="4"
            placeholder="请输入面试说明，如面试流程、需要准备的材料等"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确认安排
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import type { ApplicationInfo, ApplicationStatus } from '@/types/application';

// 定义组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  applications: {
    type: Array as () => ApplicationInfo[],
    default: () => []
  }
});

// 定义事件
const emit = defineEmits(['update:visible', 'submit', 'cancel']);

// 表单引用
const formRef = ref<FormInstance>();

// 对话框可见状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

// 加载状态
const loading = ref(false);

// 表单数据
const formData = reactive({
  interview_time: '',
  interview_type: 'onsite' as 'onsite' | 'video' | 'phone',
  interview_location: '',
  interview_contact: '',
  interview_contact_info: '',
  feedback: '',
  rating: 3
});

// 表单验证规则
const formRules = reactive<FormRules>({
  interview_time: [
    { required: true, message: '请选择面试时间', trigger: 'change' }
  ],
  interview_type: [
    { required: true, message: '请选择面试方式', trigger: 'change' }
  ],
  interview_location: [
    {
      required: true,
      message: '请输入面试地点',
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (formData.interview_type === 'onsite' && !value) {
          callback(new Error('请输入面试地点'));
        } else {
          callback();
        }
      }
    }
  ],
  interview_contact: [
    { required: true, message: '请输入面试联系人', trigger: 'blur' }
  ],
  interview_contact_info: [
    { required: true, message: '请输入联系方式', trigger: 'blur' }
  ]
});

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7; // 禁用今天之前的日期
};

// 初始化表单数据
const initForm = () => {
  // 设置默认值
  const now = new Date();
  now.setHours(now.getHours() + 24); // 默认设置为明天此时

  formData.interview_time = now.toISOString().slice(0, 16).replace('T', ' ');
  formData.interview_type = 'onsite';
  formData.interview_location = '';
  formData.interview_contact = '';
  formData.interview_contact_info = '';
  formData.feedback = '';
  formData.rating = 3;
};

// 处理关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
  emit('cancel');
};

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;

      try {
        // 构建提交数据
        const submitData = {
          status: 'interview' as const,
          interview_time: formData.interview_time,
          interview_type: formData.interview_type,
          interview_location: formData.interview_type === 'onsite' ? formData.interview_location : '',
          interview_contact: formData.interview_contact,
          interview_contact_info: formData.interview_contact_info,
          feedback: formData.feedback,
          rating: formData.rating,
          applicationIds: props.applications.map(app => app.id)
        };

        // 发送提交事件
        emit('submit', submitData);

        // 关闭对话框
        dialogVisible.value = false;
      } catch (error) {
        console.error('Failed to schedule batch interview:', error);
        ElMessage.error('批量安排面试失败');
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.warning('请完善表单信息');
    }
  });
};

// 格式化状态
const formatStatus = (status: ApplicationStatus): string => {
  const statusMap: Record<ApplicationStatus, string> = {
    'pending': '待处理',
    'viewed': '已查看',
    'interview': '面试中',
    'offer': '已录用',
    'rejected': '已拒绝',
    'withdrawn': '已撤回'
  };
  return statusMap[status] || '未知状态';
};

// 获取状态类型
const getStatusType = (status: ApplicationStatus): string => {
  const typeMap: Record<ApplicationStatus, string> = {
    'pending': 'info',
    'viewed': 'warning',
    'interview': 'success',
    'offer': 'success',
    'rejected': 'danger',
    'withdrawn': 'info'
  };
  return typeMap[status] || 'info';
};

// 暴露方法
defineExpose({
  initForm
});
</script>

<style scoped>
.batch-interview-dialog {
  padding: 0 10px;
}

.selected-candidates {
  margin-bottom: 20px;
}

.selected-candidates h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.candidate-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.candidate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  background-color: var(--el-fill-color-light);
}

.candidate-info {
  display: flex;
  flex-direction: column;
}

.candidate-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.candidate-job {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
