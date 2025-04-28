<template>
  <div class="admin-statistics">
    <el-row :gutter="20">
      <!-- 数据概览卡片 -->
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="statistics-summary-card">
          <div class="summary-content">
            <div class="summary-icon user-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-title">注册用户</div>
              <div class="summary-value">{{ statistics.totalUsers }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="statistics-summary-card">
          <div class="summary-content">
            <div class="summary-icon company-icon">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-title">企业数量</div>
              <div class="summary-value">{{ statistics.totalCompanies }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="statistics-summary-card">
          <div class="summary-content">
            <div class="summary-icon job-icon">
              <el-icon><Briefcase /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-title">职位数量</div>
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
              <div class="summary-title">申请数量</div>
              <div class="summary-value">{{ statistics.totalApplications }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 用户增长趋势卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">用户增长趋势</span>
              <el-tooltip content="展示平台用户增长趋势" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div v-loading="loading" class="chart-container">
            <echart-component
              v-if="!loading && userGrowthData.xAxis.length > 0"
              :options="userGrowthChartOptions"
              height="300px"
            />
            <el-empty v-else-if="!loading" description="暂无用户增长数据" />
          </div>
        </el-card>
      </el-col>

      <!-- 用户类型分布卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">用户类型分布</span>
              <el-tooltip content="展示平台用户类型分布情况" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div v-loading="loading" class="chart-container">
            <echart-component
              v-if="!loading && userTypeData.length > 0"
              :options="userTypeChartOptions"
              height="300px"
            />
            <el-empty v-else-if="!loading" description="暂无用户类型数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 企业审核状态卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">企业审核状态</span>
              <el-tooltip content="展示企业审核状态分布" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div v-loading="loading" class="chart-container">
            <echart-component
              v-if="!loading && companyAuditData.length > 0"
              :options="companyAuditChartOptions"
              height="300px"
            />
            <el-empty v-else-if="!loading" description="暂无企业审核数据" />
          </div>
        </el-card>
      </el-col>

      <!-- 职位类型分布卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">职位类型分布</span>
              <el-tooltip content="展示平台职位类型分布情况" placement="top">
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
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 平台活跃度卡片 -->
      <el-col :span="24">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">平台活跃度</span>
              <el-tooltip content="展示平台各项活动的活跃度" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div v-loading="loading" class="chart-container">
            <echart-component
              v-if="!loading && activityData.xAxis.length > 0"
              :options="activityChartOptions"
              height="300px"
            />
            <el-empty v-else-if="!loading" description="暂无活跃度数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import EChartComponent from '@/components/common/EChartComponent.vue';
import { getSystemOverview } from '@/api/statistics';
import {
  InfoFilled,
  User,
  OfficeBuilding,
  Briefcase,
  Document
} from '@element-plus/icons-vue';
import type { EChartsOption } from 'echarts';

const loading = ref(true);

// 统计数据
const statistics = reactive({
  totalUsers: 0,
  totalCompanies: 0,
  totalJobs: 0,
  totalApplications: 0
});

// 用户增长数据
const userGrowthData = reactive({
  xAxis: [] as string[],
  students: [] as number[],
  companies: [] as number[]
});

// 用户类型数据
const userTypeData = ref<{ name: string; value: number }[]>([]);

// 企业审核状态数据
const companyAuditData = ref<{ name: string; value: number }[]>([]);

// 职位类型数据
const jobTypeData = ref<{ name: string; value: number }[]>([]);

// 平台活跃度数据
const activityData = reactive({
  xAxis: [] as string[],
  series: [] as { name: string; data: number[] }[]
});

// 用户增长图表选项
const userGrowthChartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['学生用户', '企业用户']
  },
  xAxis: {
    type: 'category',
    data: userGrowthData.xAxis,
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
      name: '学生用户',
      type: 'line',
      data: userGrowthData.students,
      smooth: true,
      itemStyle: {
        color: '#409EFF'
      }
    },
    {
      name: '企业用户',
      type: 'line',
      data: userGrowthData.companies,
      smooth: true,
      itemStyle: {
        color: '#67C23A'
      }
    }
  ]
}));

// 用户类型图表选项
const userTypeChartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: userTypeData.value.map(item => item.name)
  },
  series: [
    {
      name: '用户类型',
      type: 'pie',
      radius: '50%',
      data: userTypeData.value,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ],
  color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']
}));

// 企业审核状态图表选项
const companyAuditChartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: companyAuditData.value.map(item => item.name)
  },
  series: [
    {
      name: '审核状态',
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
      data: companyAuditData.value
    }
  ],
  color: ['#67C23A', '#E6A23C', '#F56C6C', '#909399']
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

// 平台活跃度图表选项
const activityChartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: activityData.series.map(item => item.name)
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: activityData.xAxis
  },
  yAxis: {
    type: 'value'
  },
  series: activityData.series.map(item => ({
    name: item.name,
    type: 'bar',
    data: item.data
  }))
}));

// 获取管理员统计数据
const fetchAdminStatistics = async () => {
  loading.value = true;
  try {
    // 从API获取实际数据，使用封装的request工具
    const result = await getSystemOverview();
    console.log('API返回数据:', result);

    // 检查返回的数据结构
    if (result && result.data) {
      const data = result.data;

      // 统计数据
      if (data.userStats) {
        statistics.totalUsers = data.userStats.totalUsers || 0;
        statistics.totalCompanies = data.userStats.companyUsers || 0;
      }

      if (data.jobStats) {
        statistics.totalJobs = data.jobStats.totalJobs || 0;
      }

      if (data.applicationStats) {
        statistics.totalApplications = data.applicationStats.totalApplications || 0;
      }

      // 用户类型数据
      if (data.userStats) {
        userTypeData.value = [
          { name: '学生用户', value: data.userStats.studentUsers || 0 },
          { name: '企业用户', value: data.userStats.companyUsers || 0 },
          { name: '管理员', value: data.userStats.adminUsers || 0 }
        ];
      }

      // 企业审核状态数据 - 需要从后端获取或计算
      // 这里计算企业审核状态数据
      if (data.pendingCompanies !== undefined) {
        // 如果后端直接返回了待审核企业数量
        const pendingCompanies = data.pendingCompanies || 0;

        // 计算已通过企业数量（总企业数 - 待审核企业数）
        const approvedCompanies = (data.userStats?.companyUsers || 0) - pendingCompanies;

        companyAuditData.value = [
          { name: '已通过', value: approvedCompanies },
          { name: '待审核', value: pendingCompanies }
        ];
      } else if (data.companyAuditStats) {
        // 如果后端返回了完整的审核状态统计
        companyAuditData.value = [
          { name: '已通过', value: data.companyAuditStats.approved || 0 },
          { name: '待审核', value: data.companyAuditStats.pending || 0 },
          { name: '未通过', value: data.companyAuditStats.rejected || 0 }
        ];
      } else {
        // 如果后端没有返回相关数据，则使用空数组
        companyAuditData.value = [];
      }

      // 职位类型数据
      if (data.jobStats && data.jobStats.jobTypeDistribution &&
          Object.keys(data.jobStats.jobTypeDistribution).length > 0) {
        jobTypeData.value = Object.entries(data.jobStats.jobTypeDistribution).map(([name, value]) => ({
          name,
          value: value as number
        }));
      } else {
        // 如果后端没有返回数据或数据为空，则使用空数组
        jobTypeData.value = [];
      }

      // 平台活跃度数据 - 需要从后端获取
      // 这里假设后端返回了活跃度数据
      if (data.activityStats && data.activityStats.dailyActivity) {
        // 假设后端返回的格式是 {date: string, registrations: number, jobs: number, applications: number, interviews: number}[]
        const dailyActivity = data.activityStats.dailyActivity || [];

        if (dailyActivity.length > 0) {
          activityData.xAxis = dailyActivity.map((item: any) => item.date);
          activityData.series = [
            {
              name: '用户注册',
              data: dailyActivity.map((item: any) => item.registrations || 0)
            },
            {
              name: '职位发布',
              data: dailyActivity.map((item: any) => item.jobs || 0)
            },
            {
              name: '简历投递',
              data: dailyActivity.map((item: any) => item.applications || 0)
            },
            {
              name: '面试安排',
              data: dailyActivity.map((item: any) => item.interviews || 0)
            }
          ];
        }
      } else {
        // 如果后端没有返回，则注释掉模拟数据
        /*
        activityData.xAxis = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        activityData.series = [
          {
            name: '用户注册',
            data: [10, 15, 12, 18, 20, 25, 15]
          },
          {
            name: '职位发布',
            data: [5, 8, 10, 12, 15, 8, 5]
          },
          {
            name: '简历投递',
            data: [30, 40, 35, 50, 60, 45, 25]
          },
          {
            name: '面试安排',
            data: [8, 12, 10, 15, 18, 10, 5]
          }
        ];
        */
      }

      // 用户增长数据 - 需要从后端获取
      if (data.userGrowth && data.userGrowth.length > 0) {
        userGrowthData.xAxis = data.userGrowth.map((item: any) => item.date);
        userGrowthData.students = data.userGrowth.map((item: any) => item.students || 0);
        userGrowthData.companies = data.userGrowth.map((item: any) => item.companies || 0);
      } else {
        // 如果后端没有返回数据或数据为空，则使用空数组
        userGrowthData.xAxis = [];
        userGrowthData.students = [];
        userGrowthData.companies = [];
      }
    } else {
      console.error('获取管理员统计数据失败:', result);

      // 注释掉的模拟数据，保留作为参考
      /*
      // 统计数据
      statistics.totalUsers = 1250;
      statistics.totalCompanies = 85;
      statistics.totalJobs = 320;
      statistics.totalApplications = 2800;

      // 用户增长数据
      userGrowthData.xAxis = ['1月', '2月', '3月', '4月', '5月', '6月'];
      userGrowthData.students = [120, 180, 250, 320, 400, 500];
      userGrowthData.companies = [10, 15, 25, 35, 50, 65];

      // 用户类型数据
      userTypeData.value = [
        { name: '学生用户', value: 1000 },
        { name: '企业用户', value: 85 },
        { name: '管理员', value: 5 },
        { name: '其他', value: 160 }
      ];

      // 企业审核状态数据
      companyAuditData.value = [
        { name: '已通过', value: 65 },
        { name: '待审核', value: 15 },
        { name: '未通过', value: 5 }
      ];

      // 职位类型数据
      jobTypeData.value = [
        { name: '技术类', value: 150 },
        { name: '设计类', value: 80 },
        { name: '产品类', value: 50 },
        { name: '运营类', value: 40 },
        { name: '市场类', value: 30 },
        { name: '其他', value: 20 }
      ];

      // 平台活跃度数据
      activityData.xAxis = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      activityData.series = [
        {
          name: '用户注册',
          data: [10, 15, 12, 18, 20, 25, 15]
        },
        {
          name: '职位发布',
          data: [5, 8, 10, 12, 15, 8, 5]
        },
        {
          name: '简历投递',
          data: [30, 40, 35, 50, 60, 45, 25]
        },
        {
          name: '面试安排',
          data: [8, 12, 10, 15, 18, 10, 5]
        }
      ];
      */
    }

  } catch (error) {
    console.error('Failed to fetch admin statistics:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAdminStatistics();
});
</script>

<style scoped>
.admin-statistics {
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

.user-icon {
  background-color: #409EFF;
}

.company-icon {
  background-color: #67C23A;
}

.job-icon {
  background-color: #E6A23C;
}

.application-icon {
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
  .admin-statistics {
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
