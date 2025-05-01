<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditing ? '编辑面试安排' : '安排面试'"
    width="600px"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <div class="interview-scheduler">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        :disabled="loading"
      >
        <el-form-item label="面试时间" prop="interviewTime" required>
          <el-date-picker
            v-model="formData.interviewTime"
            type="datetime"
            placeholder="选择面试时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="disabledDate"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="面试方式" prop="interviewType" required>
          <el-radio-group v-model="formData.interviewType">
            <el-radio label="onsite">现场面试</el-radio>
            <el-radio label="video">视频面试</el-radio>
            <el-radio label="phone">电话面试</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="面试地点" prop="interviewLocation" :required="formData.interviewType === 'onsite'">
          <el-input 
            v-model="formData.interviewLocation" 
            placeholder="请输入面试地点"
            :disabled="formData.interviewType !== 'onsite'"
          />
        </el-form-item>

        <el-form-item label="面试联系人" prop="interviewContact" required>
          <el-input v-model="formData.interviewContact" placeholder="请输入面试联系人姓名" />
        </el-form-item>

        <el-form-item label="联系方式" prop="interviewContactInfo" required>
          <el-input v-model="formData.interviewContactInfo" placeholder="请输入联系方式（电话/邮箱）" />
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
          {{ isEditing ? '保存修改' : '确认安排' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import type { ApplicationInfo } from '@/types/application';

// 定义组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  application: {
    type: Object as () => ApplicationInfo | null,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
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
  interviewTime: '',
  interviewType: 'onsite' as 'onsite' | 'video' | 'phone',
  interviewLocation: '',
  interviewContact: '',
  interviewContactInfo: '',
  feedback: ''
});

// 表单验证规则
const formRules = reactive<FormRules>({
  interviewTime: [
    { required: true, message: '请选择面试时间', trigger: 'change' }
  ],
  interviewType: [
    { required: true, message: '请选择面试方式', trigger: 'change' }
  ],
  interviewLocation: [
    { 
      required: true, 
      message: '请输入面试地点', 
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (formData.interviewType === 'onsite' && !value) {
          callback(new Error('请输入面试地点'));
        } else {
          callback();
        }
      }
    }
  ],
  interviewContact: [
    { required: true, message: '请输入面试联系人', trigger: 'blur' }
  ],
  interviewContactInfo: [
    { required: true, message: '请输入联系方式', trigger: 'blur' }
  ]
});

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7; // 禁用今天之前的日期
};

// 初始化表单数据
const initForm = () => {
  // 如果是编辑模式且有应用数据，则填充表单
  if (props.isEditing && props.application) {
    formData.interviewTime = props.application.interviewTime || '';
    formData.interviewType = props.application.interviewType || 'onsite';
    formData.interviewLocation = props.application.interviewLocation || '';
    formData.interviewContact = props.application.interviewContact || '';
    formData.interviewContactInfo = props.application.interviewContactInfo || '';
    formData.feedback = props.application.feedback || '';
  } else {
    // 新建模式，设置默认值
    const now = new Date();
    now.setHours(now.getHours() + 24); // 默认设置为明天此时
    
    formData.interviewTime = now.toISOString().slice(0, 16).replace('T', ' ');
    formData.interviewType = 'onsite';
    formData.interviewLocation = '';
    formData.interviewContact = '';
    formData.interviewContactInfo = '';
    formData.feedback = '';
  }
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
          interviewTime: formData.interviewTime,
          interviewType: formData.interviewType,
          interviewLocation: formData.interviewType === 'onsite' ? formData.interviewLocation : '',
          interviewContact: formData.interviewContact,
          interviewContactInfo: formData.interviewContactInfo,
          feedback: formData.feedback
        };
        
        // 发送提交事件
        emit('submit', submitData);
        
        // 关闭对话框
        dialogVisible.value = false;
      } catch (error) {
        console.error('Failed to schedule interview:', error);
        ElMessage.error('安排面试失败');
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
.interview-scheduler {
  padding: 0 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
