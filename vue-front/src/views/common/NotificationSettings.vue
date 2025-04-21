<template>
  <div class="notification-settings-page responsive-padding">
    <el-card shadow="never" class="page-card responsive-card">
      <template #header>
        <div class="card-header">
          <el-button @click="goBack" type="primary" plain class="back-button">
            <el-icon class="back-icon"><ArrowLeft /></el-icon>
            <span class="back-text">返回</span>
          </el-button>
          <span class="page-title">通知设置</span>
        </div>
      </template>

      <div v-loading="loading" class="settings-content">
        <el-form
          ref="settingsFormRef"
          :model="settingsForm"
          label-position="top"
        >
          <!-- 通知方式设置 -->
          <div class="settings-section">
            <h2 class="section-title">通知方式</h2>
            <el-form-item label="浏览器通知">
              <el-switch v-model="settingsForm.enableBrowser" />
              <div class="setting-description">
                在浏览器中显示通知提醒
              </div>
            </el-form-item>
            
            <el-form-item label="邮件通知">
              <el-switch v-model="settingsForm.enableEmail" />
              <div class="setting-description">
                将重要通知发送到您的邮箱
              </div>
            </el-form-item>
          </div>

          <!-- 通知类型设置 -->
          <div class="settings-section">
            <h2 class="section-title">通知类型</h2>
            <p class="section-description">
              选择您想要接收的通知类型
            </p>
            
            <el-form-item>
              <el-checkbox v-model="receiveSystem" label="系统通知">
                <div class="checkbox-content">
                  <div class="checkbox-title">系统通知</div>
                  <div class="checkbox-description">平台更新、安全提醒等系统消息</div>
                </div>
              </el-checkbox>
            </el-form-item>
            
            <el-form-item>
              <el-checkbox v-model="receiveApplication" label="申请通知">
                <div class="checkbox-content">
                  <div class="checkbox-title">申请通知</div>
                  <div class="checkbox-description">职位申请状态更新、简历被查看等通知</div>
                </div>
              </el-checkbox>
            </el-form-item>
            
            <el-form-item>
              <el-checkbox v-model="receiveInterview" label="面试通知">
                <div class="checkbox-content">
                  <div class="checkbox-title">面试通知</div>
                  <div class="checkbox-description">面试邀请、面试安排变更等通知</div>
                </div>
              </el-checkbox>
            </el-form-item>
          </div>

          <!-- 通知频率设置 -->
          <div class="settings-section">
            <h2 class="section-title">通知频率</h2>
            <el-form-item label="邮件摘要频率">
              <el-radio-group v-model="settingsForm.emailDigestFrequency">
                <el-radio label="immediate">实时发送</el-radio>
                <el-radio label="daily">每日摘要</el-radio>
                <el-radio label="weekly">每周摘要</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>

          <!-- 保存按钮 -->
          <div class="form-actions">
            <el-button @click="resetSettings">恢复默认设置</el-button>
            <el-button type="primary" @click="saveSettings" :loading="saving">保存设置</el-button>
          </div>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import type { NotificationType } from '@/types/notification';
import { ArrowLeft } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const notificationStore = useNotificationStore();

// 状态
const loading = ref(false);
const saving = ref(false);
const settingsFormRef = ref();

// 表单数据
const settingsForm = ref({
  enableBrowser: true,
  enableEmail: true,
  mutedTypes: [] as NotificationType[],
  emailDigestFrequency: 'daily' // 'immediate', 'daily', 'weekly'
});

// 计算属性 - 通知类型复选框
const receiveSystem = computed({
  get: () => !settingsForm.value.mutedTypes.includes('system'),
  set: (value) => {
    if (value) {
      settingsForm.value.mutedTypes = settingsForm.value.mutedTypes.filter(t => t !== 'system');
    } else {
      if (!settingsForm.value.mutedTypes.includes('system')) {
        settingsForm.value.mutedTypes.push('system');
      }
    }
  }
});

const receiveApplication = computed({
  get: () => !settingsForm.value.mutedTypes.includes('application'),
  set: (value) => {
    if (value) {
      settingsForm.value.mutedTypes = settingsForm.value.mutedTypes.filter(t => t !== 'application');
    } else {
      if (!settingsForm.value.mutedTypes.includes('application')) {
        settingsForm.value.mutedTypes.push('application');
      }
    }
  }
});

const receiveInterview = computed({
  get: () => !settingsForm.value.mutedTypes.includes('interview'),
  set: (value) => {
    if (value) {
      settingsForm.value.mutedTypes = settingsForm.value.mutedTypes.filter(t => t !== 'interview');
    } else {
      if (!settingsForm.value.mutedTypes.includes('interview')) {
        settingsForm.value.mutedTypes.push('interview');
      }
    }
  }
});

// 初始化
onMounted(async () => {
  await fetchSettings();
});

// 获取通知设置
const fetchSettings = async () => {
  loading.value = true;
  try {
    const settings = await notificationStore.fetchNotificationSettings();
    if (settings) {
      settingsForm.value.enableBrowser = settings.enableBrowser;
      settingsForm.value.enableEmail = settings.enableEmail;
      settingsForm.value.mutedTypes = settings.mutedTypes || [];
      
      // 这里假设后端API还没有实现邮件摘要频率设置，使用默认值
      settingsForm.value.emailDigestFrequency = 'daily';
    }
  } catch (error) {
    console.error('Failed to fetch notification settings:', error);
  } finally {
    loading.value = false;
  }
};

// 保存设置
const saveSettings = async () => {
  saving.value = true;
  try {
    await notificationStore.updateNotificationSettings({
      enableBrowser: settingsForm.value.enableBrowser,
      enableEmail: settingsForm.value.enableEmail,
      mutedTypes: settingsForm.value.mutedTypes
    });
    
    // 这里假设后端API还没有实现邮件摘要频率设置
    // 实际项目中应该添加这个参数到updateNotificationSettings方法中
    
    ElMessage.success('通知设置已保存');
  } catch (error) {
    console.error('Failed to save notification settings:', error);
  } finally {
    saving.value = false;
  }
};

// 重置设置
const resetSettings = () => {
  settingsForm.value = {
    enableBrowser: true,
    enableEmail: true,
    mutedTypes: [],
    emailDigestFrequency: 'daily'
  };
};

// 返回上一页
const goBack = () => {
  router.push('/notifications');
};
</script>

<style scoped>
.notification-settings-page {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
}

.back-button {
  margin-right: 15px;
}

.back-icon {
  margin-right: 5px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  flex-grow: 1;
}

.settings-content {
  max-width: 800px;
  margin: 0 auto;
}

.settings-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
}

.section-description {
  color: #606266;
  margin-bottom: 20px;
}

.setting-description {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.checkbox-content {
  display: flex;
  flex-direction: column;
  margin-left: 8px;
}

.checkbox-title {
  font-weight: 500;
}

.checkbox-description {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .notification-settings-page {
    padding: 10px;
  }
  
  .settings-section {
    padding: 15px;
  }
}
</style>
