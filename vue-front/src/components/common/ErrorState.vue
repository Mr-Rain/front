<template>
  <div
    v-if="error"
    class="error-state"
    :class="[
      `error-state--${type}`,
      `error-state--${size}`,
      { 'error-state--fullscreen': fullscreen }
    ]"
  >
    <div class="error-state__content">
      <!-- 图标 -->
      <div class="error-state__icon">
        <slot name="icon">
          <el-icon :size="iconSize">
            <component :is="errorIcon" />
          </el-icon>
        </slot>
      </div>
      
      <!-- 标题 -->
      <div class="error-state__title">
        <slot name="title">{{ title || defaultTitle }}</slot>
      </div>
      
      <!-- 描述 -->
      <div v-if="description || $slots.description" class="error-state__description">
        <slot name="description">{{ description }}</slot>
      </div>
      
      <!-- 错误详情 -->
      <div v-if="showDetails && errorDetails" class="error-state__details">
        <el-collapse>
          <el-collapse-item title="错误详情">
            <pre class="error-state__details-content">{{ errorDetails }}</pre>
          </el-collapse-item>
        </el-collapse>
      </div>
      
      <!-- 操作按钮 -->
      <div class="error-state__actions">
        <slot name="actions">
          <el-button v-if="showRetry" type="primary" @click="handleRetry">
            {{ retryText }}
          </el-button>
          <el-button v-if="showBack" @click="handleBack">
            {{ backText }}
          </el-button>
        </slot>
      </div>
    </div>
  </div>
  
  <div v-else>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { CircleClose, Warning, InfoFilled } from '@element-plus/icons-vue';

// 定义组件属性
const props = defineProps({
  // 是否显示错误状态
  error: {
    type: [Boolean, Error, String, Object],
    default: false
  },
  // 错误类型
  type: {
    type: String,
    default: 'error',
    validator: (value: string) => {
      return ['error', 'warning', 'info'].includes(value);
    }
  },
  // 错误大小
  size: {
    type: String,
    default: 'default',
    validator: (value: string) => {
      return ['small', 'default', 'large'].includes(value);
    }
  },
  // 是否全屏
  fullscreen: {
    type: Boolean,
    default: false
  },
  // 错误标题
  title: {
    type: String,
    default: ''
  },
  // 错误描述
  description: {
    type: String,
    default: ''
  },
  // 是否显示错误详情
  showDetails: {
    type: Boolean,
    default: false
  },
  // 错误详情
  errorDetails: {
    type: [String, Object],
    default: ''
  },
  // 是否显示重试按钮
  showRetry: {
    type: Boolean,
    default: true
  },
  // 重试按钮文本
  retryText: {
    type: String,
    default: '重试'
  },
  // 是否显示返回按钮
  showBack: {
    type: Boolean,
    default: true
  },
  // 返回按钮文本
  backText: {
    type: String,
    default: '返回'
  },
  // 返回路径
  backPath: {
    type: String,
    default: ''
  }
});

// 定义事件
const emit = defineEmits(['retry', 'back']);

const router = useRouter();

// 计算默认标题
const defaultTitle = computed(() => {
  const titleMap = {
    error: '出错了',
    warning: '警告',
    info: '提示'
  };
  return titleMap[props.type as keyof typeof titleMap];
});

// 计算错误图标
const errorIcon = computed(() => {
  const iconMap = {
    error: CircleClose,
    warning: Warning,
    info: InfoFilled
  };
  return iconMap[props.type as keyof typeof iconMap];
});

// 计算图标大小
const iconSize = computed(() => {
  const sizeMap = {
    small: 32,
    default: 48,
    large: 64
  };
  return sizeMap[props.size as keyof typeof sizeMap];
});

// 处理重试
const handleRetry = () => {
  emit('retry');
};

// 处理返回
const handleBack = () => {
  emit('back');
  if (props.backPath) {
    router.push(props.backPath);
  } else {
    router.back();
  }
};
</script>

<style scoped>
.error-state {
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.error-state--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  min-height: 100vh;
  background-color: var(--el-bg-color);
}

.error-state__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 600px;
}

.error-state__icon {
  margin-bottom: 20px;
}

.error-state--error .error-state__icon {
  color: var(--el-color-danger);
}

.error-state--warning .error-state__icon {
  color: var(--el-color-warning);
}

.error-state--info .error-state__icon {
  color: var(--el-color-info);
}

.error-state--small .error-state__icon {
  margin-bottom: 10px;
}

.error-state--large .error-state__icon {
  margin-bottom: 30px;
}

.error-state__title {
  font-size: 20px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;
}

.error-state--small .error-state__title {
  font-size: 16px;
  margin-bottom: 5px;
}

.error-state--large .error-state__title {
  font-size: 24px;
  margin-bottom: 15px;
}

.error-state__description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 20px;
  line-height: 1.5;
}

.error-state--small .error-state__description {
  font-size: 12px;
  margin-bottom: 10px;
}

.error-state--large .error-state__description {
  font-size: 16px;
  margin-bottom: 30px;
}

.error-state__details {
  width: 100%;
  margin-bottom: 20px;
  text-align: left;
}

.error-state__details-content {
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  background-color: var(--el-fill-color-light);
  padding: 10px;
  border-radius: 4px;
  max-height: 200px;
  overflow: auto;
}

.error-state__actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .error-state {
    padding: 15px;
  }
  
  .error-state__content {
    max-width: 100%;
  }
  
  .error-state__actions {
    flex-direction: column;
    width: 100%;
  }
  
  .error-state__actions .el-button {
    width: 100%;
  }
}
</style>
