<template>
  <div class="optimized-image-container" :style="containerStyle">
    <!-- 使用v-lazy指令实现懒加载 -->
    <img
      v-lazy="optimizedSrc"
      :alt="alt"
      :class="['optimized-image', { 'rounded': rounded, 'circle': circle }]"
      :style="imageStyle"
      @error="handleError"
    />
    <!-- 加载状态 -->
    <div v-if="loading" class="image-loading">
      <el-skeleton-item variant="image" :style="skeletonStyle" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { checkWebpSupport, getOptimizedImagePath, handleImageError, DEFAULT_AVATAR } from '@/utils/imageUtils';

// 定义组件属性
const props = defineProps({
  // 图片源
  src: {
    type: String,
    required: true
  },
  // 替代文本
  alt: {
    type: String,
    default: ''
  },
  // 宽度
  width: {
    type: [String, Number],
    default: 'auto'
  },
  // 高度
  height: {
    type: [String, Number],
    default: 'auto'
  },
  // 是否圆角
  rounded: {
    type: Boolean,
    default: false
  },
  // 是否圆形
  circle: {
    type: Boolean,
    default: false
  },
  // 填充模式
  fit: {
    type: String,
    default: 'cover',
    validator: (value: string) => ['fill', 'contain', 'cover', 'none', 'scale-down'].includes(value)
  },
  // 备用图片
  fallbackSrc: {
    type: String,
    default: DEFAULT_AVATAR
  }
});

// 状态
const loading = ref(true);
const supportsWebP = ref(false);
const optimizedSrc = ref(props.src);

// 计算样式
const containerStyle = computed(() => {
  const style: Record<string, string> = {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  };
  return style;
});

const imageStyle = computed(() => {
  return {
    objectFit: props.fit as any,
    width: '100%',
    height: '100%',
  };
});

const skeletonStyle = computed(() => {
  return {
    width: '100%',
    height: '100%',
    borderRadius: props.circle ? '50%' : props.rounded ? '8px' : '0',
  };
});

// 处理图片加载错误
const handleError = (event: Event) => {
  handleImageError(event, props.fallbackSrc);
};

// 初始化WebP支持检测
const initWebPSupport = async () => {
  try {
    supportsWebP.value = await checkWebpSupport();
    updateOptimizedSrc();
  } catch (error) {
    console.error('WebP支持检测失败:', error);
    supportsWebP.value = false;
  }
};

// 更新优化后的图片源
const updateOptimizedSrc = () => {
  if (props.src) {
    optimizedSrc.value = getOptimizedImagePath(props.src, supportsWebP.value);
  }
};

// 监听图片加载完成
const handleImageLoaded = () => {
  loading.value = false;
};

// 监听src变化
watch(() => props.src, () => {
  loading.value = true;
  updateOptimizedSrc();
});

// 组件挂载时
onMounted(() => {
  initWebPSupport();
  
  // 监听图片加载事件
  const img = new Image();
  img.onload = handleImageLoaded;
  img.onerror = () => {
    loading.value = false;
  };
  img.src = optimizedSrc.value;
});
</script>

<style scoped>
.optimized-image-container {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.optimized-image {
  display: block;
  transition: opacity 0.3s ease;
}

.optimized-image.rounded {
  border-radius: 8px;
}

.optimized-image.circle {
  border-radius: 50%;
}

.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color-light);
}
</style>
