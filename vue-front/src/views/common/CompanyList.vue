<template>
  <div class="company-list-page responsive-padding">
    <div class="page-header">
      <div class="title-section">
        <h2 class="page-title">企业列表</h2>
      </div>
      <div class="header-actions">
        <el-button
          type="primary"
          plain
          size="small"
          icon="Filter"
          class="filter-button show-on-mobile"
          @click="showFilterForm = !showFilterForm"
        >
          {{ showFilterForm ? '隐藏筛选' : '筛选' }}
        </el-button>
      </div>
    </div>

    <el-card shadow="hover" class="filter-card responsive-card">
      <!-- 搜索表单 -->
      <el-form
        :inline="true"
        :model="listQuery"
        @submit.prevent="handleFilter"
        class="filter-form"
        :class="{ 'mobile-hidden': !showFilterForm && isMobileView }"
      >
        <div class="search-form-container">
          <div class="search-inputs-group">
            <el-form-item label="行业" class="search-form-item">
              <el-select
                v-model="listQuery.industry"
                placeholder="选择行业"
                clearable
                @change="handleFilter"
                class="search-select"
              >
                <el-option label="互联网" value="互联网"></el-option>
                <el-option label="金融" value="金融"></el-option>
                <el-option label="教育" value="教育"></el-option>
                <el-option label="医疗" value="医疗"></el-option>
                <el-option label="制造业" value="制造业"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="地点" class="search-form-item">
              <el-input
                v-model="listQuery.location"
                placeholder="城市"
                clearable
                @clear="handleFilter"
              />
            </el-form-item>
            <el-form-item label="关键词" class="search-form-item">
              <el-input
                v-model="listQuery.keyword"
                placeholder="公司名称"
                clearable
                @clear="handleFilter"
                prefix-icon="Search"
              />
            </el-form-item>
          </div>
          <div class="search-button-group">
            <el-form-item class="search-button-item">
              <el-button type="primary" @click="handleFilter" :icon="Search" class="search-button">搜索</el-button>
            </el-form-item>
          </div>
        </div>
      </el-form>
    </el-card>

    <el-card shadow="never" class="list-card responsive-card" v-loading="loading">
      <!-- 搜索结果摘要 -->
      <div class="search-summary" v-if="companyTotal > 0">
        <span>找到 <strong>{{ companyTotal }}</strong> 家企业</span>
        <el-button v-if="hasActiveFilters" link type="primary" @click="clearFilters">清除筛选</el-button>
      </div>

      <!-- 企业列表 -->
      <template v-if="companyList.length > 0">
        <div class="company-list">
          <div v-for="company in companyList" :key="company.id" class="company-card">
            <div class="company-logo">
              <el-avatar :size="64" :src="company.logo || defaultLogo">{{ company.name.substring(0, 1) }}</el-avatar>
            </div>
            <div class="company-info">
              <h3 class="company-name">{{ company.name }}</h3>
              <div class="company-meta">
                <span class="company-industry">{{ company.industry }}</span>
                <span class="company-location">{{ company.location }}</span>
              </div>
              <p class="company-description">{{ company.description }}</p>
              <div class="company-tags">
                <el-tag v-for="(tag, index) in company.tags" :key="index" size="small" class="company-tag">{{ tag }}</el-tag>
              </div>
            </div>
            <div class="company-actions">
              <el-button type="primary" size="small" @click="viewCompany(company.id)">查看详情</el-button>
              <el-button type="info" plain size="small" @click="viewJobs(company.id)">查看职位</el-button>
            </div>
          </div>
        </div>
      </template>
      <el-empty v-else description="未找到相关企业"></el-empty>

      <!-- 分页器 -->
      <div class="pagination-container" v-if="companyTotal > 0">
        <el-pagination
          v-model:current-page="listQuery.page"
          v-model:page-size="listQuery.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="companyTotal"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loading = ref(false);
const defaultLogo = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 移动端适配相关变量
const showFilterForm = ref(window.innerWidth > 576);
const isMobileView = ref(window.innerWidth <= 576);

// 监听窗口大小变化
const handleResize = () => {
  isMobileView.value = window.innerWidth <= 576;
  if (!isMobileView.value) {
    showFilterForm.value = true;
  }
};

// 查询参数
const listQuery = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  industry: '',
  location: '',
});

// 计算属性：是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return !!listQuery.keyword || !!listQuery.industry || !!listQuery.location;
});

// 模拟数据 - 实际项目中应该从API获取
const companyList = ref([
  {
    id: 1,
    name: '科技创新有限公司',
    logo: '',
    industry: '互联网',
    location: '北京',
    description: '专注于人工智能和大数据分析的科技公司，致力于为企业提供智能化解决方案。',
    tags: ['人工智能', '大数据', '云计算']
  },
  {
    id: 2,
    name: '未来教育科技',
    logo: '',
    industry: '教育',
    location: '上海',
    description: '专注于在线教育和教育科技的创新企业，提供智能学习平台和个性化教育服务。',
    tags: ['在线教育', 'EdTech', '智能学习']
  },
  {
    id: 3,
    name: '健康医疗科技',
    logo: '',
    industry: '医疗',
    location: '广州',
    description: '致力于医疗健康领域的科技创新，提供远程医疗和健康管理解决方案。',
    tags: ['医疗科技', '远程医疗', '健康管理']
  },
  {
    id: 4,
    name: '金融科技服务',
    logo: '',
    industry: '金融',
    location: '深圳',
    description: '专注于金融科技领域，提供智能金融服务和风险管理解决方案。',
    tags: ['金融科技', '支付', '风险管理']
  },
  {
    id: 5,
    name: '智能制造科技',
    logo: '',
    industry: '制造业',
    location: '杭州',
    description: '专注于智能制造和工业自动化，提供工业4.0解决方案。',
    tags: ['智能制造', '工业自动化', '物联网']
  }
]);

// 企业总数
const companyTotal = ref(5);

// 获取数据 - 模拟API调用
const fetchData = () => {
  loading.value = true;
  
  // 模拟API延迟
  setTimeout(() => {
    // 模拟筛选逻辑
    const filteredList = [
      {
        id: 1,
        name: '科技创新有限公司',
        logo: '',
        industry: '互联网',
        location: '北京',
        description: '专注于人工智能和大数据分析的科技公司，致力于为企业提供智能化解决方案。',
        tags: ['人工智能', '大数据', '云计算']
      },
      {
        id: 2,
        name: '未来教育科技',
        logo: '',
        industry: '教育',
        location: '上海',
        description: '专注于在线教育和教育科技的创新企业，提供智能学习平台和个性化教育服务。',
        tags: ['在线教育', 'EdTech', '智能学习']
      },
      {
        id: 3,
        name: '健康医疗科技',
        logo: '',
        industry: '医疗',
        location: '广州',
        description: '致力于医疗健康领域的科技创新，提供远程医疗和健康管理解决方案。',
        tags: ['医疗科技', '远程医疗', '健康管理']
      },
      {
        id: 4,
        name: '金融科技服务',
        logo: '',
        industry: '金融',
        location: '深圳',
        description: '专注于金融科技领域，提供智能金融服务和风险管理解决方案。',
        tags: ['金融科技', '支付', '风险管理']
      },
      {
        id: 5,
        name: '智能制造科技',
        logo: '',
        industry: '制造业',
        location: '杭州',
        description: '专注于智能制造和工业自动化，提供工业4.0解决方案。',
        tags: ['智能制造', '工业自动化', '物联网']
      }
    ].filter(company => {
      if (listQuery.industry && company.industry !== listQuery.industry) return false;
      if (listQuery.location && !company.location.includes(listQuery.location)) return false;
      if (listQuery.keyword && !company.name.includes(listQuery.keyword)) return false;
      return true;
    });
    
    companyList.value = filteredList;
    companyTotal.value = filteredList.length;
    loading.value = false;
  }, 500);
};

// 处理筛选
const handleFilter = () => {
  listQuery.page = 1;
  fetchData();
};

// 清除筛选条件
const clearFilters = () => {
  listQuery.keyword = '';
  listQuery.industry = '';
  listQuery.location = '';
  handleFilter();
};

// 分页处理
const handleSizeChange = (val: number) => {
  listQuery.pageSize = val;
  fetchData();
};

const handleCurrentChange = (val: number) => {
  listQuery.page = val;
  fetchData();
};

// 查看企业详情
const viewCompany = (id: number) => {
  ElMessage.info('企业详情功能开发中');
  // router.push(`/companies/${id}`);
};

// 查看企业职位
const viewJobs = (id: number) => {
  router.push({
    path: '/jobs',
    query: { company_id: id.toString() }
  });
};

onMounted(() => {
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
  handleResize(); // 初始化时调用一次
  
  // 获取数据
  fetchData();
});
</script>

<style scoped>
.company-list-page {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  position: relative;
}

.title-section {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #303133;
  margin: 0;
  padding-left: 12px;
  position: relative;
}

.page-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 4px;
  background: var(--el-color-primary);
  border-radius: 2px;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
  transition: all 0.3s;
  padding: 20px;
}

.list-card {
  border-radius: 12px;
  padding: 20px;
}

.search-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #606266;
}

.company-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.company-card {
  display: flex;
  padding: 20px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.company-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.company-logo {
  margin-right: 20px;
  display: flex;
  align-items: flex-start;
}

.company-info {
  flex: 1;
}

.company-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
}

.company-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  color: #606266;
  font-size: 14px;
}

.company-industry::before {
  content: '行业：';
  color: #909399;
}

.company-location::before {
  content: '地点：';
  color: #909399;
}

.company-description {
  margin: 10px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.company-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.company-tag {
  font-size: 12px;
}

.company-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  margin-left: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 移动端适配 */
@media (max-width: 576px) {
  .company-list-page {
    padding: 10px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .filter-card {
    margin-bottom: 15px;
  }

  .filter-button {
    display: flex;
  }

  .mobile-hidden {
    display: none;
  }

  .company-card {
    flex-direction: column;
    padding: 15px;
  }

  .company-logo {
    margin-right: 0;
    margin-bottom: 15px;
    justify-content: center;
  }

  .company-actions {
    margin-left: 0;
    margin-top: 15px;
    flex-direction: row;
    justify-content: flex-start;
  }
}
</style>
