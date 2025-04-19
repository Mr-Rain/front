<template>
  <div class="company-dashboard-page">
    <el-card shadow="never">
      <template #header>
        <span>企业工作台</span>
      </template>
      <p>这里是企业端 Dashboard 页面。</p>
      <p>后续将展示待处理申请、已发布职位概览、统计数据等。</p>
      <!-- Placeholder for dashboard widgets -->
      <el-row :gutter="20" style="margin-top: 20px;">
         <el-col :span="8">
            <el-statistic title="待处理申请" :value="stats.pendingApplications || 0" />
         </el-col>
         <el-col :span="8">
             <el-statistic title="在线职位数" :value="stats.activeJobs || 0" />
         </el-col>
          <el-col :span="8">
             <el-statistic title="收到简历总数" :value="stats.totalResumes || 0" />
          </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElCard, ElRow, ElCol, ElStatistic } from 'element-plus';
// TODO: Import relevant stores (e.g., companyStore, jobStore, applicationStore)

// Placeholder for stats
const stats = reactive({
    pendingApplications: 0,
    activeJobs: 0,
    totalResumes: 0
});

onMounted(() => {
    // TODO: Fetch dashboard data from store/API
    console.log("Company Dashboard mounted. Need to fetch data.");
    // Example:
    // const companyStore = useCompanyStore();
    // stats.pendingApplications = await companyStore.fetchPendingApplicationCount();
});

</script>

<style scoped>
.company-dashboard-page {
  padding: 20px;
}
.el-statistic {
    text-align: center;
    padding: 20px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
}
</style> 