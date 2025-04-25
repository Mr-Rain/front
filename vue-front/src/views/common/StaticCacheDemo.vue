<template>
  <div class="static-cache-demo">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <h2>静态资源缓存示例</h2>
          <p class="subtitle">展示静态资源缓存功能</p>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <!-- 基本缓存示例 -->
        <el-tab-pane label="缓存状态" name="status">
          <div class="section">
            <h3>缓存状态</h3>
            <p>查看当前缓存状态和支持情况</p>
            
            <el-descriptions title="缓存支持情况" :column="1" border>
              <el-descriptions-item label="Service Worker">
                <el-tag :type="isServiceWorkerSupported ? 'success' : 'danger'">
                  {{ isServiceWorkerSupported ? '支持' : '不支持' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Cache API">
                <el-tag :type="isCacheApiSupported ? 'success' : 'danger'">
                  {{ isCacheApiSupported ? '支持' : '不支持' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="IndexedDB">
                <el-tag :type="isIndexedDBSupported ? 'success' : 'danger'">
                  {{ isIndexedDBSupported ? '支持' : '不支持' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="LocalStorage">
                <el-tag :type="isLocalStorageSupported ? 'success' : 'danger'">
                  {{ isLocalStorageSupported ? '支持' : '不支持' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
            
            <div class="demo-buttons">
              <el-button type="primary" @click="refreshStats">
                刷新统计信息
              </el-button>
              
              <el-button type="danger" @click="clearCache">
                清除所有缓存
              </el-button>
            </div>
            
            <el-descriptions title="缓存统计信息" :column="1" border>
              <el-descriptions-item label="缓存项数量">
                {{ cacheStats.itemCount }}
              </el-descriptions-item>
              <el-descriptions-item label="总缓存大小">
                {{ cacheStats.formattedTotalSize }}
              </el-descriptions-item>
              <el-descriptions-item label="缓存命中率">
                {{ cacheStats.hitRatePercentage }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
        
        <!-- 资源预加载示例 -->
        <el-tab-pane label="资源预加载" name="preload">
          <div class="section">
            <h3>资源预加载</h3>
            <p>演示资源预加载功能</p>
            
            <el-form :model="preloadOptions" label-width="120px" class="preload-form">
              <el-form-item label="预加载类型">
                <el-select v-model="preloadOptions.type" placeholder="选择预加载类型">
                  <el-option label="图片" value="image" />
                  <el-option label="样式" value="style" />
                  <el-option label="脚本" value="script" />
                  <el-option label="字体" value="font" />
                  <el-option label="DNS预解析" value="dns" />
                  <el-option label="预连接" value="preconnect" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="资源URL">
                <el-input
                  v-model="preloadOptions.url"
                  placeholder="输入资源URL，多个URL用逗号分隔"
                  type="textarea"
                  :rows="3"
                />
              </el-form-item>
              
              <el-form-item label="高优先级" v-if="preloadOptions.type === 'image'">
                <el-switch v-model="preloadOptions.priority" />
              </el-form-item>
              
              <el-form-item label="跨域" v-if="['font', 'preconnect'].includes(preloadOptions.type)">
                <el-switch v-model="preloadOptions.crossOrigin" />
              </el-form-item>
            </el-form>
            
            <div class="demo-buttons">
              <el-button type="primary" @click="preloadResources">
                预加载资源
              </el-button>
            </div>
            
            <div v-if="preloadedResources.length > 0" class="preloaded-resources">
              <h4>已预加载的资源</h4>
              <el-table :data="preloadedResources" style="width: 100%">
                <el-table-column prop="url" label="资源URL" />
                <el-table-column prop="type" label="类型" width="120" />
                <el-table-column prop="time" label="预加载时间" width="180" />
              </el-table>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- Service Worker示例 -->
        <el-tab-pane label="Service Worker" name="sw">
          <div class="section">
            <h3>Service Worker</h3>
            <p>演示Service Worker缓存功能</p>
            
            <div class="sw-status">
              <h4>Service Worker状态</h4>
              <p>
                <strong>状态:</strong>
                <el-tag :type="swStatus.registered ? 'success' : 'warning'">
                  {{ swStatus.registered ? '已注册' : '未注册' }}
                </el-tag>
              </p>
              <p v-if="swStatus.registered">
                <strong>版本:</strong> {{ swStatus.version || '未知' }}
              </p>
              <p v-if="swStatus.needRefresh">
                <strong>更新状态:</strong>
                <el-tag type="warning">有新版本可用</el-tag>
                <el-button type="primary" size="small" @click="updateServiceWorker">
                  更新
                </el-button>
              </p>
            </div>
            
            <div class="demo-buttons">
              <el-button type="primary" @click="testCachedResource">
                测试缓存资源
              </el-button>
              
              <el-button type="warning" @click="checkForUpdates">
                检查更新
              </el-button>
            </div>
            
            <div v-if="testResult" class="test-result">
              <h4>测试结果</h4>
              <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, inject, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { isServiceWorkerSupported, isCacheApiSupported, isIndexedDBSupported, isLocalStorageSupported } from '@/utils/staticCache';
import { updateServiceWorker, swUpdateState } from '@/utils/registerSW';

// 获取静态资源缓存
const staticCache = inject('staticCache') as any;

// 状态
const activeTab = ref('status');
const cacheStats = ref<any>({
  itemCount: 0,
  formattedTotalSize: '0 B',
  hitRatePercentage: '0%'
});
const preloadOptions = reactive({
  type: 'image',
  url: '',
  priority: false,
  crossOrigin: true
});
const preloadedResources = ref<any[]>([]);
const swStatus = reactive({
  registered: false,
  version: '',
  needRefresh: false
});
const testResult = ref<any>(null);

// 刷新缓存统计信息
const refreshStats = async () => {
  try {
    await staticCache.loadStats();
    cacheStats.value = staticCache.getStats();
    ElMessage({
      message: '统计信息已刷新',
      type: 'success'
    });
  } catch (error) {
    console.error('刷新统计信息失败:', error);
    ElMessage({
      message: '刷新统计信息失败',
      type: 'error'
    });
  }
};

// 清除所有缓存
const clearCache = async () => {
  try {
    await staticCache.clearAll();
    await refreshStats();
    ElMessage({
      message: '所有缓存已清除',
      type: 'success'
    });
  } catch (error) {
    console.error('清除缓存失败:', error);
    ElMessage({
      message: '清除缓存失败',
      type: 'error'
    });
  }
};

// 预加载资源
const preloadResources = () => {
  try {
    // 解析URL
    const urls = preloadOptions.url.split(',').map(url => url.trim()).filter(url => url);
    
    if (urls.length === 0) {
      ElMessage({
        message: '请输入至少一个URL',
        type: 'warning'
      });
      return;
    }
    
    // 根据类型预加载资源
    switch (preloadOptions.type) {
      case 'image':
        staticCache.preloadImages(urls, preloadOptions.priority);
        break;
      case 'style':
        staticCache.preloadStyles(urls);
        break;
      case 'script':
        staticCache.preloadScripts(urls);
        break;
      case 'font':
        staticCache.preloadFonts(urls, preloadOptions.crossOrigin);
        break;
      case 'dns':
        staticCache.prefetchDNS(urls);
        break;
      case 'preconnect':
        staticCache.preconnect(urls, preloadOptions.crossOrigin);
        break;
    }
    
    // 添加到已预加载资源列表
    urls.forEach(url => {
      preloadedResources.value.push({
        url,
        type: preloadOptions.type,
        time: new Date().toLocaleTimeString()
      });
    });
    
    ElMessage({
      message: `已预加载 ${urls.length} 个资源`,
      type: 'success'
    });
  } catch (error) {
    console.error('预加载资源失败:', error);
    ElMessage({
      message: '预加载资源失败',
      type: 'error'
    });
  }
};

// 测试缓存资源
const testCachedResource = async () => {
  try {
    // 测试图片缓存
    const imageUrl = '/src/assets/images/default-avatar.svg';
    
    // 预加载图片
    staticCache.preloadImages([imageUrl], true);
    
    // 等待一段时间
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 检查缓存状态
    const startTime = performance.now();
    const response = await fetch(imageUrl);
    const endTime = performance.now();
    
    // 更新测试结果
    testResult.value = {
      url: imageUrl,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      fromCache: response.headers.get('x-from-cache') === 'true' || response.headers.get('cf-cache-status') === 'HIT',
      time: Math.round(endTime - startTime) + 'ms'
    };
    
    // 刷新统计信息
    await refreshStats();
  } catch (error) {
    console.error('测试缓存资源失败:', error);
    ElMessage({
      message: '测试缓存资源失败',
      type: 'error'
    });
  }
};

// 检查Service Worker更新
const checkForUpdates = () => {
  try {
    // 更新Service Worker
    updateServiceWorker();
    
    ElMessage({
      message: '正在检查更新...',
      type: 'info'
    });
  } catch (error) {
    console.error('检查更新失败:', error);
    ElMessage({
      message: '检查更新失败',
      type: 'error'
    });
  }
};

// 更新Service Worker
const updateServiceWorker = () => {
  try {
    // 更新Service Worker
    if (swUpdateState.registration) {
      swUpdateState.registration.update().catch(console.error);
    }
    
    ElMessage({
      message: '正在更新Service Worker...',
      type: 'info'
    });
  } catch (error) {
    console.error('更新Service Worker失败:', error);
    ElMessage({
      message: '更新Service Worker失败',
      type: 'error'
    });
  }
};

// 组件挂载时
onMounted(async () => {
  // 刷新缓存统计信息
  await refreshStats();
  
  // 更新Service Worker状态
  swStatus.registered = !!swUpdateState.registration;
  swStatus.needRefresh = swUpdateState.needRefresh;
  
  // 如果Service Worker已注册，获取版本
  if (swUpdateState.registration) {
    try {
      const version = await swUpdateState.registration.active?.scriptURL.split('?v=')[1] || '未知';
      swStatus.version = version;
    } catch (error) {
      console.error('获取Service Worker版本失败:', error);
    }
  }
});
</script>

<style scoped>
.static-cache-demo {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
}

.demo-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.section {
  margin-bottom: 30px;
}

.section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 600;
}

.section p {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--el-text-color-secondary);
}

.demo-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0;
}

.preload-form {
  margin-bottom: 20px;
}

.preloaded-resources {
  margin-top: 20px;
}

.preloaded-resources h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
}

.sw-status {
  margin-bottom: 20px;
  padding: 15px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

.sw-status h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
}

.sw-status p {
  margin: 5px 0;
}

.test-result {
  margin-top: 20px;
  padding: 15px;
  background-color: var(--el-bg-color-page);
  border-radius: 4px;
  overflow: auto;
}

.test-result h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
}

.test-result pre {
  margin: 0;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .demo-buttons {
    flex-direction: column;
  }
  
  .demo-buttons .el-button {
    width: 100%;
  }
}
</style>
