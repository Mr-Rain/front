<template>
  <div class="student-profile-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <el-button v-if="!isEditing" type="primary" :icon="Edit" @click="isEditing = true">编辑</el-button>
          <div v-else>
             <el-button type="success" :icon="Check" @click="saveProfile" :loading="loading">保存</el-button>
             <el-button @click="cancelEdit" :icon="Close">取消</el-button>
          </div>
        </div>
      </template>

      <el-form 
        ref="profileFormRef" 
        :model="profileForm" 
        :rules="profileRules" 
        label-width="100px" 
        label-position="top" 
        :disabled="!isEditing" 
        v-loading="studentStore.loading || loading"
      >
        <el-row :gutter="30">
          <el-col :xs="24" :md="8" :lg="6" style="text-align: center;">
            <UserAvatar 
              :image-url="profileForm.avatar"
              :editable="isEditing"
              :size="150"
              @upload-success="handleAvatarSuccess"
              style="margin-bottom: 20px;"
            />
            <div v-if="!isEditing" class="username-display">{{ profileForm.username }}</div>
          </el-col>

          <el-col :xs="24" :md="16" :lg="18">
             <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                   <el-form-item label="用户名" prop="username">
                     <el-input v-model="profileForm.username" disabled></el-input>
                   </el-form-item>
                 </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="profileForm.email" placeholder="请输入邮箱"></el-input>
                  </el-form-item>
                </el-col>
                 <el-col :xs="24" :sm="12">
                   <el-form-item label="手机号" prop="phone">
                     <el-input v-model="profileForm.phone" placeholder="请输入手机号"></el-input>
                   </el-form-item>
                 </el-col>
                 <el-col :xs="24" :sm="12">
                   <el-form-item label="学号" prop="student_id">
                     <el-input v-model="profileForm.student_id" placeholder="请输入学号"></el-input>
                   </el-form-item>
                 </el-col>
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
                 <el-col :xs="24" :sm="12">
                    <el-form-item label="学历" prop="education">
                        <el-select v-model="profileForm.education" placeholder="请选择学历" style="width: 100%;">
                            <el-option label="大专" value="大专"></el-option>
                            <el-option label="本科" value="本科"></el-option>
                            <el-option label="硕士" value="硕士"></el-option>
                            <el-option label="博士" value="博士"></el-option>
                            <el-option label="其他" value="其他"></el-option>
                        </el-select>
                    </el-form-item>
                 </el-col>
                 <el-col :xs="24" :sm="12">
                   <el-form-item label="年级" prop="grade">
                     <el-input v-model="profileForm.grade" placeholder="请输入入学年份，如 2021"></el-input>
                   </el-form-item>
                 </el-col>
                 <el-col :span="24">
                   <el-form-item label="技能标签" prop="skills">
                     <!-- Use a tag input component or simple text for now -->
                     <el-input 
                        v-model="skillsInput" 
                        placeholder="请输入技能，用逗号或空格分隔，如 Vue, React, Node.js"
                        @change="updateSkillsArray"
                      />
                     <!-- Display tags for better visualization -->
                     <div style="margin-top: 5px;">
                         <el-tag 
                            v-for="tag in profileForm.skills" 
                            :key="tag" 
                            :closable="isEditing" 
                            @close="handleSkillRemove(tag)"
                            style="margin-right: 5px; margin-bottom: 5px;"
                         >
                            {{ tag }}
                         </el-tag>
                     </div>
                   </el-form-item>
                 </el-col>
                 <el-col :span="24">
                   <el-form-item label="期望薪资" prop="expected_salary">
                     <el-input v-model="profileForm.expected_salary" placeholder="如 10k-15k"></el-input>
                   </el-form-item>
                 </el-col>
                  <el-col :span="24">
                   <el-form-item label="期望工作地点" prop="expected_location">
                     <el-input v-model="profileForm.expected_location" placeholder="如 上海, 北京"></el-input>
                   </el-form-item>
                 </el-col>
                 <el-col :span="24">
                   <el-form-item label="实习/项目经历" prop="experience">
                     <el-input 
                        type="textarea" 
                        :rows="5" 
                        v-model="profileForm.experience"
                        placeholder="请描述您的实习或项目经历，支持 Markdown 格式"
                    ></el-input>
                   </el-form-item>
                 </el-col>
             </el-row>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useStudentStore } from '@/stores/student';
import UserAvatar from '@/components/common/UserAvatar.vue';
import type { StudentProfile } from '@/types/student';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Edit, Check, Close } from '@element-plus/icons-vue';
import _ from 'lodash'; // Use lodash for deep cloning

const studentStore = useStudentStore();
const profileFormRef = ref<FormInstance>();
const isEditing = ref(false);
const loading = ref(false); // Loading state for save action

// Form data - use reactive for nested objects
const profileForm = reactive<Partial<StudentProfile>>({
    // Initialize with default values or empty strings
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
});

// Store original data for cancellation
let originalProfileData: Partial<StudentProfile> = {}; 

// Validation rules
const profileRules = reactive<FormRules>({
  email: [
      { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ],
  school: [{ message: '请输入学校名称', trigger: 'blur' }], // Example: make school required
  major: [{ message: '请输入专业名称', trigger: 'blur' }],
  education: [{ message: '请选择学历', trigger: 'change' }],
  // Add more rules as needed
});

// Separate ref for skills input field
const skillsInput = ref('');

// Watch for changes in the store profile and update the form
watch(() => studentStore.profile, (newProfile) => {
  if (newProfile) {
    // Use _.cloneDeep to prevent reactivity issues when resetting
    originalProfileData = _.cloneDeep(newProfile);
    Object.assign(profileForm, newProfile);
    // Initialize skillsInput from profileForm.skills
    skillsInput.value = profileForm.skills?.join(', ') || '';
  }
}, { immediate: true, deep: true });

// Fetch profile if not already loaded
onMounted(() => {
  if (!studentStore.profile) {
    studentStore.fetchProfile();
  }
});

// Handle avatar upload success
const handleAvatarSuccess = (newImageUrl: string) => {
    if (profileForm.avatar !== undefined) { // Check if avatar property exists
        profileForm.avatar = newImageUrl;
         // Optionally trigger immediate save for avatar or wait for main save button
        // saveProfile(); // Uncomment to save immediately after upload
    }
};

// Convert skills input string to array
const updateSkillsArray = () => {
    if (isEditing.value) { // Only update when editing
        profileForm.skills = skillsInput.value
            .split(/[,\s，]+/) // Split by comma, space, Chinese comma
            .map(s => s.trim())
            .filter(s => s !== '');
    }
};

// Handle removing a skill tag
const handleSkillRemove = (tagToRemove: string) => {
    if (profileForm.skills) {
        profileForm.skills = profileForm.skills.filter(tag => tag !== tagToRemove);
        // Update the input field as well
        skillsInput.value = profileForm.skills.join(', ');
    }
}

// Save profile changes
const saveProfile = async () => {
  if (!profileFormRef.value) return;
  profileFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // Ensure skills are updated from the input before saving
        updateSkillsArray(); 
        // Call store action to update profile
        // Only send necessary fields, exclude username, user_type, id?
        const updateData = _.omit(profileForm, ['id', 'username', 'user_type']);
        await studentStore.updateProfile(updateData);
        isEditing.value = false; // Exit edit mode on success
        ElMessage.success('个人信息更新成功');
      } catch (error) {
        console.error('Failed to save profile:', error);
        // Error message is handled within the store action
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.error('请检查表单填写是否正确');
    }
  });
};

// Cancel editing
const cancelEdit = () => {
  isEditing.value = false;
  // Reset form data to original state using the deep clone
  Object.assign(profileForm, originalProfileData);
  skillsInput.value = profileForm.skills?.join(', ') || '';
  // Clear validation errors if any
  profileFormRef.value?.clearValidate(); 
};

</script>

<style scoped>
.student-profile-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.username-display {
    font-size: 1.2em;
    font-weight: bold;
    margin-top: 10px;
}

/* Add some spacing between form items */
.el-form-item {
    margin-bottom: 18px;
}

/* Responsive label position */
@media (max-width: 768px) {
    /* :deep(.el-form-item__label) { 
        text-align: left;
    } */
}
</style> 