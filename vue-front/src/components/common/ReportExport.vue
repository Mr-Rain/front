<template>
  <div class="report-export">
    <el-button :type="buttonType" :size="buttonSize" @click="showExportDialog" :icon="Download">
      {{ buttonText }}
    </el-button>
    
    <!-- 导出选项对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <el-form :model="exportForm" label-position="top">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.format">
            <el-radio label="pdf">PDF文档</el-radio>
            <el-radio label="image" v-if="hasCharts">图片</el-radio>
            <el-radio label="excel" v-if="hasTableData">Excel表格</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="文件名">
          <el-input v-model="exportForm.fileName" placeholder="请输入文件名（不含扩展名）"></el-input>
        </el-form-item>
        
        <el-form-item label="报表标题">
          <el-input v-model="exportForm.title" placeholder="请输入报表标题"></el-input>
        </el-form-item>
        
        <el-form-item label="页面方向" v-if="exportForm.format === 'pdf'">
          <el-radio-group v-model="exportForm.orientation">
            <el-radio label="portrait">纵向</el-radio>
            <el-radio label="landscape">横向</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="包含内容" v-if="exportForm.format === 'pdf'">
          <el-checkbox-group v-model="exportForm.includeContent">
            <el-checkbox label="charts" v-if="hasCharts">图表</el-checkbox>
            <el-checkbox label="tables" v-if="hasTableData">表格数据</el-checkbox>
            <el-checkbox label="summary" v-if="hasSummaryData">摘要数据</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleExport" :loading="exporting">
            导出
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 用于PDF导出的报表容器（默认隐藏） -->
    <div :id="reportContainerId" ref="reportContainer" class="report-container" :style="{ display: 'none' }">
      <div class="report-header">
        <h1 class="report-title">{{ exportForm.title }}</h1>
        <p class="report-date">生成时间：{{ formatDateTime(new Date()) }}</p>
      </div>
      
      <!-- 摘要数据 -->
      <div v-if="hasSummaryData && exportForm.includeContent.includes('summary')" class="report-section summary-section">
        <h2 class="section-title">数据摘要</h2>
        <div class="summary-grid">
          <div v-for="(item, index) in summaryData" :key="index" class="summary-item">
            <div class="summary-label">{{ item.label }}</div>
            <div class="summary-value">{{ item.value }}</div>
          </div>
        </div>
      </div>
      
      <!-- 图表部分 -->
      <div v-if="hasCharts && exportForm.includeContent.includes('charts')" class="report-section charts-section">
        <h2 class="section-title">图表数据</h2>
        <div class="charts-grid">
          <div v-for="(chart, index) in chartData" :key="index" class="chart-container">
            <h3 class="chart-title">{{ chart.title }}</h3>
            <div :id="`export-chart-${index}`" class="chart-placeholder" :style="{ height: '300px' }">
              <!-- 图表将在导出前动态渲染到这里 -->
            </div>
          </div>
        </div>
      </div>
      
      <!-- 表格数据 -->
      <div v-if="hasTableData && exportForm.includeContent.includes('tables')" class="report-section tables-section">
        <h2 class="section-title">表格数据</h2>
        <div v-for="(table, tableIndex) in tableData" :key="tableIndex" class="table-wrapper">
          <h3 class="table-title">{{ table.title }}</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th v-for="(column, colIndex) in table.columns" :key="colIndex">
                  {{ column.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in table.data" :key="rowIndex">
                <td v-for="(column, colIndex) in table.columns" :key="colIndex">
                  {{ formatCellValue(row, column) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="report-footer">
        <p>{{ footerText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { Download } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { exportToPDF, exportToExcel, exportChartToImage } from '@/utils/exportUtils';
import * as echarts from 'echarts';

const props = defineProps({
  // 按钮文本
  buttonText: {
    type: String,
    default: '导出报表'
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
  // 对话框标题
  dialogTitle: {
    type: String,
    default: '导出报表'
  },
  // 报表标题
  reportTitle: {
    type: String,
    default: '数据统计报表'
  },
  // 报表容器ID
  reportContainerId: {
    type: String,
    default: 'report-export-container'
  },
  // 页脚文本
  footerText: {
    type: String,
    default: '© 校园招聘系统'
  },
  // 图表数据
  chartData: {
    type: Array as () => Array<{
      title: string;
      options: echarts.EChartsOption;
    }>,
    default: () => []
  },
  // 表格数据
  tableData: {
    type: Array as () => Array<{
      title: string;
      columns: Array<{
        prop: string;
        label: string;
        formatter?: (row: any, column: any, cellValue: any, index: number) => any;
      }>;
      data: any[];
    }>,
    default: () => []
  },
  // 摘要数据
  summaryData: {
    type: Array as () => Array<{
      label: string;
      value: string | number;
    }>,
    default: () => []
  },
  // 默认文件名
  defaultFileName: {
    type: String,
    default: 'report'
  }
});

const emit = defineEmits(['export-success', 'export-error']);

// 状态
const dialogVisible = ref(false);
const exporting = ref(false);
const reportContainer = ref<HTMLElement | null>(null);
const chartInstances = ref<echarts.ECharts[]>([]);

// 导出表单
const exportForm = reactive({
  format: 'pdf',
  fileName: props.defaultFileName,
  title: props.reportTitle,
  orientation: 'portrait',
  includeContent: ['charts', 'tables', 'summary']
});

// 计算属性
const hasCharts = computed(() => props.chartData.length > 0);
const hasTableData = computed(() => props.tableData.length > 0);
const hasSummaryData = computed(() => props.summaryData.length > 0);

// 显示导出对话框
const showExportDialog = () => {
  // 重置表单
  exportForm.format = 'pdf';
  exportForm.fileName = props.defaultFileName;
  exportForm.title = props.reportTitle;
  exportForm.orientation = 'portrait';
  exportForm.includeContent = ['charts', 'tables', 'summary'];
  
  dialogVisible.value = true;
};

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

// 渲染图表
const renderCharts = () => {
  // 清除之前的图表实例
  chartInstances.value.forEach(chart => {
    chart.dispose();
  });
  chartInstances.value = [];
  
  // 渲染新的图表
  props.chartData.forEach((chart, index) => {
    const chartContainer = document.getElementById(`export-chart-${index}`);
    if (chartContainer) {
      const chartInstance = echarts.init(chartContainer);
      chartInstance.setOption(chart.options);
      chartInstances.value.push(chartInstance);
    }
  });
};

// 处理导出
const handleExport = async () => {
  if (!exportForm.fileName) {
    ElMessage.warning('请输入文件名');
    return;
  }
  
  try {
    exporting.value = true;
    
    switch (exportForm.format) {
      case 'pdf':
        await triggerPDFExport();
        break;
      case 'image':
        await triggerImageExport();
        break;
      case 'excel':
        await triggerExcelExport();
        break;
      default:
        ElMessage.warning('不支持的导出格式');
        exporting.value = false;
        return;
    }
    
    dialogVisible.value = false;
    ElMessage.success('导出成功');
    emit('export-success', { format: exportForm.format, fileName: exportForm.fileName });
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败，请重试');
    emit('export-error', { format: exportForm.format, error });
  } finally {
    exporting.value = false;
  }
};

// 导出为PDF
const triggerPDFExport = async () => {
  if (!reportContainer.value) {
    throw new Error('报表容器不存在');
  }
  
  // 显示报表容器
  reportContainer.value.style.display = 'block';
  
  // 渲染图表
  if (hasCharts.value && exportForm.includeContent.includes('charts')) {
    renderCharts();
    // 等待图表渲染完成
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  try {
    // 导出为PDF - 调用导入的辅助函数
    await exportToPDFHelper(reportContainer.value, exportForm.fileName, {
      format: 'a4',
      orientation: exportForm.orientation as 'portrait' | 'landscape',
      margin: 10,
      scale: 1.5,
      title: exportForm.title
    });
  } finally {
    // 隐藏报表容器
    reportContainer.value.style.display = 'none';
  }
};

// 导出为图片
const triggerImageExport = async () => {
  if (!hasCharts.value) {
    throw new Error('没有图表可导出');
  }
  
  // 如果只有一个图表，直接导出
  if (props.chartData.length === 1 && chartInstances.value.length === 1) {
    exportChartToImage(chartInstances.value[0], exportForm.fileName);
    return;
  }
  
  // 如果有多个图表，显示报表容器并渲染图表
  if (!reportContainer.value) {
    throw new Error('报表容器不存在');
  }
  
  // 显示报表容器
  reportContainer.value.style.display = 'block';
  
  // 渲染图表
  renderCharts();
  
  // 等待图表渲染完成
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // 导出为PDF（模拟图片效果）
    await exportToPDFHelper(reportContainer.value, exportForm.fileName, {
      format: 'a4',
      orientation: 'landscape',
      margin: 10,
      scale: 2,
      title: exportForm.title
    });
  } finally {
    // 隐藏报表容器
    reportContainer.value.style.display = 'none';
  }
};

// 导出为Excel
const triggerExcelExport = async () => {
  if (!hasTableData.value) {
    throw new Error('没有表格数据可导出');
  }
  
  // 准备Excel数据
  const allData: any[] = [];
  
  // 添加摘要数据
  if (hasSummaryData.value) {
    props.summaryData.forEach(item => {
      allData.push({ 
        category: '摘要数据',
        label: item.label, 
        value: item.value 
      });
    });
  }
  
  // 添加表格数据
  props.tableData.forEach(table => {
    table.data.forEach(row => {
      const excelRow: Record<string, any> = { category: table.title };
      
      table.columns.forEach(column => {
        excelRow[column.label] = formatCellValue(row, column);
      });
      
      allData.push(excelRow);
    });
  });
  
  // 导出Excel - 调用导入的辅助函数
  exportToExcel(allData, exportForm.fileName);
};

// 导出为PDF的辅助函数 - 重命名导入的函数以避免冲突
const exportToPDFHelper = async (
  element: HTMLElement,
  fileName: string,
  options: {
    format?: 'a4' | 'a3' | 'letter' | 'legal';
    orientation?: 'portrait' | 'landscape';
    margin?: number;
    scale?: number;
    title?: string;
  } = {}
) => {
  const { exportToPDF: pdfExporter } = await import('@/utils/exportUtils');
  return pdfExporter(element, fileName, options);
};

// 初始化
onMounted(() => {
  // 获取报表容器
  reportContainer.value = document.getElementById(props.reportContainerId);
  
  // 确保报表容器存在
  if (!reportContainer.value) {
    console.warn(`Report container with ID "${props.reportContainerId}" not found. PDF export may not work correctly.`);
  }
});
</script>

<style scoped>
.report-container {
  width: 100%;
  max-width: 210mm; /* A4宽度 */
  padding: 20mm;
  background-color: white;
  font-family: 'Arial', 'Microsoft YaHei', sans-serif;
  color: #333;
}

.report-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
  padding-bottom: 20px;
}

.report-title {
  font-size: 24px;
  margin: 0 0 10px;
  color: #333;
}

.report-date {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.report-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 20px;
  margin: 0 0 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
  color: #2c3e50;
}

/* 摘要部分样式 */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.summary-item {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

/* 图表部分样式 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.chart-container {
  background-color: #fff;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 16px;
  margin: 0 0 10px;
  color: #333;
}

.chart-placeholder {
  width: 100%;
  background-color: #f9f9f9;
  border-radius: 5px;
}

/* 表格部分样式 */
.table-wrapper {
  margin-bottom: 20px;
}

.table-title {
  font-size: 16px;
  margin: 0 0 10px;
  color: #333;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.data-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.data-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.report-footer {
  margin-top: 30px;
  text-align: center;
  font-size: 12px;
  color: #999;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

/* 打印样式 */
@media print {
  .report-container {
    padding: 0;
    width: 100%;
  }
}
</style>
