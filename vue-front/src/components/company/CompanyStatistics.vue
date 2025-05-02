<template>
  <div class="company-statistics">
    <el-row :gutter="20">
      <!-- 数据概览卡片 -->
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="statistics-summary-card">
          <div class="summary-content">
            <div class="summary-icon job-icon">
              <el-icon><Briefcase /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-title">发布职位</div>
              <div class="summary-value">{{ statistics.totalJobs }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="statistics-summary-card">
          <div class="summary-content">
            <div class="summary-icon application-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-title">收到申请</div>
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
              <div class="summary-title">录用人数</div>
              <div class="summary-value">{{ statistics.offerCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 申请趋势统计卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">申请趋势</span>
              <el-tooltip content="展示近期收到的申请数量变化趋势" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div v-loading="loading" class="chart-container">
            <echart-component
              v-if="!loading && applicationTrendData.xAxis.length > 0"
              :options="applicationTrendChartOptions"
              height="300px"
              @chart-click="handleTrendChartClick"
              @chart-mouseover="handleTrendChartMouseover"
              @chart-mouseout="handleTrendChartMouseout"
            />
            <el-empty v-else-if="!loading" description="暂无趋势数据" />
          </div>
        </el-card>
      </el-col>

      <!-- 申请状态统计卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">申请状态分布</span>
              <el-tooltip content="展示各状态下的申请数量分布" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div v-loading="loading" class="chart-container">
            <echart-component
              v-if="!loading && applicationStatusData.length > 0"
              :options="applicationStatusChartOptions"
              height="300px"
            />
            <el-empty v-else-if="!loading" description="暂无状态数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 职位热度排行卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">职位热度排行</span>
              <el-tooltip content="展示申请人数最多的职位排行" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div v-loading="loading" class="chart-container">
            <echart-component
              v-if="!loading && jobPopularityData.yAxis.length > 0"
              :options="jobPopularityChartOptions"
              height="300px"
            />
            <el-empty v-else-if="!loading" description="暂无职位热度数据" />
          </div>
        </el-card>
      </el-col>

      <!-- 应聘者学历分布卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">应聘者学历分布</span>
              <el-tooltip content="展示应聘者的学历分布情况" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div v-loading="loading" class="chart-container">
            <echart-component
              v-if="!loading && educationData.length > 0"
              :options="educationChartOptions"
              height="300px"
            />
            <el-empty v-else-if="!loading" description="暂无学历分布数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 选中日期数据对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="`${selectedDate || ''} 申请数据详情`"
      width="500px"
      @close="handleDialogClose"
    >
      <div v-if="selectedDateData">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="日期">{{ selectedDate }}</el-descriptions-item>
          <el-descriptions-item label="申请数量">{{ selectedDateData.applications || 0 }}</el-descriptions-item>
          <el-descriptions-item label="面试数量">{{ selectedDateData.interviews || 0 }}</el-descriptions-item>
          <el-descriptions-item label="录用数量">{{ selectedDateData.offers || 0 }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div v-else class="empty-data">
        <el-empty description="暂无该日期的详细数据" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import EChartComponent from '@/components/common/EChartComponent.vue';
import {
  InfoFilled,
  Briefcase,
  Document,
  ChatLineRound,
  GoodsFilled
} from '@element-plus/icons-vue';
import type { EChartsOption } from 'echarts';
import { ElMessage } from 'element-plus';
import { getCompanyStatistics } from '@/api/statistics';

const loading = ref(true);
// 选中的日期数据
const selectedDate = ref<string | null>(null);
const selectedDateData = ref<any>(null);
const dialogVisible = ref(false);
// 存储从后端获取的趋势数据
const fetchedTrendData = ref<any[]>([]);

// 处理趋势图表点击事件
const handleTrendChartClick = (params: any) => {
  console.log('点击事件原始参数:', params);

  // 获取点击的日期索引
  let dateIndex = params.dataIndex;

  // 如果点击的是标记点（markPoint），需要找到对应的实际数据点
  if (params.componentType === 'markPoint') {
    // 找到最大值对应的索引
    if (params.name === '最大值') {
      const maxValue = Math.max(...applicationTrendData.values);
      dateIndex = applicationTrendData.values.findIndex(v => v === maxValue);
    }
    // 找到最小值对应的索引
    else if (params.name === '最小值') {
      const minValue = Math.min(...applicationTrendData.values);
      dateIndex = applicationTrendData.values.findIndex(v => v === minValue);
    }
  }

  if (dateIndex >= 0 && dateIndex < applicationTrendData.xAxis.length) {
    // 获取对应的日期
    selectedDate.value = applicationTrendData.xAxis[dateIndex];

    // 从后端数据中查找该日期的详细数据
    const trendData = fetchedTrendData.value.find((item: any) => item.date === selectedDate.value);
    console.log('后端返回的该日期数据:', trendData);

    // 使用后端返回的真实数据
    if (trendData) {
      selectedDateData.value = trendData;
      console.log('最终选中的日期数据:', selectedDateData.value);
    } else {
      // 如果找不到对应日期的数据，使用默认值
      selectedDateData.value = {
        date: selectedDate.value,
        applications: 0,
        interviews: 0,
        offers: 0
      };
    }

    ElMessage.success(`已选择 ${selectedDate.value} 的数据`);

    // 显示对话框
    dialogVisible.value = true;
  }
};

// 处理对话框关闭
const handleDialogClose = () => {
  dialogVisible.value = false;
  selectedDate.value = null;
  selectedDateData.value = null;
};

// 处理趋势图表鼠标悬停事件
const handleTrendChartMouseover = (params: any) => {
  // 获取悬停的日期索引
  const dataIndex = params.dataIndex;
  if (dataIndex >= 0 && dataIndex < applicationTrendData.xAxis.length) {
    // 获取对应的日期
    const date = applicationTrendData.xAxis[dataIndex];
    const value = applicationTrendData.values[dataIndex];

    // 可以在这里添加额外的交互效果，比如高亮显示当前数据点
    console.log(`鼠标悬停在 ${date} 上，申请数量: ${value}`);
  }
};

// 处理趋势图表鼠标离开事件
const handleTrendChartMouseout = () => {
  // 鼠标离开时的处理逻辑
  console.log('鼠标离开图表数据点');
};

// 统计数据
const statistics = reactive({
  totalJobs: 0,
  totalApplications: 0,
  interviewCount: 0,
  offerCount: 0
});

// 申请趋势数据
const applicationTrendData = reactive({
  xAxis: [] as string[],
  values: [] as number[]
});

// 申请状态数据
const applicationStatusData = ref<{ name: string; value: number }[]>([]);

// 职位热度数据
const jobPopularityData = reactive({
  yAxis: [] as string[],
  values: [] as number[]
});

// 应聘者学历分布数据
const educationData = ref<{ name: string; value: number }[]>([]);
// 申请趋势图表选项
const applicationTrendChartOptions = computed(() => ({
  title: {
    text: '最近15天申请趋势',
    textStyle: {
      fontSize: 14,
      fontWeight: 'normal'
    },
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'line',
      animation: true,
      lineStyle: {
        color: '#409EFF',
        width: 2
      }
    },
    formatter: function(params) {
      const dataIndex = params[0].dataIndex;
      const date = applicationTrendData.xAxis[dataIndex];
      const value = applicationTrendData.values[dataIndex];
      return `<div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 5px;">${date}</div>
                <div>申请数量: <span style="font-weight: bold; color: #409EFF;">${value}</span></div>
              </div>`;
    },
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#409EFF',
    borderWidth: 1,
    textStyle: {
      color: '#333'
    },
    extraCssText: 'box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: applicationTrendData.xAxis,
    axisLabel: {
      interval: 0,
      rotate: 45,
      fontSize: 11,
      margin: 8
    }
  },
  yAxis: {
    type: 'value',
    minInterval: 1,
    splitLine: {
      lineStyle: {
        type: 'dashed'
      }
    }
  },
  series: [
    {
      name: '申请数量',
      type: 'line',
      data: applicationTrendData.values,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: '#409EFF',
        borderColor: '#fff',
        borderWidth: 2
      },
      emphasis: {
        scale: true,
        symbolSize: 12,
        itemStyle: {
          color: '#409EFF',
          borderColor: '#fff',
          borderWidth: 3,
          shadowBlur: 10,
          shadowColor: 'rgba(64, 158, 255, 0.5)'
        }
      },
      lineStyle: {
        width: 3
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ]
        }
      },
      markPoint: {
        data: [
          { type: 'max', name: '最大值' },
          ...((() => {
            // 检查是否有多个最小值
            const minValue = Math.min(...applicationTrendData.values);
            const minValueCount = applicationTrendData.values.filter(v => v === minValue).length;
            // 只有一个最小值时才显示最小值标记点
            return minValueCount === 1 ? [{ type: 'min', name: '最小值' }] : [];
          })())
        ]
      }
    }
  ]
}));

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
  color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
}));

// 职位热度图表选项
const jobPopularityChartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    minInterval: 1
  },
  yAxis: {
    type: 'category',
    data: jobPopularityData.yAxis,
    axisLabel: {
      interval: 0
    }
  },
  series: [
    {
      name: '申请人数',
      type: 'bar',
      data: jobPopularityData.values,
      itemStyle: {
        color: function(params: any) {
          const colorList = ['#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452'];
          return colorList[params.dataIndex % colorList.length];
        }
      }
    }
  ]
}));

// 应聘者学历分布图表选项
const educationChartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: educationData.value.map(item => item.name)
  },
  series: [
    {
      name: '学历分布',
      type: 'pie',
      radius: '50%',
      data: educationData.value,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ],
  color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
}));

// 获取企业统计数据
const fetchCompanyStatistics = async () => {
  loading.value = true;
  try {
    // 调用API获取实际数据，修改为请求最近15天的数据
    const response = await getCompanyStatistics({ time_range: 'custom', days: 15 });
    const data = response.data;

    if (data && data.overview) {
      // 统计数据
      statistics.totalJobs = data.overview.totalJobs || 0;
      statistics.totalApplications = data.overview.totalApplications || 0;
      statistics.interviewCount = data.overview.interviewArranged || 0;
      statistics.offerCount = data.overview.offerSent || 0;

      // 申请趋势数据
      if (data.applicationTrend && data.applicationTrend.length > 0) {
        console.log('后端返回的趋势数据:', data.applicationTrend);

        // 保存完整的趋势数据，用于点击时显示详情
        fetchedTrendData.value = data.applicationTrend;

        // 提取日期和申请数量用于图表显示
        applicationTrendData.xAxis = data.applicationTrend.map((item: any) => item.date);
        applicationTrendData.values = data.applicationTrend.map((item: any) => item.applications);

        // 打印处理后的数据
        console.log('处理后的趋势数据:');
        console.log('日期:', applicationTrendData.xAxis);
        console.log('申请数量:', applicationTrendData.values);
      }

      // 申请状态数据 - 需要后端提供或前端计算
      // 这里使用一个简单的模拟，实际应该从API获取
      applicationStatusData.value = [
        { name: '待处理', value: data.overview.totalApplications - data.overview.interviewArranged - data.overview.offerSent || 0 },
        { name: '面试中', value: data.overview.interviewArranged || 0 },
        { name: '已录用', value: data.overview.offerSent || 0 }
      ];

      // 职位热度数据
      if (data.jobStatistics && data.jobStatistics.length > 0) {
        // 按申请数量排序
        const sortedJobs = [...data.jobStatistics].sort((a, b) => b.applications - a.applications);
        // 取前5个
        const top5Jobs = sortedJobs.slice(0, 5);

        jobPopularityData.yAxis = top5Jobs.map(job => job.jobTitle);
        jobPopularityData.values = top5Jobs.map(job => job.applications);
      }

      // 应聘者学历分布数据 - 需要后端提供或前端计算
      // 这里使用一个简单的模拟，实际应该从API获取
      educationData.value = [
        { name: '本科', value: Math.round(data.overview.totalApplications * 0.6) || 0 },
        { name: '硕士', value: Math.round(data.overview.totalApplications * 0.3) || 0 },
        { name: '博士', value: Math.round(data.overview.totalApplications * 0.05) || 0 },
        { name: '大专', value: Math.round(data.overview.totalApplications * 0.05) || 0 }
      ];
    }
  } catch (error) {
    console.error('Failed to fetch company statistics:', error);
    // 如果API调用失败，使用空数据
    resetStatisticsData();
  } finally {
    loading.value = false;
  }
};

// 重置统计数据为空
const resetStatisticsData = () => {
  statistics.totalJobs = 0;
  statistics.totalApplications = 0;
  statistics.interviewCount = 0;
  statistics.offerCount = 0;

  applicationTrendData.xAxis = [];
  applicationTrendData.values = [];

  applicationStatusData.value = [];

  jobPopularityData.yAxis = [];
  jobPopularityData.values = [];

  educationData.value = [];
};

onMounted(() => {
  fetchCompanyStatistics();
});
</script>

<style scoped>
.company-statistics {
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

.job-icon {
  background-color: #409EFF;
}

.application-icon {
  background-color: #67C23A;
}

.interview-icon {
  background-color: #E6A23C;
}

.offer-icon {
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
  .company-statistics {
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
