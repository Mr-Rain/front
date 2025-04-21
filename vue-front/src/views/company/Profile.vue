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
        class="company-profile-form"
      >
        <!-- 公司基本信息区域 - 上下布局 -->
        <div class="company-info-section">
          <div class="company-logo-section" style="text-align: center;">
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
          </div>
        </div>

        <!-- 表单区域 -->
        <div class="form-section">
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
              <el-form-item label="公司标签" prop="tags">
                <company-tags-manager
                  v-model="companyTags"
                  :suggestions="industryTagSuggestions"
                  :max-tags="10"
                />
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

          <!-- 联系人信息部分 -->
          <div class="section-divider">
            <h3 class="section-title">联系人信息</h3>
          </div>

          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="联系人姓名" prop="contact_person">
                <el-input v-model="profileData.contact_person" placeholder="请输入联系人姓名"></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="联系人电话" prop="contact_phone">
                <el-input v-model="profileData.contact_phone" placeholder="请输入联系人电话"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="联系人邮箱" prop="contact_email">
                <el-input v-model="profileData.contact_email" placeholder="请输入联系人邮箱"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 资质认证部分 -->
          <div class="section-divider">
            <h3 class="section-title">
              资质认证
              <el-tooltip content="企业资质认证是确保平台企业真实性和合法性的重要环节" placement="top">
                <el-icon class="info-icon" @click="showLicenseHelp"><QuestionFilled /></el-icon>
              </el-tooltip>
            </h3>
          </div>

          <el-row>
            <el-col :span="24">
              <div class="license-section">
                <license-uploader
                  ref="licenseUploaderRef"
                  v-model="profileData.business_license"
                  :disabled="!isEditing"
                  :file-name="profileData.business_license_name || '营业执照.pdf'"
                  @upload-success="handleLicenseSuccess"
                />

                <div v-if="profileData.audit_status" class="license-audit-status">
                  <p>
                    <strong>审核状态：</strong>
                    <el-tag :type="getAuditStatusType(profileData.audit_status)">
                      {{ formatAuditStatus(profileData.audit_status) }}
                    </el-tag>
                  </p>
                  <p v-if="profileData.audit_status === 'rejected' && profileData.audit_message" class="audit-message">
                    <strong>原因：</strong> {{ profileData.audit_message }}
                  </p>
                  <p v-if="profileData.audit_status === 'pending'" class="audit-pending-message">
                    您的企业资质正在审核中，请耐心等待（1-3个工作日）
                  </p>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useCompanyStore } from '@/stores/company';
import UserAvatar from '@/components/common/UserAvatar.vue'; // Reusing avatar component for logo
import CompanyTagsManager from '@/components/company/CompanyTagsManager.vue';
import LicenseUploader from '@/components/company/LicenseUploader.vue';
import type { CompanyProfile, CompanyAuditStatus } from '@/types/company';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Edit, Check, Close, InfoFilled, QuestionFilled } from '@element-plus/icons-vue';
import * as _ from 'lodash';

const companyStore = useCompanyStore();
const profileFormRef = ref<FormInstance>();
const isEditing = ref(false);
const loading = ref(false);
const licenseUploaderRef = ref<InstanceType<typeof LicenseUploader>>();

// 计算属性：确保标签始终是数组
const companyTags = computed({
  get: () => profileData.tags || [],
  set: (value: string[]) => {
    profileData.tags = value;
  }
});

// 行业标签建议
const industryTagSuggestions = [
  '互联网', '人工智能', '大数据', '云计算', '区块链', '物联网', '5G', '金融科技',
  '电子商务', '社交媒体', '在线教育', '医疗健康', '生物技术', '新能源', '智能制造',
  '游戏', '文化创意', '广告营销', '咨询服务', '法律服务', '房地产', '建筑设计',
  '物流运输', '旅游酒店', '餐饮服务', '零售', '农业科技', '环保', '汽车', '航空航天'
];

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
    tags: [],
    // 联系人信息
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    // 资质认证
    business_license: '',
    business_license_name: '',
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
  contact_person: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
  contact_email: [
    { required: true, message: '请输入联系人邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ],
  contact_phone: [{ required: true, message: '请输入联系人电话', trigger: 'blur' }],
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

// 显示资质认证帮助对话框
const showLicenseHelp = () => {
    if (licenseUploaderRef.value) {
        licenseUploaderRef.value.showHelpDialog();
    }
};

// 处理营业执照上传成功
const handleLicenseSuccess = (url: string) => {
    profileData.business_license = url;
    profileData.business_license_name = '营业执照';
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

/* 公司信息区域样式 */
.company-info-section {
    margin-bottom: 30px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    padding-bottom: 20px;
}

.company-logo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
}

/* 表单区域样式 */
.form-section {
    margin-top: 20px;
}

/* 表单样式优化 */
.company-profile-form .el-form-item {
    margin-bottom: 20px;
}

.company-profile-form .el-input,
.company-profile-form .el-select {
    width: 100%;
}

/* 确保表单项对齐 */
.company-profile-form .el-form-item__label {
    padding-bottom: 8px;
    line-height: 1.2;
    font-weight: 500;
}

/* 分区样式 */
.section-divider {
    margin: 30px 0 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    padding-top: 20px;
    position: relative;
}

.section-title {
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 15px;
    display: flex;
    align-items: center;
}

.info-icon {
    margin-left: 8px;
    color: var(--el-color-info);
    cursor: pointer;
    font-size: 16px;
}

/* 资质认证部分样式 */
.license-section {
    margin-bottom: 20px;
}

.license-audit-status {
    margin-top: 15px;
    padding: 15px;
    background-color: var(--el-color-info-light-9);
    border-radius: 4px;
}

.audit-pending-message {
    color: var(--el-color-warning-dark);
    font-size: 14px;
    margin-top: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .company-profile-page {
        padding: 10px;
    }

    .company-info-section {
        margin-bottom: 20px;
        padding-bottom: 15px;
    }

    .company-logo-section {
        margin-bottom: 15px;
    }

    .form-section {
        margin-top: 15px;
    }

    .company-profile-form .el-form-item {
        margin-bottom: 15px;
    }

    .company-profile-form .el-form-item__label {
        padding-bottom: 5px;
    }

    .section-divider {
        margin: 20px 0 15px;
        padding-top: 15px;
    }

    .section-title {
        font-size: 16px;
        margin-bottom: 10px;
    }
}
</style>