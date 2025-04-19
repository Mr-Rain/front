import { defineStore } from 'pinia';
import type { CompanyProfile, AuditPayload } from '@/types/company';
import type { JobInfo } from '@/types/job';
import type { ApplicationInfo } from '@/types/application';
import {
  getCompanyProfile,
  updateCompanyProfile,
  getCompanyJobList,
  uploadCompanyLogo,
  uploadCompanyLicense,
  getCompanyAuditList,
  submitCompanyAuditResult
} from '@/api/company';
import { getCompanyApplicationList } from '@/api/application';
import { ElMessage } from 'element-plus';

interface CompanyState {
  profile: CompanyProfile | null;
  jobList: JobInfo[];
  jobTotal: number;
  applicationList: ApplicationInfo[];
  applicationTotal: number;
  loadingProfile: boolean;
  loadingJobs: boolean;
  loadingApplications: boolean;
  submitting: boolean;

  auditList: CompanyProfile[];
  auditTotal: number;
  loadingAuditList: boolean;
  submittingAudit: boolean;
}

export const useCompanyStore = defineStore('company', {
  state: (): CompanyState => ({
    profile: null,
    jobList: [],
    jobTotal: 0,
    applicationList: [],
    applicationTotal: 0,
    loadingProfile: false,
    loadingJobs: false,
    loadingApplications: false,
    submitting: false,

    auditList: [],
    auditTotal: 0,
    loadingAuditList: false,
    submittingAudit: false,
  }),

  actions: {
    // 获取公司信息
    async fetchProfile() {
      if (this.profile) return;
      this.loadingProfile = true;
      try {
        const response = await getCompanyProfile();
        this.profile = response.data;
      } catch (error) {
        console.error('Failed to fetch company profile:', error);
        ElMessage.error('获取公司信息失败');
      } finally {
        this.loadingProfile = false;
      }
    },

    // 更新公司信息
    async updateProfile(data: Partial<CompanyProfile>) {
      this.loadingProfile = true;
      try {
        await updateCompanyProfile(data);
        await this.fetchProfile(); // Re-fetch
        ElMessage.success('更新成功');
      } catch (error) {
        console.error('Failed to update company profile:', error);
        ElMessage.error('更新公司信息失败');
      } finally {
        this.loadingProfile = false;
      }
    },

    // 获取公司发布的职位列表
    async fetchJobList(params: any = {}) {
      this.loadingJobs = true;
      try {
        const response = await getCompanyJobList(params);
        this.jobList = response.data.list;
        this.jobTotal = response.data.total;
      } catch (error) {
        console.error('Failed to fetch company job list:', error);
        ElMessage.error('获取职位列表失败');
      } finally {
        this.loadingJobs = false;
      }
    },

    // 获取收到的申请列表
    async fetchApplicationList(params: any = {}) {
      this.loadingApplications = true;
      try {
        const response = await getCompanyApplicationList(params);
        this.applicationList = response.data.list;
        this.applicationTotal = response.data.total;
      } catch (error) {
        console.error('Failed to fetch company application list:', error);
        ElMessage.error('获取申请列表失败');
      } finally {
        this.loadingApplications = false;
      }
    },

    // --- Logo & License Upload (Placeholders, implement API calls) ---
    async uploadLogo(file: File): Promise<string> {
      this.submitting = true;
      try {
        // TODO: Implement uploadCompanyLogo API call
        const response = await uploadCompanyLogo(file);
        return response.data.url; // Assuming API returns { data: { url: '...' } }
      } catch (error) {
        console.error("Logo upload failed:", error);
        throw error;
      } finally {
        this.submitting = false;
      }
    },
    
    async uploadLicense(file: File): Promise<{url: string, name: string}> {
      this.submitting = true;
      try {
        // TODO: Implement uploadCompanyLicense API call
        const response = await uploadCompanyLicense(file);
        // Assuming API returns { data: { url: '...', name: '...' } }
        return response.data; 
      } catch (error) {
        console.error("License upload failed:", error);
        throw error;
      } finally {
        this.submitting = false;
      }
    },

    // --- Admin Audit Actions ---
    async fetchAuditList(params: any = {}) {
      this.loadingAuditList = true;
      try {
        // TODO: Ensure getCompanyAuditList API exists
        const response = await getCompanyAuditList(params);
        this.auditList = response.data.list;
        this.auditTotal = response.data.total;
      } catch (error) {
        console.error('Failed to fetch company audit list:', error);
        ElMessage.error('获取企业审核列表失败');
        this.auditList = [];
        this.auditTotal = 0;
      } finally {
        this.loadingAuditList = false;
      }
    },

    async submitAuditResult(companyId: string | number, payload: AuditPayload) {
      this.submittingAudit = true;
      try {
        // TODO: Ensure submitCompanyAuditResult API exists
        await submitCompanyAuditResult(companyId, payload);
        // Optionally update the status in the auditList locally or refetch
        const index = this.auditList.findIndex(c => c.id === companyId);
        if (index !== -1) {
          this.auditList[index].audit_status = payload.status;
          this.auditList[index].audit_message = payload.message;
        }
        // Refresh profile if the audited company is the current profile ( unlikely scenario )
        // if (this.profile?.id === companyId) {
        //    await this.fetchProfile();
        // }
        // Success message handled by component?
      } catch (error) {
        console.error('Failed to submit audit result:', error);
        ElMessage.error('提交审核结果失败');
        throw error;
      } finally {
        this.submittingAudit = false;
      }
    },

    // 清除公司信息
    clearCompanyData() {
      this.profile = null;
      this.jobList = [];
      this.jobTotal = 0;
      this.applicationList = [];
      this.applicationTotal = 0;
    },
  },
}); 