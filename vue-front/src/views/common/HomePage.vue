<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <el-container>
        <el-main>
          <h1 class="hero-title">智慧连接未来</h1>
          <h2 class="hero-subtitle">开启你的高效校园招聘之旅</h2>
          <p class="hero-description">
            我们致力于为高校学生和优秀企业搭建智能、精准、便捷的桥梁，<br />
            助力学生发现理想工作，协助企业招募顶尖人才。
          </p>
          <div class="hero-actions">
            <el-button type="primary" size="large" class="action-button primary-button" @click="goToLogin">
              立即登录
            </el-button>
            <el-button size="large" class="action-button outline-button" @click="goToRegister">
              注册账号
            </el-button>
            <el-button type="success" size="large" class="browse-jobs-button" @click="browseJobs">
              浏览职位 <el-icon><ArrowRightBold /></el-icon>
            </el-button>
          </div>
        </el-main>
      </el-container>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">平台核心优势</h2>
        <div class="title-underline"></div>
      </div>
      <el-row :gutter="40" justify="center">
        <el-col :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="feature-card">
            <div class="feature-icon primary-icon"><el-icon><Opportunity /></el-icon></div>
            <h3 class="feature-title">智能匹配推荐</h3>
            <p class="feature-text">基于大数据与 AI 算法，精准推送人岗匹配信息，提升求职与招聘效率。</p>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="feature-card">
            <div class="feature-icon success-icon"><el-icon><DocumentChecked /></el-icon></div>
            <h3 class="feature-title">便捷流程管理</h3>
            <p class="feature-text">从简历投递到 Offer 发放，全流程在线管理，进度透明，沟通顺畅。</p>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="feature-card">
             <div class="feature-icon warning-icon"><el-icon><TrendCharts /></el-icon></div>
            <h3 class="feature-title">海量优质资源</h3>
            <p class="feature-text">汇聚众多知名企业与重点高校资源，提供丰富多元的就业与人才选择。</p>
          </el-card>
        </el-col>
      </el-row>
    </section>

     <!-- Call to Action Section -->
     <section class="cta-section">
       <div class="cta-content">
         <h2 class="cta-title">准备好开启你的旅程了吗？</h2>
         <p class="cta-description">加入我们的平台，连接企业与人才，实现职业梦想</p>
         <el-button type="success" size="large" class="cta-button" @click="goToRegister">
           立即加入我们
         </el-button>
       </div>
     </section>

     <!-- Footer -->
     <el-footer class="home-footer">
        <div class="footer-content">
          <div class="footer-logo">智能校园招聘平台</div>
          <div class="footer-links">
            <a href="#">关于我们</a>
            <a href="#">使用条款</a>
            <a href="#">隐私政策</a>
            <a href="#">联系我们</a>
          </div>
          <p class="copyright">&copy; {{ new Date().getFullYear() }} 智能校园招聘平台. All rights reserved.</p>
        </div>
     </el-footer>

  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ElContainer, ElMain, ElButton, ElRow, ElCol, ElCard, ElIcon, ElText, ElFooter } from 'element-plus';
import { ArrowRightBold, Opportunity, DocumentChecked, TrendCharts } from '@element-plus/icons-vue';

const router = useRouter();

const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/register');
};

const browseJobs = () => {
    // 重定向到公共职位列表页面
    router.push('/jobs');
};

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

:root {
  /* 主色调 */
  --primary: #409EFF;
  --primary-dark: #337ecc;
  --primary-light: #79bbff;
  
  /* 辅助色调 */
  --success: #67C23A;
  --success-dark: #529b2e;
  --warning: #E6A23C;
  --danger: #F56C6C;
  --info: #909399;
  
  /* 背景颜色 */
  --bg-light: #FFFFFF;
  --bg-dark: #181818;
  --bg-gradient: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(103, 194, 58, 0.05) 100%);
  --bg-card: #F9FAFC;
  --bg-card-hover: #EBEEF5;
  
  /* 文本颜色 */
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --text-placeholder: #C0C4CC;
  
  /* 边框与阴影 */
  --border-light: #DCDFE6;
  --border-base: #E4E7ED;
  --shadow-base: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.08);
  --shadow-hover: 0 6px 24px rgba(0, 0, 0, 0.12);
  
  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}

.home-page {
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  text-align: center;
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Hero Section */
.hero-section {
  background: var(--bg-gradient), var(--bg-light);
  padding: 100px 20px;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSg2NCwgMTU4LCAyNTUsIDAuMDMpIj48L3JlY3Q+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIj48L3JlY3Q+PC9zdmc+');
  opacity: 0.5;
  z-index: 0;
}

.hero-section .el-main {
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  background: linear-gradient(to right, #1890ff, #52c41a);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
  animation: fadeInUp 0.8s ease;
}

.hero-subtitle {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 25px;
  font-weight: 600;
  animation: fadeInUp 0.8s ease 0.2s both;
}

.hero-description {
  font-size: 1.2rem;
  color: var(--text-regular);
  line-height: 1.8;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeInUp 0.8s ease 0.4s both;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  animation: fadeInUp 0.8s ease 0.6s both;
}

.action-button {
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  min-width: 140px;
}

.primary-button {
  background-color: #1890ff !important;
  border: none !important;
  color: #ffffff !important;
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
}

.primary-button:hover {
  transform: translateY(-2px);
  background-color: #096dd9 !important;
  box-shadow: 0 8px 20px rgba(24, 144, 255, 0.4);
}

.outline-button {
  border: 2px solid #1890ff !important;
  color: #1890ff !important;
  background: transparent !important;
}

.outline-button:hover {
  background: rgba(24, 144, 255, 0.1) !important;
  transform: translateY(-2px);
}

.browse-jobs-button {
  background-color: transparent !important;
  color: #52c41a !important;
  border: none !important;
  font-weight: 600;
  transition: all 0.3s ease;
}

.browse-jobs-button:hover {
  color: var(--success);
  transform: translateX(5px);
}

/* 淡入上移动画 */
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

/* Features Section */
.features-section {
  padding: 80px 20px;
  background-color: var(--bg-card);
  position: relative;
}

.section-header {
  margin-bottom: 60px;
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 15px;
}

.title-underline {
  width: 80px;
  height: 4px;
  background: linear-gradient(to right, var(--primary), var(--success));
  margin: 0 auto;
  border-radius: var(--radius-full);
}

.feature-card {
  text-align: center;
  padding: 40px 25px;
  border: none;
  border-radius: var(--radius-lg);
  transition: all 0.4s ease;
  height: 100%;
  background: var(--bg-light);
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-hover);
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 25px;
  font-size: 2.5rem;
  transition: all 0.3s ease;
}

.primary-icon {
  color: var(--primary);
  background: rgba(64, 158, 255, 0.1);
}

.success-icon {
  color: var(--success);
  background: rgba(103, 194, 58, 0.1);
}

.warning-icon {
  color: var(--warning);
  background: rgba(230, 162, 60, 0.1);
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.feature-text {
  font-size: 1.05rem;
  color: var(--text-regular);
  line-height: 1.7;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(to right, rgba(64, 158, 255, 0.9), rgba(103, 194, 58, 0.9)), 
              url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80');
  background-size: cover;
  background-position: center;
  padding: 80px 20px;
  color: white;
  position: relative;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.cta-description {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.cta-button {
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  background-color: #52c41a !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  min-width: 180px;
}

.cta-button:hover {
  transform: translateY(-3px);
  background-color: #389e0d !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
}

/* Footer */
.home-footer {
  background-color: var(--bg-dark);
  color: white;
  padding: 40px 20px;
  text-align: center;
  height: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-logo {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  background: linear-gradient(to right, var(--primary-light), var(--success));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: white;
}

.copyright {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.5rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .cta-title {
    font-size: 2rem;
  }
  
  .feature-card {
    margin-bottom: 30px;
    padding: 30px 20px;
  }
  
  .feature-icon {
    width: 70px;
    height: 70px;
    font-size: 2rem;
  }
  
  .hero-section, .features-section, .cta-section {
    padding: 60px 15px;
  }
  
  .hero-section {
    min-height: auto;
  }
  
  .hero-actions {
    gap: 10px;
  }
  
  .action-button {
    padding: 10px 20px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-description br {
    display: none;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .cta-title {
    font-size: 1.8rem;
  }
  
  .cta-description {
    font-size: 1rem;
  }
  
  .footer-links {
    gap: 15px;
  }
}
</style>