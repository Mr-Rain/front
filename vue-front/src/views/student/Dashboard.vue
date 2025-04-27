<template>
  <!-- 学生仪表盘主容器 -->
  <div class="student-dashboard">
    <el-row :gutter="20">
      <!-- 左侧：个人信息卡片 -->
      <el-col :xs="24" :sm="24" :md="6" :lg="5">
        <el-card class="box-card profile-summary" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">个人信息</span>
              <!-- 编辑按钮，点击跳转到个人信息编辑页 -->
              <el-button type="primary" class="edit-button" @click="goToProfile">编辑</el-button>
            </div>
          </template>
          <!-- 加载状态：显示骨架屏 -->
          <div v-if="studentStore.loading" class="loading-placeholder">
            <el-skeleton :rows="3" animated />
          </div>
          <!-- 加载成功且有数据：显示个人信息 -->
          <div v-else-if="studentStore.profile" class="profile-content">
            <div class="avatar-container">
              <!-- 用户头像组件 -->
              <UserAvatar :image-url="studentStore.profile.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" :size="100" />
            </div>
            <h3 class="profile-name">{{ studentStore.profile.username || '未设置姓名' }}</h3>
            <div class="profile-info">
              <p class="info-item"><i class="el-icon"><School /></i> {{ studentStore.profile.school || '未设置学校' }}</p>
              <p class="info-item"><i class="el-icon"><OfficeBuilding /></i> {{ studentStore.profile.major || '未设置专业' }}</p>
              <p class="info-item"><i class="el-icon"><Collection /></i> 学历: {{ studentStore.profile.education || '未设置学历' }}</p>
              <el-button type="primary" size="small" style="margin-top: 10px;" @click="goToProfile">完善个人信息</el-button>
            </div>
          </div>
          <!-- 加载失败或无数据：显示错误消息 -->
          <div v-else class="error-message">
            无法加载学生信息
            <el-button type="primary" size="small" style="margin-top: 10px;" @click="goToProfile">完善个人信息</el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：主要内容区域 -->
      <el-col :xs="24" :sm="24" :md="18" :lg="19">
        <!-- 最近面试结果卡片 -->
        <el-card class="box-card interview-results" shadow="hover" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近面试结果</span>
              <!-- 查看全部按钮，点击跳转到申请列表页 -->
              <el-button type="primary" class="more-button" @click="goToApplications">查看全部</el-button>
            </div>
          </template>
          <!-- 加载状态：显示骨架屏 -->
          <div v-if="applicationStore.loadingStudentList" class="loading-placeholder">
            <el-skeleton :rows="2" animated />
          </div>
          <!-- 加载成功且有面试记录：显示面试列表 -->
          <div v-else-if="recentInterviews.length > 0" class="interview-container">
            <el-row :gutter="20">
              <!-- 遍历最近的面试结果 -->
              <el-col v-for="interview in recentInterviews" :key="interview.id" :xs="24" :sm="24" :md="12" :lg="8">
                <!-- 单个面试卡片，根据状态添加不同样式 -->
                <el-card shadow="hover" class="interview-card" :class="{'success-card': interview.status === 'offer', 'pending-card': interview.status === 'interview', 'rejected-card': interview.status === 'rejected'}">
                  <div class="interview-header">
                    <!-- 公司 Logo 或首字母 -->
                    <el-avatar :size="40" :src="interview.company_logo || ''" class="company-logo">
                      {{ interview.company_name?.substring(0, 1) || 'C' }}
                    </el-avatar>
                    <div class="interview-company">
                      <h4>{{ interview.company_name || '未知企业' }}</h4>
                      <p>{{ interview.job_info?.title || '未知职位' }}</p>
                    </div>
                    <!-- 面试状态标签 -->
                    <el-tag :type="getStatusTagType(interview.status)" class="interview-status">
                      {{ formatStatus(interview.status) }}
                    </el-tag>
                  </div>
                  <div class="interview-content">
                    <div class="interview-info">
                      <!-- 显示面试时间、地点、面试官信息 -->
                      <p v-if="interview.interview_time">
                        <el-icon><Calendar /></el-icon>
                        面试时间: {{ formatTimestamp(interview.interview_time) }}
                      </p>
                      <p v-if="interview.interview_location">
                        <el-icon><Location /></el-icon>
                        面试地点: {{ interview.interview_location }}
                      </p>
                      <p v-if="interview.interviewer">
                        <el-icon><User /></el-icon>
                        面试官: {{ interview.interviewer }}
                      </p>
                    </div>
                    <!-- 显示面试反馈信息 -->
                    <div v-if="interview.feedback" class="interview-feedback">
                      <p class="feedback-title">面试反馈:</p>
                      <p class="feedback-content">{{ interview.feedback }}</p>
                    </div>
                    <!-- 查看详情按钮 -->
                    <div class="interview-actions">
                      <el-button type="primary" size="small" @click="goToApplicationDetail(interview.id)">
                        查看详情
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
          <!-- 无面试记录时显示空状态提示 -->
          <el-empty v-else description="暂无面试记录"></el-empty>
        </el-card>

        <!-- 最新申请状态卡片 -->
        <el-card class="box-card application-status" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">最新申请状态</span>
              <!-- 查看全部按钮 -->
              <el-button type="primary" class="more-button" @click="goToApplications">查看全部</el-button>
            </div>
          </template>
          <!-- 加载状态 -->
          <div v-if="applicationStore.loadingStudentList" class="loading-placeholder">
            <el-skeleton :rows="3" animated />
          </div>
          <!-- 加载成功且有申请记录：显示时间线 -->
          <div v-else-if="applicationStore.studentApplications.length > 0" class="timeline-container">
             <!-- 使用 Element Plus 时间线组件展示最新的申请记录 -->
             <el-timeline>
                <!-- 遍历最新的5条申请记录 -->
                <el-timeline-item
                  v-for="app in applicationStore.studentApplications.slice(0, 5)"
                  :key="app.id"
                  :timestamp="formatTimestamp(app.apply_time)"
                  placement="top"
                  class="timeline-item"
                >
                   <!-- 单个申请状态卡片 -->
                   <el-card shadow="hover" class="app-status-card">
                      <p class="job-title">
                        申请职位：
                        <!-- 职位名称，点击可跳转到职位详情 -->
                        <el-link type="primary" @click="goToJobDetail(app.job_id)">
                          {{ app.job_info?.title || '职位信息加载中...' }}
                        </el-link>
                        <span class="company-name">({{ app.job_info?.company_name }})</span>
                      </p>
                      <p class="job-status">
                        <!-- 申请状态标签 -->
                        状态：<el-tag :type="getStatusTagType(app.status)" effect="plain">{{ formatStatus(app.status) }}</el-tag>
                      </p>
                      <!-- 企业反馈信息 -->
                      <p v-if="app.feedback" class="job-feedback">企业反馈：{{ app.feedback }}</p>
                   </el-card>
                </el-timeline-item>
             </el-timeline>
          </div>
          <!-- 无申请记录时显示空状态提示 -->
          <el-empty v-else description="暂无申请记录"></el-empty>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据统计部分 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card class="box-card statistics-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">数据统计</span>
              <!-- 提示信息图标 -->
              <el-tooltip content="展示您的申请数据和统计信息" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <!-- 引入并显示学生统计数据组件 -->
          <student-statistics />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
// 导入 Vue 相关 API 和状态管理库
import { onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
// 导入学生和申请相关的 Pinia Store
import { useStudentStore } from '@/stores/student';
import { useApplicationStore } from '@/stores/application';
// 导入 Element Plus 组件和图标
import { ElMessage } from 'element-plus';
import UserAvatar from '@/components/common/UserAvatar.vue';
import StudentStatistics from '@/components/student/StudentStatistics.vue';
import { School, OfficeBuilding, Collection, InfoFilled, Calendar, Location, User } from '@element-plus/icons-vue';
// 导入申请状态的类型定义
import type { ApplicationStatus } from '@/types/application';

// 获取路由实例
const router = useRouter();
// 获取学生状态 store 实例
const studentStore = useStudentStore();
// 获取申请状态 store 实例
const applicationStore = useApplicationStore();

// 在组件挂载后执行数据获取操作
onMounted(() => {
  // 获取学生个人信息
  studentStore.fetchProfile();
  // 获取学生的申请列表（默认获取第一页，每页10条）
  applicationStore.fetchStudentApplications({ pageSize: 10, page: 1 });
});

// 定义导航函数，使用正常的 router.push 方式
const goToProfile = async () => {
  try {
    console.log('Navigating to profile page...');
    await nextTick();

    // 使用 router.push 并添加时间戳参数，确保每次都是唯一的
    router.push({
      path: '/student/profile',
      // query: {
      //   t: Date.now().toString() // 移除时间戳参数
      // }
    }).then(() => {
      console.log('Navigation to profile successful');
    }).catch(err => {
      console.error('Navigation error:', err);
      ElMessage.error('导航失败，请刷新页面重试');
    });
  } catch (error) {
    console.error('Error in goToProfile:', error);
    ElMessage.error('导航失败，请刷新页面重试');
  }
};

const goToApplications = () => {
  try {
    console.log('Navigating to applications page...');

    // 使用 router.push 并添加时间戳参数，确保每次都是唯一的
    router.push({
      path: '/student/applications',
      query: {
        t: Date.now().toString() // 添加时间戳参数
      }
    }).then(() => {
      console.log('Navigation to applications successful');
    }).catch(err => {
      console.error('Navigation error:', err);
      ElMessage.error('导航失败，请刷新页面重试');
    });
  } catch (error) {
    console.error('Error in goToApplications:', error);
    ElMessage.error('导航失败，请刷新页面重试');
  }
};

const goToJobDetail = (jobId: string | number) => {
  try {
    console.log(`Navigating to job detail page: ${jobId}...`);

    // 使用 router.push 并添加时间戳参数，确保每次都是唯一的
    router.push({
      path: `/jobs/${jobId}`,
      query: {
        t: Date.now().toString() // 添加时间戳参数
      }
    }).then(() => {
      console.log(`Navigation to job detail ${jobId} successful`);
    }).catch(err => {
      console.error('Navigation error:', err);
      ElMessage.error('导航失败，请刷新页面重试');
    });
  } catch (error) {
    console.error('Error in goToJobDetail:', error);
    ElMessage.error('导航失败，请刷新页面重试');
  }
};

const goToApplicationDetail = (applicationId: string | number) => {
  try {
    console.log(`Navigating to application detail page: ${applicationId}...`);

    // 使用 router.push 并添加时间戳参数，确保每次都是唯一的
    router.push({
      path: `/student/applications/${applicationId}`,
      query: {
        t: Date.now().toString() // 添加时间戳参数
      }
    }).then(() => {
      console.log(`Navigation to application detail ${applicationId} successful`);
    }).catch(err => {
      console.error('Navigation error:', err);
      ElMessage.error('导航失败，请刷新页面重试');
    });
  } catch (error) {
    console.error('Error in goToApplicationDetail:', error);
    ElMessage.error('导航失败，请刷新页面重试');
  }
};

// 计算属性：获取最近的面试结果
const recentInterviews = computed(() => {
  // 如果申请列表为空或未加载，返回空数组
  if (!applicationStore.studentApplications || applicationStore.studentApplications.length === 0) {
    return [];
  }

  // 筛选出状态为 'interview', 'offer', 'rejected' 的申请记录
  return applicationStore.studentApplications
    .filter(app => ['interview', 'offer', 'rejected'].includes(app.status))
    // 将筛选出的申请记录映射为面试卡片所需的数据格式
    .map(app => ({
      id: app.id,
      status: app.status,
      company_name: app.job_info?.company_name, // 使用可选链安全访问
      company_logo: 'https://via.placeholder.com/40', // 暂时使用占位图作为公司 Logo
      job_info: app.job_info, // 包含职位标题等信息
      interview_time: app.interview_time || app.update_time, // 优先使用面试时间，否则使用更新时间
      interview_location: app.interview_type === 'onsite' ? (app.interview_location || '公司总部') : '线上面试', // 根据面试类型确定地点
      interviewer: app.interview_contact || '招聘负责人', // 面试联系人或默认值
      feedback: app.feedback // 面试反馈
    }))
    // 只获取最新的3条面试结果
    .slice(0, 3);
});

// 辅助函数：格式化 ISO 8601 时间戳为本地可读格式
const formatTimestamp = (isoString: string): string => {
    if (!isoString) return 'N/A'; // 处理空值
    try {
        // 尝试将 ISO 字符串转换为 Date 对象并格式化
        return new Date(isoString).toLocaleString();
    } catch (e) {
        // 如果转换失败，返回原始字符串作为后备
        return isoString;
    }
};

// 辅助函数：将申请状态的英文标识符转换为中文文本
const formatStatus = (status: ApplicationStatus): string => {
    // 定义状态映射表
    const statusMap: Record<ApplicationStatus, string> = {
        pending: '待处理',      // 申请已提交，等待企业查看
        viewed: '已查看',       // 企业已查看申请
        interview: '邀请面试',   // 企业已发出面试邀请
        offer: '已录用',       // 企业已发出录用通知
        rejected: '未通过',     // 申请未通过筛选或面试
        withdrawn: '已撤回'      // 学生主动撤回申请
    };
    // 返回对应的中文状态，如果找不到则返回原始状态标识符
    return statusMap[status] || status;
}

// 辅助函数：根据申请状态返回 Element Plus 标签的类型 (type)
const getStatusTagType = (status: ApplicationStatus): ('primary' | 'success' | 'info' | 'warning' | 'danger') => {
     // 根据不同的状态返回不同的标签类型，用于视觉区分
     switch (status) {
        case 'offer': return 'success';    // 录用 - 成功
        case 'interview': return 'primary';  // 面试 - 主要
        case 'rejected': return 'danger';     // 未通过 - 危险
        case 'withdrawn': return 'info';     // 已撤回 - 信息
        case 'viewed': return 'warning';    // 已查看 - 警告
        case 'pending':                     // 待处理及其他情况 - 信息
        default: return 'info';
    }
}

</script>

<style scoped>
/* 全局 CSS 自定义属性 (变量)，用于统一风格 */
:root {
  --primary-color: #409EFF;
  --success-color: #67C23A;
  --warning-color: #E6A23C;
  --danger-color: #F56C6C;
  --info-color: #909399;

  --text-primary: #303133;   /* 主要文字颜色 */
  --text-regular: #606266;   /* 常规文字颜色 */
  --text-secondary: #909399; /* 次要文字颜色 */

  --border-color: #EBEEF5;   /* 边框颜色 */
  --bg-color: #F5F7FA;       /* 背景颜色 */

  --card-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);      /* 卡片默认阴影 */
  --card-hover-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15); /* 卡片悬停阴影 */
}

/* 仪表盘整体布局 */
.student-dashboard {
  padding: 24px;
  background-color: var(--bg-color);
  min-height: calc(100vh - 60px); /* 最小高度，确保内容不足时也能撑满视口 (减去可能的导航栏高度) */
}

/* 通用卡片样式 */
.box-card {
  margin-bottom: 24px;
  border-radius: 8px; /* 圆角 */
  transition: all 0.3s; /* 平滑过渡效果 */
  border: none; /* 移除默认边框 */
  height: 100%; /* 使卡片在栅格布局中高度一致 */
}

.box-card:hover {
  transform: translateY(-3px); /* 悬停时向上移动 */
  box-shadow: var(--card-hover-shadow); /* 应用悬停阴影 */
}

/* 面试结果卡片特定样式 */
.interview-container {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  gap: 16px; /* 卡片间距 */
}

.interview-card {
  margin-bottom: 16px;
  border-radius: 8px;
  transition: all 0.3s;
  border-left: 4px solid #909399; /* 左侧状态指示条，默认为灰色 */
}

.interview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 根据状态改变左侧指示条颜色 */
.success-card {
  border-left-color: var(--success-color);
}

.pending-card {
  border-left-color: var(--primary-color);
}

.rejected-card {
  border-left-color: var(--danger-color);
}

/* 面试卡片头部布局 */
.interview-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.company-logo {
  margin-right: 12px;
}

.interview-company {
  flex: 1; /* 占据剩余空间 */
}

.interview-company h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.interview-company p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.interview-status {
  margin-left: auto; /* 将状态标签推到最右侧 */
}

/* 面试卡片内容区域 */
.interview-content {
  margin-top: 12px;
}

.interview-info p {
  margin: 8px 0;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.interview-info p .el-icon {
  margin-right: 8px;
  color: var(--text-secondary);
}

/* 面试反馈样式 */
.interview-feedback {
  margin-top: 12px;
  padding: 8px;
  background-color: #f8f9fa; /* 轻微背景色 */
  border-radius: 4px;
}

.feedback-title {
  font-weight: 600;
  margin: 0 0 4px 0;
  font-size: 14px;
}

.feedback-content {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
}

/* 面试卡片操作按钮区域 */
.interview-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end; /* 按钮右对齐 */
}

/* 卡片头部通用样式 */
.card-header {
  display: flex;
  justify-content: space-between; /* 标题和按钮分布在两侧 */
  align-items: center;
  padding: 15px 0; /* 上下内边距 */
}

/* 卡片标题样式 */
.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  position: relative;
  padding-left: 12px; /* 左侧留出空间给装饰条 */
}

/* 卡片标题左侧的装饰条 */
.card-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: var(--primary-color);
  border-radius: 2px;
}

/* 编辑和更多按钮样式 */
.edit-button,
.more-button {
  font-weight: 500;
}

/* 个人信息卡片特定样式 */
.profile-summary {
  background: linear-gradient(to bottom, #f7fafc, #fff); /* 背景渐变 */
  position: sticky; /* 粘性定位，使其在滚动时固定在顶部 */
  top: 24px; /* 固定在距离顶部 24px 的位置 */
}

.profile-content {
  text-align: center;
  padding: 10px 0;
}

.avatar-container {
  margin-bottom: 16px;
  position: relative;
}

/* 头像外层的脉冲动画装饰圈 */
.avatar-container::after {
  content: '';
  display: block;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 2px solid rgba(64, 158, 255, 0.2); /* 半透明边框 */
  position: absolute;
  top: -5px; /* 微调位置 */
  left: 50%;
  transform: translateX(-50%);
  animation: pulse 2s infinite; /* 应用脉冲动画 */
}

/* 脉冲动画定义 */
@keyframes pulse {
  0% {
    transform: translateX(-50%) scale(1);
    opacity: 0.8;
  }
  70% {
    transform: translateX(-50%) scale(1.1); /* 放大 */
    opacity: 0; /* 透明度变为0 */
  }
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 0;
  }
}

/* 用户名样式 */
.profile-name {
  margin: 16px 0 10px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 学校、专业、学历信息样式 */
.profile-info {
  text-align: left;
  padding: 5px 10px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  color: var(--text-regular);
  font-size: 14px;
  border-bottom: 1px solid var(--border-color); /* 分隔线 */
}

.info-item:last-child {
  border-bottom: none; /* 最后一项无分隔线 */
}

.info-item .el-icon {
  margin-right: 10px;
  color: var(--primary-color);
  font-size: 18px;
}

/* 加载占位符样式 */
.loading-placeholder {
  padding: 20px 0;
}

/* 错误消息样式 */
.error-message {
  text-align: center;
  color: var(--danger-color);
  padding: 20px 0;
}



/* 申请状态卡片特定样式 */
.application-status {
  background-color: #fff;
  height: calc(100% - 24px); /* 计算高度以填充剩余空间 */
}

/* 时间线容器样式 */
.timeline-container {
  padding: 0 10px;
  max-height: 600px; /* 限制最大高度，超出则滚动 */
  overflow-y: auto; /* 垂直滚动 */
}

.timeline-item {
  padding-bottom: 15px;
}

/* 时间线内单个申请卡片样式 */
.app-status-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  border-left: 3px solid var(--primary-color);
  margin-bottom: 5px;
}

.app-status-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

/* 职位标题样式 */
.job-title {
  margin: 10px 0;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  flex-wrap: wrap; /* 允许换行 */
  gap: 5px; /* 元素间距 */
}

/* 公司名称样式 */
.company-name {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: normal;
  white-space: nowrap; /* 防止公司名称换行 */
}

/* 职位状态样式 */
.job-status {
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 企业反馈样式 */
.job-feedback {
  margin: 10px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  background-color: #f8f8f8;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 2px solid var(--warning-color);
}

/* Element Plus 时间线组件样式覆盖 */
:deep(.el-timeline-item__node) {
  background-color: var(--primary-color); /* 时间节点颜色 */
}

:deep(.el-timeline-item__tail) {
  border-left-color: var(--border-color); /* 时间线颜色 */
}

:deep(.el-timeline-item__timestamp) {
  color: var(--text-secondary);
  font-size: 13px;
}

/* 响应式布局调整 */
@media (max-width: 992px) { /* 中等屏幕 */
  .student-dashboard {
    padding: 16px;
  }

  .profile-summary {
    position: static; /* 取消粘性定位 */
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) { /* 平板屏幕 */
  .student-dashboard {
    padding: 12px;
  }

  /* 移除 Element Plus 栅格的默认间距 */
  .el-row {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .el-col {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .box-card {
    margin-bottom: 16px;
  }

  .card-title {
    font-size: 16px;
  }

  .profile-name {
    font-size: 18px;
  }

  .avatar-container::after {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 575px) { /* 手机屏幕 */
  .student-dashboard {
    padding: 10px;
  }

  .card-header {
    padding: 12px 0;
  }

  .avatar-container {
    margin-bottom: 12px;
  }

  .profile-name {
    font-size: 16px;
    margin: 12px 0 8px;
  }

  .job-title,
  .job-status,
  .job-feedback {
    font-size: 13px;
    margin: 8px 0;
  }
}
</style>