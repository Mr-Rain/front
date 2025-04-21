<template>
  <div class="table-export">
    <export-button
      :text="buttonText"
      :type="buttonType"
      :size="buttonSize"
      :icon="Download"
      :data="exportData"
      :fileName="fileName"
      :headers="exportHeaders"
      :elementId="tableId"
      :support-types="supportTypes"
      :pdf-options="pdfOptions"
      @export-success="handleExportSuccess"
      @export-error="handleExportError"
    />
    
    <!-- 用于PDF导出的表格容器（默认隐藏） -->
    <div :id="tableId" ref="tableContainer" class="table-export-container" :style="{ display: 'none' }">
      <div class="export-header">
        <h2 class="export-title">{{ title }}</h2>
        <p v-if="subtitle" class="export-subtitle">{{ subtitle }}</p>
      </div>
      
      <table class="export-table">
        <thead>
          <tr>
            <th v-for="(column, index) in columns" :key="index">{{ column.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in data" :key="rowIndex">
            <td v-for="(column, colIndex) in columns" :key="colIndex">
              {{ formatCellValue(row, column) }}
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="export-footer">
        <p>导出时间：{{ formatDateTime(new Date()) }}</p>
        <p v-if="footerText">{{ footerText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ExportButton from '@/components/common/ExportButton.vue';
import { Download } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  // 按钮文本
  buttonText: {
    type: String,
    default: '导出数据'
  },
  // 按钮类型
  buttonType: {
    type: String,
    default: 'primary'
  },
  // 按钮大小
  buttonSize: {
    type: String,
    default: 'default'
  },
  // 表格数据
  data: {
    type: Array,
    required: true
  },
  // 表格列配置
  columns: {
    type: Array as () => Array<{
      prop: string;
      label: string;
      formatter?: (row: any, column: any, cellValue: any, index: number) => any;
    }>,
    required: true
  },
  // 导出文件名（不含扩展名）
  fileName: {
    type: String,
    default: 'table-export'
  },
  // 导出表格标题
  title: {
    type: String,
    default: '数据导出'
  },
  // 导出表格副标题
  subtitle: {
    type: String,
    default: ''
  },
  // 导出表格页脚文本
  footerText: {
    type: String,
    default: ''
  },
  // 支持的导出类型
  supportTypes: {
    type: Array as () => Array<'excel' | 'pdf' | 'csv' | 'json'>,
    default: () => ['excel', 'pdf', 'csv', 'json']
  },
  // 表格ID（用于PDF导出）
  tableId: {
    type: String,
    default: 'export-table-container'
  }
});

const emit = defineEmits(['export-success', 'export-error']);
const tableContainer = ref<HTMLElement | null>(null);

// 计算导出数据
const exportData = computed(() => {
  return props.data.map(row => {
    const exportRow: Record<string, any> = {};
    
    props.columns.forEach(column => {
      const value = column.formatter 
        ? column.formatter(row, column, row[column.prop], 0) 
        : row[column.prop];
      
      exportRow[column.prop] = value;
    });
    
    return exportRow;
  });
});

// 计算导出表头映射
const exportHeaders = computed(() => {
  const headers: Record<string, string> = {};
  
  props.columns.forEach(column => {
    headers[column.prop] = column.label;
  });
  
  return headers;
});

// PDF导出选项
const pdfOptions = computed(() => ({
  format: 'a4',
  orientation: props.columns.length > 5 ? 'landscape' : 'portrait',
  margin: 10,
  scale: 1,
  title: props.title
}));

// 格式化单元格值
const formatCellValue = (row: any, column: any): string => {
  if (!row || !column.prop) return '';
  
  const value = row[column.prop];
  
  if (value === null || value === undefined) {
    return '';
  }
  
  if (column.formatter) {
    return column.formatter(row, column, value, 0);
  }
  
  return String(value);
};

// 格式化日期时间
const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 处理导出成功
const handleExportSuccess = (event: any) => {
  emit('export-success', event);
};

// 处理导出错误
const handleExportError = (event: any) => {
  emit('export-error', event);
};

// 初始化
onMounted(() => {
  // 确保表格容器存在
  tableContainer.value = document.getElementById(props.tableId);
  if (!tableContainer.value && props.supportTypes.includes('pdf')) {
    console.warn(`Table container with ID "${props.tableId}" not found. PDF export may not work correctly.`);
  }
});
</script>

<style scoped>
.table-export {
  display: inline-block;
}

.table-export-container {
  width: 100%;
  max-width: 210mm; /* A4宽度 */
  padding: 20mm;
  background-color: white;
  font-family: 'Arial', 'Microsoft YaHei', sans-serif;
  color: #333;
}

.export-header {
  text-align: center;
  margin-bottom: 20px;
}

.export-title {
  font-size: 20px;
  margin: 0 0 10px;
  color: #333;
}

.export-subtitle {
  font-size: 14px;
  margin: 0;
  color: #666;
}

.export-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.export-table th,
.export-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.export-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.export-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.export-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #999;
}

/* 打印样式 */
@media print {
  .table-export-container {
    padding: 0;
    width: 100%;
  }
}
</style>
