<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="700px"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    <div v-else class="permission-manager">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="角色管理" name="roles">
          <div class="role-management">
            <div class="role-list">
              <h3>角色列表</h3>
              <el-scrollbar height="300px">
                <el-radio-group v-model="selectedRole" @change="handleRoleChange">
                  <div v-for="role in roles" :key="role.id" class="role-item">
                    <el-radio :label="role.id">{{ role.name }}</el-radio>
                    <div class="role-actions">
                      <el-button 
                        type="primary" 
                        link 
                        size="small" 
                        @click="handleEditRole(role)"
                        :disabled="role.code === 'admin' && !isAdmin"
                      >
                        编辑
                      </el-button>
                      <el-button 
                        type="danger" 
                        link 
                        size="small" 
                        @click="handleDeleteRole(role.id)"
                        :disabled="role.code === 'admin' || role.code === 'student' || role.code === 'company'"
                      >
                        删除
                      </el-button>
                    </div>
                  </div>
                </el-radio-group>
              </el-scrollbar>
              
              <div class="add-role-form">
                <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="80px" size="small">
                  <el-form-item label="角色名称" prop="name">
                    <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
                  </el-form-item>
                  <el-form-item label="角色代码" prop="code">
                    <el-input v-model="roleForm.code" placeholder="请输入角色代码" :disabled="roleForm.id !== ''" />
                  </el-form-item>
                  <el-form-item label="角色描述" prop="description">
                    <el-input v-model="roleForm.description" type="textarea" placeholder="请输入角色描述" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="handleSaveRole" :loading="submitting">
                      {{ roleForm.id ? '更新角色' : '添加角色' }}
                    </el-button>
                    <el-button @click="resetRoleForm">取消</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </div>
            
            <div class="role-permissions" v-if="selectedRole">
              <h3>角色权限</h3>
              <el-scrollbar height="300px">
                <el-tree
                  ref="permissionTreeRef"
                  :data="permissionTree"
                  show-checkbox
                  node-key="id"
                  :default-checked-keys="selectedRolePermissions"
                  :props="{ label: 'name', children: 'children' }"
                >
                </el-tree>
              </el-scrollbar>
              <div class="permission-actions">
                <el-button type="primary" @click="handleSaveRolePermissions" :loading="submitting">
                  保存权限设置
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="用户角色" name="userRoles">
          <div class="user-role-management">
            <div class="user-info" v-if="user">
              <h3>用户信息</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="用户名">{{ user.username }}</el-descriptions-item>
                <el-descriptions-item label="用户类型">
                  <el-tag :type="getUserTypeTagType(user.user_type)">
                    {{ formatUserType(user.user_type) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="邮箱">{{ user.email || '-' }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="user.status === 'active' ? 'success' : 'danger'">
                    {{ user.status === 'active' ? '正常' : '禁用' }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>
            
            <div class="user-roles">
              <h3>用户角色</h3>
              <el-checkbox-group v-model="userRoles" @change="handleUserRolesChange">
                <el-checkbox 
                  v-for="role in roles" 
                  :key="role.id" 
                  :label="role.id"
                  :disabled="(role.code === 'admin' && !isAdmin) || isDefaultRole(role.code, user?.user_type)"
                >
                  {{ role.name }}
                </el-checkbox>
              </el-checkbox-group>
              
              <div class="role-actions">
                <el-button type="primary" @click="handleSaveUserRoles" :loading="submitting">
                  保存用户角色
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import type { UserInfo, UserType } from '@/types/user';
import type { Role, PermissionCode } from '@/types/permission';

// 角色类型定义
interface RoleInfo {
  id: string;
  name: string;
  code: string;
  description?: string;
}

// 权限类型定义
interface PermissionInfo {
  id: string;
  name: string;
  code: string;
  description?: string;
  children?: PermissionInfo[];
}

// 定义组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object as () => UserInfo | null,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  submitting: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits([
  'update:visible', 
  'close', 
  'save-role', 
  'delete-role', 
  'save-role-permissions',
  'save-user-roles'
]);

// 对话框可见状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

// 标题
const title = computed(() => {
  if (props.user) {
    return `权限管理 - ${props.user.username}`;
  }
  return '权限管理';
});

// 当前激活的标签页
const activeTab = ref('roles');

// 角色列表
const roles = ref<RoleInfo[]>([
  { id: '1', name: '管理员', code: 'admin', description: '系统管理员，拥有所有权限' },
  { id: '2', name: '学生用户', code: 'student', description: '学生用户，可以浏览职位、投递简历' },
  { id: '3', name: '企业用户', code: 'company', description: '企业用户，可以发布职位、管理申请' },
  { id: '4', name: '访客', code: 'guest', description: '未登录用户，只能浏览公开内容' }
]);

// 权限树
const permissionTree = ref<PermissionInfo[]>([
  {
    id: '1',
    name: '用户管理',
    code: 'user',
    children: [
      { id: '1-1', name: '查看用户', code: 'user:view' },
      { id: '1-2', name: '编辑用户', code: 'user:edit' },
      { id: '1-3', name: '删除用户', code: 'user:delete' },
      { id: '1-4', name: '管理用户状态', code: 'user:status' }
    ]
  },
  {
    id: '2',
    name: '职位管理',
    code: 'job',
    children: [
      { id: '2-1', name: '查看职位', code: 'job:view' },
      { id: '2-2', name: '创建职位', code: 'job:create' },
      { id: '2-3', name: '编辑职位', code: 'job:edit' },
      { id: '2-4', name: '删除职位', code: 'job:delete' }
    ]
  },
  {
    id: '3',
    name: '申请管理',
    code: 'application',
    children: [
      { id: '3-1', name: '查看申请', code: 'application:view' },
      { id: '3-2', name: '投递申请', code: 'application:apply' },
      { id: '3-3', name: '撤回申请', code: 'application:withdraw' },
      { id: '3-4', name: '更新申请状态', code: 'application:updateStatus' }
    ]
  },
  {
    id: '4',
    name: '企业管理',
    code: 'company',
    children: [
      { id: '4-1', name: '查看企业', code: 'company:view' },
      { id: '4-2', name: '编辑企业', code: 'company:edit' },
      { id: '4-3', name: '审核企业', code: 'company:audit' }
    ]
  },
  {
    id: '5',
    name: '简历管理',
    code: 'resume',
    children: [
      { id: '5-1', name: '查看简历', code: 'resume:view' },
      { id: '5-2', name: '编辑简历', code: 'resume:edit' },
      { id: '5-3', name: '删除简历', code: 'resume:delete' }
    ]
  }
]);

// 选中的角色
const selectedRole = ref('');
// 选中角色的权限
const selectedRolePermissions = ref<string[]>([]);
// 权限树引用
const permissionTreeRef = ref();

// 角色表单
const roleFormRef = ref<FormInstance>();
const roleForm = ref<{
  id: string;
  name: string;
  code: string;
  description: string;
}>({
  id: '',
  name: '',
  code: '',
  description: ''
});

// 角色表单验证规则
const roleRules = ref<FormRules>({
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色代码', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9_]*$/, message: '角色代码只能包含小写字母、数字和下划线，且必须以字母开头', trigger: 'blur' }
  ]
});

// 用户角色
const userRoles = ref<string[]>([]);

// 监听用户变化
watch(() => props.user, (newUser) => {
  if (newUser) {
    activeTab.value = 'userRoles';
    // 根据用户类型设置默认角色
    setDefaultUserRoles(newUser.user_type);
  } else {
    activeTab.value = 'roles';
  }
}, { immediate: true });

// 设置默认用户角色
const setDefaultUserRoles = (userType: UserType) => {
  userRoles.value = [];
  
  // 根据用户类型设置默认角色
  if (userType === 'admin') {
    const adminRole = roles.value.find(r => r.code === 'admin');
    if (adminRole) {
      userRoles.value.push(adminRole.id);
    }
  } else if (userType === 'student') {
    const studentRole = roles.value.find(r => r.code === 'student');
    if (studentRole) {
      userRoles.value.push(studentRole.id);
    }
  } else if (userType === 'company') {
    const companyRole = roles.value.find(r => r.code === 'company');
    if (companyRole) {
      userRoles.value.push(companyRole.id);
    }
  }
};

// 处理角色变更
const handleRoleChange = (roleId: string) => {
  const role = roles.value.find(r => r.id === roleId);
  if (!role) return;
  
  // 设置选中角色的权限
  if (role.code === 'admin') {
    // 管理员拥有所有权限
    selectedRolePermissions.value = getAllPermissionIds();
  } else if (role.code === 'student') {
    // 学生权限
    selectedRolePermissions.value = [
      '2-1', // 查看职位
      '3-1', '3-2', '3-3', // 申请相关
      '4-1', // 查看企业
      '5-1', '5-2', '5-3' // 简历相关
    ];
  } else if (role.code === 'company') {
    // 企业权限
    selectedRolePermissions.value = [
      '2-1', '2-2', '2-3', '2-4', // 职位相关
      '3-1', '3-4', // 申请相关
      '4-1', '4-2' // 企业相关
    ];
  } else if (role.code === 'guest') {
    // 访客权限
    selectedRolePermissions.value = [
      '2-1', // 查看职位
      '4-1' // 查看企业
    ];
  } else {
    // 自定义角色，暂时没有权限
    selectedRolePermissions.value = [];
  }
  
  // 更新权限树
  nextTick(() => {
    permissionTreeRef.value?.setCheckedKeys(selectedRolePermissions.value);
  });
};

// 获取所有权限ID
const getAllPermissionIds = (): string[] => {
  const ids: string[] = [];
  
  const collectIds = (permissions: PermissionInfo[]) => {
    for (const perm of permissions) {
      ids.push(perm.id);
      if (perm.children && perm.children.length > 0) {
        collectIds(perm.children);
      }
    }
  };
  
  collectIds(permissionTree.value);
  return ids;
};

// 处理编辑角色
const handleEditRole = (role: RoleInfo) => {
  roleForm.value = { ...role };
};

// 处理删除角色
const handleDeleteRole = async (roleId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该角色吗？删除后无法恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    emit('delete-role', roleId);
    
    // 如果删除的是当前选中的角色，清空选择
    if (selectedRole.value === roleId) {
      selectedRole.value = '';
      selectedRolePermissions.value = [];
    }
  } catch {
    // 用户取消操作
  }
};

// 处理保存角色
const handleSaveRole = async () => {
  if (!roleFormRef.value) return;
  
  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      const roleData = { ...roleForm.value };
      emit('save-role', roleData);
      resetRoleForm();
    }
  });
};

// 重置角色表单
const resetRoleForm = () => {
  roleForm.value = {
    id: '',
    name: '',
    code: '',
    description: ''
  };
  roleFormRef.value?.clearValidate();
};

// 处理保存角色权限
const handleSaveRolePermissions = () => {
  if (!selectedRole.value) {
    ElMessage.warning('请先选择一个角色');
    return;
  }
  
  const checkedKeys = permissionTreeRef.value?.getCheckedKeys() || [];
  const halfCheckedKeys = permissionTreeRef.value?.getHalfCheckedKeys() || [];
  const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys];
  
  emit('save-role-permissions', {
    roleId: selectedRole.value,
    permissionIds: allCheckedKeys
  });
};

// 处理用户角色变更
const handleUserRolesChange = (roles: string[]) => {
  // 确保用户至少有一个角色
  if (roles.length === 0 && props.user) {
    ElMessage.warning('用户必须至少有一个角色');
    setDefaultUserRoles(props.user.user_type);
  }
};

// 处理保存用户角色
const handleSaveUserRoles = () => {
  if (!props.user) {
    ElMessage.warning('请先选择一个用户');
    return;
  }
  
  emit('save-user-roles', {
    userId: props.user.id,
    roleIds: userRoles.value
  });
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

// 判断是否为默认角色
const isDefaultRole = (roleCode: string, userType?: UserType): boolean => {
  if (!userType) return false;
  return (
    (userType === 'admin' && roleCode === 'admin') ||
    (userType === 'student' && roleCode === 'student') ||
    (userType === 'company' && roleCode === 'company')
  );
};

// 处理关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
  resetRoleForm();
  emit('close');
};
</script>

<style scoped>
.loading-container {
  padding: 20px;
}

.permission-manager {
  padding: 0 10px;
}

.role-management {
  display: flex;
  gap: 20px;
}

.role-list {
  flex: 1;
  border-right: 1px solid var(--el-border-color-light);
  padding-right: 20px;
}

.role-permissions {
  flex: 1;
  padding-left: 10px;
}

.role-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.role-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.add-role-form {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed var(--el-border-color-light);
}

.user-role-management {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-roles {
  margin-top: 20px;
}

.user-roles .el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.permission-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .role-management {
    flex-direction: column;
  }
  
  .role-list {
    border-right: none;
    border-bottom: 1px solid var(--el-border-color-light);
    padding-right: 0;
    padding-bottom: 20px;
  }
  
  .role-permissions {
    padding-left: 0;
    padding-top: 20px;
  }
}
</style>
