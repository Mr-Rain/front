<template>
  <div class="company-profile-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>公司信息维护</span>
           <el-button v-if="!isEditing" type="primary" :icon="Edit" @click="isEditing = true">编辑</el-button>
          <div v-else>
             <el-button type="success" :icon="Check" @click="saveProfile" :loading="loading">保存</el-button>
             <el-button @click="cancelEdit" :icon="Close">取消</el-button>
          </div>
        </div>
      </template>

      <el-form
        ref="profileFormRef"
        :model="profileData"
        :rules="profileRules"
        label-width="120px" 
        label-position="top"
        :disabled="!isEditing"
        v-loading="companyStore.loadingProfile || loading"
      >
        <el-row :gutter="30">
           <el-col :xs="24" :md="8" :lg="6" style="text-align: center;">
             <UserAvatar 
                :image-url="profileData.logo" 
                :editable="isEditing"
                :size="150"
                shape="square"
                @upload-success="handleLogoSuccess"
                style="margin-bottom: 20px;"
            />
             <div v-if="!isEditing" class="company-name-display">{{ profileData.company_name }}</div>
             <div v-if="!isEditing && profileData.audit_status" class="audit-status-display">
                 <el-tag :type="getAuditStatusType(profileData.audit_status)" size="large">
                     审核状态: {{ formatAuditStatus(profileData.audit_status) }}
                 </el-tag>
                 <p v-if="profileData.audit_status === 'rejected' && profileData.audit_message" class="audit-message">
                     原因: {{ profileData.audit_message }}
                 </p>
             </div>
           </el-col>

           <el-col :xs="24" :md="16" :lg="18">
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                   <el-form-item label="公司全称" prop="company_name">
                     <el-input v-model="profileData.company_name" placeholder="请输入公司完整名称"></el-input>
                   </el-form-item>
                 </el-col>
                <el-col :xs="24" :sm="12">
                   <el-form-item label="公司简称" prop="short_name">
                     <el-input v-model="profileData.short_name" placeholder="请输入公司简称"></el-input>
                   </el-form-item>
                 </el-col>
                 <el-col :xs="24" :sm="12">
                   <el-form-item label="公司官网" prop="website">
                     <el-input v-model="profileData.website" placeholder="https://..."></el-input>
                   </el-form-item>
                 </el-col>
                 <el-col :xs="24" :sm="12">
                   <el-form-item label="所属行业" prop="industry">
                     <el-input v-model="profileData.industry" placeholder="如 互联网/软件/信息技术"></el-input>
                   </el-form-item>
                 </el-col>
                  <el-col :xs="24" :sm="12">
                   <el-form-item label="公司规模" prop="scale">
                     <el-select v-model="profileData.scale" placeholder="请选择公司规模" style="width: 100%;">
                        <el-option label="0-20人" value="0-20人"></el-option>
                        <el-option label="20-99人" value="20-99人"></el-option>
                        <el-option label="100-499人" value="100-499人"></el-option>
                        <el-option label="500-999人" value="500-999人"></el-option>
                        <el-option label="1000-9999人" value="1000-9999人"></el-option>
                        <el-option label="10000人以上" value="10000人以上"></el-option>
                      </el-select>
                   </el-form-item>
                 </el-col>
                  <el-col :xs="24" :sm="12">
                   <el-form-item label="融资阶段" prop="financing">
                     <el-select v-model="profileData.financing" placeholder="请选择融资阶段" style="width: 100%;">
                        <el-option label="未融资" value="未融资"></el-option>
                        <el-option label="天使轮" value="天使轮"></el-option>
                        <el-option label="Pre-A轮" value="Pre-A轮"></el-option>
                        <el-option label="A轮" value="A轮"></el-option>
                        <el-option label="A+轮" value="A+轮"></el-option>
                        <el-option label="B轮" value="B轮"></el-option>
                        <el-option label="C轮" value="C轮"></el-option>
                        <el-option label="D轮及以上" value="D轮及以上"></el-option>
                        <el-option label="已上市" value="已上市"></el-option>
                        <el-option label="不需要融资" value="不需要融资"></el-option>
                      </el-select>
                   </el-form-item>
                 </el-col>
                 <el-col :span="24">
                   <el-form-item label="公司地址" prop="location">
                     <el-input v-model="profileData.location" placeholder="请输入公司详细地址"></el-input>
                   </el-form-item>
                 </el-col>
                  <el-col :span="24">
                   <el-form-item label="公司简介" prop="description">
                     <el-input 
                        type="textarea" 
                        :rows="6" 
                        v-model="profileData.description"
                        placeholder="介绍一下您的公司吧，支持 Markdown 格式"
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
import { ref, reactive, onMounted, watch } from 'vue';
import { useCompanyStore } from '@/stores/company';
import UserAvatar from '@/components/common/UserAvatar.vue'; // Reusing avatar component for logo
import type { CompanyProfile, CompanyAuditStatus } from '@/types/company';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Edit, Check, Close } from '@element-plus/icons-vue';
import _ from 'lodash';

const companyStore = useCompanyStore();
const profileFormRef = ref<FormInstance>();
const isEditing = ref(false);
const loading = ref(false); 

const profileData = reactive<Partial<CompanyProfile>>({
    company_name: '',
    short_name: '',
    logo: '',
    website: '',
    industry: '',
    scale: undefined,
    financing: undefined,
    location: '',
    description: '',
    // Readonly fields
    username: '',
    email: '',
    audit_status: undefined,
    audit_message: ''
});

let originalProfileData: Partial<CompanyProfile> = {};

const profileRules = reactive<FormRules>({
  company_name: [{ required: true, message: '请输入公司全称', trigger: 'blur' }],
  industry: [{ required: true, message: '请输入所属行业', trigger: 'blur' }],
  location: [{ required: true, message: '请输入公司地址', trigger: 'blur' }],
  description: [{ required: true, message: '请输入公司简介', trigger: 'blur' }],
  website: [{ type: 'url', message: '请输入有效的网址', trigger: ['blur', 'change'] }],
});

watch(() => companyStore.profile, (newProfile) => {
  if (newProfile) {
    originalProfileData = _.cloneDeep(newProfile);
    Object.assign(profileData, newProfile);
  }
}, { immediate: true, deep: true });

onMounted(() => {
  if (!companyStore.profile) {
    companyStore.fetchProfile();
  }
});

const handleLogoSuccess = (newImageUrl: string) => {
    if ('logo' in profileData) {
        profileData.logo = newImageUrl;
    }
};

const saveProfile = async () => {
  if (!profileFormRef.value) return;
  profileFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // Exclude readonly fields before sending
        const updateData = _.omit(profileData, ['id', 'username', 'email', 'user_type', 'audit_status', 'audit_message']);
        await companyStore.updateProfile(updateData);
        isEditing.value = false;
        ElMessage.success('公司信息更新成功');
      } catch (error) {
         // Error handled in store
      } finally {
        loading.value = false;
      }
    } else {
       ElMessage.error('请检查表单填写是否正确');
    }
  });
};

const cancelEdit = () => {
  isEditing.value = false;
  Object.assign(profileData, originalProfileData);
  profileFormRef.value?.clearValidate(); 
};

// --- Display Helpers ---
const formatAuditStatus = (status: CompanyAuditStatus | undefined): string => {
     switch (status) {
        case 'pending': return '待审核';
        case 'approved': return '已通过';
        case 'rejected': return '未通过';
        default: return '未知';
    }
}
const getAuditStatusType = (status: CompanyAuditStatus | undefined): ('success' | 'info' | 'warning' | 'danger') => {
     switch (status) {
        case 'approved': return 'success';
        case 'pending': return 'warning';
        case 'rejected': return 'danger';
        default: return 'info';
    }
}

</script>

<style scoped>
.company-profile-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.company-name-display {
    font-size: 1.2em;
    font-weight: bold;
    margin-top: 10px;
}

.audit-status-display {
    margin-top: 15px;
}
.audit-message {
    font-size: 12px;
    color: var(--el-color-danger);
    margin-top: 5px;
}

.el-form-item {
    margin-bottom: 18px;
}
</style> 