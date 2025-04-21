<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span>校园招聘系统 - 登录</span>
        </div>
      </template>
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名/邮箱/手机号"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="rememberMe">记住登录状态</el-checkbox>
        </el-form-item>

        <!-- 模拟登录角色选择 -->
        <el-form-item label="模拟角色">
          <el-radio-group v-model="mockUserType">
            <el-radio label="student">学生</el-radio>
            <el-radio label="company">企业</el-radio>
            <el-radio label="admin">管理员</el-radio>
          </el-radio-group>
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
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const rememberMe = ref(false);

// 模拟用户角色选择
const mockUserType = ref('student');

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
        // 将选择的角色保存到localStorage
        localStorage.setItem('mockUserType', mockUserType.value);

        // 设置模拟的token
        userStore.setToken('mock_token_' + mockUserType.value, rememberMe.value);

        // 获取用户信息
        await userStore.getUserInfo();

        ElMessage.success('登录成功 (模拟)');

        // 根据角色跳转到相应页面
        if (mockUserType.value === 'admin') {
          router.push('/admin/dashboard');
        } else if (mockUserType.value === 'company') {
          router.push('/company/dashboard');
        } else {
          router.push('/student/dashboard');
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
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5; /* Optional background */
}

.login-card {
  width: 400px;
}

.card-header {
  text-align: center;
  font-size: 1.2em;
}

.form-links {
  text-align: right;
  margin-top: -10px; /* Adjust spacing */
}
</style>