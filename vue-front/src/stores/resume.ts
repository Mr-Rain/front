import { defineStore } from 'pinia';
import type { ResumeInfo } from '@/types/resume';
import {
  getResumeList,
  getResumeDetail,
  createResume,
  updateResume,
  deleteResume,
  setDefaultResume,
  uploadResumeFile,
} from '@/api/resume';
import { ElMessage } from 'element-plus';

interface ResumeState {
  resumeList: ResumeInfo[];
  currentResume: ResumeInfo | null;
  loadingList: boolean;
  loadingDetail: boolean;
  uploading: boolean;
}

export const useResumeStore = defineStore('resume', {
  state: (): ResumeState => ({
    resumeList: [],
    currentResume: null,
    loadingList: false,
    loadingDetail: false,
    uploading: false,
  }),

  actions: {
    // 获取简历列表
    async fetchResumeList() {
      this.loadingList = true;
      try {
        const response = await getResumeList();
        this.resumeList = response.data;
      } catch (error) {
        console.error('Failed to fetch resume list:', error);
        ElMessage.error('获取简历列表失败');
        this.resumeList = [];
      } finally {
        this.loadingList = false;
      }
    },

    // 获取简历详情
    async fetchResumeDetail(id: string | number) {
      this.loadingDetail = true;
      this.currentResume = null;
      try {
        const response = await getResumeDetail(id);
        this.currentResume = response.data;
      } catch (error) {
        console.error(`Failed to fetch resume detail for id ${id}:`, error);
        ElMessage.error('获取简历详情失败');
      } finally {
        this.loadingDetail = false;
      }
    },

    // 创建在线简历
    async createResume(data: Partial<ResumeInfo>) {
      try {
        await createResume(data);
        await this.fetchResumeList(); // Refresh list
        ElMessage.success('创建成功');
      } catch (error) {
        console.error('Failed to create resume:', error);
        ElMessage.error('创建简历失败');
        throw error; // Re-throw for component handling
      }
    },

    // 更新在线简历
    async updateResume(id: string | number, data: Partial<ResumeInfo>) {
      try {
        await updateResume(id, data);
        await this.fetchResumeList(); // Refresh list
        // Optionally update currentResume if it matches id
        if (this.currentResume?.id === id) {
          await this.fetchResumeDetail(id);
        }
        ElMessage.success('更新成功');
      } catch (error) {
        console.error('Failed to update resume:', error);
        ElMessage.error('更新简历失败');
        throw error;
      }
    },

    // 删除简历
    async deleteResume(id: string | number) {
      try {
        await deleteResume(id);
        await this.fetchResumeList(); // Refresh list
        if (this.currentResume?.id === id) {
          this.currentResume = null;
        }
        ElMessage.success('删除成功');
      } catch (error) {
        console.error('Failed to delete resume:', error);
        ElMessage.error('删除简历失败');
        throw error;
      }
    },

    // 设置默认简历
    async setDefaultResume(id: string | number) {
        try {
            await setDefaultResume(id);
            await this.fetchResumeList(); // Refresh list to update is_default flag
            ElMessage.success('设置成功');
        } catch (error) {
            console.error('Failed to set default resume:', error);
            ElMessage.error('设置默认简历失败');
            throw error;
        }
    },

    // 上传附件简历
    async uploadResumeFile(file: File) {
      this.uploading = true;
      try {
        await uploadResumeFile(file);
        await this.fetchResumeList(); // Refresh list
        ElMessage.success('上传成功');
      } catch (error) {
        console.error('Failed to upload resume file:', error);
        ElMessage.error('上传附件简历失败');
        throw error;
      } finally {
        this.uploading = false;
      }
    },

    clearCurrentResume() {
        this.currentResume = null;
    },

    clearResumeData() {
        this.resumeList = [];
        this.currentResume = null;
    }
  },
}); 