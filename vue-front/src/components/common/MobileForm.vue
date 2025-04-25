<template>
  <div class="mobile-form-container">
    <!-- 表单标题 -->
    <div v-if="title" class="mobile-form-title">
      <h3>{{ title }}</h3>
      <slot name="title-extra"></slot>
    </div>

    <!-- 表单内容 -->
    <el-form
      ref="formRef"
      :model="model"
      :rules="rules"
      :label-position="(isMobile ? 'top' : labelPosition) as 'top' | 'left' | 'right'"
      :label-width="isMobile ? 'auto' : labelWidth"
      :size="(isMobile ? 'default' : size) as '' | 'small' | 'default' | 'large'"
      :disabled="disabled"
      :class="{ 'mobile-form': isMobile }"
      v-bind="$attrs"
    >
      <slot></slot>

      <!-- 表单操作按钮 -->
      <div v-if="showButtons" :class="['form-buttons', { 'mobile-form-buttons': isMobile }]">
        <slot name="buttons">
          <el-button @click="handleCancel">{{ cancelText }}</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="loading">{{ submitText }}</el-button>
        </slot>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots, useAttrs } from 'vue';
import { ElForm, ElButton, ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

// 定义组件属性
const props = defineProps({
  // 表单数据模型
  model: {
    type: Object,
    required: true
  },
  // 表单验证规则
  rules: {
    type: Object as () => FormRules,
    default: () => ({})
  },
  // 表单标题
  title: {
    type: String,
    default: ''
  },
  // 标签位置
  labelPosition: {
    type: String,
    default: 'right'
  },
  // 标签宽度
  labelWidth: {
    type: String,
    default: '100px'
  },
  // 表单尺寸
  size: {
    type: String,
    default: 'default'
  },
  // 是否禁用表单
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否显示按钮
  showButtons: {
    type: Boolean,
    default: true
  },
  // 提交按钮文本
  submitText: {
    type: String,
    default: '提交'
  },
  // 取消按钮文本
  cancelText: {
    type: String,
    default: '取消'
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 强制使用移动端视图
  forceMobile: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits([
  'submit',
  'cancel',
  'validate'
]);

// 获取插槽和属性
const slots = useSlots();
const attrs = useAttrs();

// 表单引用
const formRef = ref<FormInstance>();

// 计算是否为移动端视图
const isMobile = computed(() => {
  if (props.forceMobile) return true;
  return window.innerWidth <= 768;
});

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    emit('submit', props.model);
  } catch (error) {
    console.error('表单验证失败:', error);
    emit('validate', false, error);
    ElMessage.error('请检查表单填写是否正确');
  }
};

// 处理表单取消
const handleCancel = () => {
  emit('cancel');
};

// 暴露方法
defineExpose({
  validate: async () => {
    if (!formRef.value) return false;
    return formRef.value.validate();
  },
  resetFields: () => {
    if (!formRef.value) return;
    formRef.value.resetFields();
  },
  scrollToField: (field: string) => {
    if (!formRef.value) return;
    formRef.value.scrollToField(field);
  },
  clearValidate: (fields?: string | string[]) => {
    if (!formRef.value) return;
    formRef.value.clearValidate(fields);
  }
});
</script>

<style scoped>
.mobile-form-container {
  width: 100%;
}

.mobile-form-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.mobile-form-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.form-buttons {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.mobile-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.mobile-form :deep(.el-form-item__label) {
  padding-bottom: 8px;
  font-weight: 500;
}

.mobile-form :deep(.el-input__inner) {
  height: 40px;
}

.mobile-form :deep(.el-textarea__inner) {
  min-height: 80px;
}

.mobile-form :deep(.el-select) {
  width: 100%;
}

.mobile-form :deep(.el-date-editor.el-input) {
  width: 100%;
}

.mobile-form-buttons {
  flex-direction: column;
  gap: 8px;
}

.mobile-form-buttons :deep(.el-button) {
  width: 100%;
  margin-left: 0;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .form-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .form-buttons :deep(.el-button) {
    width: 100%;
    margin-left: 0;
  }

  .mobile-form-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
