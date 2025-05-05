<template>
  <div class="register-container">
    <div class="theme-switch-container">
      <ThemeSwitcher />
    </div>
    <div class="back-home-btn">
      <el-button link type="primary" @click="goToHome" class="home-button">
        <el-icon class="home-icon"><House /></el-icon>
        返回主页
      </el-button>
    </div>
    <div class="register-content">
      <div class="register-left">
        <h2 class="welcome-text">开启新旅程</h2>
        <h1 class="system-title">校园招聘系统</h1>
        <p class="system-desc">注册账号，探索更多职业机会</p>
      </div>
      <el-card class="register-card">
        <template #header>
          <div class="card-header">
            <span>用户注册</span>
          </div>
        </template>
        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="100px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="registerForm.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="registerForm.email" placeholder="请输入邮箱"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password></el-input>
          </el-form-item>
          <el-form-item label="用户类型" prop="userType">
            <el-radio-group v-model="registerForm.userType">
              <el-radio label="STUDENT">学生</el-radio>
              <el-radio label="COMPANY">企业</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleRegister" :loading="loading">注册</el-button>
            <el-button @click="goToLogin">已有账号? 去登录</el-button>
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
import { House } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue';
import { useUserStore } from '@/stores/user'; // Assuming register logic is in userStore
import type { UserType } from '@/types/user'; // Import UserType

const router = useRouter();
const userStore = useUserStore();
const registerFormRef = ref<FormInstance>();
const loading = ref(false);

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  userType: 'STUDENT' as UserType, // Default to student
});

// Custom validator for password confirmation
const validatePassConfirm = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error("两次输入的密码不一致!"));
  } else {
    callback();
  }
};

const registerRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字、下划线和中文', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码必须包含大小写字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePassConfirm, trigger: 'blur' },
  ],
  userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
});

const handleRegister = () => {
  if (!registerFormRef.value) return;
  registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 调用 userStore 的注册 action
        // Destructure needed fields, exclude confirmPassword
        const { confirmPassword, ...registerData } = registerForm;
        await userStore.register(registerData);
        ElMessage.success('注册成功！');
        // 注册成功后跳转到登录页面
        router.push('/login');
      } catch (error: any) {
        console.error('Registration failed:', error);
        // 显示错误信息，如果有特定错误消息则显示，否则显示通用错误
        ElMessage.error(error?.message || '注册失败，请稍后重试');
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

const goToHome = () => {
  router.push('/');
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--el-color-primary-light-7) 0%, var(--el-color-primary-light-9) 100%);
  position: relative;
  overflow: hidden;
  padding: 2rem 0;
}

.register-container::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%);
  animation: rotate 30s linear infinite;
}

.register-content {
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

.register-left {
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

.register-card {
  width: 500px;
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
:deep(.el-form-item:nth-child(4)) { animation-delay: 1.0s; }
:deep(.el-form-item:nth-child(5)) { animation-delay: 1.1s; }
:deep(.el-form-item:nth-child(6)) { animation-delay: 1.2s; }

:deep(.el-radio-group) {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

:deep(.el-radio) {
  margin-right: 0;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-radio.is-checked) {
  background: var(--el-color-primary-light-9);
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
  .register-container {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  }

  .register-content {
    background: rgba(0, 0, 0, 0.2);
  }

  .register-card {
    background-color: rgba(37, 37, 37, 0.9) !important;
    border-color: rgba(51, 51, 51, 0.5) !important;
  }

  .el-input__wrapper {
    background-color: rgba(44, 44, 44, 0.8) !important;
    box-shadow: 0 0 0 1px rgba(68, 68, 68, 0.5) inset !important;
    backdrop-filter: blur(5px);
  }

  .el-radio.is-checked {
    background: rgba(var(--el-color-primary-rgb), 0.2);
  }

  .el-input__inner {
    color: #cccccc !important;
  }

  .el-form-item__label,
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
@media (max-width: 1200px) {
  .register-content {
    flex-direction: column;
    gap: 2rem;
  }

  .register-left {
    text-align: center;
    padding: 1rem;
  }

  .system-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 600px) {
  .register-card {
    width: 100%;
    max-width: 450px;
  }

  .system-title {
    font-size: 2rem;
  }

  :deep(.el-radio-group) {
    flex-direction: column;
    gap: 1rem;
  }

  :deep(.el-radio) {
    margin: 0;
    padding: 8px 16px;
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
</style>