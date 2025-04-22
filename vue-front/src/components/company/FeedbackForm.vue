<template>
  <div class="feedback-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-position="top"
      :disabled="loading"
    >
      <el-form-item label="评分" prop="rating" v-if="showRating">
        <el-rate
          v-model="formData.rating"
          :colors="rateColors"
          :texts="rateTexts"
          show-text
          :max="5"
        />
      </el-form-item>

      <el-form-item label="反馈内容" prop="content" required>
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="4"
          :placeholder="placeholder"
        />
      </el-form-item>

      <el-form-item v-if="showResult && type === 'interview'">
        <el-radio-group v-model="formData.result">
          <el-radio label="pass">通过</el-radio>
          <el-radio label="fail">不通过</el-radio>
          <el-radio label="pending">待定</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ submitText }}
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';

// 反馈类型
type FeedbackType = 'interview' | 'rejection' | 'offer' | 'general';

// 定义组件属性
const props = defineProps({
  type: {
    type: String as () => FeedbackType,
    default: 'general'
  },
  initialContent: {
    type: String,
    default: ''
  },
  initialRating: {
    type: Number,
    default: 3
  },
  initialResult: {
    type: String,
    default: 'pending'
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['submit', 'cancel']);

// 表单引用
const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive({
  content: props.initialContent,
  rating: props.initialRating,
  result: props.initialResult
});

// 表单验证规则
const formRules = reactive<FormRules>({
  content: [
    { required: true, message: '请输入反馈内容', trigger: 'blur' },
    { min: 5, message: '反馈内容不能少于5个字符', trigger: 'blur' }
  ]
});

// 评分颜色
const rateColors = ['#F56C6C', '#E6A23C', '#909399', '#67C23A', '#409EFF'];

// 评分文本
const rateTexts = ['不合适', '一般', '合格', '良好', '优秀'];

// 是否显示评分
const showRating = computed(() => true); // 所有类型的反馈都显示评分

// 是否显示结果
const showResult = computed(() => props.type === 'interview');

// 提交按钮文本
const submitText = computed(() => {
  switch (props.type) {
    case 'interview':
      return '提交面试反馈';
    case 'rejection':
      return '提交拒绝理由';
    case 'offer':
      return '提交录用信息';
    default:
      return '提交反馈';
  }
});

// 占位符文本
const placeholder = computed(() => {
  switch (props.type) {
    case 'interview':
      return '请输入面试反馈，如候选人表现、技能评估等';
    case 'rejection':
      return '请输入拒绝理由，如不符合岗位要求、技能不匹配等';
    case 'offer':
      return '请输入录用信息，如薪资、入职时间等';
    default:
      return '请输入反馈内容';
  }
});

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 构建提交数据
      const submitData = {
        content: formData.content,
        rating: formData.rating,
        result: formData.result,
        type: props.type
      };

      // 发送提交事件
      emit('submit', submitData);
    } else {
      ElMessage.warning('请完善表单信息');
    }
  });
};

// 处理取消
const handleCancel = () => {
  emit('cancel');
};

// 重置表单
const resetForm = () => {
  formData.content = props.initialContent;
  formData.rating = props.initialRating;
  formData.result = props.initialResult;
  formRef.value?.clearValidate();
};

// 暴露方法
defineExpose({
  resetForm
});
</script>

<style scoped>
.feedback-form {
  margin-top: 15px;
}
</style>
