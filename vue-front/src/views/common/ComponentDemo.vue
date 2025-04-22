<template>
  <div class="component-demo">
    <h1 class="demo-title">组件演示</h1>
    
    <el-tabs v-model="activeTab">
      <el-tab-pane label="页面过渡" name="transition">
        <div class="demo-section">
          <h2 class="section-title">页面过渡动画</h2>
          <p class="section-description">
            页面过渡动画已经应用于整个应用程序。当您在不同页面之间导航时，将看到平滑的过渡效果。
          </p>
          
          <div class="demo-controls">
            <el-form :model="transitionForm" label-position="top">
              <el-form-item label="过渡类型">
                <el-select v-model="transitionForm.type">
                  <el-option label="淡入淡出" value="fade" />
                  <el-option label="滑动" value="slide" />
                  <el-option label="缩放" value="zoom" />
                  <el-option label="弹跳" value="bounce" />
                  <el-option label="翻转" value="flip" />
                  <el-option label="缩放" value="scale" />
                </el-select>
              </el-form-item>
              
              <el-form-item v-if="transitionForm.type === 'slide'" label="滑动方向">
                <el-select v-model="transitionForm.direction">
                  <el-option label="从右侧" value="right" />
                  <el-option label="从左侧" value="left" />
                  <el-option label="从上方" value="up" />
                  <el-option label="从下方" value="down" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="过渡持续时间">
                <el-slider v-model="transitionForm.duration" :min="100" :max="1000" :step="50" show-input />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="applyTransition">应用过渡</el-button>
                <el-button @click="resetTransition">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <div class="demo-preview">
            <div class="preview-container">
              <page-transition
                :name="previewTransitionName"
                :type="transitionForm.type"
                :direction="transitionForm.direction"
                :duration="transitionForm.duration"
              >
                <div v-if="showPreview" class="preview-content">
                  <h3>过渡预览</h3>
                  <p>这是一个过渡动画的预览。</p>
                </div>
              </page-transition>
            </div>
            
            <el-button @click="togglePreview">切换预览</el-button>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="加载状态" name="loading">
        <div class="demo-section">
          <h2 class="section-title">加载状态组件</h2>
          <p class="section-description">
            加载状态组件用于在数据加载过程中显示加载状态，提供多种加载类型和样式。
          </p>
          
          <div class="demo-controls">
            <el-form :model="loadingForm" label-position="top">
              <el-form-item label="加载类型">
                <el-select v-model="loadingForm.type">
                  <el-option label="默认" value="default" />
                  <el-option label="旋转" value="spinner" />
                  <el-option label="骨架屏" value="skeleton" />
                  <el-option label="进度条" value="progress" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="大小">
                <el-select v-model="loadingForm.size">
                  <el-option label="小" value="small" />
                  <el-option label="默认" value="default" />
                  <el-option label="大" value="large" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="加载文本">
                <el-input v-model="loadingForm.text" placeholder="请输入加载文本" />
              </el-form-item>
              
              <el-form-item>
                <el-checkbox v-model="loadingForm.overlay">显示遮罩层</el-checkbox>
              </el-form-item>
              
              <el-form-item v-if="loadingForm.type === 'progress'" label="进度">
                <el-slider v-model="loadingForm.percentage" :min="0" :max="100" show-input />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="toggleLoading">{{ isLoading ? '隐藏加载' : '显示加载' }}</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <div class="demo-preview">
            <div class="preview-container">
              <loading-state
                :loading="isLoading"
                :type="loadingForm.type"
                :size="loadingForm.size"
                :text="loadingForm.text"
                :overlay="loadingForm.overlay"
                :percentage="loadingForm.percentage"
              >
                <div class="preview-content">
                  <h3>加载状态预览</h3>
                  <p>这是加载状态组件的预览内容。当加载状态激活时，将显示加载指示器。</p>
                </div>
              </loading-state>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="错误状态" name="error">
        <div class="demo-section">
          <h2 class="section-title">错误状态组件</h2>
          <p class="section-description">
            错误状态组件用于在发生错误时显示错误信息，提供多种错误类型和样式。
          </p>
          
          <div class="demo-controls">
            <el-form :model="errorForm" label-position="top">
              <el-form-item label="错误类型">
                <el-select v-model="errorForm.type">
                  <el-option label="错误" value="error" />
                  <el-option label="警告" value="warning" />
                  <el-option label="信息" value="info" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="大小">
                <el-select v-model="errorForm.size">
                  <el-option label="小" value="small" />
                  <el-option label="默认" value="default" />
                  <el-option label="大" value="large" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="标题">
                <el-input v-model="errorForm.title" placeholder="请输入错误标题" />
              </el-form-item>
              
              <el-form-item label="描述">
                <el-input v-model="errorForm.description" type="textarea" placeholder="请输入错误描述" />
              </el-form-item>
              
              <el-form-item>
                <el-checkbox v-model="errorForm.showDetails">显示错误详情</el-checkbox>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="toggleError">{{ hasError ? '隐藏错误' : '显示错误' }}</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <div class="demo-preview">
            <div class="preview-container">
              <error-state
                :error="hasError"
                :type="errorForm.type"
                :size="errorForm.size"
                :title="errorForm.title"
                :description="errorForm.description"
                :show-details="errorForm.showDetails"
                :error-details="errorDetails"
                @retry="handleRetry"
                @back="handleBack"
              >
                <div class="preview-content">
                  <h3>错误状态预览</h3>
                  <p>这是错误状态组件的预览内容。当错误状态激活时，将显示错误信息。</p>
                </div>
              </error-state>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="引导提示" name="guide">
        <div class="demo-section">
          <h2 class="section-title">引导提示组件</h2>
          <p class="section-description">
            引导提示组件用于为用户提供功能引导，帮助用户了解应用程序的功能和使用方法。
          </p>
          
          <div class="demo-controls">
            <el-form :model="guideForm" label-position="top">
              <el-form-item>
                <el-checkbox v-model="guideForm.showArrow">显示箭头</el-checkbox>
              </el-form-item>
              
              <el-form-item>
                <el-checkbox v-model="guideForm.showMask">显示遮罩层</el-checkbox>
              </el-form-item>
              
              <el-form-item>
                <el-checkbox v-model="guideForm.showHighlight">显示高亮</el-checkbox>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="startGuideTour">开始引导</el-button>
                <el-button @click="resetGuideTour">重置引导状态</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <div class="demo-preview">
            <div class="preview-container">
              <div class="guide-demo-elements">
                <el-button id="guide-step-1" type="primary">第一步</el-button>
                <el-input id="guide-step-2" placeholder="第二步" />
                <el-select id="guide-step-3" placeholder="第三步">
                  <el-option label="选项1" value="1" />
                  <el-option label="选项2" value="2" />
                </el-select>
                <el-button id="guide-step-4" type="success">第四步</el-button>
              </div>
              
              <guide-tour
                ref="guideTour"
                :steps="guideSteps"
                :show-arrow="guideForm.showArrow"
                :show-mask="guideForm.showMask"
                :show-highlight="guideForm.showHighlight"
                storage-key="demo-guide-tour"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import PageTransition from '@/components/common/PageTransition.vue';
import LoadingState from '@/components/common/LoadingState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import GuideTour from '@/components/common/GuideTour.vue';

// 当前激活的标签页
const activeTab = ref('transition');

// 页面过渡相关
const transitionForm = reactive({
  type: 'fade',
  direction: 'right',
  duration: 300
});

const showPreview = ref(true);
const previewTransitionName = computed(() => {
  return `${transitionForm.type}${transitionForm.type === 'slide' ? `-${transitionForm.direction}` : ''}`;
});

const togglePreview = () => {
  showPreview.value = !showPreview.value;
};

const applyTransition = () => {
  // 应用过渡设置
  ElMessage.success('过渡设置已应用');
};

const resetTransition = () => {
  transitionForm.type = 'fade';
  transitionForm.direction = 'right';
  transitionForm.duration = 300;
};

// 加载状态相关
const loadingForm = reactive({
  type: 'default',
  size: 'default',
  text: '加载中...',
  overlay: false,
  percentage: 50
});

const isLoading = ref(false);

const toggleLoading = () => {
  isLoading.value = !isLoading.value;
  
  if (isLoading.value && loadingForm.type === 'progress') {
    // 模拟进度条
    const interval = setInterval(() => {
      loadingForm.percentage += 10;
      if (loadingForm.percentage >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          isLoading.value = false;
          loadingForm.percentage = 0;
        }, 500);
      }
    }, 500);
  }
};

// 错误状态相关
const errorForm = reactive({
  type: 'error',
  size: 'default',
  title: '发生错误',
  description: '抱歉，处理您的请求时发生了错误。请稍后重试或联系管理员。',
  showDetails: false
});

const hasError = ref(false);
const errorDetails = ref('Error: Failed to fetch data\nStatus: 500\nMessage: Internal Server Error');

const toggleError = () => {
  hasError.value = !hasError.value;
};

const handleRetry = () => {
  ElMessage.success('正在重试...');
  setTimeout(() => {
    hasError.value = false;
  }, 1000);
};

const handleBack = () => {
  ElMessage.info('返回上一页');
};

// 引导提示相关
const guideTour = ref<InstanceType<typeof GuideTour> | null>(null);

const guideForm = reactive({
  showArrow: true,
  showMask: true,
  showHighlight: true
});

const guideSteps = [
  {
    target: '#guide-step-1',
    title: '第一步',
    description: '这是引导的第一步，点击这个按钮开始操作。',
    position: 'bottom'
  },
  {
    target: '#guide-step-2',
    title: '第二步',
    description: '在这个输入框中输入您的信息。',
    position: 'right'
  },
  {
    target: '#guide-step-3',
    title: '第三步',
    description: '从下拉菜单中选择一个选项。',
    position: 'top'
  },
  {
    target: '#guide-step-4',
    title: '第四步',
    description: '点击这个按钮完成操作。',
    position: 'left'
  }
];

const startGuideTour = () => {
  guideTour.value?.startTour();
};

const resetGuideTour = () => {
  guideTour.value?.resetCompletion();
  ElMessage.success('引导状态已重置');
};
</script>

<style scoped>
.component-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-title {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 20px;
  color: var(--el-text-color-primary);
}

.demo-section {
  margin-top: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
}

.section-description {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 20px;
  line-height: 1.5;
}

.demo-controls {
  margin-bottom: 30px;
  padding: 20px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.demo-preview {
  margin-bottom: 30px;
}

.preview-container {
  min-height: 200px;
  padding: 20px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  margin-bottom: 10px;
  position: relative;
}

.preview-content {
  text-align: center;
}

.preview-content h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
}

.preview-content p {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.guide-demo-elements {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .component-demo {
    padding: 10px;
  }
  
  .demo-controls,
  .preview-container {
    padding: 15px;
  }
  
  .guide-demo-elements {
    flex-direction: column;
    align-items: center;
  }
}
</style>
