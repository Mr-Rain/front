<template>
  <div class="login-container">
    <div class="theme-switch-container">
      <ThemeSwitcher />
    </div>
    <div class="back-home-btn">
      <el-button link type="primary" @click="goToHome" class="home-button">
        <el-icon class="home-icon"><House /></el-icon>
        返回主页
      </el-button>
    </div>
    <div class="login-content">
      <div class="login-left">
        <h2 class="welcome-text">欢迎来到</h2>
        <h1 class="system-title">校园招聘系统</h1>
        <p class="system-desc">连接人才与机遇，开启你的职业生涯</p>
      </div>
      <el-card class="login-card">
        <template #header>
          <div class="card-header">
            <span>用户登录</span>
          </div>
        </template>
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="80px" @keyup.enter="handleLogin">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名/邮箱/手机号"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password></el-input>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="rememberMe">记住登录状态</el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleLogin" :loading="loading">登录</el-button>
            <el-button @click="goToRegister">注册</el-button>
          </el-form-item>
          <div class="form-links">
            <el-link type="primary" @click="goToForgotPassword">忘记密码?</el-link>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { House } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useUserStore } from '@/stores/user';
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue';

const router = useRouter();
const userStore = useUserStore();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const rememberMe = ref(false);

const loginForm = reactive({
  username: '',
  password: '',
});

const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' }
  ],
});

const handleLogin = () => {
  if (!loginFormRef.value) return;
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 调用实际的登录API
        await userStore.login({
          username: loginForm.username,
          password: loginForm.password
        }, rememberMe.value);

        ElMessage.success('登录成功');

        // 根据用户类型跳转到相应页面
        const userType = userStore.userInfo?.userType?.toLowerCase();
        console.log('User type:', userType);

        if (userType === 'admin') {
          router.push('/admin/dashboard');
        } else if (userType === 'company') {
          router.push('/company/dashboard');
        } else if (userType === 'student') {
          router.push('/student/dashboard');
        } else {
          // 默认跳转到首页
          router.push('/');
          console.warn('Unknown user type:', userType);
        }
      } catch (error) {
        console.error('Login failed:', error);
        ElMessage.error('登录失败，请检查用户名和密码');
      } finally {
        loading.value = false;
      }
    } else {
      console.log('error submit!!');
    }
  });
};

const goToRegister = () => {
  router.push('/register');
};

const goToForgotPassword = () => {
  router.push('/forgot-password');
};

const goToHome = () => {
  router.push('/');
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--el-color-primary-light-7) 0%, var(--el-color-primary-light-9) 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%);
  animation: rotate 30s linear infinite;
}

.login-content {
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

.login-left {
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

.login-card {
  width: 400px;
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

.form-links {
  text-align: right;
  margin-top: 1rem;
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

.back-home-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 10;
}

.home-button {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.home-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.home-icon {
  font-size: 1.2em;
}

/* Dark theme styles */
:deep(.dark-theme) {
  .login-container {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  }

  .login-content {
    background: rgba(0, 0, 0, 0.2);
  }

  .login-card {
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

  .el-form-item__label,
  .el-checkbox__label,
  .el-radio__label {
    color: #cccccc !important;
  }

  .home-button {
    background: rgba(0, 0, 0, 0.2);
    color: #fff;
  }
  
  .home-button:hover {
    background: rgba(0, 0, 0, 0.3);
  }
}

/* Responsive design */
@media (max-width: 1024px) {
  .login-content {
    flex-direction: column;
    gap: 2rem;
  }

  .login-left {
    text-align: center;
    padding: 1rem;
  }

  .system-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .login-card {
    width: 100%;
    max-width: 350px;
  }

  .system-title {
    font-size: 2rem;
  }
}
</style>