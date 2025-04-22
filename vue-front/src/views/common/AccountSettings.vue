<template>
  <div class="account-settings-container">
    <div v-if="!userStore.token" class="login-required">
      <el-empty description="请先登录再访问账号设置">
        <template #extra>
          <el-button type="primary" @click="goToLogin">去登录</el-button>
        </template>
      </el-empty>
    </div>
    <el-card v-else class="account-settings-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h2 class="title">账号设置</h2>
          <p class="subtitle">管理您的账号信息和安全设置</p>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="settings-tabs">
        <el-tab-pane label="基本信息" name="basic">
          <el-form
            ref="basicFormRef"
            :model="basicForm"
            :rules="basicRules"
            label-width="100px"
            v-loading="loading"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="basicForm.username" disabled></el-input>
              <div class="form-item-hint">用户名创建后不可修改</div>
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="basicForm.email"></el-input>
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input v-model="basicForm.phone" placeholder="请输入手机号"></el-input>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveBasicInfo" :loading="submitting">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="修改密码" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            v-loading="loading"
          >
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                show-password
                placeholder="请输入当前密码"
              ></el-input>
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="请输入新密码"
              ></el-input>
              <div class="form-item-hint">密码长度至少为8位，包含字母和数字</div>
            </el-form-item>

            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入新密码"
              ></el-input>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="changePassword" :loading="submitting">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="账号安全" name="security">
          <div class="security-settings">
            <div class="security-item">
              <div class="security-item-info">
                <h3>登录设备管理</h3>
                <p>查看并管理您当前登录的设备</p>
              </div>
              <el-button @click="showLoginDevices">查看设备</el-button>
            </div>

            <el-divider></el-divider>

            <div class="security-item">
              <div class="security-item-info">
                <h3>两步验证</h3>
                <p>启用两步验证提高账号安全性</p>
              </div>
              <el-switch v-model="securitySettings.twoFactorAuth" @change="toggleTwoFactorAuth"></el-switch>
            </div>

            <el-divider></el-divider>

            <div class="security-item">
              <div class="security-item-info">
                <h3>登录通知</h3>
                <p>当有新设备登录时通过邮件通知您</p>
              </div>
              <el-switch v-model="securitySettings.loginNotification" @change="toggleLoginNotification"></el-switch>
            </div>

            <el-divider></el-divider>

            <div class="security-item danger-zone">
              <div class="security-item-info">
                <h3>注销账号</h3>
                <p>永久删除您的账号及所有相关数据</p>
              </div>
              <el-button type="danger" @click="showDeleteAccountConfirm">注销账号</el-button>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="通知设置" name="notifications">
          <div class="notification-settings">
            <div class="notification-item">
              <div class="notification-item-info">
                <h3>系统通知</h3>
                <p>接收系统更新、维护等相关通知</p>
              </div>
              <el-switch v-model="notificationSettings.system" @change="saveNotificationSettings"></el-switch>
            </div>

            <el-divider></el-divider>

            <div class="notification-item">
              <div class="notification-item-info">
                <h3>申请通知</h3>
                <p>接收职位申请状态变更通知</p>
              </div>
              <el-switch v-model="notificationSettings.application" @change="saveNotificationSettings"></el-switch>
            </div>

            <el-divider></el-divider>

            <div class="notification-item">
              <div class="notification-item-info">
                <h3>面试通知</h3>
                <p>接收面试安排和变更通知</p>
              </div>
              <el-switch v-model="notificationSettings.interview" @change="saveNotificationSettings"></el-switch>
            </div>

            <el-divider></el-divider>

            <div class="notification-item">
              <div class="notification-item-info">
                <h3>邮件通知</h3>
                <p>同时通过邮件接收以上通知</p>
              </div>
              <el-switch v-model="notificationSettings.email" @change="saveNotificationSettings"></el-switch>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 登录设备对话框 -->
    <el-dialog
      v-model="loginDevicesDialogVisible"
      title="登录设备管理"
      width="600px"
    >
      <div class="login-devices-list" v-loading="loadingDevices">
        <div v-if="loginDevices.length > 0">
          <div v-for="(device, index) in loginDevices" :key="index" class="login-device-item">
            <div class="device-info">
              <el-icon><Monitor v-if="device.type === 'desktop'" /><Cellphone v-else /></el-icon>
              <div class="device-details">
                <h4>{{ device.name }}</h4>
                <p>{{ device.location }} · {{ device.lastActive }}</p>
                <el-tag size="small" :type="device.current ? 'success' : 'info'">
                  {{ device.current ? '当前设备' : '其他设备' }}
                </el-tag>
              </div>
            </div>
            <el-button
              v-if="!device.current"
              type="danger"
              size="small"
              @click="logoutDevice(device.id)"
              :loading="device.loggingOut"
            >
              退出登录
            </el-button>
          </div>
        </div>
        <el-empty v-else description="暂无登录设备记录"></el-empty>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="loginDevicesDialogVisible = false">关闭</el-button>
          <el-button type="danger" @click="logoutAllDevices" :loading="loggingOutAll">
            退出所有其他设备
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.account-settings-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 0 20px;
}

.login-required {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.account-settings-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.card-header {
  padding: 10px 0;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.settings-tabs {
  margin-top: 20px;
}

.form-item-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

/* 安全设置样式 */
.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.security-item-info h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
}

.security-item-info p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.danger-zone h3 {
  color: var(--el-color-danger);
}

/* 通知设置样式 */
.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.notification-item-info h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
}

.notification-item-info p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

/* 登录设备列表样式 */
.login-devices-list {
  min-height: 200px;
}

.login-device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.login-device-item:last-child {
  border-bottom: none;
}

.device-info {
  display: flex;
  align-items: center;
}

.device-info .el-icon {
  font-size: 24px;
  margin-right: 16px;
  color: var(--el-color-primary);
}

.device-details h4 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 500;
}

.device-details p {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .account-settings-container {
    padding: 0 10px;
  }

  .security-item,
  .notification-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .security-item > *:last-child,
  .notification-item > *:last-child {
    margin-top: 12px;
    align-self: flex-start;
  }

  .login-device-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .login-device-item > button {
    margin-top: 12px;
  }
}
</style>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { Monitor, Cellphone } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

// 用户Store
const userStore = useUserStore();
const router = useRouter();

// 跳转到登录页
const goToLogin = () => {
  router.push('/login');
};

// 表单引用
const basicFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();

// 加载状态
const loading = ref(false);
const submitting = ref(false);

// 当前激活的标签页
const activeTab = ref('basic');

// 基本信息表单
const basicForm = reactive({
  username: '',
  email: '',
  phone: ''
});

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 安全设置
const securitySettings = reactive({
  twoFactorAuth: false,
  loginNotification: true
});

// 通知设置
const notificationSettings = reactive({
  system: true,
  application: true,
  interview: true,
  email: false
});

// 登录设备相关
const loginDevicesDialogVisible = ref(false);
const loadingDevices = ref(false);
const loggingOutAll = ref(false);
const loginDevices = ref<any[]>([]);

// 表单验证规则
const basicRules = reactive<FormRules>({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
});

const passwordRules = reactive<FormRules>({
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度至少为8个字符', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      message: '密码必须包含字母和数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
});

// 初始化数据
onMounted(async () => {
  await fetchUserData();
  await fetchSecuritySettings();
  await fetchNotificationSettings();
});

// 获取用户数据
const fetchUserData = async () => {
  loading.value = true;
  try {
    // 检查是否有token
    if (!userStore.token) {
      ElMessage.warning('您尚未登录，请先登录');
      return;
    }

    // 如果用户信息不存在，先获取用户信息
    if (!userStore.userInfo) {
      await userStore.getUserInfo();
    }

    // 填充表单数据
    if (userStore.userInfo) {
      basicForm.username = userStore.userInfo.username;
      basicForm.email = userStore.userInfo.email || '';
      basicForm.phone = userStore.userInfo.phone || '';
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    ElMessage.error('获取用户数据失败');
  } finally {
    loading.value = false;
  }
};

// 获取安全设置
const fetchSecuritySettings = async () => {
  // 检查是否有token
  if (!userStore.token) {
    return;
  }

  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 300));

  // 模拟数据
  securitySettings.twoFactorAuth = false;
  securitySettings.loginNotification = true;
};

// 获取通知设置
const fetchNotificationSettings = async () => {
  // 检查是否有token
  if (!userStore.token) {
    return;
  }

  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 300));

  // 模拟数据
  notificationSettings.system = true;
  notificationSettings.application = true;
  notificationSettings.interview = true;
  notificationSettings.email = false;
};

// 保存基本信息
const saveBasicInfo = async () => {
  if (!basicFormRef.value) return;

  await basicFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 800));

        // 更新用户信息
        if (userStore.userInfo) {
          userStore.userInfo.email = basicForm.email;
          userStore.userInfo.phone = basicForm.phone;
        }

        ElMessage.success('基本信息更新成功');
      } catch (error) {
        console.error('Failed to save basic info:', error);
        ElMessage.error('保存基本信息失败');
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 800));

        ElMessage.success('密码修改成功');

        // 清空表单
        passwordForm.currentPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';

        // 重置表单验证
        passwordFormRef.value?.resetFields();
      } catch (error) {
        console.error('Failed to change password:', error);
        ElMessage.error('密码修改失败');
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 切换两步验证
const toggleTwoFactorAuth = async (value: boolean) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));

    ElMessage.success(`两步验证已${value ? '启用' : '禁用'}`);
  } catch (error) {
    console.error('Failed to toggle two-factor auth:', error);
    ElMessage.error('操作失败');
    securitySettings.twoFactorAuth = !value; // 恢复原值
  }
};

// 切换登录通知
const toggleLoginNotification = async (value: boolean) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));

    ElMessage.success(`登录通知已${value ? '启用' : '禁用'}`);
  } catch (error) {
    console.error('Failed to toggle login notification:', error);
    ElMessage.error('操作失败');
    securitySettings.loginNotification = !value; // 恢复原值
  }
};

// 保存通知设置
const saveNotificationSettings = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));

    ElMessage.success('通知设置已保存');
  } catch (error) {
    console.error('Failed to save notification settings:', error);
    ElMessage.error('保存通知设置失败');
  }
};

// 显示登录设备对话框
const showLoginDevices = async () => {
  loginDevicesDialogVisible.value = true;
  await fetchLoginDevices();
};

// 获取登录设备列表
const fetchLoginDevices = async () => {
  loadingDevices.value = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800));

    // 模拟数据
    loginDevices.value = [
      {
        id: 1,
        name: 'Chrome on Windows',
        type: 'desktop',
        location: '北京',
        lastActive: '当前在线',
        current: true,
        loggingOut: false
      },
      {
        id: 2,
        name: 'Safari on iPhone',
        type: 'mobile',
        location: '上海',
        lastActive: '最后活跃于 2023-06-15 14:30',
        current: false,
        loggingOut: false
      },
      {
        id: 3,
        name: 'Firefox on MacOS',
        type: 'desktop',
        location: '广州',
        lastActive: '最后活跃于 2023-06-10 09:15',
        current: false,
        loggingOut: false
      }
    ];
  } catch (error) {
    console.error('Failed to fetch login devices:', error);
    ElMessage.error('获取登录设备失败');
  } finally {
    loadingDevices.value = false;
  }
};

// 退出指定设备
const logoutDevice = async (deviceId: number) => {
  try {
    // 设置设备的退出状态
    const device = loginDevices.value.find(d => d.id === deviceId);
    if (device) {
      device.loggingOut = true;
    }

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800));

    // 从列表中移除设备
    loginDevices.value = loginDevices.value.filter(d => d.id !== deviceId);

    ElMessage.success('设备已退出登录');
  } catch (error) {
    console.error('Failed to logout device:', error);
    ElMessage.error('退出设备失败');

    // 恢复设备的退出状态
    const device = loginDevices.value.find(d => d.id === deviceId);
    if (device) {
      device.loggingOut = false;
    }
  }
};

// 退出所有其他设备
const logoutAllDevices = async () => {
  try {
    loggingOutAll.value = true;

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 只保留当前设备
    loginDevices.value = loginDevices.value.filter(d => d.current);

    ElMessage.success('已退出所有其他设备');
  } catch (error) {
    console.error('Failed to logout all devices:', error);
    ElMessage.error('退出所有设备失败');
  } finally {
    loggingOutAll.value = false;
  }
};

// 显示注销账号确认对话框
const showDeleteAccountConfirm = async () => {
  try {
    await ElMessageBox.confirm(
      '注销账号将永久删除您的所有数据，此操作不可恢复。请输入您的密码确认操作。',
      '注销账号确认',
      {
        confirmButtonText: '确认注销',
        cancelButtonText: '取消',
        type: 'warning',
        showInput: true,
        inputType: 'password',
        inputPlaceholder: '请输入密码确认'
      }
    );

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    ElMessage.success('账号已注销，即将退出登录');

    // 退出登录
    setTimeout(() => {
      userStore.logout();
    }, 1500);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete account:', error);
      ElMessage.error('注销账号失败');
    }
  }
};
</script>

<style scoped>
.account-settings-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 0 20px;
}

.account-settings-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.card-header {
  padding: 10px 0;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.settings-tabs {
  margin-top: 20px;
}

.form-item-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

/* 安全设置样式 */
.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.security-item-info h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
}

.security-item-info p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.danger-zone h3 {
  color: var(--el-color-danger);
}

/* 通知设置样式 */
.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.notification-item-info h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
}

.notification-item-info p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

/* 登录设备列表样式 */
.login-devices-list {
  min-height: 200px;
}

.login-device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.login-device-item:last-child {
  border-bottom: none;
}

.device-info {
  display: flex;
  align-items: center;
}

.device-info .el-icon {
  font-size: 24px;
  margin-right: 16px;
  color: var(--el-color-primary);
}

.device-details h4 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 500;
}

.device-details p {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .account-settings-container {
    padding: 0 10px;
  }

  .security-item,
  .notification-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .security-item > *:last-child,
  .notification-item > *:last-child {
    margin-top: 12px;
    align-self: flex-start;
  }

  .login-device-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .login-device-item > button {
    margin-top: 12px;
  }
}
</style>
