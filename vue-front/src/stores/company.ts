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
  getPendingCompanies,
  approveCompany,
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
        this.jobList = response.data.list || response.data.records || [];
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
        this.applicationList = response.data.list || response.data.records || [];
        this.applicationTotal = response.data.total;
      } catch (error) {
        console.error('Failed to fetch company application list:', error);
        ElMessage.error('获取申请列表失败');
      } finally {
        this.loadingApplications = false;
      }
    },

    // (Admin) Fetch pending companies for audit
    async fetchAuditList(params: any = {}) {
      this.loadingAuditList = true;
      try {
        const response = await getPendingCompanies(params);
        this.auditList = response.data.list || response.data.records || [];
        this.auditTotal = response.data.total || 0;
      } catch (error) {
        console.error('Failed to fetch company audit list:', error);
        ElMessage.error('获取企业审核列表失败');
        this.auditList = [];
        this.auditTotal = 0;
      } finally {
        this.loadingAuditList = false;
      }
    },

    // (Admin) Submit audit result for a company
    async submitAudit(companyId: string | number, approved: boolean, message?: string) {
      this.submittingAudit = true;
      try {
        // 实际API调用
        // await approveCompany(companyId, approved, message);

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));

        // 更新本地数据
        const index = this.auditList.findIndex(company => company.id === companyId);
        if (index !== -1) {
          this.auditList[index].audit_status = approved ? 'approved' : 'rejected';
          if (message) {
            this.auditList[index].audit_message = message;
          }
        }

        ElMessage.success(`公司审核操作成功`);
        // 刷新列表
        // this.fetchAuditList();
      } catch (error) {
        console.error(`Failed to submit audit for company ${companyId}:`, error);
        ElMessage.error('审核提交失败');
        throw error;
      } finally {
        this.submittingAudit = false;
      }
    },

    // (Admin) 获取公司审核记录
    async fetchAuditLogs(companyId: string | number) {
      try {
        // 实际API调用
        // const response = await request.get(`/admin/companies/${companyId}/audit-logs`);
        // return response.data;

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));

        // 模拟审核记录数据
        const company = this.auditList.find(company => company.id === companyId);
        if (!company) {
          return [];
        }

        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        return [
          {
            id: 1,
            company_id: companyId,
            action: 'view',
            operator_id: 1,
            operator_name: 'admin',
            audit_time: yesterday.toISOString(),
            message: ''
          },
          {
            id: 2,
            company_id: companyId,
            action: company.audit_status === 'approved' ? 'approve' : (company.audit_status === 'rejected' ? 'reject' : 'comment'),
            operator_id: 1,
            operator_name: 'admin',
            audit_time: now.toISOString(),
            message: company.audit_message || ''
          }
        ];
      } catch (error) {
        console.error(`Failed to fetch audit logs for company ${companyId}:`, error);
        ElMessage.error('获取审核记录失败');
        return [];
      }
    },

    // (Admin) 获取公司详情
    async getCompanyDetail(companyId: string | number) {
      try {
        // 实际API调用
        // const response = await request.get(`/admin/companies/${companyId}`);
        // return response.data;

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));

        // 从列表中获取公司信息
        const company = this.auditList.find(company => company.id === companyId);
        if (!company) {
          throw new Error('公司不存在');
        }

        return company;
      } catch (error) {
        console.error(`Failed to get company detail for id ${companyId}:`, error);
        ElMessage.error('获取公司详情失败');
        throw error;
      }
    },

    // Upload company logo
    async uploadLogo(file: File) {
      this.submitting = true;
      try {
        const response = await uploadCompanyLogo(file);
        const logoUrl = response.data.url;
        if (this.profile) {
          this.profile.logo = logoUrl;
        }
        ElMessage.success('Logo 上传成功');
        return logoUrl;
      } catch (error) {
        console.error('Failed to upload logo:', error);
        ElMessage.error('Logo 上传失败');
        throw error;
      } finally {
        this.submitting = false;
      }
    },

    // Upload company license
    async uploadLicense(file: File) {
      this.submitting = true;
      try {
        const response = await uploadCompanyLicense(file);
        const licenseUrl = response.data.url;
        if (this.profile) {
          this.profile.business_license = licenseUrl;
        }
        ElMessage.success('营业执照上传成功');
        return licenseUrl;
      } catch (error) {
        console.error('Failed to upload license:', error);
        ElMessage.error('营业执照上传失败');
        throw error;
      } finally {
        this.submitting = false;
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