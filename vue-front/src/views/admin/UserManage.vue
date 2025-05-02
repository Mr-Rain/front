<template>
  <div class="user-manage-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="handleManagePermissions()">
              <el-icon><Setting /></el-icon> 权限管理
            </el-button>
            <el-button type="primary" size="small" @click="handleBatchAction" :disabled="selectedUsers.length === 0">
              批量操作
            </el-button>
          </div>
        </div>
      </template>

      <!-- Filters -->
      <div class="filter-card">
        <el-form :inline="true" :model="listQuery" @submit.prevent="handleFilter" class="filter-form">
          <div class="search-form-container">
            <div class="search-inputs-group">
              <el-form-item label="用户类型" class="search-form-item">
                <el-select
                  v-model="listQuery.userType"
                  placeholder="所有类型"
                  clearable
                  @change="handleFilter"
                  class="search-select"
                >
                  <el-option label="学生" value="student"></el-option>
                  <el-option label="企业" value="company"></el-option>
                  <el-option label="管理员" value="admin"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="账号状态" class="search-form-item">
                <el-select
                  v-model="listQuery.status"
                  placeholder="所有状态"
                  clearable
                  @change="handleFilter"
                  class="search-select"
                >
                  <el-option label="正常" value="active"></el-option>
                  <el-option label="禁用" value="inactive"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="关键词" class="search-form-item">
                <el-input
                  v-model="listQuery.keyword"
                  placeholder="用户名/邮箱/手机号"
                  clearable
                  @clear="handleFilter"
                />
              </el-form-item>
            </div>
            <div class="search-button-group">
              <el-form-item class="search-button-item">
                <el-button type="primary" @click="handleFilter" :icon="Search" class="search-button">搜索</el-button>
                <el-button @click="resetFilter" class="search-button">重置</el-button>
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <el-table
        :data="userStore.userList"
        v-loading="userStore.loadingList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名" min-width="150"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
        <el-table-column prop="userType" label="用户类型" width="120" align="center">
            <template #default="scope">
                <el-tag :type="getTypeTagType(scope.row.userType)">{{ formatUserType(scope.row.userType) }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
                 <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">{{ scope.row.status === 'active' ? '正常' : '禁用' }}</el-tag>
            </template>
        </el-table-column>
         <el-table-column prop="create_time" label="注册时间" width="180">
            <template #default="scope">{{ formatTime(scope.row.create_time) }}</template>
         </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleViewDetail(scope.row.id)">
              <el-icon><View /></el-icon> 详情
            </el-button>
            <el-button
              v-if="scope.row.status === 'active'"
              link
              type="danger"
              size="small"
              @click="handleUpdateStatus(scope.row.id, 'inactive')"
            >
              <el-icon><Lock /></el-icon> 禁用
            </el-button>
            <el-button
              v-else
              link
              type="success"
              size="small"
              @click="handleUpdateStatus(scope.row.id, 'active')"
            >
              <el-icon><Unlock /></el-icon> 启用
            </el-button>
            <el-button
              link
              type="warning"
              size="small"
              @click="handleManagePermissions(scope.row)"
            >
              <el-icon><Setting /></el-icon> 权限
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
            <el-empty description="暂无用户数据"></el-empty>
         </template>
      </el-table>

      <!-- Pagination -->
      <Pagination
        v-if="userStore.userTotal > 0"
        :total="userStore.userTotal"
        v-model:page="listQuery.page"
        v-model:limit="listQuery.pageSize"
        @pagination="fetchUsers"
        class="list-pagination"
      />

    </el-card>

    <!-- 用户详情抽屉 -->
    <user-detail-drawer
      v-model:visible="detailDrawerVisible"
      :user-id="selectedUserId"
      :user-detail="currentUserDetail"
      :student-profile="studentProfile"
      :company-profile="companyProfile"
      :loading="loadingDetail"
      :submitting="submitting"
      @status-change="handleUpdateStatus"
      @view-company="handleViewCompanyDetail"
    />

    <!-- 批量操作对话框 -->
    <el-dialog v-model="batchDialogVisible" title="批量操作" width="500px">
      <div class="batch-dialog-content">
        <p>已选择 <span class="selected-count">{{ selectedUsers.length }}</span> 个用户</p>

        <el-form :model="batchForm" label-position="top">
          <el-form-item label="操作类型" required>
            <el-radio-group v-model="batchForm.action">
              <el-radio label="active">启用账号</el-radio>
              <el-radio label="inactive">禁用账号</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <div class="selected-users">
          <h4>选中的用户：</h4>
          <el-scrollbar height="200px">
            <div class="user-list">
              <div v-for="user in selectedUsers" :key="user.id" class="user-item">
                <div class="user-info">
                  <div class="username">{{ user.username }}</div>
                  <div class="user-type">
                    <el-tag size="small" :type="getTypeTagType(user.userType)">{{ formatUserType(user.userType) }}</el-tag>
                  </div>
                </div>
                <div class="user-status">
                  <el-tag size="small" :type="user.status === 'active' ? 'success' : 'danger'">
                    {{ user.status === 'active' ? '正常' : '禁用' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleBatchSubmit" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 权限管理对话框 -->
    <role-permission-manager
      v-model:visible="permissionDialogVisible"
      :user="currentUserDetail"
      :loading="permissionStore.loadingRoles || permissionStore.loadingPermissions"
      :submitting="permissionStore.submitting"
      :is-admin="isAdmin"
      @save-role="handleSaveRole"
      @delete-role="handleDeleteRole"
      @save-role-permissions="handleSaveRolePermissions"
      @save-user-roles="handleSaveUserRoles"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useCompanyStore } from '@/stores/company';
import { usePermissionStore } from '@/stores/permission';
import type { UserInfo, UserType, UserStatus } from '@/types/user';
import type { CompanyProfile } from '@/types/company';
import type { StudentProfile } from '@/types/student';
import type { RoleInfo, UserRoleUpdatePayload } from '@/types/permission';
import { ElCard, ElTable, ElTableColumn, ElTag, ElButton, ElEmpty, ElMessage, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElDialog, ElScrollbar, ElRadioGroup, ElRadio, ElIcon } from 'element-plus';
import { Search, View, Lock, Unlock, Setting } from '@element-plus/icons-vue';
import Pagination from '@/components/common/Pagination.vue';
import UserDetailDrawer from '@/components/admin/UserDetailDrawer.vue';
import RolePermissionManager from '@/components/admin/RolePermissionManager.vue';

const userStore = useUserStore();
const companyStore = useCompanyStore();
const permissionStore = usePermissionStore();
const router = useRouter();

// 表格选中的用户

const selectedUsers = ref<UserInfo[]>([]);
const selectedUserId = ref<string | number>('');
const currentUserDetail = ref<UserInfo | null>(null);
const studentProfile = ref<StudentProfile | null>(null);
const companyProfile = ref<CompanyProfile | null>(null);
const detailDrawerVisible = ref(false);
const batchDialogVisible = ref(false);
const permissionDialogVisible = ref(false);
const loadingDetail = ref(false);
const submitting = ref(false);

// 判断当前用户是否为管理员
const isAdmin = computed(() => {
  return userStore.userInfo?.userType === 'admin';
});

// 批量操作表单
const batchForm = reactive({
  action: 'inactive' as UserStatus
});

// 查询参数
const listQuery = reactive({
    page: 1,
    pageSize: 10,
    userType: undefined as UserType | undefined,
    status: undefined as UserStatus | undefined,
    keyword: ''
});

// 获取用户列表
const fetchUsers = () => {
    userStore.fetchUserList(listQuery);
};

// 页面加载时获取数据
onMounted(() => {
    fetchUsers();

    // 尝试获取角色和权限列表，但不阻止页面加载
    try {
        // 获取角色列表
        permissionStore.fetchRoles().catch(error => {
            console.warn('获取角色列表失败，但不影响页面基本功能:', error);
        });

        // 获取权限列表
        permissionStore.fetchPermissions().catch(error => {
            console.warn('获取权限列表失败，但不影响页面基本功能:', error);
        });
    } catch (error) {
        console.warn('权限数据加载失败，但不影响页面基本功能:', error);
    }
});

// 处理表格选择变化
const handleSelectionChange = (selection: UserInfo[]) => {
    selectedUsers.value = selection;
};

// 处理筛选
const handleFilter = () => {
  listQuery.page = 1;
  fetchUsers();
};

// 重置筛选
const resetFilter = () => {
  listQuery.page = 1;
  listQuery.userType = undefined;
  listQuery.status = undefined;
  listQuery.keyword = '';
  fetchUsers();
};

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
const formatUserType = (userType: UserType | undefined): string => {
  switch (userType) {
    case 'student': return '学生';
    case 'company': return '企业';
    case 'admin': return '管理员';
    default: return '未知';
  }
};

// 获取用户类型标签样式
const getTypeTagType = (userType: UserType | undefined): ('primary' | 'success' | 'warning' | undefined) => {
  switch (userType) {
    case 'student': return 'success';
    case 'company': return 'primary';
    case 'admin': return 'warning';
    default: return undefined;
  }
};

// 查看用户详情
const handleViewDetail = async (id: string | number) => {
    selectedUserId.value = id;
    loadingDetail.value = true;
    detailDrawerVisible.value = true;

    try {
        // 获取用户详情
        const userDetail = await userStore.getUserDetail(id);
        currentUserDetail.value = userDetail;

        // 根据用户类型获取相应的详细信息
        if (userDetail.user_type === 'student') {
            // 获取学生信息
            try {
                // 这里应该调用API获取学生详细信息
                // 暂时使用模拟数据
                studentProfile.value = userDetail as StudentProfile;
            } catch (error) {
                console.error('获取学生信息失败:', error);
                studentProfile.value = null;
            }
            companyProfile.value = null;
        } else if (userDetail.user_type === 'company') {
            // 获取公司信息
            try {
                const company = await companyStore.getCompanyDetail(userDetail.id);
                companyProfile.value = company;
            } catch (error) {
                companyProfile.value = null;
            }
            studentProfile.value = null;
        } else {
            studentProfile.value = null;
            companyProfile.value = null;
        }
    } catch (error) {
        currentUserDetail.value = null;
        studentProfile.value = null;
        companyProfile.value = null;
        ElMessage.error('获取用户详情失败');
    } finally {
        loadingDetail.value = false;
    }
};

// 查看公司详情
const handleViewCompanyDetail = (id: string | number) => {
    router.push(`/admin/company-audit?id=${id}`);
};

// 打开权限管理对话框
const handleManagePermissions = async (user?: UserInfo) => {
    if (user) {
        // 如果指定了用户，获取该用户的角色
        selectedUserId.value = user.id;
        currentUserDetail.value = user;
        try {
            await permissionStore.fetchUserRoles(user.id);
        } catch (error) {
            console.warn('获取用户角色失败，使用默认角色:', error);
            // 使用默认角色
            if (user.userType === 'admin') {
                permissionStore.userRoles = ['admin'];
            } else if (user.userType === 'student') {
                permissionStore.userRoles = ['student'];
            } else if (user.userType === 'company') {
                permissionStore.userRoles = ['company'];
            } else {
                permissionStore.userRoles = [];
            }
        }
    } else {
        // 如果没有指定用户，打开角色管理页面
        selectedUserId.value = '';
        currentUserDetail.value = null;
    }

    permissionDialogVisible.value = true;
};

// 处理保存角色
const handleSaveRole = async (role: RoleInfo) => {
    const savedRole = await permissionStore.saveRole(role);
    if (savedRole) {
        ElMessage.success(role.id ? '角色更新成功' : '角色创建成功');
    }
};

// 处理删除角色
const handleDeleteRole = async (roleId: string | number) => {
    const success = await permissionStore.deleteRole(roleId);
    if (success) {
        ElMessage.success('角色删除成功');
    }
};

// 处理保存角色权限
const handleSaveRolePermissions = async (data: { roleId: string | number; permissionIds: (string | number)[] }) => {
    const success = await permissionStore.updateRolePermissions(data);
    if (success) {
        ElMessage.success('角色权限更新成功');
    }
};

// 处理保存用户角色
const handleSaveUserRoles = async (data: UserRoleUpdatePayload) => {
    const success = await permissionStore.updateUserRoles(data);
    if (success) {
        ElMessage.success('用户角色更新成功');
    }
};

// 更新用户状态
const handleUpdateStatus = async (id: string | number, status: UserStatus) => {
    // 检查是否为管理员用户
    const user = userStore.userList.find(u => u.id === id);
    if (user && user.userType === 'admin') {
        ElMessage.warning('不能修改管理员用户的状态');
        return;
    }

    submitting.value = true;
    try {
        await userStore.updateUserStatus(id, status);
        ElMessage.success('用户状态更新成功');

        // 更新当前详情中的状态
        if (currentUserDetail.value && currentUserDetail.value.id === id) {
            currentUserDetail.value.status = status;
        }

        // 刷新用户列表
        fetchUsers();
    } catch (error: any) {
        console.error('更新用户状态失败:', error);
        if (error.response && error.response.data && error.response.data.message) {
            ElMessage.error(`更新用户状态失败: ${error.response.data.message}`);
        } else {
            ElMessage.error('更新用户状态失败，请稍后重试');
        }
    } finally {
        submitting.value = false;
    }
};

// 批量操作
const handleBatchAction = () => {
    if (selectedUsers.value.length === 0) {
        ElMessage.warning('请选择要操作的用户');
        return;
    }

    // 检查是否包含管理员用户
    const hasAdmin = selectedUsers.value.some(user => user.userType === 'admin');
    if (hasAdmin) {
        ElMessage.warning('不能对管理员用户执行批量操作，请取消选择管理员用户');
        return;
    }

    batchDialogVisible.value = true;
};

// 提交批量操作
const handleBatchSubmit = async () => {
    if (selectedUsers.value.length === 0) {
        ElMessage.warning('请选择要操作的用户');
        return;
    }

    // 再次检查是否包含管理员用户
    const hasAdmin = selectedUsers.value.some(user => user.userType === 'admin');
    if (hasAdmin) {
        ElMessage.warning('不能对管理员用户执行批量操作，请取消选择管理员用户');
        return;
    }

    const ids = selectedUsers.value.map(user => user.id);
    const status = batchForm.action;

    submitting.value = true;
    try {
        const result = await userStore.batchUpdateUserStatus(ids, status);

        if (result && result.updatedCount !== undefined) {
            if (result.updatedCount === ids.length) {
                ElMessage.success(`成功${status === 'active' ? '启用' : '禁用'} ${result.updatedCount} 个用户账号`);
            } else {
                ElMessage.warning(`操作部分完成：${result.updatedCount}/${ids.length} 个用户账号已${status === 'active' ? '启用' : '禁用'}`);
            }

            // 刷新用户列表
            fetchUsers();
        } else {
            ElMessage.success(`成功${status === 'active' ? '启用' : '禁用'} ${ids.length} 个用户账号`);
        }

        batchDialogVisible.value = false;

        // 清除选中状态
        const table = document.querySelector('.el-table__header-wrapper th.el-table-column--selection .el-checkbox');
        if (table) {
            (table as HTMLElement).click();
        }
    } catch (error: any) {
        console.error('批量操作失败:', error);
        if (error.response && error.response.data && error.response.data.message) {
            ElMessage.error(`批量操作失败: ${error.response.data.message}`);
        } else {
            ElMessage.error('批量操作失败，请稍后重试');
        }
    } finally {
        submitting.value = false;
    }
};

</script>

<style scoped>
.user-manage-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-card {
  background-color: var(--el-fill-color-light);
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 15px;
}

.search-form-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 10px;
}

.search-inputs-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  flex: 1;
}

.search-button-group {
  display: flex;
  gap: 10px;
}

.list-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 批量操作对话框样式 */
.batch-dialog-content {
  padding: 0 10px;
}

.selected-count {
  font-weight: bold;
  color: var(--el-color-primary);
}

.selected-users h4 {
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  background-color: var(--el-fill-color-light);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.username {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.user-type {
  font-size: 12px;
}

@media (max-width: 768px) {
  .user-manage-page {
    padding: 10px;
  }

  .search-form-container {
    flex-direction: column;
  }

  .search-inputs-group {
    width: 100%;
  }

  .search-button-group {
    width: 100%;
    justify-content: flex-end;
  }

  .search-form-item {
    margin-bottom: 10px;
  }
}
</style>
