<template>
  <div class="forgot-password-container">
    <div class="theme-switch-container">
      <ThemeSwitcher />
    </div>
    <el-card class="forgot-password-card">
      <template #header>
        <div class="card-header">
          <span>校园招聘系统 - 找回密码</span>
        </div>
      </template>
      <el-form ref="forgotPasswordFormRef" :model="forgotPasswordForm" :rules="forgotPasswordRules" label-width="80px">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="forgotPasswordForm.email" placeholder="请输入注册时使用的邮箱"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-input v-model="forgotPasswordForm.code" placeholder="请输入邮箱验证码">
            <template #append>
              <el-button :disabled="isSendingCode" @click="sendVerificationCode">
                {{ codeButtonText }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
          <el-button @click="goToLogin">返回登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue';
import { useUserStore } from '@/stores/user'; // Assuming forgot password logic is in userStore or api

const router = useRouter();
const userStore = useUserStore(); // Or call API directly
const forgotPasswordFormRef = ref<FormInstance>();
const loading = ref(false);
const isSendingCode = ref(false);
const countdown = ref(60);
const codeButtonText = ref('获取验证码');

const forgotPasswordForm = reactive({
  email: '',
  code: ''
});

const forgotPasswordRules = reactive<FormRules>({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] },
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
});

// 发送验证码
 const sendVerificationCode = async () => {
  // 验证邮箱格式
  if (!forgotPasswordForm.email) {
    ElMessage.warning('请先输入邮箱地址');
    return;
  }

  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailPattern.test(forgotPasswordForm.email)) {
    ElMessage.warning('请输入有效的邮箱地址');
    return;
  }

  isSendingCode.value = true;
  try {
    // 调用发送验证码的API
    await userStore.sendVerificationCode(forgotPasswordForm.email);
    ElMessage.success('验证码已发送到您的邮箱');

    // 开始倒计时
    countdown.value = 60;
    codeButtonText.value = `重新发送(${countdown.value}s)`;

    const timer = setInterval(() => {
      countdown.value--;
      codeButtonText.value = `重新发送(${countdown.value}s)`;

      if (countdown.value <= 0) {
        clearInterval(timer);
        isSendingCode.value = false;
        codeButtonText.value = '获取验证码';
      }
    }, 1000);
  } catch (error) {
    console.error('Failed to send verification code:', error);
    ElMessage.error('验证码发送失败，请稍后重试');
    isSendingCode.value = false;
  }
};

const handleSubmit = () => {
  if (!forgotPasswordFormRef.value) return;
  forgotPasswordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 调用 userStore 或 api 的忘记密码 action
        await userStore.resetPassword({
          email: forgotPasswordForm.email,
          code: forgotPasswordForm.code
        });

        // 成功响应
        ElMessage.success('密码重置链接已发送到您的邮箱，请检查邮箱并点击链接重置密码。');

        // 清空表单
        forgotPasswordForm.email = '';
        forgotPasswordForm.code = '';

        // 3秒后跳转到登录页面
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (error: any) {
        console.error('Forgot password failed:', error);
        ElMessage.error(error?.message || '密码重置失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.warning('请正确填写所有必填信息');
    }
  });
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--el-bg-color-page, #f0f2f5);
  color: var(--el-text-color-primary);
  position: relative;
}

.theme-switch-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.forgot-password-card {
  width: 450px; /* Adjust width as needed */
  background-color: var(--el-bg-color, #ffffff);
  border-color: var(--el-border-color-light);
}

.card-header {
  text-align: center;
  font-size: 1.2em;
  color: var(--el-text-color-primary);
}

/* 添加深色主题下的样式 */
:deep(.dark-theme .el-card) {
  background-color: var(--theme-card-bg-dark, #252525) !important;
  border-color: var(--theme-border-color, #333333) !important;
  color: var(--theme-text-color, #e6e6e6) !important;
}

:deep(.dark-theme .el-card__header) {
  border-bottom-color: var(--theme-border-color, #333333) !important;
}

:deep(.dark-theme .el-input__wrapper) {
  background-color: var(--theme-input-bg, #2c2c2c) !important;
  box-shadow: 0 0 0 1px var(--theme-input-border, #444444) inset !important;
}

:deep(.dark-theme .el-input__inner) {
  color: var(--theme-input-text, #cccccc) !important;
  background-color: transparent !important;
}

:deep(.dark-theme .el-form-item__label) {
  color: var(--theme-text-color-light, #cccccc) !important;
}

:deep(.dark-theme .el-button--default) {
  background-color: var(--theme-bg-color-lighter, #2c2c2c) !important;
  border-color: var(--theme-border-color, #333333) !important;
  color: var(--theme-text-color, #e6e6e6) !important;
}
</style>