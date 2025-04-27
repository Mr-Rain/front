<template>
  <div class="student-profile-page responsive-padding">
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
          >
            <!-- 基本信息部分 -->
            <div class="form-section">
              <h2 class="section-title">基本信息</h2>
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="姓名" prop="username">
                    <el-input v-model="profileForm.username" disabled></el-input>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="学号" prop="student_id">
                    <el-input v-model="profileForm.student_id" placeholder="请输入学号"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="学校" prop="school">
                    <el-input v-model="profileForm.school" placeholder="请输入学校名称"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="专业" prop="major">
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

              <el-form-item label="个人简介" prop="bio">
                <el-input
                  v-model="profileForm.bio"
                  type="textarea"
                  :rows="3"
                  placeholder="请简要介绍自己"
                ></el-input>
              </el-form-item>
            </div>

            <!-- 教育经历部分 -->
            <div class="form-section">
              <education-experience-form
                v-model="profileForm.education_experiences"
                :editable="isEditing"
              />
            </div>

            <!-- 工作经历部分 -->
            <div class="form-section">
              <work-experience-form
                v-model="profileForm.work_experiences"
                :editable="isEditing"
              />
            </div>

            <!-- 联系方式部分 -->
            <div class="form-section">
              <h2 class="section-title">联系方式</h2>
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="手机号码" prop="phone">
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
                  <el-form-item label="期望薪资" prop="expected_salary">
                    <el-input v-model="profileForm.expected_salary" placeholder="例如：10k-15k"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="期望工作地点" prop="expected_location">
                    <el-input v-model="profileForm.expected_location" placeholder="例如：上海、北京"></el-input>
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
import { ref, reactive, onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useStudentStore } from '@/stores/student';
import AvatarUploader from '@/components/common/AvatarUploader.vue';
import EducationExperienceForm from '@/components/student/EducationExperienceForm.vue';
import WorkExperienceForm from '@/components/student/WorkExperienceForm.vue';
import SkillsTagsForm from '@/components/student/SkillsTagsForm.vue';
import type { StudentProfile } from '@/types/student';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import _ from 'lodash'; // 使用lodash进行深拷贝

const route = useRoute();
const studentStore = useStudentStore();
const profileFormRef = ref<FormInstance>();
const isEditing = ref(false);
const loading = ref(false);

// 表单数据
const profileForm = reactive<Partial<StudentProfile>>({
  username: '',
  email: '',
  phone: '',
  avatar: '',
  student_id: '',
  school: '',
  major: '',
  education: '',
  grade: '',
  skills: [],
  expected_salary: '',
  expected_location: '',
  experience: '',
  bio: '',
  education_experiences: [],
  work_experiences: []
});

// 存储原始数据用于取消编辑
let originalProfileData: Partial<StudentProfile> = {};

// 表单验证规则
const profileRules = reactive<FormRules>({
  email: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  school: [{ message: '请输入学校名称', trigger: 'blur' }],
  major: [{ message: '请输入专业名称', trigger: 'blur' }],
  education: [{ message: '请选择学历', trigger: 'change' }]
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

    // 重新赋值
    Object.assign(profileForm, newProfile);

    // 确保数组属性存在
    if (!profileForm.education_experiences) profileForm.education_experiences = [];
    if (!profileForm.work_experiences) profileForm.work_experiences = [];
    if (!profileForm.skills) profileForm.skills = [];

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
        // 调用store action更新个人信息
        const updateData = _.omit(profileForm, ['id', 'username', 'user_type']);
        await studentStore.updateProfile(updateData);
        isEditing.value = false;
        ElMessage.success('个人信息更新成功');
      } catch (error) {
        console.error('Failed to save profile:', error);
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
