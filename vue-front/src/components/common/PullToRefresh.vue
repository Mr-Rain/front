<template>
  <div 
    class="pull-to-refresh-container"
    ref="containerRef"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- 下拉刷新指示器 -->
    <div 
      class="pull-to-refresh-indicator"
      :class="{ 
        'visible': isPulling || isRefreshing,
        'refreshing': isRefreshing
      }"
      :style="indicatorStyle"
    >
      <div class="indicator-content">
        <el-icon v-if="!isRefreshing" class="indicator-icon" :style="iconStyle">
          <ArrowDown />
        </el-icon>
        <el-icon v-else class="indicator-icon refreshing">
          <Loading />
        </el-icon>
        <span class="indicator-text">{{ indicatorText }}</span>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="pull-to-refresh-content" :style="contentStyle">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ArrowDown, Loading } from '@element-plus/icons-vue';

// 定义组件属性
const props = defineProps({
  // 是否启用下拉刷新
  disabled: {
    type: Boolean,
    default: false
  },
  // 下拉阈值，超过该值触发刷新
  threshold: {
    type: Number,
    default: 70
  },
  // 最大下拉距离
  maxDistance: {
    type: Number,
    default: 100
  },
  // 刷新状态
  refreshing: {
    type: Boolean,
    default: false
  },
  // 下拉提示文本
  pullText: {
    type: String,
    default: '下拉刷新'
  },
  // 释放提示文本
  releaseText: {
    type: String,
    default: '释放刷新'
  },
  // 刷新中提示文本
  refreshingText: {
    type: String,
    default: '刷新中...'
  }
});

// 定义事件
const emit = defineEmits(['refresh']);

// 容器引用
const containerRef = ref<HTMLElement | null>(null);

// 状态变量
const isPulling = ref(false);
const pullDistance = ref(0);
const startY = ref(0);
const isRefreshing = computed(() => props.refreshing);

// 计算指示器样式
const indicatorStyle = computed(() => {
  const translateY = Math.min(pullDistance.value - props.threshold, 0);
  return {
    height: `${props.threshold}px`,
    transform: isRefreshing.value ? 'translateY(0)' : `translateY(${translateY}px)`
  };
});

// 计算内容区域样式
const contentStyle = computed(() => {
  if (!isPulling.value && !isRefreshing.value) return {};
  
  const translateY = isRefreshing.value 
    ? props.threshold 
    : Math.min(pullDistance.value, props.maxDistance);
  
  return {
    transform: `translateY(${translateY}px)`,
    transition: isPulling.value ? 'none' : 'transform 0.3s ease'
  };
});

// 计算图标样式
const iconStyle = computed(() => {
  const rotation = Math.min(180 * pullDistance.value / props.threshold, 180);
  return {
    transform: `rotate(${rotation}deg)`
  };
});

// 计算指示器文本
const indicatorText = computed(() => {
  if (isRefreshing.value) return props.refreshingText;
  return pullDistance.value >= props.threshold ? props.releaseText : props.pullText;
});

// 处理触摸开始事件
const handleTouchStart = (e: TouchEvent) => {
  if (props.disabled || isRefreshing.value) return;
  
  // 只有在页面顶部才启用下拉刷新
  if (document.documentElement.scrollTop > 0) return;
  
  startY.value = e.touches[0].clientY;
  isPulling.value = true;
};

// 处理触摸移动事件
const handleTouchMove = (e: TouchEvent) => {
  if (!isPulling.value || props.disabled || isRefreshing.value) return;
  
  const currentY = e.touches[0].clientY;
  const diff = currentY - startY.value;
  
  // 只处理下拉操作
  if (diff <= 0) {
    isPulling.value = false;
    pullDistance.value = 0;
    return;
  }
  
  // 计算下拉距离，添加阻尼效果
  pullDistance.value = Math.pow(diff, 0.8);
  
  // 阻止默认滚动行为
  if (pullDistance.value > 0) {
    e.preventDefault();
  }
};

// 处理触摸结束事件
const handleTouchEnd = () => {
  if (!isPulling.value || props.disabled) return;
  
  if (pullDistance.value >= props.threshold) {
    emit('refresh');
  }
  
  // 如果不是刷新状态，重置下拉距离
  if (!isRefreshing.value) {
    pullDistance.value = 0;
  }
  
  isPulling.value = false;
};

// 监听窗口大小变化
const handleResize = () => {
  // 重置状态
  isPulling.value = false;
  pullDistance.value = 0;
};

// 组件挂载时添加事件监听
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

// 组件卸载前移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.pull-to-refresh-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.pull-to-refresh-indicator {
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s;
}

.pull-to-refresh-indicator.visible {
  opacity: 1;
}

.indicator-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.indicator-icon {
  font-size: 20px;
  margin-right: 8px;
  transition: transform 0.3s;
}

.indicator-icon.refreshing {
  animation: spin 1s infinite linear;
}

.indicator-text {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.pull-to-refresh-content {
  width: 100%;
  min-height: 100%;
  will-change: transform;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
