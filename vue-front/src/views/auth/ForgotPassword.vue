<template>
  <div class="forgot-password-container">
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
        <!-- Add verification code input if needed -->
        <!--
        <el-form-item label="验证码" prop="code">
          <el-input v-model="forgotPasswordForm.code" placeholder="请输入邮箱验证码">
            <template #append>
              <el-button :disabled="isSendingCode">获取验证码</el-button>
            </template>
          </el-input>
        </el-form-item>
        -->
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
import { useUserStore } from '@/stores/user'; // Assuming forgot password logic is in userStore or api

const router = useRouter();
const userStore = useUserStore(); // Or call API directly
const forgotPasswordFormRef = ref<FormInstance>();
const loading = ref(false);
// const isSendingCode = ref(false); // For verification code logic

const forgotPasswordForm = reactive({
  email: '',
  // code: '' // For verification code logic
});

const forgotPasswordRules = reactive<FormRules>({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] },
  ],
  // code: [{ required: true, message: '请输入验证码', trigger: 'blur' }] // For verification code logic
});

const handleSubmit = () => {
  if (!forgotPasswordFormRef.value) return;
  forgotPasswordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // TODO: 调用 userStore 或 api 的忘记密码 action
        // await userStore.forgotPassword(forgotPasswordForm.email);
        ElMessage.success('请求已提交 (模拟)，请检查您的邮箱以重置密码。');
        // Optionally clear form or redirect
        // router.push('/login');
      } catch (error) {
        console.error('Forgot password failed:', error);
        // ElMessage.error('请求失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    } else {
      console.log('error submit!!');
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
  background-color: #f0f2f5;
}

.forgot-password-card {
  width: 450px; /* Adjust width as needed */
}

.card-header {
  text-align: center;
  font-size: 1.2em;
}
</style> 