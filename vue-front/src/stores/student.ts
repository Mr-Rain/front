import { defineStore } from 'pinia';
import type { StudentProfile } from '@/types/student';
import { getStudentProfile, updateStudentProfile } from '@/api/student';
import { ElMessage } from 'element-plus';

interface StudentState {
  profile: StudentProfile | null;
  loading: boolean;
}

export const useStudentStore = defineStore('student', {
  state: (): StudentState => ({
    profile: null,
    loading: false,
  }),

  actions: {
    // 获取学生档案信息
    async fetchProfile() {
      if (this.profile) return; // 如果已有，避免重复获取
      this.loading = true;
      try {
        const response = await getStudentProfile();
        this.profile = response.data;
      } catch (error) {
        console.error('Failed to fetch student profile:', error);
        ElMessage.error('获取学生信息失败');
      } finally {
        this.loading = false;
      }
    },

    // 更新学生档案信息
    async updateProfile(data: Partial<StudentProfile>) {
      this.loading = true;
      try {
        // Optimistic update (optional)
        // const oldProfile = { ...this.profile };
        // this.profile = { ...this.profile, ...data } as StudentProfile;

        await updateStudentProfile(data);
        // Refetch or update based on response
        await this.fetchProfile(); // 简单起见，重新获取最新信息
        ElMessage.success('更新成功');
      } catch (error) {
        console.error('Failed to update student profile:', error);
        ElMessage.error('更新学生信息失败');
        // Rollback optimistic update if needed
        // this.profile = oldProfile;
      } finally {
        this.loading = false;
      }
    },

    // 清除学生信息 (例如登出时)
    clearProfile() {
      this.profile = null;
    },
  },
}); 