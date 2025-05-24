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
            <EChartComponent
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
            <EChartComponent
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
            <EChartComponent
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
            <EChartComponent
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
              <div class="summary-title">通过率</div>
              <div class="summary-value">{{ statistics.passRate }}%</div>
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
  passRate: 0
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
    // 获取学生申请列表
    await applicationStore.fetchStudentApplications({ pageSize: 100, page: 1 });

    // 如果没有申请数据，使用默认值
    if (!applicationStore.studentApplications || applicationStore.studentApplications.length === 0) {
      // 设置默认值
      statistics.totalApplications = 0;
      statistics.interviewCount = 0;
      statistics.offerCount = 0;
      statistics.passRate = 0;

      // 清空图表数据
      applicationStatusData.value = [];
      applicationTrendData.xAxis = [];
      applicationTrendData.values = [];
      jobTypeData.value = [];
      applicationResultData.value = [];

      loading.value = false;
      return;
    }

    // 处理申请数据
    const applications = applicationStore.studentApplications;

    // 统计数据
    statistics.totalApplications = applications.length;
    statistics.interviewCount = applications.filter(app =>
        app.status === 'interview' || app.status === 'offer' || app.status === 'accepted'
    ).length;

    statistics.offerCount = applications.filter(app => app.status === 'offer' || app.status === 'accepted').length;

    statistics.passRate = statistics.totalApplications > 0
      ? Math.round((statistics.offerCount / statistics.totalApplications) * 100)
      : 0;

    // 申请状态数据
    const statusMap = new Map();
    applications.forEach(app => {
      const status = formatStatus(app.status);
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    applicationStatusData.value = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));

    // 申请趋势数据
    const dateMap = new Map();
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);

    // 初始化过去6个月的数据
    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo);
      date.setMonth(sixMonthsAgo.getMonth() + i);
      const monthName = date.toLocaleDateString('zh-CN', { month: 'short' });
      dateMap.set(monthName, 0);
    }

    // 填充实际数据
    applications.forEach(app => {
      const applyDate = new Date(app.applyTime);
      if (applyDate >= sixMonthsAgo) {
        const monthName = applyDate.toLocaleDateString('zh-CN', { month: 'short' });
        dateMap.set(monthName, (dateMap.get(monthName) || 0) + 1);
      }
    });

    applicationTrendData.xAxis = Array.from(dateMap.keys());
    applicationTrendData.values = Array.from(dateMap.values());

    // 职位类型数据
    const jobTypeMap = new Map();
    applications.forEach(app => {
      const jobType = app.jobInfo?.jobType || '未知';
      jobTypeMap.set(jobType, (jobTypeMap.get(jobType) || 0) + 1);
    });
    jobTypeData.value = Array.from(jobTypeMap.entries()).map(([name, value]) => ({ name, value }));

    // 申请结果数据
    const resultMap = new Map();
    applications.forEach(app => {
      const result = formatStatus(app.status);
      resultMap.set(result, (resultMap.get(result) || 0) + 1);
    });
    applicationResultData.value = Array.from(resultMap.entries()).map(([name, value]) => ({ name, value }));

  } catch (error) {
    console.error('Failed to fetch application statistics:', error);
    // 设置默认值
    statistics.totalApplications = 0;
    statistics.interviewCount = 0;
    statistics.offerCount = 0;
    statistics.passRate = 0;
  } finally {
    loading.value = false;
  }
};

// 格式化申请状态
const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': '待处理',
    'viewed': '已查看',
    'interview': '面试中',
    'offer': '已录用',
    'rejected': '未通过',
    'withdrawn': '已撤回',
    'accepted': '通过'
  };
  return statusMap[status] || status;
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
