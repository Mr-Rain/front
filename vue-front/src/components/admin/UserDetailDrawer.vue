<template>
  <el-drawer
    v-model="drawerVisible"
    :title="title"
    direction="rtl"
    size="50%"
    :before-close="handleClose"
  >
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    <div v-else-if="userDetail" class="user-detail-content">
      <el-descriptions :column="1" border size="medium">
        <el-descriptions-item label="用户ID">{{ userDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ userDetail.username }}</el-descriptions-item>
        <el-descriptions-item label="用户类型">
          <el-tag :type="getUserTypeTagType(userDetail.user_type)">
            {{ formatUserType(userDetail.user_type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="账号状态">
          <el-tag :type="userDetail.status === 'active' ? 'success' : 'danger'">
            {{ userDetail.status === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ userDetail.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ userDetail.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatTime(userDetail.create_time) }}</el-descriptions-item>
      </el-descriptions>

      <!-- 学生特有信息 -->
      <template v-if="userDetail.user_type === 'student' && studentProfile">
        <h3 class="section-title">学生信息</h3>
        <el-descriptions :column="1" border size="medium">
          <el-descriptions-item label="姓名">{{ studentProfile.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="学校">{{ studentProfile.school || '-' }}</el-descriptions-item>
          <el-descriptions-item label="专业">{{ studentProfile.major || '-' }}</el-descriptions-item>
          <el-descriptions-item label="学历">{{ studentProfile.education || '-' }}</el-descriptions-item>
          <el-descriptions-item label="毕业年份">{{ studentProfile.graduation_year || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>

      <!-- 企业特有信息 -->
      <template v-if="userDetail.user_type === 'company' && companyProfile">
        <h3 class="section-title">企业信息</h3>
        <el-descriptions :column="1" border size="medium">
          <el-descriptions-item label="公司名称">{{ companyProfile.company_name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="行业">{{ companyProfile.industry || '-' }}</el-descriptions-item>
          <el-descriptions-item label="规模">{{ companyProfile.scale || '-' }}</el-descriptions-item>
          <el-descriptions-item label="地址">{{ companyProfile.location || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getAuditStatusTagType(companyProfile.audit_status)">
              {{ formatAuditStatus(companyProfile.audit_status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </template>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button 
          :type="userDetail.status === 'active' ? 'danger' : 'success'" 
          @click="handleStatusChange"
          :loading="submitting"
        >
          {{ userDetail.status === 'active' ? '禁用账号' : '启用账号' }}
        </el-button>
        
        <el-button v-if="userDetail.user_type === 'company'" type="primary" @click="handleViewCompanyDetail">
          查看企业详情
        </el-button>
      </div>
    </div>
    <el-empty v-else description="无法加载用户信息"></el-empty>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UserInfo, UserType, UserStatus } from '@/types/user';
import type { CompanyProfile, CompanyAuditStatus } from '@/types/company';
import type { StudentProfile } from '@/types/student';

// 定义组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userId: {
    type: [String, Number],
    default: ''
  },
  userDetail: {
    type: Object as () => UserInfo | null,
    default: null
  },
  studentProfile: {
    type: Object as () => StudentProfile | null,
    default: null
  },
  companyProfile: {
    type: Object as () => CompanyProfile | null,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  submitting: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['update:visible', 'close', 'status-change', 'view-company']);

// 路由
const router = useRouter();

// 抽屉可见状态
const drawerVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

// 标题
const title = computed(() => {
  if (!props.userDetail) return '用户详情';
  return `用户详情 - ${props.userDetail.username}`;
});

// 格式化时间
const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return '-';
  try {
    return new Date(timeStr).toLocaleString();
  } catch (e) {
    return timeStr || '-';
  }
};

// 格式化用户类型
const formatUserType = (type: UserType | undefined): string => {
  if (!type) return '未知';
  const map: Record<UserType, string> = {
    student: '学生',
    company: '企业',
    admin: '管理员'
  };
  return map[type] || type;
};

// 获取用户类型标签样式
const getUserTypeTagType = (type: UserType | undefined): string => {
  if (!type) return 'info';
  const map: Record<UserType, string> = {
    student: 'success',
    company: 'primary',
    admin: 'danger'
  };
  return map[type] || 'info';
};

// 格式化审核状态
const formatAuditStatus = (status: CompanyAuditStatus | undefined): string => {
  if (!status) return '未知';
  const map: Record<CompanyAuditStatus, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '未通过'
  };
  return map[status] || status;
};

// 获取审核状态标签样式
const getAuditStatusTagType = (status: CompanyAuditStatus | undefined): string => {
  if (!status) return 'info';
  const map: Record<CompanyAuditStatus, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  };
  return map[status] || 'info';
};

// 处理关闭抽屉
const handleClose = () => {
  drawerVisible.value = false;
  emit('close');
};

// 处理状态变更
const handleStatusChange = async () => {
  if (!props.userDetail) return;
  
  const newStatus: UserStatus = props.userDetail.status === 'active' ? 'inactive' : 'active';
  const actionText = newStatus === 'active' ? '启用' : '禁用';
  
  try {
    await ElMessageBox.confirm(
      `确定要${actionText}用户 "${props.userDetail.username}" 的账号吗？`,
      `${actionText}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    emit('status-change', props.userDetail.id, newStatus);
  } catch {
    // 用户取消操作
  }
};

// 查看企业详情
const handleViewCompanyDetail = () => {
  if (!props.userDetail || props.userDetail.user_type !== 'company') return;
  emit('view-company', props.userDetail.id);
};
</script>

<style scoped>
.loading-container {
  padding: 20px;
}

.user-detail-content {
  padding: 0 20px;
}

.section-title {
  margin-top: 30px;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 10px;
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
}
</style>
