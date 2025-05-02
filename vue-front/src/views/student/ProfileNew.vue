<template>
  <div class="student-profile-page responsive-padding">
    <!-- 调试信息卡片 -->
    <el-card v-if="true" shadow="hover" class="debug-card responsive-card">
      <div class="debug-info">
        <h3>调试信息</h3>
        <p><strong>路由信息：</strong> {{ route.path }} ({{ route.name }})</p>
        <p><strong>查询参数：</strong> {{ JSON.stringify(route.query) }}</p>
        <p><strong>加载状态：</strong> {{ studentStore.loading ? '加载中' : '已加载' }}</p>
        <p><strong>个人信息：</strong> {{ studentStore.profile ? '已获取' : '未获取' }}</p>
        <p><strong>个人信息ID：</strong> {{ studentStore.profile?.id }}</p>
        <p><strong>真实姓名：</strong> {{ studentStore.profile?.realName }}</p>
        <p><strong>学校：</strong> {{ studentStore.profile?.school }}</p>
        <p><strong>专业：</strong> {{ studentStore.profile?.major }}</p>
        <p><strong>最后登录时间(UTC)：</strong> {{ studentStore.profile?.lastLoginTime }}</p>
        <p><strong>最后登录时间(北京)：</strong> {{ formatToBeiJingTime(studentStore.profile?.lastLoginTime) }}</p>
        <p><strong>表单数据：</strong></p>
        <pre>{{ JSON.stringify(profileForm, null, 2) }}</pre>
        <el-button size="small" @click="forceRefreshData">强制刷新数据</el-button>
      </div>
    </el-card>

    <el-card shadow="never" class="page-card responsive-card">
      <template #header>
        <div class="card-header">
          <span class="page-title">个人信息</span>
          <el-button type="primary" @click="toggleEdit">
            {{ isEditing ? '取消编辑' : '编辑信息' }}
          </el-button>
        </div>
      </template>

      <div v-loading="studentStore.loading || loading">
        <div v-if="studentStore.profile" class="profile-content">
          <!-- 头像部分 -->
          <div class="avatar-section">
            <avatar-uploader
              v-model="profileForm.avatar"
              :disabled="!isEditing"
              @upload="handleAvatarUpload"
            />
          </div>

          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-position="top"
            :disabled="!isEditing"
            @submit.prevent
          >
            <!-- 基本信息部分 -->
            <div class="form-section">
              <h2 class="section-title">基本信息</h2>
              <div class="required-fields-note">
                <span class="required-mark">*</span> 标记为必填字段（真实姓名、学号、性别、学校、专业、手机号码）
              </div>
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="用户名" prop="username">
                    <el-input v-model="profileForm.username" disabled></el-input>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="真实姓名" prop="realName" required>
                    <el-input v-model="profileForm.realName" placeholder="请输入真实姓名"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="学号" prop="studentNumber" required>
                    <el-input v-model="profileForm.studentNumber" placeholder="请输入学号"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="性别" prop="gender" required>
                    <el-select v-model="profileForm.gender" placeholder="请选择性别" style="width: 100%">
                      <el-option label="男" value="男"></el-option>
                      <el-option label="女" value="女"></el-option>
                      <el-option label="其他" value="其他"></el-option>
                      <el-option label="保密" value="保密"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="学校" prop="school" required>
                    <el-input v-model="profileForm.school" placeholder="请输入学校名称"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="专业" prop="major" required>
                    <el-input v-model="profileForm.major" placeholder="请输入专业名称"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="年级" prop="grade">
                    <el-input v-model="profileForm.grade" placeholder="请输入入学年份，如 2021"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="学历" prop="education">
                    <el-select v-model="profileForm.education" placeholder="请选择学历" style="width: 100%">
                      <el-option label="大专" value="大专"></el-option>
                      <el-option label="本科" value="本科"></el-option>
                      <el-option label="硕士" value="硕士"></el-option>
                      <el-option label="博士" value="博士"></el-option>
                      <el-option label="其他" value="其他"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="个人简介" prop="introduction">
                <el-input
                  v-model="profileForm.introduction"
                  type="textarea"
                  :rows="3"
                  placeholder="请简要介绍自己"
                ></el-input>
              </el-form-item>
            </div>

            <!-- 教育经历部分 -->
            <div class="form-section">
              <education-experience-form
                v-model="profileForm.educationList"
                :editable="isEditing"
              />
            </div>

            <!-- 工作经历部分 -->
            <div class="form-section">
              <work-experience-form
                v-model="profileForm.workList"
                :editable="isEditing"
              />
            </div>

            <!-- 联系方式部分 -->
            <div class="form-section">
              <h2 class="section-title">联系方式</h2>
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="手机号码" prop="phone" required>
                    <el-input v-model="profileForm.phone" placeholder="请输入手机号码"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="profileForm.email" placeholder="请输入邮箱地址"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 技能标签部分 -->
            <div class="form-section">
              <skills-tags-form
                v-model="profileForm.skills"
                :editable="isEditing"
              />
            </div>

            <!-- 求职意向部分 -->
            <div class="form-section">
              <h2 class="section-title">求职意向</h2>
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="期望薪资" prop="expectedSalary">
                    <el-input v-model="profileForm.expectedSalary" placeholder="例如：10k-15k"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="期望工作地点" prop="expectedLocation">
                    <el-input v-model="profileForm.expectedLocation" placeholder="例如：上海、北京"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 保存按钮 -->
            <div v-if="isEditing" class="form-actions">
              <el-button @click="cancelEdit">取消</el-button>
              <el-button type="primary" @click="saveProfile" :loading="loading">保存信息</el-button>
            </div>
          </el-form>
        </div>

        <el-empty v-else description="暂无个人信息"></el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';
import { useStudentStore } from '@/stores/student';
import { formatToBeiJingTime, formatToBeiJingTimeShort } from '@/utils/dateUtils';
import AvatarUploader from '@/components/common/AvatarUploader.vue';
import EducationExperienceForm from '@/components/student/EducationExperienceForm.vue';
import WorkExperienceForm from '@/components/student/WorkExperienceForm.vue';
import SkillsTagsForm from '@/components/student/SkillsTagsForm.vue';
import type { StudentProfileCamel, EducationExperienceCamel, WorkExperienceCamel } from '@/types/student';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import _ from 'lodash'; // 使用lodash进行深拷贝

const route = useRoute();
const studentStore = useStudentStore();
const profileFormRef = ref<FormInstance>();
const isEditing = ref(false);
const loading = ref(false);

// 表单数据
const profileForm = reactive<Partial<StudentProfileCamel>>({
  username: '',
  email: '',
  phone: '',
  avatar: '',
  realName: '', // 使用后端字段名（驼峰命名）
  studentNumber: '', // 学号，存储在数据库中
  studentId: '', // 用户ID，不再用作学号
  school: '',
  major: '',
  education: '',
  grade: '', // 前端特有字段，用于设置graduationYear
  skills: ['暂无技能'],
  expectedSalary: '', // 前端特有字段，不会保存到数据库
  expectedLocation: '', // 前端特有字段，不会保存到数据库
  introduction: '', // 使用后端字段名
  educationList: [], // 修改为 educationList
  workList: [] // 修改为 workList
});

// 存储原始数据用于取消编辑
let originalProfileData: Partial<StudentProfileCamel> = {};

// 表单验证规则
const profileRules = reactive<FormRules>({
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  studentNumber: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9]*$/, message: '学号只能包含字母和数字', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  email: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ],
  phone: [
    { required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  school: [
    { required: true, message: '请输入学校名称', trigger: 'blur' }
  ],
  major: [
    { required: true, message: '请输入专业名称', trigger: 'blur' }
  ],
  education: [
    { message: '请选择学历', trigger: 'change' }
  ]
});

// 监听store中的profile变化并更新表单
watch(() => studentStore.profile, (newProfile, oldProfile) => {
  console.log('Profile changed in store:', newProfile);
  console.log('Old profile:', oldProfile);

  if (newProfile) {
    // 使用深拷贝防止引用问题
    originalProfileData = _.cloneDeep(newProfile);

    // 清空表单，确保没有旧数据残留
    Object.keys(profileForm).forEach(key => {
      if (Array.isArray(profileForm[key])) {
        profileForm[key] = [];
      } else if (typeof profileForm[key] === 'object' && profileForm[key] !== null) {
        profileForm[key] = {};
      } else {
        profileForm[key] = '';
      }
    });

    // 直接使用驼峰命名字段，与后端保持一致
    Object.assign(profileForm, newProfile);

    // 如果有graduationYear，设置grade字段（前端特有字段）
    if (newProfile.graduationYear !== undefined && newProfile.graduationYear !== null) {
      profileForm.grade = newProfile.graduationYear.toString();
    } else {
      // 为新账号设置默认毕业年份（当前年份+4）
      const defaultYear = Math.min(new Date().getFullYear() + 4, 2100);
      profileForm.grade = defaultYear.toString();
    }

    // 处理用户名、邮箱和学号
    // 直接使用newProfile中的username、email和studentNumber
    if (newProfile.username) {
      profileForm.username = newProfile.username;
    }
    if (newProfile.email) {
      profileForm.email = newProfile.email;
    }
    if (newProfile.studentNumber) {
      profileForm.studentNumber = newProfile.studentNumber;
    } else if (newProfile.id) {
      // 如果没有学号，使用用户ID作为临时学号
      const tempStudentNumber = 'S' + newProfile.id;
      profileForm.studentNumber = tempStudentNumber;
      console.log('设置临时学号:', tempStudentNumber);
    }

    // 确保数组属性存在
    // 处理educationExperiences，转换为educationList
    if (newProfile.educationExperiences) {
      try {
        if (typeof newProfile.educationExperiences === 'string') {
          profileForm.educationList = JSON.parse(newProfile.educationExperiences);
          console.log('从educationExperiences解析educationList:', profileForm.educationList);
        } else if (Array.isArray(newProfile.educationExperiences)) {
          profileForm.educationList = newProfile.educationExperiences;
        }
      } catch (e) {
        console.error('Failed to parse educationExperiences:', e);
        profileForm.educationList = [];
      }
    } else if (!profileForm.educationList) {
      profileForm.educationList = [];
    }

    // 处理workExperiences，转换为workList
    if (newProfile.workExperiences) {
      try {
        if (typeof newProfile.workExperiences === 'string') {
          profileForm.workList = JSON.parse(newProfile.workExperiences);
          console.log('从workExperiences解析workList:', profileForm.workList);
        } else if (Array.isArray(newProfile.workExperiences)) {
          profileForm.workList = newProfile.workExperiences;
        }
      } catch (e) {
        console.error('Failed to parse workExperiences:', e);
        profileForm.workList = [];
      }
    } else if (!profileForm.workList) {
      profileForm.workList = [];
    }

    // 确保skills始终是数组
    if (!profileForm.skills || !Array.isArray(profileForm.skills)) {
      profileForm.skills = [];
      console.warn('Skills was not an array, initialized as empty array');
    }

    // 强制初始化为空数组，确保不会是null
    if (profileForm.skills === null) {
      profileForm.skills = [];
      console.warn('Skills was null, initialized as empty array');
    }

    console.log('Profile form updated:', profileForm);

    // 如果表单引用已经存在，清除验证状态
    if (profileFormRef.value) {
      profileFormRef.value.clearValidate();
    }
  } else {
    console.warn('Received null or undefined profile from store');
  }
}, { immediate: true, deep: true });

// 监听路由变化，实现页面刷新
watch(route, (to, from) => {
  console.log('Route changed:', from.path, '->', to.path);
  console.log('Route query params:', to.query);

  // 如果路由参数中有时间戳，说明需要刷新数据
  if (to.query.t) {
    console.log('Time parameter detected, refreshing data...');

    // 重新获取个人信息
    studentStore.fetchProfile().then(profile => {
      console.log('Profile data refreshed successfully via route watch:', profile);
      ElMessage.success('个人信息已更新');
    }).catch(error => {
      console.error('Failed to refresh student profile via route watch:', error);
      ElMessage.error('获取学生信息失败，请刷新页面重试');
    });
  }
});

// 在组件挂载时获取个人信息
onMounted(() => {
  console.log('ProfileNew component mounted');
  console.log('Route query params:', route.query);
  console.log('Route path:', route.path);

  // 添加一个小延迟，确保组件完全挂载
  setTimeout(() => {
    // 无论是否已加载，都重新获取个人信息，确保数据最新
    console.log('Fetching profile data on mount...');
    studentStore.fetchProfile().then(profile => {
      console.log('Profile data fetched successfully on mount:', profile);

      // 如果有时间戳参数，显示提示信息
      if (route.query.t) {
        // ElMessage.success('个人信息已更新'); // 在路由 watch 中处理此消息
      }
    }).catch(error => {
      console.error('Failed to fetch student profile on mount:', error);
      ElMessage.error('获取学生信息失败，请刷新页面重试');
    });
  }, 100);
});

// 强制刷新数据
const forceRefreshData = () => {
  console.log('强制刷新个人信息数据');
  studentStore.fetchProfile().then(profile => {
    console.log('个人信息数据已强制刷新:', profile);
    ElMessage.success('个人信息数据已刷新');
  }).catch(error => {
    console.error('强制刷新个人信息数据失败:', error);
    ElMessage.error('刷新数据失败，请重试');
  });
};

// 处理头像上传
const handleAvatarUpload = (file: File) => {
  // 这里应该调用API上传文件，获取URL
  // 模拟上传成功
  console.log('Avatar file to upload:', file);
  // profileForm.avatar = URL.createObjectURL(file); // 临时URL，实际应该使用服务器返回的URL
};

// 切换编辑模式
const toggleEdit = () => {
  if (isEditing.value) {
    cancelEdit();
  } else {
    isEditing.value = true;
  }
};

// 保存个人信息
const saveProfile = async () => {
  if (!profileFormRef.value) return;

  profileFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        console.log('准备提交的表单数据:', profileForm);

        // 准备要发送到后端的数据，确保所有字段都有值（即使是空字符串）
        // 注意：使用驼峰命名字段（camelCase），与后端保持一致
        const updateData = {
          // 基本信息
          studentNumber: profileForm.studentNumber || ('S' + studentStore.profile?.id), // 学号字段，确保不为空
          realName: profileForm.realName || '未填写',
          gender: profileForm.gender || '保密',
          age: 20, // 默认年龄
          phone: profileForm.phone || '',
          school: profileForm.school || '未填写',
          major: profileForm.major || '未填写',
          education: profileForm.education || '本科',
          graduationYear: profileForm.grade ? parseInt(profileForm.grade) : Math.min(new Date().getFullYear() + 4, 2100),
          skills: profileForm.skills && Array.isArray(profileForm.skills) ?
            (profileForm.skills.length > 0 ? profileForm.skills : ['暂无技能']) :
            ['暂无技能'],
          introduction: profileForm.introduction || '暂无介绍',
          avatar: profileForm.avatar || '',
          // 添加期望薪资和期望工作地点字段
          expectedSalary: profileForm.expectedSalary || '面议',
          expectedLocation: profileForm.expectedLocation || '全国',
          // 添加教育和工作经历 - 确保是数组而不是字符串，并使用正确的字段名
          educationExperiences: Array.isArray(profileForm.educationList)
            ? profileForm.educationList
            : (typeof profileForm.educationList === 'string'
              ? JSON.parse(profileForm.educationList)
              : []),
          workExperiences: Array.isArray(profileForm.workList)
            ? profileForm.workList
            : (typeof profileForm.workList === 'string'
              ? JSON.parse(profileForm.workList)
              : [])
        };

        console.log('发送到后端的数据 (移除 stringify):', updateData);

        // --- 添加的日志 ---
        console.log('在调用 updateProfile 前 - educationExperiences:', updateData.educationExperiences); // 应该打印数组
        console.log('在调用 updateProfile 前 - workExperiences:', updateData.workExperiences); // 应该打印数组
        console.log('在调用 updateProfile 前 - 完整的 updateData:', JSON.stringify(updateData)); // 仍然打印 JSON 以供检查
        // --- 添加的日志结束 ---

        // 调用store action更新个人信息
        await studentStore.updateProfile(updateData);

        // 不再需要强制刷新数据，updateProfile已经更新了store中的数据
        // await studentStore.fetchProfile();

        isEditing.value = false;
        // 移除重复的成功提示，updateProfile方法内部已经显示了成功提示

        // 显示详细日志
        console.log('个人信息更新后的数据:', studentStore.profile);
      } catch (error) {
        console.error('保存个人信息失败:', error);
        ElMessage.error('保存个人信息失败，请重试');
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.error('请检查表单填写是否正确');
    }
  });
};

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false;
  // 重置表单数据为原始状态
  Object.assign(profileForm, originalProfileData);
  // 清除验证错误
  profileFormRef.value?.clearValidate();
};
</script>

<style scoped>
.student-profile-page {
  padding: 20px;
}

/* 调试信息样式 */
.debug-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
  font-size: 14px;
}

.debug-info p {
  margin: 5px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
}

.profile-content {
  max-width: 900px;
  margin: 0 auto;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.required-fields-note {
  margin-bottom: 15px;
  color: #606266;
  font-size: 14px;
}

.required-mark {
  color: #f56c6c;
  margin-right: 4px;
}

/* 移动端适配 */
@media (max-width: 576px) {
  .student-profile-page {
    padding: 10px;
  }

  .form-section {
    padding: 15px;
  }
}
</style>
