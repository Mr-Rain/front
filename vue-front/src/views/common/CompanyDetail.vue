<template>
  <div class="company-detail-page responsive-padding">
    <!-- 面包屑导航 -->
    <Breadcrumb />

    <div class="page-header">
      <div class="title-section">
        <el-button
          @click="goBack"
          type="primary"
          plain
          class="back-button"
        >
          <el-icon class="back-icon"><ArrowLeft /></el-icon>
          <span class="back-text">返回</span>
        </el-button>
        <h2 class="page-title">企业详情</h2>
      </div>
    </div>

    <el-card shadow="never" class="company-detail-card" v-loading="loading">
      <template v-if="company">
        <!-- 企业基本信息 -->
        <div class="company-header">
          <div class="company-logo">
            <el-avatar :size="100" :src="company.logo || defaultLogo" shape="square">
              {{ getCompanyFirstLetter(company) }}
            </el-avatar>
          </div>
          <div class="company-basic-info">
            <h1 class="company-name">{{ getCompanyName(company) }}</h1>
            <div class="company-meta">
              <span v-if="company.industry" class="meta-item">
                <el-icon><OfficeBuilding /></el-icon>
                {{ company.industry }}
              </span>
              <span v-if="company.scale" class="meta-item">
                <el-icon><User /></el-icon>
                {{ company.scale }}
              </span>
              <span v-if="company.financing" class="meta-item">
                <el-icon><Money /></el-icon>
                {{ company.financing }}
              </span>
              <span v-if="company.location" class="meta-item">
                <el-icon><Location /></el-icon>
                {{ company.location }}
              </span>
            </div>
            <div v-if="company.tags && company.tags.length" class="company-tags">
              <el-tag v-for="(tag, index) in company.tags" :key="index" size="small" class="company-tag">
                {{ tag }}
              </el-tag>
            </div>
          </div>
          <div class="company-actions">
            <el-button type="primary" @click="viewJobs">查看该企业职位</el-button>
            <el-button v-if="company.website" type="info" plain @click="openWebsite">
              <el-icon><Link /></el-icon>
              访问官网
            </el-button>
          </div>
        </div>

        <!-- 企业详细信息 -->
        <el-divider />

        <div class="company-sections">
          <!-- 企业介绍 -->
          <section class="company-section">
            <h2 class="section-title">企业介绍</h2>
            <div class="section-content">
              <p v-if="company.description" class="company-description">{{ company.description }}</p>
              <el-empty v-else description="暂无企业介绍" :image-size="100"></el-empty>
            </div>
          </section>

          <!-- 联系方式 -->
          <section class="company-section">
            <h2 class="section-title">联系方式</h2>
            <div class="section-content">
              <el-descriptions :column="2" border>
                <el-descriptions-item v-if="company.contactPerson" label="联系人">
                  {{ company.contactPerson || '-' }}
                </el-descriptions-item>
                <el-descriptions-item v-if="company.contactEmail" label="联系邮箱">
                  {{ company.contactEmail || '-' }}
                </el-descriptions-item>
                <el-descriptions-item v-if="company.contactPhone" label="联系电话">
                  {{ company.contactPhone || '-' }}
                </el-descriptions-item>
                <el-descriptions-item v-if="company.website" label="公司网站">
                  <el-link :href="company.website" target="_blank" type="primary">
                    {{ company.website }}
                  </el-link>
                </el-descriptions-item>
              </el-descriptions>
              <el-empty v-if="!hasContactInfo" description="暂无联系方式" :image-size="100"></el-empty>
            </div>
          </section>

          <!-- 企业职位 -->
          <section class="company-section">
            <h2 class="section-title">
              企业职位
              <el-button type="primary" link @click="viewJobs">查看全部</el-button>
            </h2>
            <div class="section-content">
              <div v-if="recentJobs.length" class="recent-jobs">
                <el-card v-for="job in recentJobs" :key="job.id" shadow="hover" class="job-card">
                  <div class="job-card-content">
                    <h3 class="job-title">{{ job.title }}</h3>
                    <div class="job-meta">
                      <span class="job-salary">{{ job.salaryRange }}</span>
                      <span class="job-location">{{ job.location }}</span>
                    </div>
                    <div class="job-actions">
                      <el-button type="primary" size="small" @click="viewJobDetail(job.id)">查看详情</el-button>
                    </div>
                  </div>
                </el-card>
              </div>
              <el-empty v-else description="暂无职位信息" :image-size="100"></el-empty>
            </div>
          </section>
        </div>
      </template>
      <el-empty v-else-if="!loading" description="未找到企业信息" :image-size="150"></el-empty>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, OfficeBuilding, User, Money, Location, Link } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import Breadcrumb from '@/components/common/Breadcrumb.vue';
import { useCompanyStore } from '@/stores/company';
import { useJobStore } from '@/stores/job';
import type { CompanyProfile } from '@/types/company';
import type { JobInfo } from '@/types/job';
import { getCompanyDetail } from '@/api/company';
import { getJobsByCompany } from '@/api/job';

const route = useRoute();
const router = useRouter();
const companyStore = useCompanyStore();
const jobStore = useJobStore();

const loading = ref(false);
const company = ref<CompanyProfile | null>(null);
const recentJobs = ref<JobInfo[]>([]);
const defaultLogo = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 计算属性：是否有联系信息
const hasContactInfo = computed(() => {
  if (!company.value) return false;
  return !!(
    company.value.contactPerson ||
    company.value.contactEmail ||
    company.value.contactPhone ||
    company.value.website
  );
});

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/companies');
  }
};

// 查看企业职位
const viewJobs = () => {
  if (!company.value) return;

  router.push({
    path: '/jobs',
    query: { company_id: company.value.id.toString() }
  });
};

// 查看职位详情
const viewJobDetail = (jobId: string | number) => {
  router.push(`/jobs/${jobId}`);
};

// 打开企业网站
const openWebsite = () => {
  if (!company.value || !company.value.website) return;

  window.open(company.value.website, '_blank');
};

// 获取企业详情
const fetchCompanyDetail = async () => {
  const companyId = route.params.id;
  if (!companyId) {
    ElMessage.error('企业ID不能为空');
    return;
  }

  // 确保companyId是字符串或数字
  const id = typeof companyId === 'string' ? companyId : Array.isArray(companyId) ? companyId[0] : '';
  if (!id) {
    ElMessage.error('无效的企业ID');
    return;
  }

  loading.value = true;
  try {
    const response = await getCompanyDetail(id);
    company.value = response.data;
  } catch (error) {
    console.error('获取企业详情失败:', error);
    ElMessage.error('获取企业详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 获取企业最近发布的职位
const fetchRecentJobs = async () => {
  const companyId = route.params.id;
  if (!companyId) return;

  try {
    // 确保companyId是字符串或数字
    const id = typeof companyId === 'string' ? companyId : Array.isArray(companyId) ? companyId[0] : '';
    const response = await getJobsByCompany(id, { page: 1, pageSize: 3 });

    // 获取职位列表
    const jobList = response.data.records || response.data.list || [];

    // 处理数据，确保字段名符合前端类型定义（驼峰命名法）
    recentJobs.value = jobList.map(job => {
      // 使用类型断言处理可能存在的下划线命名字段
      const jobAny = job as any;
      if (jobAny.salary_range && !job.salaryRange) {
        job.salaryRange = jobAny.salary_range;
      }
      return job;
    });
  } catch (error) {
    console.error('获取企业职位失败:', error);
    // 不显示错误消息，因为这是次要信息
  }
};

// 获取公司名称（统一使用驼峰命名法）
const getCompanyName = (company: any): string => {
  return company.companyName || '未知企业';
};

// 获取公司名称首字母（用于头像显示）
const getCompanyFirstLetter = (company: any): string => {
  const name = getCompanyName(company);
  return name ? name.substring(0, 1) : '?';
};

onMounted(() => {
  fetchCompanyDetail();
  fetchRecentJobs();
});
</script>

<style scoped>
.company-detail-page {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.title-section {
  display: flex;
  align-items: center;
}

.back-button {
  margin-right: 15px;
}

.back-icon {
  margin-right: 5px;
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

.company-detail-card {
  border-radius: 12px;
  padding: 20px;
}

.company-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
}

.company-logo {
  margin-right: 24px;
  flex-shrink: 0;
}

.company-basic-info {
  flex: 1;
}

.company-name {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #303133;
}

.company-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.meta-item .el-icon {
  margin-right: 4px;
}

.company-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.company-tag {
  margin-right: 0;
}

.company-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.company-sections {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.company-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-content {
  color: #606266;
}

.company-description {
  white-space: pre-line;
  line-height: 1.6;
}

.recent-jobs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.job-card {
  height: 100%;
  transition: all 0.3s;
}

.job-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.job-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.job-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #303133;
}

.job-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #606266;
  font-size: 14px;
}

.job-actions {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .company-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .company-logo {
    margin-right: 0;
    margin-bottom: 16px;
  }

  .company-meta {
    justify-content: center;
  }

  .company-tags {
    justify-content: center;
  }

  .company-actions {
    width: 100%;
    margin-top: 20px;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
  }

  .recent-jobs {
    grid-template-columns: 1fr;
  }
}
</style>
