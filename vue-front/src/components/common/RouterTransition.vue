<template>
  <page-transition
    :name="transitionName"
    :mode="mode"
    :appear="appear"
    :type="type"
    :direction="direction"
    :duration="duration"
    :delay="delay"
    :easing="easing"
  >
    <slot />
  </page-transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import PageTransition from './PageTransition.vue';

// 定义组件属性
const props = defineProps({
  // 过渡模式
  mode: {
    type: String,
    default: 'out-in'
  },
  // 是否在初始渲染时应用过渡
  appear: {
    type: Boolean,
    default: true
  },
  // 过渡类型
  type: {
    type: String,
    default: 'fade',
    validator: (value: string) => {
      return ['fade', 'slide', 'zoom', 'bounce', 'flip', 'scale', 'custom'].includes(value);
    }
  },
  // 过渡方向（仅适用于 slide 类型）
  direction: {
    type: String,
    default: 'right',
    validator: (value: string) => {
      return ['left', 'right', 'up', 'down'].includes(value);
    }
  },
  // 过渡持续时间（毫秒）
  duration: {
    type: Number,
    default: 300
  },
  // 过渡延迟（毫秒）
  delay: {
    type: Number,
    default: 0
  },
  // 过渡时间函数
  easing: {
    type: String,
    default: 'ease'
  },
  // 是否启用路由深度感知过渡
  enableRouteDepth: {
    type: Boolean,
    default: true
  },
  // 是否启用路由名称感知过渡
  enableRouteNames: {
    type: Boolean,
    default: true
  },
  // 自定义过渡映射
  transitionMap: {
    type: Object as () => Record<string, string>,
    default: () => ({})
  }
});

const route = useRoute();
const transitionName = ref('fade');

// 计算路由深度
const getRouteDepth = (path: string): number => {
  return path.split('/').filter(Boolean).length;
};

// 更新过渡名称
const updateTransitionName = (to: string, from: string) => {
  // 如果是初始加载，使用默认过渡
  if (!from) {
    transitionName.value = `${props.type}${props.type === 'slide' ? `-${props.direction}` : ''}`;
    return;
  }

  // 检查自定义过渡映射
  const toName = route.name?.toString() || '';
  if (props.enableRouteNames && toName && props.transitionMap[toName]) {
    transitionName.value = props.transitionMap[toName];
    return;
  }

  // 基于路由深度的过渡
  if (props.enableRouteDepth) {
    const toDepth = getRouteDepth(to);
    const fromDepth = getRouteDepth(from);

    if (toDepth > fromDepth) {
      // 导航到更深层级的路由
      transitionName.value = 'slide-right';
    } else if (toDepth < fromDepth) {
      // 导航到更浅层级的路由
      transitionName.value = 'slide-left';
    } else {
      // 同级路由导航
      transitionName.value = `${props.type}${props.type === 'slide' ? `-${props.direction}` : ''}`;
    }
  } else {
    // 使用默认过渡
    transitionName.value = `${props.type}${props.type === 'slide' ? `-${props.direction}` : ''}`;
  }
};

// 监听路由变化
watch(
  () => route.fullPath,
  (to, from) => {
    updateTransitionName(to, from);
  }
);

// 组件挂载时设置初始过渡
onMounted(() => {
  updateTransitionName(route.fullPath, '');
});
</script>
