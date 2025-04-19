<template>
  <div :class="{'hidden': hidden}" class="pagination-container">
    <el-pagination
      v-model:current-page="internalCurrentPage"
      v-model:page-size="internalPageSize"
      :background="background"
      :layout="layout"
      :page-sizes="pageSizes"
      :pager-count="pagerCount"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { scrollTo } from '@/utils/scroll-to'; // Optional: Import scroll utility

const props = defineProps({
  total: {
    required: true,
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 10
  },
  pageSizes: {
    type: Array as () => number[],
    default: () => [10, 20, 30, 50, 100]
  },
  // Number of pagers
  pagerCount: {
    type: Number,
    default: 5 // Use default document value: 7 -> 5 for smaller layout
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  },
  background: {
    type: Boolean,
    default: true
  },
  autoScroll: { // Automatically scroll to top on page change
    type: Boolean,
    default: true
  },
  hidden: { // Hide pagination when total is 0
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:page', 'update:limit', 'pagination']);

// Use internal refs synced with props for v-model binding
const internalCurrentPage = ref(props.page);
const internalPageSize = ref(props.limit);

// Watch for prop changes to update internal state
watch(() => props.page, (val) => {
  internalCurrentPage.value = val;
});

watch(() => props.limit, (val) => {
  internalPageSize.value = val;
});

const handleSizeChange = (val: number) => {
  // Emit update events first
  emit('update:limit', val);
  // Then emit the pagination event with new limit and page 1
  emit('pagination', { page: 1, limit: val }); // Reset to page 1 when size changes
  if (props.autoScroll) {
    scrollTo(0, 800); // Scroll to top
  }
};

const handleCurrentChange = (val: number) => {
   // Emit update events first
  emit('update:page', val);
   // Then emit the pagination event
  emit('pagination', { page: val, limit: props.limit });
  if (props.autoScroll) {
    scrollTo(0, 800);
  }
};

</script>

<style scoped>
.pagination-container {
  background: #fff;
  padding: 15px 16px;
  text-align: right; /* Default to right alignment */
}
.pagination-container.hidden {
  display: none;
}

/* Optional: Center pagination on smaller screens */
@media (max-width: 768px) {
    .pagination-container {
        text-align: center;
    }
}
</style> 