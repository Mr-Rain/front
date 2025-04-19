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
            <el-button type="primary" size="large" @click="goToLogin">立即登录</el-button>
            <el-button size="large" @click="goToRegister">注册账号</el-button>
            <el-button type="success" size="large" link @click="browseJobs">浏览职位 <el-icon><ArrowRightBold /></el-icon></el-button>
          </div>
        </el-main>
      </el-container>
    </section>

    <!-- Features Section -->
    <section class="features-section">
       <el-text type="primary" size="large" tag="h2" style="text-align: center; margin-bottom: 40px; font-weight: bold;">平台核心优势</el-text>
      <el-row :gutter="40" justify="center">
        <el-col :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="feature-card">
            <div class="feature-icon"><el-icon><Opportunity /></el-icon></div>
            <h3 class="feature-title">智能匹配推荐</h3>
            <p class="feature-text">基于大数据与 AI 算法，精准推送人岗匹配信息，提升求职与招聘效率。</p>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="feature-card">
            <div class="feature-icon"><el-icon><DocumentChecked /></el-icon></div>
            <h3 class="feature-title">便捷流程管理</h3>
            <p class="feature-text">从简历投递到 Offer 发放，全流程在线管理，进度透明，沟通顺畅。</p>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="feature-card">
             <div class="feature-icon"><el-icon><TrendCharts /></el-icon></div>
            <h3 class="feature-title">海量优质资源</h3>
            <p class="feature-text">汇聚众多知名企业与重点高校资源，提供丰富多元的就业与人才选择。</p>
          </el-card>
        </el-col>
      </el-row>
    </section>

     <!-- Call to Action Section -->
     <section class="cta-section">
         <h2>准备好开启你的旅程了吗？</h2>
         <el-button type="success" size="large" round @click="goToRegister">立即加入我们</el-button>
     </section>

     <!-- Footer -->
     <el-footer class="home-footer">
        <p>&copy; {{ new Date().getFullYear() }} 智能校园招聘平台. All rights reserved.</p>
        <!-- Add other footer links if needed -->
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
    // Redirect to student job list, assuming public browsing redirects there
    // Or create a separate public job list view
    router.push('/student/jobs'); 
};

</script>

<style scoped>
.home-page {
  text-align: center;
  color: #333;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(103, 194, 58, 0.05) 100%), #fff;
  padding: 80px 20px;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-bottom: 15px;
}

.hero-subtitle {
  font-size: 1.8rem;
  color: #555;
  margin-bottom: 25px;
}

.hero-description {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.8;
  margin-bottom: 40px;
}

.hero-actions {
  /* Add flexbox for better wrapping */
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px; /* Use gap for spacing */
}

.hero-actions .el-button {
  margin: 0; /* Remove fixed margins */
}

/* Features Section */
.features-section {
  padding: 60px 20px;
  background-color: #f9fafc;
}

.feature-card {
  text-align: center;
  padding: 30px 20px;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  height: 100%; /* Make cards same height */
}
.feature-card:hover {
   transform: translateY(-5px);
   box-shadow: var(--el-box-shadow-light);
}


.feature-icon {
  font-size: 3rem;
  color: var(--el-color-primary);
  margin-bottom: 20px;
}
.feature-card:nth-child(2) .feature-icon {
    color: var(--el-color-success);
}
.feature-card:nth-child(3) .feature-icon {
    color: var(--el-color-warning);
}


.feature-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 15px;
}

.feature-text {
  font-size: 1rem;
  color: #666;
  line-height: 1.7;
}

/* CTA Section */
.cta-section {
    padding: 60px 20px;
    background-color: #fff; /* Or another distinct background */
}
.cta-section h2 {
    font-size: 2rem;
    margin-bottom: 30px;
}

/* Footer */
.home-footer {
    background-color: #f5f5f5;
    color: #999;
    padding: 20px;
    text-align: center;
    font-size: 0.9rem;
    height: auto; /* Override default height */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem; /* Slightly smaller */
  }
  .hero-subtitle {
    font-size: 1.3rem; /* Slightly smaller */
  }
  .hero-description {
    font-size: 0.95rem;
  }
  .feature-card {
      margin-bottom: 25px; /* Adjust spacing */
  }
  .feature-icon {
      font-size: 2.5rem; /* Smaller icon */
      margin-bottom: 15px;
  }
   .feature-title {
      font-size: 1.3rem;
  }
  .feature-text {
      font-size: 0.95rem;
  }
  .cta-section h2 {
      font-size: 1.8rem;
  }
  .hero-section {
      padding: 50px 15px; /* Adjust padding */
  }
   .features-section, .cta-section {
      padding: 35px 15px; /* Adjust padding */
   }
   .hero-actions {
       gap: 10px; /* Smaller gap on mobile */
   }
}

@media (max-width: 480px) {
    /* Further adjustments for very small screens if needed */
    .hero-title {
        font-size: 2rem;
    }
     .hero-subtitle {
        font-size: 1.2rem;
    }
}

</style> 