<template>
  <div class="admin-dashboard-page">
    <el-card shadow="never">
      <template #header>
        <span>管理工作台</span>
      </template>
      <p>这里是管理端 Dashboard 页面。</p>
      <p>后续将展示系统核心指标、待处理事项（如企业审核）、用户统计等。</p>
      
       <el-row :gutter="20" style="margin-top: 20px;">
         <el-col :span="6">
            <el-statistic title="注册用户总数" :value="stats.totalUsers || 0" />
         </el-col>
         <el-col :span="6">
             <el-statistic title="入驻企业总数" :value="stats.totalCompanies || 0" />
         </el-col>
         <el-col :span="6">
            <el-statistic title="发布职位总数" :value="stats.totalJobs || 0" />
         </el-col>
          <el-col :span="6">
             <el-statistic title="待审核企业" :value="stats.pendingCompanies || 0">
                 <template #suffix>
                    <el-button type="primary" link @click="goToAudit">去审核</el-button>
                 </template>
             </el-statistic>
          </el-col>
      </el-row>

       <!-- Add charts or other widgets here -->

    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElCard, ElRow, ElCol, ElStatistic, ElButton } from 'element-plus';
// TODO: Import relevant stores (adminStore, userStore, companyStore?)

const router = useRouter();

// Placeholder stats
const stats = reactive({
    totalUsers: 0,
    totalCompanies: 0,
    totalJobs: 0,
    pendingCompanies: 0
});

onMounted(() => {
    // TODO: Fetch dashboard stats from API/Store
    console.log("Admin dashboard mounted. Need to fetch stats.");
});

const goToAudit = () => {
    router.push({ name: 'admin-company-audit' }); // Assuming this route name
};

</script>

<style scoped>
.admin-dashboard-page {
  padding: 20px;
}

.el-statistic {
    text-align: center;
    padding: 20px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
}
</style> 