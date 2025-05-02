import { defineStore } from 'pinia';
import type { JobInfo, JobListParams, JobStatus } from '@/types/job';
import { getJobList, getJobDetail, createJob, updateJob, deleteJob } from '@/api/job';
import type { CreateJobPayload } from '@/api/job';
import { updateJobStatus } from '@/api/job';
import { getCompanyJobList } from '@/api/company';
import { ElMessage } from 'element-plus';

interface JobState {
  // Student/Public Job List
  jobList: JobInfo[];
  jobTotal: number;
  loadingList: boolean;

  // Company Job List
  companyJobList: JobInfo[];
  companyJobTotal: number;
  loadingCompanyList: boolean;

  // Job Detail
  currentJob: JobInfo | null;
  loadingDetail: boolean;

  // Common submitting state for mutations
  submitting: boolean;
}

export const useJobStore = defineStore('job', {
  state: (): JobState => ({
    jobList: [],
    jobTotal: 0,
    loadingList: false,

    companyJobList: [],
    companyJobTotal: 0,
    loadingCompanyList: false,

    currentJob: null,
    loadingDetail: false,

    submitting: false,
  }),

  actions: {
    // --- Student/Public Actions ---
    async fetchJobList(params: JobListParams) {
      this.loadingList = true;
      try {
        console.log('Fetching job list with params:', params);
        const response = await getJobList(params);
        console.log('API response:', response.data);

        let jobList = response.data.list || response.data.records || [];
        console.log('Raw job list:', jobList);

        // 检查是否是从"所有状态"选项来的请求
        const isAllStatusRequest = params.hasOwnProperty('_allStatus') && params._allStatus === true;

        // 检查每个职位的状态，并记录日志
        console.log('原始职位列表:');
        jobList.forEach(job => {
          console.log(`Job ID: ${job.id}, Title: ${job.title}, Status: ${job.status}`);
        });

        // 如果指定了status参数且不为空，在前端再次过滤确保状态匹配
        if (params.status && params.status !== 'all') {
          console.log(`Filtering jobs by status: ${params.status}`);
          const originalCount = jobList.length;
          jobList = jobList.filter(job => job.status === params.status);
          console.log(`Filtered ${originalCount - jobList.length} jobs, ${jobList.length} remaining`);
        }
        // 如果status参数为空字符串或_allStatus为true，显示所有状态的职位
        else if (params.status === '' || isAllStatusRequest) {
          console.log('All status request, showing all jobs regardless of status');
          // 不进行过滤，显示所有状态的职位
        }
        // 如果没有指定status参数且不是"所有状态"请求，则在前端过滤掉已关闭的职位
        else {
          console.log('No status specified and not "all status" request, filtering closed jobs in frontend');
          const originalCount = jobList.length;
          jobList = jobList.filter(job => job.status === 'open');
          console.log(`Filtered ${originalCount - jobList.length} jobs, ${jobList.length} remaining`);
        }

        this.jobList = jobList;
        this.jobTotal = params.status ? response.data.total : jobList.length;
        console.log('Final job list:', this.jobList);
        console.log('Total jobs:', this.jobTotal);
      } catch (error) {
        console.error('Failed to fetch job list:', error);
        this.jobList = [];
        this.jobTotal = 0;
        ElMessage.error('获取职位列表失败');
      } finally {
        this.loadingList = false;
      }
    },

    // 获取职位详情
    async fetchJobDetail(id: string | number) {
      this.loadingDetail = true;
      this.currentJob = null; // Clear previous detail
      try {
        const response = await getJobDetail(id);
        this.currentJob = response.data;
      } catch (error) {
        console.error(`Failed to fetch job detail for id ${id}:`, error);
        ElMessage.error('获取职位详情失败');
      } finally {
        this.loadingDetail = false;
      }
    },

    clearCurrentJob() {
      this.currentJob = null;
    },

    clearJobList() {
        this.jobList = [];
        this.jobTotal = 0;
    },

    // --- Company Actions ---
    async fetchCompanyJobList(params: any = {}) {
        this.loadingCompanyList = true;
        try {
            // 添加时间戳参数，避免使用缓存
            const timestamp = new Date().getTime();
            const response = await getCompanyJobList({
                ...params,
                _t: timestamp // 添加时间戳参数
            });

            console.log('Company job list response:', response.data);

            // 获取职位列表
            let jobList = response.data.list || response.data.records || [];

            // 记录原始职位状态
            console.log('原始职位列表状态:');
            jobList.forEach(job => {
                console.log(`Job ID: ${job.id}, Title: ${job.title}, Status: ${job.status}`);
            });

            // 不在前端进行额外的状态筛选，完全依赖后端返回的数据
            this.companyJobList = jobList;
            this.companyJobTotal = response.data.total;
        } catch (error) {
            console.error('Failed to fetch company job list:', error);
            ElMessage.error('获取公司职位列表失败');
            this.companyJobList = [];
            this.companyJobTotal = 0;
        } finally {
            this.loadingCompanyList = false;
        }
    },

    async createJob(data: Partial<JobInfo>) {
        this.submitting = true;
        try {
            const response = await createJob(data as CreateJobPayload);
            ElMessage.success('职位发布成功');
            await this.fetchCompanyJobList(); // Refresh list
            return response.data; // Return created job info if needed
        } catch (error) {
            console.error('Failed to create job:', error);
            // ElMessage.error('发布职位失败'); // request.ts拦截器已处理
        } finally {
            this.submitting = false;
        }
    },

    async updateJob(id: string | number, data: Partial<JobInfo>) {
        this.submitting = true;
        try {
            await updateJob(id, data);
            ElMessage.success('职位信息更新成功');
            await this.fetchCompanyJobList(); // Refresh list
            // Also update currentJob if it matches
            if (this.currentJob?.id === id) {
                 await this.fetchJobDetail(id);
            }
        } catch (error) {
            console.error('Failed to update job:', error);
            // ElMessage.error('更新职位信息失败'); // request.ts拦截器已处理
        } finally {
            this.submitting = false;
        }
    },

    async updateJobStatus(id: string | number, status: JobStatus) {
        this.submitting = true;
        try {
            await updateJobStatus(id, status);
            ElMessage.success(`职位状态已更新为 ${status === 'open' ? '招聘中' : '已关闭'}`);
            // Refresh the list to reflect status change
            const index = this.companyJobList.findIndex(job => job.id === id);
            if (index !== -1) {
                this.companyJobList[index].status = status;
            }
            // Optionally update currentJob status if matches
             if (this.currentJob?.id === id) {
                this.currentJob.status = status;
            }
        } catch (error) {
            console.error('Failed to update job status:', error);
            ElMessage.error('更新职位状态失败');
            throw error;
        } finally {
            this.submitting = false;
        }
    },

    async deleteJob(id: string | number) {
        this.submitting = true;
        try {
            await deleteJob(id);
            ElMessage.success('职位删除成功');
            await this.fetchCompanyJobList(); // Refresh list
             // Clear current job if it was deleted
            if (this.currentJob?.id === id) {
                 this.clearCurrentJob();
            }
        } catch (error) {
            console.error('Failed to delete job:', error);
            // ElMessage.error('删除职位失败'); // request.ts拦截器已处理
        } finally {
            this.submitting = false;
        }
    },

    clearCompanyJobList() {
        this.companyJobList = [];
        this.companyJobTotal = 0;
    },

  },
});