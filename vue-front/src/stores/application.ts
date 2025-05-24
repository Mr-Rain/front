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
  submitInterviewFeedback,
  scheduleInterview,
  submitCompanyFeedback,
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
        const rawApplications = response.data.list || response.data.records || [];

        // 处理数据，确保顶层字段存在
        this.studentApplications = rawApplications.map(app => {
          // 打印原始数据，用于调试
          console.log('原始申请数据:', app);

          return {
            ...app,
            jobTitle: app.jobTitle || app.jobInfo?.title || 'N/A',
            companyName: app.companyName || app.jobInfo?.companyName || 'N/A',
            // 简历标题处理逻辑
            resumeTitle: app.resumeTitle ||
                        (app as any).resumeSnapshot?.title ||
                        (app as any).resumeInfo?.title ||
                        (app as any).resume?.title ||
                        '未知简历'
          };
        });

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
        // 清除申请列表缓存
        import('@/utils/apiCache').then(module => {
          const apiCache = module.default;
          apiCache.clearByTags(['application', 'student-applications']);
        });
        // 刷新学生申请列表
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
        // 清除申请列表缓存
        import('@/utils/apiCache').then(module => {
          const apiCache = module.default;
          apiCache.clearByTags(['application', 'student-applications']);
        });
        await this.fetchStudentApplications(); // 刷新列表
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
        this.companyApplications = response.data.list || response.data.records || [];
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
      // 处理数据，确保顶层字段存在
      const applicationDetail = response.data;
      // 打印原始数据，用于调试
      console.log('Original application detail data:', applicationDetail);

      this.currentApplicationDetail = {
        ...applicationDetail,
        jobTitle: applicationDetail.jobTitle || applicationDetail.jobInfo?.title || 'N/A',
        companyName: applicationDetail.companyName || applicationDetail.jobInfo?.companyName || 'N/A',
        // 确保简历标题字段存在，增加更多可能的数据来源
        resumeTitle: applicationDetail.resumeTitle ||
                    (applicationDetail as any).resumeSnapshot?.title ||
                    (applicationDetail as any).resumeInfo?.title ||
                    (applicationDetail as any).resume?.title ||
                    '未知简历'
      };

      // 打印处理后的数据，用于调试
      console.log('处理后的申请详情数据:', this.currentApplicationDetail);

      // 打印处理后的数据，用于调试
      console.log('Processed application detail data:', this.currentApplicationDetail);
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
        await updateApplicationStatus(id, data);

        // 更新本地数据
        const companyAppIndex = this.companyApplications.findIndex(app => app.id === id);
        if (companyAppIndex !== -1) {
          // 更新状态
          this.companyApplications[companyAppIndex].status = data.status;

          // 更新反馈
          if (data.feedback) {
            this.companyApplications[companyAppIndex].feedback = data.feedback;
          }

          // 更新面试相关信息
          if (data.interviewTime) {
            this.companyApplications[companyAppIndex].interviewTime = data.interviewTime;
          }
          if (data.interviewType) {
            this.companyApplications[companyAppIndex].interviewType = data.interviewType;
          }
          if (data.interviewLocation) {
            this.companyApplications[companyAppIndex].interviewLocation = data.interviewLocation;
          }
          if (data.interviewContact) {
            this.companyApplications[companyAppIndex].interviewContact = data.interviewContact;
          }
          if (data.interviewContactInfo) {
            this.companyApplications[companyAppIndex].interviewContactInfo = data.interviewContactInfo;
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
          if (data.interviewTime) {
            this.currentApplicationDetail.interviewTime = data.interviewTime;
          }
          if (data.interviewType) {
            this.currentApplicationDetail.interviewType = data.interviewType;
          }
          if (data.interviewLocation) {
            this.currentApplicationDetail.interviewLocation = data.interviewLocation;
          }
          if (data.interviewContact) {
            this.currentApplicationDetail.interviewContact = data.interviewContact;
          }
          if (data.interviewContactInfo) {
            this.currentApplicationDetail.interviewContactInfo = data.interviewContactInfo;
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
        // 实际API调用 - 这里需要后端提供批量更新接口
        // 由于后端可能没有批量更新接口，我们这里循环调用单个更新接口
        for (const id of ids) {
          // 如果是安排面试，使用专门的面试安排API
          if (data.status === 'interview' &&
              (data.interviewTime || data.interviewType || data.interviewLocation ||
               data.interviewContact || data.interviewContactInfo)) {
            await scheduleInterview(id, data);
          } else {
            await updateApplicationStatus(id, data);
          }
        }

        // 更新本地数据
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
            if (data.interviewTime) {
              this.companyApplications[companyAppIndex].interviewTime = data.interviewTime;
            }
            if (data.interviewType) {
              this.companyApplications[companyAppIndex].interviewType = data.interviewType;
            }
            if (data.interviewLocation) {
              this.companyApplications[companyAppIndex].interviewLocation = data.interviewLocation;
            }
            if (data.interviewContact) {
              this.companyApplications[companyAppIndex].interviewContact = data.interviewContact;
            }
            if (data.interviewContactInfo) {
              this.companyApplications[companyAppIndex].interviewContactInfo = data.interviewContactInfo;
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
            if (data.interviewTime) {
              this.currentApplicationDetail.interviewTime = data.interviewTime;
            }
            if (data.interviewType) {
              this.currentApplicationDetail.interviewType = data.interviewType;
            }
            if (data.interviewLocation) {
              this.currentApplicationDetail.interviewLocation = data.interviewLocation;
            }
            if (data.interviewContact) {
              this.currentApplicationDetail.interviewContact = data.interviewContact;
            }
            if (data.interviewContactInfo) {
              this.currentApplicationDetail.interviewContactInfo = data.interviewContactInfo;
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
        // 保存ID以便清除缓存
        const id = this.currentApplicationDetail?.id;

        // 清除当前详情
        this.currentApplicationDetail = null;

        // 清除缓存
        if (id) {
          import('@/utils/apiCache').then(module => {
            const apiCache = module.default;
            apiCache.clearByTags(['application', `application-${id}`]);
            console.log('Cleared application cache for ID:', id);
          });
        }
    },

    clearApplicationData() {
        this.studentApplications = [];
        this.studentApplicationsTotal = 0;
        this.companyApplications = [];
        this.companyApplicationsTotal = 0;
        this.currentApplicationDetail = null;

        // 清除所有申请相关缓存
        import('@/utils/apiCache').then(module => {
          const apiCache = module.default;
          apiCache.clearByTags(['application']);
          console.log('Cleared all application cache');
        });
    },

    // 提交面试反馈
    async submitInterviewFeedback(id: string | number, rating: number, feedback?: string) {
      this.submitting = true;
      try {
        const response = await submitInterviewFeedback(id, rating, feedback);

        // 使用后端返回的最新数据更新本地状态
        if (this.currentApplicationDetail?.id === id && response.data) {
          // 完全替换为后端返回的最新数据
          this.currentApplicationDetail = response.data;
        }

        ElMessage.success('反馈提交成功');
        return response;
      } catch (error: any) {
        console.error('Failed to submit interview feedback:', error);

        // 处理特定错误消息
        if (error.response && error.response.data && error.response.data.message) {
          ElMessage.error(error.response.data.message);
        } else {
          ElMessage.error('提交反馈失败，请稍后重试');
        }

        throw error;
      } finally {
        this.submitting = false;
      }
    },

    // 企业提交反馈
    async submitCompanyFeedback(id: string | number, feedback: string, rating: number) {
      this.submitting = true;
      try {
        const response = await submitCompanyFeedback(id, { feedback, rating });

        // 使用后端返回的最新数据更新本地状态
        if (this.currentApplicationDetail?.id === id && response.data) {
          // 完全替换为后端返回的最新数据
          this.currentApplicationDetail = response.data;
        }

        // 更新列表中的数据
        const companyAppIndex = this.companyApplications.findIndex(app => app.id === id);
        if (companyAppIndex !== -1) {
          this.companyApplications[companyAppIndex].feedback = feedback;
          this.companyApplications[companyAppIndex].rating = rating;
        }

        ElMessage.success('反馈提交成功');
        return response;
      } catch (error: any) {
        console.error('Failed to submit company feedback:', error);

        // 处理特定错误消息
        if (error.response && error.response.data && error.response.data.message) {
          ElMessage.error(error.response.data.message);
        } else {
          ElMessage.error('提交反馈失败，请稍后重试');
        }

        throw error;
      } finally {
        this.submitting = false;
      }
    },

    // 安排面试
    async scheduleInterviewForApplication(id: string | number, interviewData: any) {
      this.submitting = true;
      try {
        // 调用专门的面试安排API
        const response = await scheduleInterview(id, interviewData);

        // 更新本地数据
        const companyAppIndex = this.companyApplications.findIndex(app => app.id === id);
        if (companyAppIndex !== -1) {
          // 更新状态为面试中
          this.companyApplications[companyAppIndex].status = 'interview';

          // 更新面试相关信息
          if (interviewData.interviewTime) {
            this.companyApplications[companyAppIndex].interviewTime = interviewData.interviewTime;
          }
          if (interviewData.interviewType) {
            this.companyApplications[companyAppIndex].interviewType = interviewData.interviewType;
          }
          if (interviewData.interviewLocation) {
            this.companyApplications[companyAppIndex].interviewLocation = interviewData.interviewLocation;
          }
          if (interviewData.interviewContact) {
            this.companyApplications[companyAppIndex].interviewContact = interviewData.interviewContact;
          }
          if (interviewData.interviewContactInfo) {
            this.companyApplications[companyAppIndex].interviewContactInfo = interviewData.interviewContactInfo;
          }
          if (interviewData.feedback) {
            this.companyApplications[companyAppIndex].feedback = interviewData.feedback;
          }
        }

        // 更新当前详情
        if (this.currentApplicationDetail?.id === id) {
          // 更新状态为面试中
          this.currentApplicationDetail.status = 'interview';

          // 更新面试相关信息
          if (interviewData.interviewTime) {
            this.currentApplicationDetail.interviewTime = interviewData.interviewTime;
          }
          if (interviewData.interviewType) {
            this.currentApplicationDetail.interviewType = interviewData.interviewType;
          }
          if (interviewData.interviewLocation) {
            this.currentApplicationDetail.interviewLocation = interviewData.interviewLocation;
          }
          if (interviewData.interviewContact) {
            this.currentApplicationDetail.interviewContact = interviewData.interviewContact;
          }
          if (interviewData.interviewContactInfo) {
            this.currentApplicationDetail.interviewContactInfo = interviewData.interviewContactInfo;
          }
          if (interviewData.feedback) {
            this.currentApplicationDetail.feedback = interviewData.feedback;
          }
        }

        ElMessage.success('面试安排成功');
        return response;
      } catch (error: any) {
        console.error('Failed to schedule interview:', error);

        // 处理特定错误消息
        if (error.response && error.response.data && error.response.data.message) {
          ElMessage.error(error.response.data.message);
        } else {
          ElMessage.error('安排面试失败，请稍后重试');
        }

        throw error;
      } finally {
        this.submitting = false;
      }
    },

    // 获取申请统计数据
    async fetchApplicationStatistics() {
      this.loadingStatistics = true;
      try {
        // 获取企业收到的所有申请
        const response = await getCompanyApplicationList({ pageSize: 1000 });
        const applications = response.data.list || response.data.records || [];

        // 计算统计数据
        this.totalApplications = applications.length;
        this.pendingApplications = applications.filter(app => app.status === 'pending').length;
        this.approvedApplications = applications.filter(app => app.status === 'accepted').length;
        this.rejectedApplications = applications.filter(app => app.status === 'rejected').length;

        console.log('Application statistics:', {
          total: this.totalApplications,
          pending: this.pendingApplications,
          approved: this.approvedApplications,
          rejected: this.rejectedApplications
        });
      } catch (error) {
        console.error('Failed to fetch application statistics:', error);
        ElMessage.error('获取申请统计数据失败');

        // 重置统计数据
        this.totalApplications = 0;
        this.pendingApplications = 0;
        this.approvedApplications = 0;
        this.rejectedApplications = 0;
      } finally {
        this.loadingStatistics = false;
      }
    }
  },
});
