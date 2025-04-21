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

  // 统计数据
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  loadingStatistics: boolean;
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

    // 统计数据初始化
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    loadingStatistics: false,
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
        // 实际API调用
        // await updateApplicationStatus(id, data);

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));

        // 模拟更新本地数据
        const companyAppIndex = this.companyApplications.findIndex(app => app.id === id);
        if (companyAppIndex !== -1) {
          // 更新状态
          this.companyApplications[companyAppIndex].status = data.status;

          // 更新反馈
          if (data.feedback) {
            this.companyApplications[companyAppIndex].feedback = data.feedback;
          }

          // 更新面试相关信息
          if (data.interview_time) {
            this.companyApplications[companyAppIndex].interview_time = data.interview_time;
          }
          if (data.interview_type) {
            this.companyApplications[companyAppIndex].interview_type = data.interview_type;
          }
          if (data.interview_location) {
            this.companyApplications[companyAppIndex].interview_location = data.interview_location;
          }
          if (data.interview_contact) {
            this.companyApplications[companyAppIndex].interview_contact = data.interview_contact;
          }
          if (data.interview_contact_info) {
            this.companyApplications[companyAppIndex].interview_contact_info = data.interview_contact_info;
          }
        }

        // 更新当前详情
        if (this.currentApplicationDetail?.id === id) {
          // 更新状态
          this.currentApplicationDetail.status = data.status;

          // 更新反馈
          if (data.feedback) {
            this.currentApplicationDetail.feedback = data.feedback;
          }

          // 更新面试相关信息
          if (data.interview_time) {
            this.currentApplicationDetail.interview_time = data.interview_time;
          }
          if (data.interview_type) {
            this.currentApplicationDetail.interview_type = data.interview_type;
          }
          if (data.interview_location) {
            this.currentApplicationDetail.interview_location = data.interview_location;
          }
          if (data.interview_contact) {
            this.currentApplicationDetail.interview_contact = data.interview_contact;
          }
          if (data.interview_contact_info) {
            this.currentApplicationDetail.interview_contact_info = data.interview_contact_info;
          }
        }

        ElMessage.success('状态更新成功');
      } catch (error) {
        console.error('Failed to update application status:', error);
        ElMessage.error('更新申请状态失败');
        throw error;
      } finally {
        this.submitting = false;
      }
    },

    // 批量更新申请状态
    async batchUpdateApplicationStatus(ids: (string | number)[], data: UpdateApplicationStatusPayload) {
      this.submitting = true;
      try {
        // 实际API调用
        // await batchUpdateApplicationStatus(ids, data);

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));

        // 模拟更新本地数据
        for (const id of ids) {
          const companyAppIndex = this.companyApplications.findIndex(app => app.id === id);
          if (companyAppIndex !== -1) {
            // 更新状态
            this.companyApplications[companyAppIndex].status = data.status;

            // 更新反馈
            if (data.feedback) {
              this.companyApplications[companyAppIndex].feedback = data.feedback;
            }

            // 更新面试相关信息
            if (data.interview_time) {
              this.companyApplications[companyAppIndex].interview_time = data.interview_time;
            }
            if (data.interview_type) {
              this.companyApplications[companyAppIndex].interview_type = data.interview_type;
            }
            if (data.interview_location) {
              this.companyApplications[companyAppIndex].interview_location = data.interview_location;
            }
            if (data.interview_contact) {
              this.companyApplications[companyAppIndex].interview_contact = data.interview_contact;
            }
            if (data.interview_contact_info) {
              this.companyApplications[companyAppIndex].interview_contact_info = data.interview_contact_info;
            }
          }

          // 更新当前详情
          if (this.currentApplicationDetail?.id === id) {
            // 更新状态
            this.currentApplicationDetail.status = data.status;

            // 更新反馈
            if (data.feedback) {
              this.currentApplicationDetail.feedback = data.feedback;
            }

            // 更新面试相关信息
            if (data.interview_time) {
              this.currentApplicationDetail.interview_time = data.interview_time;
            }
            if (data.interview_type) {
              this.currentApplicationDetail.interview_type = data.interview_type;
            }
            if (data.interview_location) {
              this.currentApplicationDetail.interview_location = data.interview_location;
            }
            if (data.interview_contact) {
              this.currentApplicationDetail.interview_contact = data.interview_contact;
            }
            if (data.interview_contact_info) {
              this.currentApplicationDetail.interview_contact_info = data.interview_contact_info;
            }
          }
        }

        ElMessage.success('批量更新成功');
      } catch (error) {
        console.error('Failed to batch update application status:', error);
        ElMessage.error('批量更新失败');
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
    },

    // 获取申请统计数据
    async fetchApplicationStatistics() {
      this.loadingStatistics = true;
      try {
        // 模拟 API 调用
        await new Promise(resolve => setTimeout(resolve, 500));

        // 模拟数据
        this.totalApplications = 42;
        this.pendingApplications = 15;
        this.approvedApplications = 20;
        this.rejectedApplications = 7;

        // 实际 API 调用应该是这样的：
        // const response = await getApplicationStatistics();
        // this.totalApplications = response.data.total;
        // this.pendingApplications = response.data.pending;
        // this.approvedApplications = response.data.approved;
        // this.rejectedApplications = response.data.rejected;
      } catch (error) {
        console.error('Failed to fetch application statistics:', error);
        ElMessage.error('获取申请统计数据失败');
      } finally {
        this.loadingStatistics = false;
      }
    }
  },
});