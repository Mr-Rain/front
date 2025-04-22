<template>
  <div
    v-if="loading"
    class="loading-state"
    :class="[
      `loading-state--${type}`,
      `loading-state--${size}`,
      { 'loading-state--fullscreen': fullscreen },
      { 'loading-state--with-overlay': overlay },
      { 'loading-state--with-text': text }
    ]"
  >
    <div v-if="overlay" class="loading-state__overlay" @click="handleOverlayClick"></div>
    
    <div class="loading-state__content">
      <!-- 骨架屏加载 -->
      <div v-if="type === 'skeleton'" class="loading-state__skeleton">
        <slot name="skeleton">
          <el-skeleton :rows="rows" animated />
        </slot>
      </div>
      
      <!-- 旋转加载 -->
      <div v-else-if="type === 'spinner'" class="loading-state__spinner">
        <slot name="spinner">
          <el-icon class="loading-state__spinner-icon" :size="spinnerSize">
            <component :is="spinnerIcon" />
          </el-icon>
        </slot>
      </div>
      
      <!-- 进度条加载 -->
      <div v-else-if="type === 'progress'" class="loading-state__progress">
        <slot name="progress">
          <el-progress
            :percentage="percentage"
            :stroke-width="progressStrokeWidth"
            :text-inside="progressTextInside"
            :status="progressStatus"
            :indeterminate="progressIndeterminate"
            :duration="progressDuration"
          />
        </slot>
      </div>
      
      <!-- 自定义加载 -->
      <div v-else-if="type === 'custom'" class="loading-state__custom">
        <slot name="custom"></slot>
      </div>
      
      <!-- 默认加载 -->
      <div v-else class="loading-state__default">
        <slot>
          <el-icon class="loading-state__default-icon" :size="spinnerSize">
            <Loading />
          </el-icon>
        </slot>
      </div>
      
      <!-- 加载文本 -->
      <div v-if="text" class="loading-state__text">
        <slot name="text">{{ text }}</slot>
      </div>
    </div>
  </div>
  
  <div v-else>
    <slot name="default"></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Loading, RefreshRight } from '@element-plus/icons-vue';

// 定义组件属性
const props = defineProps({
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 加载类型
  type: {
    type: String,
    default: 'default',
    validator: (value: string) => {
      return ['default', 'spinner', 'skeleton', 'progress', 'custom'].includes(value);
    }
  },
  // 加载大小
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
  // 是否显示遮罩层
  overlay: {
    type: Boolean,
    default: false
  },
  // 遮罩层是否可点击关闭
  overlayClickable: {
    type: Boolean,
    default: false
  },
  // 加载文本
  text: {
    type: String,
    default: ''
  },
  // 骨架屏行数
  rows: {
    type: Number,
    default: 4
  },
  // 旋转图标
  spinnerIcon: {
    type: [String, Object],
    default: RefreshRight
  },
  // 进度条百分比
  percentage: {
    type: Number,
    default: 50
  },
  // 进度条宽度
  progressStrokeWidth: {
    type: Number,
    default: 6
  },
  // 进度条文字是否内置
  progressTextInside: {
    type: Boolean,
    default: false
  },
  // 进度条状态
  progressStatus: {
    type: String,
    default: '',
    validator: (value: string) => {
      return ['', 'success', 'exception', 'warning'].includes(value);
    }
  },
  // 进度条是否为动态进度
  progressIndeterminate: {
    type: Boolean,
    default: false
  },
  // 进度条动画持续时间
  progressDuration: {
    type: Number,
    default: 3
  }
});

// 定义事件
const emit = defineEmits(['overlay-click']);

// 计算旋转图标大小
const spinnerSize = computed(() => {
  const sizeMap = {
    small: 16,
    default: 24,
    large: 32
  };
  return sizeMap[props.size as keyof typeof sizeMap];
});

// 处理遮罩层点击
const handleOverlayClick = () => {
  if (props.overlayClickable) {
    emit('overlay-click');
  }
};
</script>

<style scoped>
.loading-state {
  position: relative;
  width: 100%;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  min-height: 100vh;
}

.loading-state__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 1;
}

.dark-theme .loading-state__overlay {
  background-color: rgba(0, 0, 0, 0.7);
}

.loading-state__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-state--small .loading-state__content {
  padding: 10px;
}

.loading-state--large .loading-state__content {
  padding: 30px;
}

.loading-state__text {
  margin-top: 10px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.loading-state--small .loading-state__text {
  font-size: 12px;
  margin-top: 5px;
}

.loading-state--large .loading-state__text {
  font-size: 16px;
  margin-top: 15px;
}

.loading-state__spinner-icon,
.loading-state__default-icon {
  animation: loading-rotate 2s linear infinite;
}

.loading-state__skeleton {
  width: 100%;
  max-width: 600px;
}

.loading-state__progress {
  width: 100%;
  max-width: 400px;
}

@keyframes loading-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
