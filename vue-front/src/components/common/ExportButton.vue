<template>
  <div class="export-button-container">
    <el-dropdown @command="handleExport" trigger="click">
      <el-button :type="type" :size="size" :icon="icon">
        {{ text }}
        <el-icon class="el-icon--right"><arrow-down /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-if="supportExcel" command="excel">
            <el-icon><document /></el-icon>导出Excel
          </el-dropdown-item>
          <el-dropdown-item v-if="supportPDF" command="pdf">
            <el-icon><document /></el-icon>导出PDF
          </el-dropdown-item>
          <el-dropdown-item v-if="supportCSV" command="csv">
            <el-icon><document /></el-icon>导出CSV
          </el-dropdown-item>
          <el-dropdown-item v-if="supportImage" command="image">
            <el-icon><picture /></el-icon>导出图片
          </el-dropdown-item>
          <el-dropdown-item v-if="supportJSON" command="json">
            <el-icon><document /></el-icon>导出JSON
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowDown, Document, Picture } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { 
  exportToExcel, 
  exportToPDF, 
  exportToCSV, 
  exportToJSON, 
  exportChartToImage 
} from '@/utils/exportUtils';

const props = defineProps({
  // 按钮文本
  text: {
    type: String,
    default: '导出'
  },
  // 按钮类型
  type: {
    type: String,
    default: 'primary'
  },
  // 按钮大小
  size: {
    type: String,
    default: 'default'
  },
  // 按钮图标
  icon: {
    type: Object,
    default: null
  },
  // 导出数据
  data: {
    type: Array,
    default: () => []
  },
  // 导出文件名（不含扩展名）
  fileName: {
    type: String,
    default: 'export'
  },
  // 导出表头映射（用于CSV和Excel）
  headers: {
    type: Object,
    default: () => ({})
  },
  // 要导出为PDF的元素ID
  elementId: {
    type: String,
    default: ''
  },
  // 图表实例（用于导出图表图片）
  chart: {
    type: Object,
    default: null
  },
  // 支持的导出类型
  supportTypes: {
    type: Array as () => Array<'excel' | 'pdf' | 'csv' | 'image' | 'json'>,
    default: () => ['excel', 'pdf', 'csv']
  },
  // PDF导出选项
  pdfOptions: {
    type: Object,
    default: () => ({
      format: 'a4',
      orientation: 'portrait',
      margin: 10,
      scale: 1,
      title: ''
    })
  }
});

const emit = defineEmits(['export-success', 'export-error']);

// 计算属性：是否支持各种导出类型
const supportExcel = computed(() => props.supportTypes.includes('excel'));
const supportPDF = computed(() => props.supportTypes.includes('pdf'));
const supportCSV = computed(() => props.supportTypes.includes('csv'));
const supportImage = computed(() => props.supportTypes.includes('image'));
const supportJSON = computed(() => props.supportTypes.includes('json'));

// 处理导出命令
const handleExport = async (command: string) => {
  try {
    switch (command) {
      case 'excel':
        if (!props.data || props.data.length === 0) {
          ElMessage.warning('没有数据可导出');
          return;
        }
        exportToExcel(props.data, props.fileName);
        break;
        
      case 'pdf':
        if (!props.elementId) {
          ElMessage.warning('未指定要导出的元素ID');
          return;
        }
        await exportToPDF(props.elementId, props.fileName, props.pdfOptions);
        break;
        
      case 'csv':
        if (!props.data || props.data.length === 0) {
          ElMessage.warning('没有数据可导出');
          return;
        }
        exportToCSV(props.data, props.fileName, props.headers);
        break;
        
      case 'image':
        if (!props.chart) {
          ElMessage.warning('未指定要导出的图表实例');
          return;
        }
        exportChartToImage(props.chart, props.fileName);
        break;
        
      case 'json':
        if (!props.data) {
          ElMessage.warning('没有数据可导出');
          return;
        }
        exportToJSON(props.data, props.fileName);
        break;
        
      default:
        ElMessage.warning('不支持的导出类型');
        return;
    }
    
    ElMessage.success('导出成功');
    emit('export-success', { type: command, fileName: props.fileName });
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败，请重试');
    emit('export-error', { type: command, error });
  }
};
</script>

<style scoped>
.export-button-container {
  display: inline-block;
}
</style>
