import { defineStore } from 'pinia';
import {
  createSystemAnnouncement as apiCreateSystemAnnouncement,
  getSystemAnnouncements as apiGetSystemAnnouncements,
  getSystemAnnouncementById as apiGetSystemAnnouncementById,
  updateSystemAnnouncement as apiUpdateSystemAnnouncement,
  deleteSystemAnnouncement as apiDeleteSystemAnnouncement,
} from '@/api/announcement';
import type {
  SystemAnnouncementDTO,
  CreateSystemAnnouncementRequest,
  UpdateSystemAnnouncementRequest,
  SystemAnnouncementQueryRequest,
} from '@/types/api/announcement';
import type { PageResult } from '@/types/api/common';

interface AnnouncementState {
  announcements: SystemAnnouncementDTO[];
  currentAnnouncement: SystemAnnouncementDTO | null;
  total: number;
  loading: boolean;
  error: any | null;
  query: SystemAnnouncementQueryRequest;
}

export const useAnnouncementStore = defineStore('announcement', {
  state: (): AnnouncementState => ({
    announcements: [],
    currentAnnouncement: null,
    total: 0,
    loading: false,
    error: null,
    query: {
      pageNum: 1,
      pageSize: 10,
      sortField: 'createTime',
      sortOrder: 'desc',
    },
  }),
  actions: {
    async fetchAnnouncements(params?: SystemAnnouncementQueryRequest) {
      this.loading = true;
      this.error = null;
      const queryParams = { ...this.query, ...params };
      try {
        const response = await apiGetSystemAnnouncements(queryParams);
        const data = response.data; // Axios data is in response.data
        this.announcements = data.list;
        this.total = data.total;
        this.query.pageNum = data.pageNum;
        this.query.pageSize = data.pageSize;
      } catch (err) {
        this.error = err;
        this.announcements = [];
        this.total = 0;
        // 可选: 向上抛出错误或使用通知系统显示错误
        console.error('Failed to fetch announcements:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchAnnouncementById(id: number | string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiGetSystemAnnouncementById(id);
        this.currentAnnouncement = response.data;
      } catch (err) {
        this.error = err;
        this.currentAnnouncement = null;
        console.error(`Failed to fetch announcement ${id}:`, err);
      } finally {
        this.loading = false;
      }
    },

    async createAnnouncement(data: CreateSystemAnnouncementRequest) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiCreateSystemAnnouncement(data);
        // 可选: 创建成功后重新加载列表或将新公告添加到列表顶部
        await this.fetchAnnouncements(); // 重新加载列表
        return response.data; // 返回创建的公告
      } catch (err) {
        this.error = err;
        console.error('Failed to create announcement:', err);
        throw err; // 向上抛出错误，以便组件处理
      } finally {
        this.loading = false;
      }
    },

    async updateAnnouncement(id: number | string, data: UpdateSystemAnnouncementRequest) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiUpdateSystemAnnouncement(id, data);
        // 可选: 更新成功后更新列表中的对应项或重新加载列表
        await this.fetchAnnouncements(); // 简单起见，重新加载列表
        if (this.currentAnnouncement && this.currentAnnouncement.id === id) {
            this.currentAnnouncement = response.data; // 更新当前打开的公告
        }
        return response.data; // 返回更新后的公告
      } catch (err) {
        this.error = err;
        console.error(`Failed to update announcement ${id}:`, err);
        throw err; // 向上抛出错误
      } finally {
        this.loading = false;
      }
    },

    async deleteAnnouncement(id: number | string) {
      this.loading = true;
      this.error = null;
      try {
        await apiDeleteSystemAnnouncement(id);
        // 从列表中移除或重新加载列表
        this.announcements = this.announcements.filter(ann => ann.id !== id);
        this.total = Math.max(0, this.total -1); // 更新总数
        if (this.currentAnnouncement && this.currentAnnouncement.id === id) {
            this.currentAnnouncement = null; // 如果删除的是当前打开的公告，则清空
        }
      } catch (err) {
        this.error = err;
        console.error(`Failed to delete announcement ${id}:`, err);
        throw err; // 向上抛出错误
      } finally {
        this.loading = false;
      }
    },

    setCurrentQuery(params: Partial<SystemAnnouncementQueryRequest>) {
      this.query = { ...this.query, ...params };
    },

    resetCurrentAnnouncement() {
        this.currentAnnouncement = null;
    }
  },
  getters: {
    getAnnouncementById: (state) => (id: number) => {
      return state.announcements.find(ann => ann.id === id) || state.currentAnnouncement;
    },
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },
}); 