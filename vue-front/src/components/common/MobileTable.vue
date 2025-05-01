<template>
  <div class="mobile-table-container">
    <!-- 移动端表格视图 -->
    <div v-if="isMobile" class="mobile-table">
      <!-- 表格标题 -->
      <div v-if="title" class="mobile-table-title">
        <h3>{{ title }}</h3>
        <slot name="title-extra"></slot>
      </div>

      <!-- 表格内容 -->
      <div v-if="data && data.length > 0" class="mobile-table-content">
        <div
          v-for="(item, index) in data"
          :key="index"
          class="mobile-table-card"
          @click="handleCardClick(item)"
        >
          <div class="mobile-card-header" v-if="showHeader">
            <slot name="card-header" :row="item">
              <div class="mobile-card-title">{{ getMainTitle(item) }}</div>
              <div v-if="getSubTitle(item)" class="mobile-card-subtitle">{{ getSubTitle(item) }}</div>
            </slot>
          </div>

          <div class="mobile-card-body">
            <div
              v-for="column in visibleColumns"
              :key="column.prop"
              class="mobile-card-item"
            >
              <div class="mobile-card-label">{{ column.label }}</div>
              <div class="mobile-card-value">
                <slot :name="column.prop" :row="item">
                  {{ getColumnValue(item, column) }}
                </slot>
              </div>
            </div>
          </div>

          <div class="mobile-card-footer" v-if="$slots.actions">
            <slot name="actions" :row="item"></slot>
          </div>
        </div>
      </div>

      <!-- 空数据状态 -->
      <div v-else class="mobile-table-empty">
        <slot name="empty">
          <el-empty :description="emptyText" />
        </slot>
      </div>

      <!-- 分页 -->
      <div v-if="showPagination && total > 0" class="mobile-table-pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="pageSizes as number[]"
          :total="total"
          layout="prev, pager, next, sizes, total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 桌面端表格视图 -->
    <el-table
      v-else
      :data="data"
      v-bind="$attrs"
      @row-click="handleRowClick"
    >
      <slot></slot>

      <template #empty>
        <slot name="empty">
          <el-empty :description="emptyText" />
        </slot>
      </template>
    </el-table>

    <!-- 桌面端分页 -->
    <div v-if="!isMobile && showPagination && total > 0" class="desktop-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes as number[]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots, useAttrs } from 'vue';
import { ElTable, ElPagination, ElEmpty } from 'element-plus';

// 定义列配置接口
interface ColumnConfig {
  prop: string;
  label: string;
  hideInMobile?: boolean;
  formatter?: (row: any, column: ColumnConfig, cellValue: any, index: number) => any;
}

// 定义组件属性
const props = defineProps({
  // 表格数据
  data: {
    type: Array as () => any[],
    default: () => []
  },
  // 表格列配置
  columns: {
    type: Array as () => ColumnConfig[], // 使用具体类型
    default: () => []
  },
  // 表格标题
  title: {
    type: String,
    default: ''
  },
  // 是否显示表头
  showHeader: {
    type: Boolean,
    default: true
  },
  // 空数据文本
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  // 主标题字段
  mainTitleProp: {
    type: String,
    default: 'title'
  },
  // 副标题字段
  subTitleProp: {
    type: String,
    default: ''
  },
  // 是否显示分页
  showPagination: {
    type: Boolean,
    default: false
  },
  // 总数据量
  total: {
    type: Number,
    default: 0
  },
  // 当前页码
  currentPage: {
    type: Number,
    default: 1
  },
  // 每页数量
  pageSize: {
    type: Number,
    default: 10
  },
  // 每页数量选项
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  // 强制使用移动端视图
  forceMobile: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits([
  'row-click',
  'card-click',
  'update:currentPage',
  'update:pageSize',
  'size-change',
  'current-change'
]);

// 获取插槽和属性
const slots = useSlots();
const attrs = useAttrs();

// 计算是否为移动端视图
const isMobile = computed(() => {
  if (props.forceMobile) return true;
  return window.innerWidth <= 768;
});

// 计算可见列
const visibleColumns = computed(() => {
  return props.columns.filter((col: ColumnConfig) => !col.hideInMobile);
});

// 获取主标题
const getMainTitle = (row: any) => {
  return row[props.mainTitleProp] || '';
};

// 获取副标题
const getSubTitle = (row: any) => {
  return props.subTitleProp ? row[props.subTitleProp] : '';
};

// 获取列值
const getColumnValue = (row: any, column: ColumnConfig) => {
  // 如果有格式化函数，使用格式化函数
  if (column.formatter && typeof column.formatter === 'function') {
    return column.formatter(row, column, null, 0); // 修正：formatter 参数可能与预期不完全一致，暂时传入null
  }

  // 处理嵌套属性，如 'user.name'
  if (column.prop.includes('.')) {
    const props = column.prop.split('.');
    let value = row;
    for (const prop of props) {
      value = value?.[prop];
      if (value === undefined) break;
    }
    return value !== undefined ? value : '';
  }

  return row[column.prop] !== undefined ? row[column.prop] : '';
};

// 处理行点击事件
const handleRowClick = (row: any) => {
  emit('row-click', row);
};

// 处理卡片点击事件
const handleCardClick = (row: any) => {
  emit('card-click', row);
  emit('row-click', row); // 同时触发row-click事件，保持一致性
};

// 处理分页大小变化
const handleSizeChange = (val: number) => {
  emit('update:pageSize', val);
  emit('size-change', val);
};

// 处理页码变化
const handleCurrentChange = (val: number) => {
  emit('update:currentPage', val);
  emit('current-change', val);
};
</script>

<style scoped>
.mobile-table-container {
  width: 100%;
}

/* 移动端表格样式 */
.mobile-table {
  width: 100%;
}

.mobile-table-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.mobile-table-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.mobile-table-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-table-card {
  background-color: #fff;
  border-radius: var(--mobile-border-radius, 8px);
  box-shadow: var(--mobile-card-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.mobile-table-card:active {
  transform: scale(0.98);
}

.mobile-card-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background-color: var(--el-color-primary-light-9);
}

.mobile-card-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.mobile-card-subtitle {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.mobile-card-body {
  padding: 12px 16px;
}

.mobile-card-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.mobile-card-item:last-child {
  margin-bottom: 0;
}

.mobile-card-label {
  color: var(--el-text-color-secondary);
  flex: 0 0 30%;
}

.mobile-card-value {
  flex: 0 0 68%;
  text-align: right;
  word-break: break-word;
}

.mobile-card-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.mobile-table-empty {
  padding: 24px 0;
}

.mobile-table-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.desktop-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .mobile-card-item {
    flex-direction: column;
    margin-bottom: 12px;
  }

  .mobile-card-label {
    flex: none;
    margin-bottom: 4px;
  }

  .mobile-card-value {
    flex: none;
    text-align: left;
  }

  .mobile-table-pagination :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
