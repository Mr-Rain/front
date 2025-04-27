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
      // 先清空当前数据，确保每次都是全新的数据
      this.profile = null;
      this.loading = true;

      try {
        console.log('Fetching student profile...');
        const response = await getStudentProfile();
        console.log('Student profile response:', response);

        // 确保响应数据存在
        if (response && response.data) {
          // 使用深拷贝确保数据独立
          this.profile = JSON.parse(JSON.stringify(response.data));

          // 如果关键字段为null，显示提示信息
          if (!this.profile.real_name || !this.profile.school || !this.profile.major) {
            ElMessage.warning('您的个人信息不完整，请前往个人信息页面完善');
          }

          console.log('Profile data set in store:', this.profile);
          return this.profile;
        } else {
          console.warn('No profile data received from API');
          // 如果没有数据，创建一个空的配置文件对象
          this.profile = {
            id: 0,
            username: '',
            email: '',
            user_type: 'student',
            real_name: null,
            gender: null,
            age: null,
            phone: null,
            school: null,
            major: null,
            education: null,
            graduation_year: null,
            skills: [],
            introduction: null,
            avatar: null,
            status: 'active',
            create_time: new Date().toISOString(),
            last_login_time: new Date().toISOString()
          };
          ElMessage.warning('未找到学生信息，请完善您的个人资料');

          return this.profile;
        }
      } catch (error) {
        console.error('Failed to fetch student profile:', error);
        ElMessage.error('获取学生信息失败');

        // 创建一个空的配置文件对象
        this.profile = {
          id: 0,
          username: '',
          email: '',
          user_type: 'student',
          real_name: null,
          gender: null,
          age: null,
          phone: null,
          school: null,
          major: null,
          education: null,
          graduation_year: null,
          skills: [],
          introduction: null,
          avatar: null,
          status: 'active',
          create_time: new Date().toISOString(),
          last_login_time: new Date().toISOString()
        };

        // 重新抛出错误，让调用者能够捕获
        throw error;
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