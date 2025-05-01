<template>
  <div class="time-range-selector">
    <el-date-picker
      v-model="dateRange"
      type="daterange"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      :shortcuts="shortcuts"
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

// 定义 Shortcut 类型
interface Shortcut {
  text: string;
  value: () => [Date | string | null, Date | string | null];
}

// 使用接口定义 Props 类型
interface Props {
  modelValue?: [Date | string | null, Date | string | null];
  shortcuts?: Shortcut[];
}

// 使用 withDefaults 提供默认值
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [null, null],
  shortcuts: () => [
    {
      text: '最近一周',
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
        return [start, end];
      }
    },
    {
      text: '最近一个月',
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        return [start, end];
      }
    },
    {
      text: '最近三个月',
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 3);
        return [start, end];
      }
    }
  ]
});

const emit = defineEmits(['update:modelValue', 'change']);

// 现在 props.modelValue 具有正确的类型，可以直接使用
const dateRange = ref<[Date | string | null, Date | string | null]>([...props.modelValue]);

// 监听外部值变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (Array.isArray(newVal) && newVal.length === 2 &&
        (newVal[0] === null || typeof newVal[0] === 'string' || newVal[0] instanceof Date) &&
        (newVal[1] === null || typeof newVal[1] === 'string' || newVal[1] instanceof Date))
    {
      dateRange.value = [newVal[0], newVal[1]];
    } else {
      dateRange.value = [null, null];
    }
  },
  { deep: true }
);

// 处理日期变化
const handleChange = (val: [Date | string | null, Date | string | null] | null) => {
  if (val && Array.isArray(val) && val.length === 2) {
    // 显式类型断言以解决 Linter 误报
    const dateTuple = val as [Date | string | null, Date | string | null];
    emit('update:modelValue', dateTuple);
    emit('change', dateTuple);
  } else {
    const nullRange: [null, null] = [null, null];
    emit('update:modelValue', nullRange);
    emit('change', nullRange);
  }
};
</script>

<style scoped>
.time-range-selector {
  display: inline-block;
}
</style>
