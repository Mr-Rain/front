<template>
  <component
    :is="transitionComponent"
    :name="name"
    :mode="mode"
    :appear="appear"
    :css="css"
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @enter-cancelled="enterCancelled"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
    @leave-cancelled="leaveCancelled"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 定义组件属性
const props = defineProps({
  // 过渡名称
  name: {
    type: String,
    default: 'fade'
  },
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
  // 是否使用 CSS 过渡
  css: {
    type: Boolean,
    default: true
  },
  // 是否使用 TransitionGroup
  group: {
    type: Boolean,
    default: false
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
  }
});

// 定义事件
const emit = defineEmits([
  'before-enter',
  'enter',
  'after-enter',
  'enter-cancelled',
  'before-leave',
  'leave',
  'after-leave',
  'leave-cancelled'
]);

// 计算使用的组件（Transition 或 TransitionGroup）
const transitionComponent = computed(() => {
  return props.group ? 'TransitionGroup' : 'Transition';
});

// 生命周期钩子
const beforeEnter = (el: Element) => {
  // 设置过渡持续时间和延迟
  if (el instanceof HTMLElement) {
    el.style.transition = `all ${props.duration}ms ${props.easing} ${props.delay}ms`;
  }
  emit('before-enter', el);
};

const enter = (el: Element, done: () => void) => {
  emit('enter', el, done);
};

const afterEnter = (el: Element) => {
  emit('after-enter', el);
};

const enterCancelled = (el: Element) => {
  emit('enter-cancelled', el);
};

const beforeLeave = (el: Element) => {
  // 设置过渡持续时间和延迟
  if (el instanceof HTMLElement) {
    el.style.transition = `all ${props.duration}ms ${props.easing} ${props.delay}ms`;
  }
  emit('before-leave', el);
};

const leave = (el: Element, done: () => void) => {
  emit('leave', el, done);
};

const afterLeave = (el: Element) => {
  emit('after-leave', el);
};

const leaveCancelled = (el: Element) => {
  emit('leave-cancelled', el);
};
</script>

<style>
/* 淡入淡出过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity v-bind('`${props.duration}ms ${props.easing} ${props.delay}ms`');
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滑动过渡 - 从右侧 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform v-bind('`${props.duration}ms ${props.easing} ${props.delay}ms`'), opacity v-bind('`${props.duration}ms ${props.easing} ${props.delay}ms`');
}

.slide-right-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

/* 滑动过渡 - 从左侧 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform v-bind('`${props.duration}ms ${props.easing} ${props.delay}ms`'), opacity v-bind('`${props.duration}ms ${props.easing} ${props.delay}ms`');
}

.slide-left-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

/* 滑动过渡 - 从上方 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform v-bind('`${props.duration}ms ${props.easing} ${props.delay}ms`'), opacity v-bind('`${props.duration}ms ${props.easing} ${props.delay}ms`');
}

.slide-up-enter-from {
  transform: translateY(-30px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(30px);
  opacity: 0;
}

/* 滑动过渡 - 从下方 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform v-bind('`${props.duration}ms ${props.easing} ${props.delay}ms`'), opacity v-bind('`${props.duration}ms ${props.easing} ${props.delay}ms`');
}

.slide-down-enter-from {
  transform: translateY(30px);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-30px);
  opacity: 0;
}

/* 缩放过渡 */
.zoom-enter-active,
.zoom-leave-active {
  transition: transform v-bind('`${props.duration}ms ${props.easing} ${props.delay}ms`'), opacity v-bind('`${props.duration}ms ${props.easing} ${props.delay}ms`');
}

.zoom-enter-from,
.zoom-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

/* 弹跳过渡 */
.bounce-enter-active {
  animation: bounce-in v-bind('props.duration') v-bind('props.easing') v-bind('props.delay + "ms"');
}

.bounce-leave-active {
  animation: bounce-in v-bind('props.duration') v-bind('props.easing') v-bind('props.delay + "ms"') reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 翻转过渡 */
.flip-enter-active,
.flip-leave-active {
  transition: transform v-bind('`${props.duration}ms ${props.easing} ${props.delay}ms`'), opacity v-bind('`${props.duration}ms ${props.easing} ${props.delay}ms`');
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.flip-enter-from {
  transform: rotateY(90deg);
  opacity: 0;
}

.flip-leave-to {
  transform: rotateY(-90deg);
  opacity: 0;
}

/* 缩放过渡 */
.scale-enter-active,
.scale-leave-active {
  transition: transform v-bind('`${props.duration}ms ${props.easing} ${props.delay}ms`'), opacity v-bind('`${props.duration}ms ${props.easing} ${props.delay}ms`');
}

.scale-enter-from {
  transform: scale(1.1);
  opacity: 0;
}

.scale-leave-to {
  transform: scale(0.9);
  opacity: 0;
}
</style>
