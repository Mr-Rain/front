<template>
  <div class="job-list-page">
    <el-card shadow="never" class="filter-card">
       <el-form :inline="true" :model="listQuery" @submit.prevent="handleFilter">
        <el-form-item label="关键词">
          <el-input v-model="listQuery.keyword" placeholder="职位名称/公司" clearable @clear="handleFilter"/>
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="listQuery.location" placeholder="城市" clearable @clear="handleFilter"/>
        </el-form-item>
         <el-form-item label="职位类型">
            <el-select v-model="listQuery.job_type" placeholder="选择类型" clearable @change="handleFilter">
                <el-option label="全职" value="全职"></el-option>
                <el-option label="兼职" value="兼职"></el-option>
                <el-option label="实习" value="实习"></el-option>
            </el-select>
        </el-form-item>
        <!-- Add more filters as needed (experience, education, salary) -->
        <el-form-item>
          <el-button type="primary" @click="handleFilter" :icon="Search">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="list-card" v-loading="jobStore.loadingList">
         <template v-if="jobStore.jobList.length > 0">
            <JobCard v-for="job in jobStore.jobList" :key="job.id" :job="job" />
         </template>
        <el-empty v-else description="未找到相关职位"></el-empty>

        <Pagination 
            v-if="jobStore.jobTotal > 0"
            :total="jobStore.jobTotal"
            v-model:page="listQuery.page"
            v-model:limit="listQuery.pageSize"
            @pagination="fetchData"
            class="list-pagination"
         />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useJobStore } from '@/stores/job';
import JobCard from '@/components/common/JobCard.vue';
import Pagination from '@/components/common/Pagination.vue';
import type { JobListParams, JobType } from '@/types/job';
import { Search } from '@element-plus/icons-vue';

const jobStore = useJobStore();

const listQuery = reactive<JobListParams>({
  page: 1,
  pageSize: 10,
  keyword: '',
  location: '',
  job_type: undefined, 
  // Initialize other filters
});

const fetchData = () => {
  jobStore.fetchJobList(listQuery);
};

const handleFilter = () => {
  listQuery.page = 1; // Reset page number on filter change
  fetchData();
};

onMounted(() => {
    // Clear previous job list/details before loading new ones for this page
    jobStore.clearJobList();
    jobStore.clearCurrentJob(); 
    fetchData();
});

</script>

<style scoped>
.job-list-page {
  padding: 20px;
}

.filter-card {
    margin-bottom: 20px;
}

/* Make form items wrap nicely */
.el-form--inline .el-form-item {
    margin-right: 10px;
    margin-bottom: 10px; 
}

.list-card {
    margin-bottom: 20px;
}

.list-pagination {
    margin-top: 20px;
}
</style> 