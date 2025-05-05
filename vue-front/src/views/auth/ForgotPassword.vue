<template>
  <div class="forgot-password-container">
    <div class="theme-switch-container">
      <ThemeSwitcher />
    </div>
    <div class="forgot-password-content">
      <div class="forgot-password-left">
        <h2 class="welcome-text">找回密码</h2>
        <h1 class="system-title">校园招聘系统</h1>
        <p class="system-desc">别担心，我们会帮您找回账号</p>
      </div>
      <el-card class="forgot-password-card">
        <template #header>
          <div class="card-header">
            <span>重置密码</span>
          </div>
        </template>
        <el-form ref="forgotPasswordFormRef" :model="forgotPasswordForm" :rules="forgotPasswordRules" label-width="80px">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="forgotPasswordForm.email" placeholder="请输入注册时使用的邮箱"></el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="code">
            <el-input v-model="forgotPasswordForm.code" placeholder="请输入邮箱验证码">
              <template #append>
                <el-button :disabled="isSendingCode" @click="sendVerificationCode" class="verification-btn">
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
  min-height: 100vh;
  background: linear-gradient(135deg, var(--el-color-primary-light-7) 0%, var(--el-color-primary-light-9) 100%);
  position: relative;
  overflow: hidden;
}

.forgot-password-container::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%);
  animation: rotate 30s linear infinite;
}

.forgot-password-content {
  display: flex;
  align-items: center;
  gap: 4rem;
  z-index: 1;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

.forgot-password-left {
  color: var(--el-text-color-primary);
  max-width: 400px;
  padding: 2rem;
}

.welcome-text {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
}

.system-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards 0.2s;
}

.system-desc {
  font-size: 1.2rem;
  line-height: 1.6;
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards 0.4s;
}

.theme-switch-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.forgot-password-card {
  width: 450px;
  background-color: var(--el-bg-color, #ffffff);
  border: none;
  border-radius: 15px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards 0.6s;
}

.card-header {
  text-align: center;
  font-size: 1.5em;
  color: var(--el-text-color-primary);
  margin-bottom: 1rem;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
  opacity: 0;
  animation: fadeInUp 0.4s ease forwards;
}

:deep(.el-form-item:nth-child(1)) { animation-delay: 0.7s; }
:deep(.el-form-item:nth-child(2)) { animation-delay: 0.8s; }
:deep(.el-form-item:nth-child(3)) { animation-delay: 0.9s; }

.verification-btn {
  min-width: 120px;
  transition: all 0.3s ease;
}

.verification-btn:not(:disabled):hover {
  background: var(--el-color-primary-light-8);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Dark theme styles */
:deep(.dark-theme) {
  .forgot-password-container {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  }

  .forgot-password-content {
    background: rgba(0, 0, 0, 0.2);
  }

  .forgot-password-card {
    background-color: rgba(37, 37, 37, 0.9) !important;
    border-color: rgba(51, 51, 51, 0.5) !important;
  }

  .el-input__wrapper {
    background-color: rgba(44, 44, 44, 0.8) !important;
    box-shadow: 0 0 0 1px rgba(68, 68, 68, 0.5) inset !important;
    backdrop-filter: blur(5px);
  }

  .el-input__inner {
    color: #cccccc !important;
  }

  .el-form-item__label {
    color: #cccccc !important;
  }

  .el-button--default {
    background-color: rgba(44, 44, 44, 0.8) !important;
    border-color: rgba(68, 68, 68, 0.5) !important;
    color: #cccccc !important;
    
    &:hover {
      background-color: rgba(44, 44, 44, 0.9) !important;
      border-color: rgba(68, 68, 68, 0.7) !important;
    }
  }
}

/* Responsive design */
@media (max-width: 1024px) {
  .forgot-password-content {
    flex-direction: column;
    gap: 2rem;
  }

  .forgot-password-left {
    text-align: center;
    padding: 1rem;
  }

  .system-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .forgot-password-card {
    width: 100%;
    max-width: 350px;
  }

  .system-title {
    font-size: 2rem;
  }

  .verification-btn {
    min-width: 100px;
    padding: 0 10px;
  }
}
</style>