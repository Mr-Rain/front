import { defineStore } from 'pinia';
import type { StudentProfileCamel } from '@/types/student-camel';
import { getStudentProfile, updateStudentProfile } from '@/api/student';
import { ElMessage } from 'element-plus';

interface StudentState {
  profile: StudentProfileCamel | null;
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
      // 不清空当前数据，只设置加载状态
      // this.profile = null; // 移除这一行，避免临时状态为null
      this.loading = true;

      try {
        console.log('Fetching student profile...');
        const response = await getStudentProfile();
        console.log('Student profile response:', response);

        // 确保响应数据存在
        if (response && response.data) {
          // API 返回的数据已经是驼峰命名，直接使用
          // 使用深拷贝确保数据独立
          const responseData = JSON.parse(JSON.stringify(response.data));

          // 直接将驼峰命名的数据赋值给 profile
          this.profile = responseData;

          // 如果关键字段为null或空，显示提示信息 (使用驼峰命名)
          if (!this.profile.realName || !this.profile.school || !this.profile.major) {
            ElMessage.warning('您的个人信息不完整，请前往个人信息页面完善');
          }

          console.log('Profile data set in store:', this.profile);
          return this.profile;
        } else {
          console.warn('No profile data received from API');
          // 如果没有数据，创建一个空的配置文件对象 (使用驼峰命名)
          if (!this.profile) {
            this.profile = {
              id: 0,
              username: '',
              email: '',
              userType: 'student', // 使用驼峰
              realName: null,      // 使用驼峰
              gender: null,
              age: null,
              phone: null,
              school: null,
              major: null,
              education: null,
              graduationYear: null, // 使用驼峰
              skills: [],
              introduction: null,
              avatar: null,
              status: 'active',
              createTime: new Date().toISOString(), // 使用驼峰
              lastLoginTime: new Date().toISOString() // 使用驼峰
            };
          }
          ElMessage.warning('未找到学生信息，请完善您的个人资料');

          return this.profile;
        }
      } catch (error) {
        console.error('Failed to fetch student profile:', error);
        ElMessage.error('获取学生信息失败');

        // 创建一个空的配置文件对象 (使用驼峰命名)
        if (!this.profile) {
          this.profile = {
            id: 0,
            username: '',
            email: '',
            userType: 'student', // 使用驼峰
            realName: null,      // 使用驼峰
            gender: null,
            age: null,
            phone: null,
            school: null,
            major: null,
            education: null,
            graduationYear: null, // 使用驼峰
            skills: [],
            introduction: null,
            avatar: null,
            status: 'active',
            createTime: new Date().toISOString(), // 使用驼峰
            lastLoginTime: new Date().toISOString() // 使用驼峰
          };
        }

        // 重新抛出错误，让调用者能够捕获
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 更新学生档案信息
    async updateProfile(data: Partial<StudentProfileCamel>) {
      this.loading = true;
      try {
        console.log('正在更新学生档案，数据:', data);

        // 记录更新前的数据 (已经是驼峰命名)
        const oldProfile = this.profile ? { ...this.profile } : null;
        console.log('更新前的档案数据:', oldProfile);

        // 确保所有必要字段都有值 (已经是驼峰命名)
        const completeData = {
          // 添加学号字段
          studentNumber: data.studentNumber || '',
          realName: data.realName || '未填写',
          gender: data.gender || '保密',
          age: data.age || 20,
          phone: data.phone || '',
          school: data.school || '未填写',
          major: data.major || '未填写',
          education: data.education || '本科',
          graduationYear: data.graduationYear || Math.min(new Date().getFullYear() + 4, 2100),
          skills: data.skills || ['暂无技能'],
          introduction: data.introduction || '暂无介绍',
          avatar: data.avatar || '',
          // 添加期望薪资和期望工作地点字段
          expectedSalary: data.expectedSalary || '面议',
          expectedLocation: data.expectedLocation || '全国'
        };

        console.log('完整的更新数据:', completeData);

        // 调用API更新个人信息 (发送驼峰命名数据)
        const response = await updateStudentProfile(completeData);
        console.log('更新学生档案响应:', response);

        // 检查响应是否成功
        // 1. 如果response是axios响应对象，检查status是否为200
        // 2. 如果response是后端响应对象，检查code是否为200
        if (response &&
            ((response.status === 200) ||
             (response.data && response.data.code === 200) ||
             ((response as any).code === 200))) {
          console.log('更新成功，响应数据:', response.data);

          // 更新本地状态 (使用驼峰命名)
          if (this.profile) {
            // 直接合并驼峰命名的 completeData
            this.profile = {
              ...this.profile,
              ...completeData
            };
          } else {
            // 如果之前没有档案数据，创建一个新的 (使用驼峰命名)
            this.profile = {
              id: 0, // 假设 id 等信息需要从 fetchProfile 或其他地方获取
              userType: 'student',
              username: '', // 假设 username 等信息需要从 fetchProfile 或其他地方获取
              email: '', // 假设 email 等信息需要从 fetchProfile 或其他地方获取
              status: 'active',
              createTime: new Date().toISOString(), // 假设 createTime 等信息需要从 fetchProfile 或其他地方获取
              lastLoginTime: new Date().toISOString(), // 假设 lastLoginTime 等信息需要从 fetchProfile 或其他地方获取
              ...completeData
            };
          }

          // 不再重新获取最新信息，直接使用更新后的数据
          console.log('更新后的档案数据:', this.profile);
          ElMessage.success('个人信息更新成功');
        } else {
          console.error('更新失败，响应:', response);
          ElMessage.error('更新失败，请重试');
        }

        return this.profile;
      } catch (error) {
        console.error('更新学生档案失败:', error);
        ElMessage.error('更新学生信息失败，请重试');
        throw error;
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