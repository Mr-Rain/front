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

const props = defineProps({
  modelValue: {
    type: Array as () => [Date | string | null, Date | string | null],
    default: () => [null, null]
  },
  shortcuts: {
    type: Array,
    default: () => [
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
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const dateRange = ref<[Date | string | null, Date | string | null]>(
  Array.isArray(props.modelValue) ? [...props.modelValue] : [null, null]
);

// 监听外部值变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && Array.isArray(newVal)) {
      dateRange.value = [...newVal];
    }
  },
  { deep: true }
);

// 处理日期变化
const handleChange = (val: [Date | string | null, Date | string | null]) => {
  emit('update:modelValue', val);
  emit('change', val);
};
</script>

<style scoped>
.time-range-selector {
  display: inline-block;
}
</style>
