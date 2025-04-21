import { defineStore } from 'pinia';
import type {
  ApplicationInfo,
  ApplyJobPayload,
  UpdateApplicationStatusPayload,
} from '@/types/application';
import {
  applyForJob,
  getStudentApplicationList,
  withdrawApplication,
  getCompanyApplicationList,
  getCompanyApplicationDetail,
  getStudentApplicationDetail,
  updateApplicationStatus,
} from '@/api/application';
import { ElMessage } from 'element-plus';

interface ApplicationState {
  studentApplications: ApplicationInfo[];
  studentApplicationsTotal: number;
  companyApplications: ApplicationInfo[];
  companyApplicationsTotal: number;
  currentApplicationDetail: ApplicationInfo | null;
  loadingStudentList: boolean;
  loadingCompanyList: boolean;
  loadingDetail: boolean;
  submitting: boolean; // For apply/withdraw/update status
}

export const useApplicationStore = defineStore('application', {
  state: (): ApplicationState => ({
    studentApplications: [],
    studentApplicationsTotal: 0,
    companyApplications: [],
    companyApplicationsTotal: 0,
    currentApplicationDetail: null,
    loadingStudentList: false,
    loadingCompanyList: false,
    loadingDetail: false,
    submitting: false,
  }),

  actions: {
    // (学生端) 获取申请列表
    async fetchStudentApplications(params: any = {}) {
      this.loadingStudentList = true;
      try {
        const response = await getStudentApplicationList(params);
        this.studentApplications = response.data.list;
        this.studentApplicationsTotal = response.data.total;
      } catch (error) {
        console.error('Failed to fetch student applications:', error);
        ElMessage.error('获取我的申请列表失败');
        this.studentApplications = [];
        this.studentApplicationsTotal = 0;
      } finally {
        this.loadingStudentList = false;
      }
    },

    // (学生端) 申请职位
    async applyForJob(data: ApplyJobPayload) {
      this.submitting = true;
      try {
        await applyForJob(data);
        ElMessage.success('申请成功');
        // Optionally refresh student application list
        await this.fetchStudentApplications();
      } catch (error) {
        console.error('Failed to apply for job:', error);
        ElMessage.error('申请职位失败');
        throw error;
      } finally {
        this.submitting = false;
      }
    },

    // (学生端) 撤回申请
    async withdrawApplication(id: string | number) {
      this.submitting = true;
      try {
        await withdrawApplication(id);
        ElMessage.success('撤回成功');
        await this.fetchStudentApplications(); // Refresh list
      } catch (error) {
        console.error('Failed to withdraw application:', error);
        ElMessage.error('撤回申请失败');
        throw error;
      } finally {
        this.submitting = false;
      }
    },

    // (企业端) 获取收到的申请列表
    async fetchCompanyApplications(params: any = {}) {
      this.loadingCompanyList = true;
      try {
        const response = await getCompanyApplicationList(params);
        this.companyApplications = response.data.list;
        this.companyApplicationsTotal = response.data.total;
      } catch (error) {
        console.error('Failed to fetch company applications:', error);
        ElMessage.error('获取收到的申请列表失败');
        this.companyApplications = [];
        this.companyApplicationsTotal = 0;
      } finally {
        this.loadingCompanyList = false;
      }
    },

    // (企业端) 获取申请详情
    async fetchCompanyApplicationDetail(id: string | number) {
      this.loadingDetail = true;
      this.currentApplicationDetail = null;
      try {
        const response = await getCompanyApplicationDetail(id);
        this.currentApplicationDetail = response.data;
      } catch (error) {
        console.error(`Failed to fetch company application detail for id ${id}:`, error);
        ElMessage.error('获取申请详情失败');
      } finally {
        this.loadingDetail = false;
      }
    },

    // (学生端) 获取申请详情
    async fetchApplicationDetail(id: string | number) {
      this.loadingDetail = true;
      this.currentApplicationDetail = null;
      try {
        const response = await getStudentApplicationDetail(id);
        this.currentApplicationDetail = response.data;
      } catch (error) {
        console.error(`Failed to fetch application detail for id ${id}:`, error);
        ElMessage.error('获取申请详情失败');
      } finally {
        this.loadingDetail = false;
      }
    },

    // (企业端) 更新申请状态
    async updateApplicationStatus(id: string | number, data: UpdateApplicationStatusPayload) {
      this.submitting = true;
      try {
        await updateApplicationStatus(id, data);
        ElMessage.success('状态更新成功');
        // Refresh company list and potentially the detail view
        await this.fetchCompanyApplications();
        if (this.currentApplicationDetail?.id === id) {
          await this.fetchCompanyApplicationDetail(id);
        }
      } catch (error) {
        console.error('Failed to update application status:', error);
        ElMessage.error('更新申请状态失败');
        throw error;
      } finally {
        this.submitting = false;
      }
    },

    clearCurrentApplicationDetail() {
        this.currentApplicationDetail = null;
    },

    clearApplicationData() {
        this.studentApplications = [];
        this.studentApplicationsTotal = 0;
        this.companyApplications = [];
        this.companyApplicationsTotal = 0;
        this.currentApplicationDetail = null;
    }
  },
});