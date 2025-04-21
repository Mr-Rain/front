<template>
  <div class="student-statistics">
    <el-row :gutter="20">
      <!-- 申请状态统计卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">申请状态统计</span>
              <el-tooltip content="展示您的申请在各个状态下的数量分布" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div v-loading="loading" class="chart-container">
            <echart-component 
              v-if="!loading && applicationStatusData.length > 0" 
              :options="applicationStatusChartOptions" 
              height="300px"
              @chart-ready="handleChartReady"
            />
            <el-empty v-else-if="!loading" description="暂无申请数据" />
          </div>
        </el-card>
      </el-col>

      <!-- 申请趋势统计卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">申请趋势</span>
              <el-tooltip content="展示您近期申请数量的变化趋势" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div v-loading="loading" class="chart-container">
            <echart-component 
              v-if="!loading && applicationTrendData.xAxis.length > 0" 
              :options="applicationTrendChartOptions" 
              height="300px"
            />
            <el-empty v-else-if="!loading" description="暂无趋势数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 职位类型分布卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">职位类型分布</span>
              <el-tooltip content="展示您申请的职位类型分布情况" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div v-loading="loading" class="chart-container">
            <echart-component 
              v-if="!loading && jobTypeData.length > 0" 
              :options="jobTypeChartOptions" 
              height="300px"
            />
            <el-empty v-else-if="!loading" description="暂无职位类型数据" />
          </div>
        </el-card>
      </el-col>

      <!-- 申请结果统计卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">申请结果统计</span>
              <el-tooltip content="展示您的申请结果分布情况" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div v-loading="loading" class="chart-container">
            <echart-component 
              v-if="!loading && applicationResultData.length > 0" 
              :options="applicationResultChartOptions" 
              height="300px"
            />
            <el-empty v-else-if="!loading" description="暂无结果数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据概览卡片 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="statistics-summary-card">
          <div class="summary-content">
            <div class="summary-icon application-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-title">申请总数</div>
              <div class="summary-value">{{ statistics.totalApplications }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="statistics-summary-card">
          <div class="summary-content">
            <div class="summary-icon interview-icon">
              <el-icon><ChatLineRound /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-title">面试邀请</div>
              <div class="summary-value">{{ statistics.interviewCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="statistics-summary-card">
          <div class="summary-content">
            <div class="summary-icon offer-icon">
              <el-icon><GoodsFilled /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-title">录用通知</div>
              <div class="summary-value">{{ statistics.offerCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="statistics-summary-card">
          <div class="summary-content">
            <div class="summary-icon rate-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-title">面试通过率</div>
              <div class="summary-value">{{ statistics.interviewPassRate }}%</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useApplicationStore } from '@/stores/application';
import EChartComponent from '@/components/common/EChartComponent.vue';
import { 
  InfoFilled, 
  Document, 
  ChatLineRound, 
  GoodsFilled, 
  DataAnalysis 
} from '@element-plus/icons-vue';
import type { EChartsOption } from 'echarts';

const applicationStore = useApplicationStore();
const loading = ref(true);

// 统计数据
const statistics = reactive({
  totalApplications: 0,
  interviewCount: 0,
  offerCount: 0,
  interviewPassRate: 0
});

// 申请状态数据
const applicationStatusData = ref<{ name: string; value: number }[]>([]);

// 申请趋势数据
const applicationTrendData = reactive({
  xAxis: [] as string[],
  values: [] as number[]
});

// 职位类型数据
const jobTypeData = ref<{ name: string; value: number }[]>([]);

// 申请结果数据
const applicationResultData = ref<{ name: string; value: number }[]>([]);

// 申请状态图表选项
const applicationStatusChartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: applicationStatusData.value.map(item => item.name)
  },
  series: [
    {
      name: '申请状态',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: applicationStatusData.value
    }
  ],
  color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#DCDFE6']
}));

// 申请趋势图表选项
const applicationTrendChartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  xAxis: {
    type: 'category',
    data: applicationTrendData.xAxis,
    axisLabel: {
      interval: 0,
      rotate: 30
    }
  },
  yAxis: {
    type: 'value',
    minInterval: 1
  },
  series: [
    {
      name: '申请数量',
      type: 'bar',
      data: applicationTrendData.values,
      itemStyle: {
        color: '#409EFF'
      }
    }
  ]
}));

// 职位类型图表选项
const jobTypeChartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: jobTypeData.value.map(item => item.name)
  },
  series: [
    {
      name: '职位类型',
      type: 'pie',
      radius: '50%',
      data: jobTypeData.value,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ],
  color: ['#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452']
}));

// 申请结果图表选项
const applicationResultChartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: applicationResultData.value.map(item => item.name)
  },
  series: [
    {
      name: '申请结果',
      type: 'pie',
      radius: ['30%', '60%'],
      center: ['50%', '50%'],
      roseType: 'radius',
      itemStyle: {
        borderRadius: 5
      },
      label: {
        formatter: '{b}: {c}'
      },
      data: applicationResultData.value
    }
  ],
  color: ['#67C23A', '#F56C6C', '#E6A23C', '#909399']
}));

// 处理图表准备好事件
const handleChartReady = (chart: any) => {
  // 可以在这里对图表实例进行额外的配置
  console.log('Chart is ready', chart);
};

// 获取申请统计数据
const fetchApplicationStatistics = async () => {
  loading.value = true;
  try {
    // 这里应该调用API获取实际数据
    // 模拟数据
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 申请状态数据
    applicationStatusData.value = [
      { name: '待处理', value: 5 },
      { name: '已查看', value: 8 },
      { name: '面试中', value: 3 },
      { name: '已录用', value: 2 },
      { name: '未通过', value: 4 },
      { name: '已撤回', value: 1 }
    ];
    
    // 申请趋势数据
    applicationTrendData.xAxis = ['1月', '2月', '3月', '4月', '5月', '6月'];
    applicationTrendData.values = [2, 5, 3, 6, 4, 8];
    
    // 职位类型数据
    jobTypeData.value = [
      { name: '前端开发', value: 10 },
      { name: 'UI设计', value: 5 },
      { name: '后端开发', value: 8 },
      { name: '产品经理', value: 3 },
      { name: '测试工程师', value: 4 }
    ];
    
    // 申请结果数据
    applicationResultData.value = [
      { name: '已录用', value: 2 },
      { name: '未通过', value: 4 },
      { name: '面试中', value: 3 },
      { name: '待处理', value: 13 }
    ];
    
    // 统计数据
    statistics.totalApplications = 23;
    statistics.interviewCount = 5;
    statistics.offerCount = 2;
    statistics.interviewPassRate = 40; // 2/5 = 40%
    
  } catch (error) {
    console.error('Failed to fetch application statistics:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchApplicationStatistics();
});
</script>

<style scoped>
.student-statistics {
  padding: 10px 0;
}

.statistics-card {
  margin-bottom: 20px;
  border-radius: 8px;
  transition: all 0.3s;
  height: 100%;
}

.statistics-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.chart-container {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.statistics-summary-card {
  margin-bottom: 20px;
  border-radius: 8px;
  transition: all 0.3s;
  height: 100%;
}

.statistics-summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.summary-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.summary-icon .el-icon {
  font-size: 30px;
  color: white;
}

.application-icon {
  background-color: #409EFF;
}

.interview-icon {
  background-color: #E6A23C;
}

.offer-icon {
  background-color: #67C23A;
}

.rate-icon {
  background-color: #F56C6C;
}

.summary-info {
  flex: 1;
}

.summary-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .student-statistics {
    padding: 5px 0;
  }
  
  .statistics-card, .statistics-summary-card {
    margin-bottom: 15px;
  }
  
  .summary-icon {
    width: 50px;
    height: 50px;
  }
  
  .summary-icon .el-icon {
    font-size: 24px;
  }
  
  .summary-value {
    font-size: 20px;
  }
}
</style>
