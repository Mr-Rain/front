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
          <el-button type="primary" @click="saveSettings" :loading="loadingSave">
            保存设置
          </el-button>
        </div>
      </template>

      <div v-loading="loadingData" class="settings-content">
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
              <el-checkbox v-model="settingsForm.mutedTypes.system" label="系统通知">
                <div class="checkbox-content">
                  <div class="checkbox-title">系统通知</div>
                  <div class="checkbox-description">平台更新、安全提醒等系统消息</div>
                </div>
              </el-checkbox>
            </el-form-item>
            
            <el-form-item>
              <el-checkbox v-model="settingsForm.mutedTypes.application" label="申请通知">
                <div class="checkbox-content">
                  <div class="checkbox-title">申请通知</div>
                  <div class="checkbox-description">职位申请状态更新、简历被查看等通知</div>
                </div>
              </el-checkbox>
            </el-form-item>
            
            <el-form-item>
              <el-checkbox v-model="settingsForm.mutedTypes.interview" label="面试通知">
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
          </div>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import type { NotificationType } from '@/types/notification';
import { ArrowLeft } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const notificationStore = useNotificationStore();

// 状态
const loadingData = ref(true);
const loadingSave = ref(false);
const settingsFormRef = ref();

// 定义应用中明确支持的通知类型，以便强类型检查
const KNOWN_NOTIFICATION_TYPES: NotificationType[] = ['system', 'application', 'interview'];

interface SettingsForm {
  enableEmail: boolean;
  enableBrowser: boolean;
  // mutedTypes 现在是一个记录，键是已知的通知类型，值是布尔值
  mutedTypes: Record<typeof KNOWN_NOTIFICATION_TYPES[number], boolean>;
  emailDigestFrequency: string; // 'immediate', 'daily', 'weekly'
}

const settingsForm = reactive<SettingsForm>({
  enableEmail: true,
  enableBrowser: true,
  mutedTypes: {
    system: false,
    application: false,
    interview: false,
    // 如果 KNOWN_NOTIFICATION_TYPES 增加了，这里也要对应增加并初始化
  },
  emailDigestFrequency: 'daily' // 'immediate', 'daily', 'weekly'
});

// 计算属性 - 通知类型复选框
const receiveSystem = computed({
  get: () => !settingsForm.mutedTypes.system,
  set: (value) => {
    if (value) {
      settingsForm.mutedTypes.system = false;
    } else {
      if (!settingsForm.mutedTypes.system) {
        settingsForm.mutedTypes.system = true;
      }
    }
  }
});

const receiveApplication = computed({
  get: () => !settingsForm.mutedTypes.application,
  set: (value) => {
    if (value) {
      settingsForm.mutedTypes.application = false;
    } else {
      if (!settingsForm.mutedTypes.application) {
        settingsForm.mutedTypes.application = true;
      }
    }
  }
});

const receiveInterview = computed({
  get: () => !settingsForm.mutedTypes.interview,
  set: (value) => {
    if (value) {
      settingsForm.mutedTypes.interview = false;
    } else {
      if (!settingsForm.mutedTypes.interview) {
        settingsForm.mutedTypes.interview = true;
      }
    }
  }
});

// 初始化
onMounted(async () => {
  loadingData.value = true;
  try {
    const currentSettings = await notificationStore.fetchNotificationSettings();
    if (currentSettings) {
      settingsForm.enableEmail = currentSettings.enableEmail;
      settingsForm.enableBrowser = currentSettings.enableBrowser;
      // currentSettings.mutedTypes 来自后端，可能是 string[] 或 undefined
      settingsForm.mutedTypes = convertMutedTypesToForm(currentSettings.mutedTypes);
    } else {
      ElMessage.warning('加载通知设置失败，将使用默认设置。');
      // 如果加载失败，确保 settingsForm.mutedTypes 被正确初始化 (reactive 已经做了)
      settingsForm.mutedTypes = convertMutedTypesToForm(undefined); // 使用默认值
    }
  } catch (error) {
    console.error('Failed to fetch notification settings:', error);
    ElMessage.error('加载通知设置失败，请稍后重试。');
  } finally {
    loadingData.value = false;
  }
});

// 将 store 中的 mutedTypes (string[]) 转换为表单需要的 Record<NotificationType, boolean>
const convertMutedTypesToForm = (mutedStoreArray: NotificationType[] | undefined): Record<typeof KNOWN_NOTIFICATION_TYPES[number], boolean> => {
  const formMuted: Record<typeof KNOWN_NOTIFICATION_TYPES[number], boolean> = {
    system: false,
    application: false,
    interview: false,
  };
  // 确保 mutedStoreArray 是一个数组
  const safeMutedStoreArray = Array.isArray(mutedStoreArray) ? mutedStoreArray : [];

  KNOWN_NOTIFICATION_TYPES.forEach(type => {
    if (safeMutedStoreArray.includes(type)) {
      formMuted[type] = true;
    } else {
      formMuted[type] = false;
    }
  });
  return formMuted;
};

// 将表单中的 Record<NotificationType, boolean> 转换为 store 需要的 string[]
const convertMutedTypesFromForm = (formMutedRecord: Record<typeof KNOWN_NOTIFICATION_TYPES[number], boolean>): NotificationType[] => {
  return (Object.keys(formMutedRecord) as NotificationType[])
    .filter(type => formMutedRecord[type]) // 只包含值为 true (即被屏蔽) 的类型
    .map(type => type);
};

// 保存设置
const saveSettings = async () => {
  loadingSave.value = true;
  try {
    const settingsToSave = {
      enableBrowser: settingsForm.enableBrowser,
      enableEmail: settingsForm.enableEmail,
      mutedTypes: convertMutedTypesFromForm(settingsForm.mutedTypes)
    };
    await notificationStore.updateNotificationSettings(settingsToSave);
    
    // 这里假设后端API还没有实现邮件摘要频率设置
    // 实际项目中应该添加这个参数到updateNotificationSettings方法中
    
    ElMessage.success('通知设置已保存');
  } catch (error) {
    console.error('Failed to save notification settings:', error);
    ElMessage.error('保存通知设置失败，请稍后重试。');
  } finally {
    loadingSave.value = false;
  }
};

// 重置设置
const resetSettings = () => {
  settingsForm.enableBrowser = true;
  settingsForm.enableEmail = true;
  settingsForm.mutedTypes = {
    system: false,
    application: false,
    interview: false,
  };
  settingsForm.emailDigestFrequency = 'daily';
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
