import { defineStore } from 'pinia';
import type { JobInfo, JobListParams, JobStatus } from '@/types/job';
import { getJobList, getJobDetail, getCompanyJobList, createJob as createJobApi, updateJob as updateJobApi, updateJobStatus as updateJobStatusApi, deleteJob as deleteJobApi } from '@/api/job';
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
        const response = await getJobList(params);
        this.jobList = response.data.list;
        this.jobTotal = response.data.total;
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
            // TODO: Ensure getCompanyJobList API exists and handles company context
            const response = await getCompanyJobList(params);
            this.companyJobList = response.data.list;
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
            // TODO: Ensure createJobApi exists
            const response = await createJobApi(data);
            ElMessage.success('职位发布成功');
            await this.fetchCompanyJobList(); // Refresh list
            return response.data; // Return created job info if needed
        } catch (error) {
            console.error('Failed to create job:', error);
            ElMessage.error('发布职位失败');
            throw error;
        } finally {
            this.submitting = false;
        }
    },

    async updateJob(id: string | number, data: Partial<JobInfo>) {
        this.submitting = true;
        try {
             // TODO: Ensure updateJobApi exists
            await updateJobApi(id, data);
            ElMessage.success('职位信息更新成功');
            await this.fetchCompanyJobList(); // Refresh list
            // Also update currentJob if it matches
            if (this.currentJob?.id === id) {
                 await this.fetchJobDetail(id);
            }
        } catch (error) {
            console.error('Failed to update job:', error);
            ElMessage.error('更新职位信息失败');
            throw error;
        } finally {
            this.submitting = false;
        }
    },

    async updateJobStatus(id: string | number, status: JobStatus) {
        this.submitting = true;
        try {
            // TODO: Ensure updateJobStatusApi exists
            await updateJobStatusApi(id, { status });
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
            // TODO: Ensure deleteJobApi exists
            await deleteJobApi(id);
            ElMessage.success('职位删除成功');
            await this.fetchCompanyJobList(); // Refresh list
             // Clear current job if it was deleted
            if (this.currentJob?.id === id) {
                 this.clearCurrentJob();
            }
        } catch (error) {
            console.error('Failed to delete job:', error);
            ElMessage.error('删除职位失败');
            throw error;
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