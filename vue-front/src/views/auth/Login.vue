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

const loginForm = reactive({
  username: '',
  password: '',
});

const loginRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});

const handleLogin = () => {
  if (!loginFormRef.value) return;
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // TODO: 调用 userStore 的登录 action
        // await userStore.login(loginForm);
        ElMessage.success('登录成功 (模拟)');
        // TODO: 获取用户信息并根据角色跳转
        // await userStore.getUserInfo();
        // const redirect = router.currentRoute.value.query.redirect as string || '/';
        // router.push(redirect);
        router.push('/'); // 暂时跳转首页
      } catch (error) {
        console.error('Login failed:', error);
        // ElMessage.error('登录失败，请检查用户名和密码'); // 由 API 或 Store 处理错误提示
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