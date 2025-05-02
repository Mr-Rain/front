<template>
  <div ref="chartContainer" :style="{ width: width, height: height }" class="echart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

const props = defineProps({
  // 图表选项
  options: {
    type: Object as () => EChartsOption,
    required: true
  },
  // 图表宽度
  width: {
    type: String,
    default: '100%'
  },
  // 图表高度
  height: {
    type: String,
    default: '300px'
  },
  // 是否自动调整大小
  autoResize: {
    type: Boolean,
    default: true
  },
  // 主题
  theme: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['chartInit', 'chartClick', 'chartReady', 'chartMouseover', 'chartMouseout']);

// 图表容器引用
const chartContainer = ref<HTMLElement | null>(null);
// 图表实例
let chartInstance: echarts.ECharts | null = null;

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return;

  // 如果已经存在图表实例，先销毁
  if (chartInstance) {
    chartInstance.dispose();
  }

  // 使用requestAnimationFrame延迟创建图表实例，提高性能
  requestAnimationFrame(() => {
    // 创建图表实例
    chartInstance = echarts.init(chartContainer.value, props.theme);

    // 设置图表选项
    chartInstance.setOption(props.options, true); // 添加第二个参数true，不合并之前的选项，提高性能

    // 添加点击事件监听
    chartInstance.on('click', (params) => {
      emit('chartClick', params);
    });

    // 添加鼠标悬停事件监听
    chartInstance.on('mouseover', (params) => {
      emit('chartMouseover', params);
    });

    // 添加鼠标离开事件监听
    chartInstance.on('mouseout', (params) => {
      emit('chartMouseout', params);
    });

    // 通知图表已初始化
    emit('chartInit', chartInstance);

    // 窗口大小变化时自动调整图表大小
    if (props.autoResize) {
      window.addEventListener('resize', handleResize);
    }

    // 通知图表已准备好
    emit('chartReady', chartInstance);
  });
};

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// 监听选项变化
watch(
  () => props.options,
  (newOptions) => {
    if (chartInstance) {
      // 使用防抖函数延迟更新图表，避免频繁更新
      const updateChart = () => {
        if (chartInstance) {
          chartInstance.setOption(newOptions, true); // 不合并之前的选项，提高性能
        }
      };

      // 使用requestAnimationFrame优化渲染性能
      requestAnimationFrame(updateChart);
    }
  },
  { deep: true, flush: 'post' } // 使用post模式，等待DOM更新后再执行
);

// 组件挂载时初始化图表
onMounted(() => {
  initChart();
});

// 组件卸载时清理资源
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }

  if (props.autoResize) {
    window.removeEventListener('resize', handleResize);
  }
});

// 暴露方法给父组件
defineExpose({
  // 获取图表实例
  getChartInstance: () => chartInstance,
  // 重新调整图表大小
  resize: () => {
    if (chartInstance) {
      chartInstance.resize();
    }
  },
  // 重新初始化图表
  reinit: initChart
});
</script>

<style scoped>
.echart-container {
  position: relative;
}
</style>
