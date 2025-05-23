<template>
  <div class="company-tags-manager">
    <div class="tags-container">
      <el-tag
        v-for="tag in modelValue"
        :key="tag"
        class="tag-item"
        :closable="!disabled"
        :disable-transitions="false"
        @close="handleClose(tag)"
      >
        {{ tag }}
      </el-tag>
      <el-input
        v-if="inputVisible && !disabled"
        ref="InputRef"
        v-model="inputValue"
        class="tag-input"
        size="small"
        @keyup.enter="handleInputConfirm"
        @blur="handleInputConfirm"
      />
      <el-button
        v-else-if="!disabled"
        class="button-new-tag"
        size="small"
        @click="showInput"
        :disabled="modelValue.length >= maxTags"
      >
        + 添加标签
      </el-button>
    </div>
    <div class="tags-suggestions" v-if="suggestions.length > 0 && showSuggestions">
      <p class="suggestions-title">推荐标签：</p>
      <div class="suggestions-list">
        <el-tag
          v-for="tag in availableSuggestions"
          :key="tag"
          class="suggestion-tag"
          @click="!disabled && addTag(tag)"
          :class="{ 'disabled': disabled }"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';
import type { InputInstance } from 'element-plus';

// 使用Vue的编译器宏defineProps，不需要导入
const props = defineProps({
  modelValue: {
    type: Array as () => string[],
    required: true,
    default: () => ['暂无标签'] // 添加默认值，确保不会是null
  },
  suggestions: {
    type: Array as () => string[],
    default: () => []
  },
  maxTags: {
    type: Number,
    default: 10
  },
  showSuggestions: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

// 使用Vue的编译器宏defineEmits，不需要导入
const emit = defineEmits(['update:modelValue']);

// 确保初始值不为 null
if (props.modelValue === null) {
  emit('update:modelValue', ['暂无标签']);
}

const inputValue = ref('');
const inputVisible = ref(false);
const InputRef = ref<InputInstance>();

// 计算可用的建议标签（排除已选择的）
const availableSuggestions = computed(() => {
  return props.suggestions.filter(tag => !props.modelValue.includes(tag));
});

// 显示输入框
const showInput = () => {
  if (props.modelValue.length >= props.maxTags) {
    return;
  }
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value?.input?.focus();
  });
};

// 处理标签输入确认
const handleInputConfirm = () => {
  if (inputValue.value) {
    const value = inputValue.value.trim();

    // 确保modelValue是数组
    let currentTags = Array.isArray(props.modelValue) ? props.modelValue : ['暂无标签'];

    // 如果当前只有默认的"暂无标签"，则移除它
    if (currentTags.length === 1 && currentTags[0] === '暂无标签') {
      currentTags = [];
    }

    if (value && !currentTags.includes(value) && currentTags.length < props.maxTags) {
      const newTags = [...currentTags, value];
      emit('update:modelValue', newTags);
    }
  }
  inputVisible.value = false;
  inputValue.value = '';
};

// 处理标签关闭
const handleClose = (tag: string) => {
  // 确保modelValue是数组
  const currentTags = Array.isArray(props.modelValue) ? props.modelValue : ['暂无标签'];
  const newTags = currentTags.filter(t => t !== tag);

  // 如果删除后没有标签，则添加默认标签
  if (newTags.length === 0) {
    newTags.push('暂无标签');
  }

  emit('update:modelValue', newTags);
};

// 添加建议标签
const addTag = (tag: string) => {
  // 确保modelValue是数组
  let currentTags = Array.isArray(props.modelValue) ? props.modelValue : ['暂无标签'];

  // 如果当前只有默认的"暂无标签"，则移除它
  if (currentTags.length === 1 && currentTags[0] === '暂无标签') {
    currentTags = [];
  }

  if (!currentTags.includes(tag) && currentTags.length < props.maxTags) {
    const newTags = [...currentTags, tag];
    emit('update:modelValue', newTags);
  }
};
</script>

<style scoped>
.company-tags-manager {
  margin-bottom: 15px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.tag-item {
  margin-right: 0;
}

.tag-input {
  width: 100px;
  margin-right: 0;
  vertical-align: bottom;
}

.button-new-tag {
  margin-right: 0;
  height: 32px;
  padding-top: 0;
  padding-bottom: 0;
}

.tags-suggestions {
  margin-top: 10px;
}

.suggestions-title {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-tag:hover:not(.disabled) {
  transform: scale(1.05);
}

.disabled {
  cursor: not-allowed !important;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .tags-container {
    gap: 6px;
  }

  .tag-input {
    width: 80px;
  }
}
</style>
