<template>
  <el-footer class="footer" height="auto"> 
    <div class="footer-content">
      <p>&copy; {{ currentYear }} 校园招聘系统. 保留所有权利.</p>
      <div class="links">
        <el-link href="/about-us" :underline="false">关于我们</el-link>
        <el-divider direction="vertical"></el-divider>
        <el-link href="/contact" :underline="false">联系我们</el-link>
        <el-divider direction="vertical"></el-divider>
        <el-link href="/privacy" :underline="false">隐私政策</el-link>
        <el-divider direction="vertical"></el-divider>
        <el-link href="/terms" :underline="false">服务条款</el-link>
      </div>
       <!-- Optional: Add ICP Filing number or other info -->
       <!-- <p>备案号: 京ICP备XXXXXXXX号-X</p> -->
    </div>
  </el-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.footer {
  padding: 20px 0;
  background-color: #f8f9fa; /* Light background color */
  border-top: 1px solid var(--el-border-color-light);
  color: #6c757d; /* Grey text color */
  font-size: 0.9em;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 0 20px;
}

.footer-content p {
  margin: 5px 0;
}

.links {
  margin-top: 10px;
}

.links .el-link {
  margin: 0 10px;
  color: #6c757d;
}
.links .el-link:hover {
  color: var(--el-color-primary);
}

.links .el-divider--vertical {
    height: 1em; /* Adjust divider height */
    vertical-align: middle;
}
</style> 