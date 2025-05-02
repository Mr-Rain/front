<template>
  <div class="guide-tour">
    <!-- 引导步骤弹出层 -->
    <div
      v-if="isActive && currentStep"
      class="guide-tour__step"
      :class="[
        `guide-tour__step--${currentStep.position || 'bottom'}`,
        { 'guide-tour__step--with-arrow': showArrow }
      ]"
      :style="stepStyle"
    >
      <!-- 步骤内容 -->
      <div class="guide-tour__step-content">
        <!-- 标题 -->
        <div v-if="currentStep.title" class="guide-tour__step-title">
          {{ currentStep.title }}
        </div>

        <!-- 描述 -->
        <div v-if="currentStep.description" class="guide-tour__step-description">
          {{ currentStep.description }}
        </div>

        <!-- 自定义内容 -->
        <div v-if="$slots[`step-${currentStepIndex}`]" class="guide-tour__step-custom">
          <slot :name="`step-${currentStepIndex}`"></slot>
        </div>

        <!-- 步骤指示器 -->
        <div v-if="showStepIndicator && steps.length > 1" class="guide-tour__step-indicator">
          <span class="guide-tour__step-current">{{ currentStepIndex + 1 }}</span>
          <span class="guide-tour__step-separator">/</span>
          <span class="guide-tour__step-total">{{ steps.length }}</span>
        </div>

        <!-- 操作按钮 -->
        <div class="guide-tour__step-actions">
          <el-button
            v-if="currentStepIndex > 0 && showPrevButton"
            size="small"
            @click="prevStep"
          >
            {{ prevButtonText }}
          </el-button>

          <el-button
            v-if="showSkipButton && !isLastStep"
            size="small"
            @click="skipTour"
          >
            {{ skipButtonText }}
          </el-button>

          <el-button
            v-if="isLastStep"
            type="primary"
            size="small"
            @click="finishTour"
          >
            {{ finishButtonText }}
          </el-button>

          <el-button
            v-else
            type="primary"
            size="small"
            @click="nextStep"
          >
            {{ nextButtonText }}
          </el-button>
        </div>
      </div>

      <!-- 箭头 -->
      <div v-if="showArrow" class="guide-tour__step-arrow"></div>
    </div>

    <!-- 遮罩层 -->
    <div
      v-if="isActive && showMask"
      class="guide-tour__mask"
      @click="handleMaskClick"
    ></div>

    <!-- 高亮元素 -->
    <div
      v-if="isActive && currentStep && showHighlight"
      class="guide-tour__highlight"
      :style="highlightStyle"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

// 引导步骤类型
export interface GuideStep {
  target: string; // 目标元素选择器
  title?: string; // 步骤标题
  description?: string; // 步骤描述
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center'; // 弹出位置
  offset?: number; // 偏移量
  beforeEnter?: () => Promise<void> | void; // 进入步骤前的钩子
  afterLeave?: () => Promise<void> | void; // 离开步骤后的钩子
  highlightPadding?: number; // 高亮区域内边距
}

// 定义组件属性
const props = defineProps({
  // 引导步骤
  steps: {
    type: Array as () => GuideStep[],
    default: () => []
  },
  // 是否自动开始
  autoStart: {
    type: Boolean,
    default: false
  },
  // 是否显示箭头
  showArrow: {
    type: Boolean,
    default: true
  },
  // 是否显示遮罩层
  showMask: {
    type: Boolean,
    default: true
  },
  // 遮罩层是否可点击
  maskClosable: {
    type: Boolean,
    default: false
  },
  // 是否显示高亮
  showHighlight: {
    type: Boolean,
    default: true
  },
  // 是否显示步骤指示器
  showStepIndicator: {
    type: Boolean,
    default: true
  },
  // 是否显示上一步按钮
  showPrevButton: {
    type: Boolean,
    default: true
  },
  // 是否显示跳过按钮
  showSkipButton: {
    type: Boolean,
    default: true
  },
  // 上一步按钮文本
  prevButtonText: {
    type: String,
    default: '上一步'
  },
  // 下一步按钮文本
  nextButtonText: {
    type: String,
    default: '下一步'
  },
  // 完成按钮文本
  finishButtonText: {
    type: String,
    default: '完成'
  },
  // 跳过按钮文本
  skipButtonText: {
    type: String,
    default: '跳过'
  },
  // 本地存储键名
  storageKey: {
    type: String,
    default: 'guide-tour-completed'
  },
  // 是否只显示一次
  showOnce: {
    type: Boolean,
    default: true
  },
  // 是否在窗口大小变化时更新位置
  updateOnResize: {
    type: Boolean,
    default: true
  }
});

// 定义事件
const emit = defineEmits([
  'start',
  'finish',
  'skip',
  'step-change',
  'step-before-enter',
  'step-after-leave'
]);

// 状态
const isActive = ref(false);
const currentStepIndex = ref(0);
const targetElement = ref<HTMLElement | null>(null);
const targetRect = ref<DOMRect | null>(null);

// 计算当前步骤
const currentStep = computed(() => {
  return props.steps[currentStepIndex.value] || null;
});

// 计算是否为最后一步
const isLastStep = computed(() => {
  return currentStepIndex.value === props.steps.length - 1;
});

// 计算步骤样式
const stepStyle = computed(() => {
  if (!targetRect.value || !currentStep.value) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  }

  const { top, left, width, height } = targetRect.value;
  const position = currentStep.value.position || 'bottom';
  const offset = currentStep.value.offset || 10;

  switch (position) {
    case 'top':
      return {
        bottom: `${window.innerHeight - top + offset}px`,
        left: `${left + width / 2}px`,
        transform: 'translateX(-50%)'
      };
    case 'right':
      return {
        top: `${top + height / 2}px`,
        left: `${left + width + offset}px`,
        transform: 'translateY(-50%)'
      };
    case 'bottom':
      return {
        top: `${top + height + offset}px`,
        left: `${left + width / 2}px`,
        transform: 'translateX(-50%)'
      };
    case 'left':
      return {
        top: `${top + height / 2}px`,
        right: `${window.innerWidth - left + offset}px`,
        transform: 'translateY(-50%)'
      };
    case 'center':
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    default:
      return {
        top: `${top + height + offset}px`,
        left: `${left + width / 2}px`,
        transform: 'translateX(-50%)'
      };
  }
});

// 计算高亮样式
const highlightStyle = computed(() => {
  if (!targetRect.value) {
    return {
      display: 'none'
    };
  }

  const { top, left, width, height } = targetRect.value;
  const padding = currentStep.value?.highlightPadding || 5;

  return {
    top: `${top - padding}px`,
    left: `${left - padding}px`,
    width: `${width + padding * 2}px`,
    height: `${height + padding * 2}px`
  };
});

// 更新目标元素位置
const updateTargetPosition = async () => {
  if (!currentStep.value) return;

  const selector = currentStep.value.target;
  targetElement.value = document.querySelector(selector);

  if (targetElement.value) {
    targetRect.value = targetElement.value.getBoundingClientRect();

    // 滚动到目标元素
    targetElement.value.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  } else {
    console.warn(`Guide tour target element not found: ${selector}`);
    targetRect.value = null;
  }
};

// 开始引导
const startTour = async () => {
  // 检查是否已完成
  if (props.showOnce && isCompleted()) {
    return;
  }

  isActive.value = true;
  currentStepIndex.value = 0;

  await nextTick();
  await updateTargetPosition();

  emit('start');
};

// 完成引导
const finishTour = () => {
  isActive.value = false;

  // 标记为已完成
  if (props.showOnce) {
    localStorage.setItem(props.storageKey, 'true');
  }

  emit('finish');
};

// 跳过引导
const skipTour = () => {
  isActive.value = false;
  emit('skip');
};

// 下一步
const nextStep = async () => {
  // 执行离开钩子
  if (currentStep.value?.afterLeave) {
    await currentStep.value.afterLeave();
    emit('step-after-leave', currentStepIndex.value);
  }

  currentStepIndex.value++;

  // 执行进入钩子
  if (currentStep.value?.beforeEnter) {
    await currentStep.value.beforeEnter();
    emit('step-before-enter', currentStepIndex.value);
  }

  await nextTick();
  await updateTargetPosition();

  emit('step-change', currentStepIndex.value);
};

// 上一步
const prevStep = async () => {
  // 执行离开钩子
  if (currentStep.value?.afterLeave) {
    await currentStep.value.afterLeave();
    emit('step-after-leave', currentStepIndex.value);
  }

  currentStepIndex.value--;

  // 执行进入钩子
  if (currentStep.value?.beforeEnter) {
    await currentStep.value.beforeEnter();
    emit('step-before-enter', currentStepIndex.value);
  }

  await nextTick();
  await updateTargetPosition();

  emit('step-change', currentStepIndex.value);
};

// 处理遮罩层点击
const handleMaskClick = () => {
  if (props.maskClosable) {
    skipTour();
  }
};

// 检查是否已完成
const isCompleted = (): boolean => {
  return localStorage.getItem(props.storageKey) === 'true';
};

// 重置完成状态
const resetCompletion = () => {
  localStorage.removeItem(props.storageKey);
};

// 监听步骤变化
watch(() => props.steps, async () => {
  if (isActive.value) {
    await nextTick();
    await updateTargetPosition();
  }
}, { deep: true });

// 监听当前步骤变化
watch(currentStepIndex, async () => {
  if (isActive.value) {
    await nextTick();
    await updateTargetPosition();
  }
});

// 窗口大小变化处理
const handleResize = async () => {
  if (isActive.value && props.updateOnResize) {
    await updateTargetPosition();
  }
};

// 组件挂载
onMounted(() => {
  if (props.autoStart) {
    startTour();
  }

  if (props.updateOnResize) {
    window.addEventListener('resize', handleResize);
  }
});

// 组件卸载
onBeforeUnmount(() => {
  if (props.updateOnResize) {
    window.removeEventListener('resize', handleResize);
  }
});

// 暴露方法
defineExpose({
  startTour,
  finishTour,
  skipTour,
  nextStep,
  prevStep,
  resetCompletion,
  isCompleted
});
</script>

<style scoped>
.guide-tour__step {
  position: fixed;
  z-index: 9999;
  max-width: 320px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  transition: all 0.3s;
  animation: guide-step-in 0.3s ease-out;
}

.dark-theme .guide-tour__step {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.guide-tour__step-content {
  position: relative;
}

.guide-tour__step-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.guide-tour__step-description {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 16px;
  line-height: 1.5;
}

.guide-tour__step-custom {
  margin-bottom: 16px;
}

.guide-tour__step-indicator {
  position: absolute;
  top: 16px;
  right: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.guide-tour__step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.guide-tour__step-arrow {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: var(--el-bg-color);
  transform: rotate(45deg);
}

.guide-tour__step--top .guide-tour__step-arrow {
  bottom: -6px;
  left: 50%;
  margin-left: -6px;
}

.guide-tour__step--right .guide-tour__step-arrow {
  left: -6px;
  top: 50%;
  margin-top: -6px;
}

.guide-tour__step--bottom .guide-tour__step-arrow {
  top: -6px;
  left: 50%;
  margin-left: -6px;
}

.guide-tour__step--left .guide-tour__step-arrow {
  right: -6px;
  top: 50%;
  margin-top: -6px;
}

.guide-tour__mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9997;
  animation: guide-mask-in 0.3s ease-out;
}

.guide-tour__highlight {
  position: fixed;
  z-index: 9998;
  border-radius: 4px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  animation: guide-highlight-in 0.3s ease-out;
}

@keyframes guide-step-in {
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

@keyframes guide-mask-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes guide-highlight-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .guide-tour__step {
    max-width: 280px;
    padding: 12px;
  }

  .guide-tour__step-title {
    font-size: 14px;
  }

  .guide-tour__step-description {
    font-size: 12px;
  }
}
</style>
