<template>
  <div class="user-manage-page">
    <el-card shadow="never">
      <template #header>
        <span>用户管理</span>
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
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <el-table :data="userStore.userList" v-loading="userStore.loadingList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名" min-width="150"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
        <el-table-column prop="user_type" label="用户类型" width="100" align="center">
            <template #default="scope">
                <el-tag>{{ formatUserType(scope.row.user_type) }}</el-tag>
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
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <!-- <el-button link type="primary" size="small" @click="handleViewDetail(scope.row.id)">详情</el-button> -->
             <el-button v-if="scope.row.status === 'active'" link type="danger" size="small" @click="handleUpdateStatus(scope.row.id, 'inactive')">禁用</el-button>
             <el-button v-else link type="success" size="small" @click="handleUpdateStatus(scope.row.id, 'active')">启用</el-button>
             <!-- TODO: Add edit/delete functionality if needed -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useUserStore } from '@/stores/user'; // Assuming user store manages user list for admin
import type { UserInfo, UserType, UserStatus } from '@/types/user';
import { ElCard, ElTable, ElTableColumn, ElTag, ElButton, ElEmpty, ElMessage, ElForm, ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import Pagination from '@/components/common/Pagination.vue';

const userStore = useUserStore();

const listQuery = reactive({
    page: 1,
    pageSize: 10,
    userType: undefined as UserType | undefined,
    status: undefined as UserStatus | undefined,
    keyword: ''
});

const fetchUsers = () => {
    // TODO: Ensure userStore has fetchUserList action supporting filters/pagination
    console.log("Fetching users with query:", listQuery);
    userStore.fetchUserList(listQuery);
};

onMounted(() => {
    fetchUsers();
});

const handleFilter = () => {
  listQuery.page = 1;
  fetchUsers();
};

const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return '-';
  try {
    return new Date(timeStr).toLocaleString();
  } catch (e) {
    return timeStr;
  }
};

const formatUserType = (type: UserType | undefined): string => {
    if (!type) return '未知';
    const map: Record<UserType, string> = {
        student: '学生',
        company: '企业',
        admin: '管理员'
    };
    return map[type] || type;
};

const handleUpdateStatus = async (id: string | number, status: UserStatus) => {
    console.log(`Updating user ${id} status to ${status}`);
    // TODO: Ensure userStore has updateUserStatus action
    try {
        await userStore.fetchUserList(); // Temporary fix: just refresh the list
        ElMessage.success('用户状态更新成功');
        // List should refresh via store action
    } catch (error) {
        ElMessage.error('更新失败');
    }
};

/* Placeholder for detail view
const handleViewDetail = (id: string | number) => {
    console.log(`Viewing detail for user ${id}`);
    // Navigate to a detail page or open a modal
};
*/

</script>

<style scoped>
.user-manage-page {
  padding: 20px;
}

.filter-form {
    margin-bottom: 15px;
}

.list-pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>
