<template>
  <div class="api-cache-demo">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <h2>API缓存示例</h2>
          <p class="subtitle">展示API数据缓存功能</p>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 基本缓存示例 -->
        <el-tab-pane label="基本缓存" name="basic">
          <div class="section">
            <h3>基本缓存功能</h3>
            <p>演示API请求缓存的基本功能</p>

            <div class="demo-buttons">
              <el-button type="primary" @click="fetchDataWithCache">
                使用缓存获取数据
              </el-button>

              <el-button type="warning" @click="fetchDataWithoutCache">
                不使用缓存获取数据
              </el-button>

              <el-button type="danger" @click="clearCache">
                清除缓存
              </el-button>
            </div>

            <div class="request-info">
              <p>
                <strong>请求次数:</strong> {{ requestCount }}
              </p>
              <p>
                <strong>缓存命中:</strong> {{ cacheHits }}
              </p>
              <p>
                <strong>响应时间:</strong> {{ responseTime }}ms
              </p>
            </div>

            <div v-if="data" class="response-display">
              <h4>响应数据 {{ data.cached ? '(来自缓存)' : '' }}</h4>
              <pre>{{ JSON.stringify(data, null, 2) }}</pre>
            </div>
          </div>
        </el-tab-pane>

        <!-- 缓存配置示例 -->
        <el-tab-pane label="缓存配置" name="config">
          <div class="section">
            <h3>缓存配置选项</h3>
            <p>演示不同的缓存配置选项</p>

            <el-form :model="cacheOptions" label-width="180px" class="cache-form">
              <el-form-item label="缓存时间 (TTL)">
                <el-slider
                  v-model="cacheOptions.ttl"
                  :min="1000"
                  :max="60000"
                  :step="1000"
                  :format-tooltip="formatTtl"
                />
              </el-form-item>

              <el-form-item label="缓存标签">
                <el-select
                  v-model="cacheOptions.tags"
                  multiple
                  placeholder="选择缓存标签"
                  style="width: 100%"
                >
                  <el-option label="user" value="user" />
                  <el-option label="post" value="post" />
                  <el-option label="comment" value="comment" />
                  <el-option label="demo" value="demo" />
                </el-select>
              </el-form-item>

              <el-form-item label="强制刷新">
                <el-switch v-model="cacheOptions.forceRefresh" />
              </el-form-item>

              <el-form-item label="后台刷新">
                <el-switch v-model="cacheOptions.backgroundRefresh" />
              </el-form-item>
            </el-form>

            <div class="demo-buttons">
              <el-button type="primary" @click="fetchDataWithOptions">
                使用自定义选项获取数据
              </el-button>

              <el-button type="warning" @click="clearCacheByTag">
                清除指定标签缓存
              </el-button>
            </div>

            <div v-if="configData" class="response-display">
              <h4>响应数据 {{ configData.cached ? '(来自缓存)' : '' }}</h4>
              <pre>{{ JSON.stringify(configData, null, 2) }}</pre>
            </div>
          </div>
        </el-tab-pane>

        <!-- 缓存统计示例 -->
        <el-tab-pane label="缓存统计" name="stats">
          <div class="section">
            <h3>缓存统计信息</h3>
            <p>查看当前缓存的统计信息</p>

            <div class="demo-buttons">
              <el-button type="primary" @click="refreshStats">
                刷新统计信息
              </el-button>

              <el-button type="danger" @click="clearAllCache">
                清除所有缓存
              </el-button>
            </div>

            <div class="stats-display">
              <el-descriptions title="缓存统计" :column="1" border>
                <el-descriptions-item label="缓存项数量">
                  {{ cacheStats.size }}
                </el-descriptions-item>
                <el-descriptions-item label="标签数量">
                  {{ cacheStats.tagCount }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, reactive } from 'vue';
import axios from 'axios';
import type { CacheOptions } from '@/utils/apiCache';

// 获取API缓存
const apiCache = inject('apiCache') as any;

// 状态
const activeTab = ref('basic');
const data = ref<any>(null);
const configData = ref<any>(null);
const requestCount = ref(0);
const cacheHits = ref(0);
const responseTime = ref(0);
const cacheStats = reactive({
  size: 0,
  tagCount: 0
});

// 缓存选项
const cacheOptions = reactive<CacheOptions>({
  ttl: 10000, // 10秒
  tags: ['demo'],
  forceRefresh: false,
  backgroundRefresh: false
});

// 格式化TTL显示
const formatTtl = (val: number) => {
  return `${val / 1000}秒`;
};

// 模拟API请求
const mockApiRequest = async (): Promise<any> => {
  // 增加请求计数
  requestCount.value++;

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  // 返回模拟数据
  return {
    id: Math.floor(Math.random() * 1000),
    title: '示例数据',
    content: '这是一个示例API响应',
    timestamp: new Date().toISOString()
  };
};

// 使用缓存获取数据
const fetchDataWithCache = async () => {
  try {
    const startTime = Date.now();

    // 创建一个带缓存的请求配置
    const response = await axios.get('/api/demo', {
      // 由于没有实际的API，我们使用模拟数据
      adapter: async (config) => {
        const result = await mockApiRequest();
        return {
          data: result,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config
        };
      },
      // 启用缓存
      cache: true
    });

    // 计算响应时间
    responseTime.value = Date.now() - startTime;

    // 更新数据
    data.value = {
      ...response.data,
      cached: response.cached
    };

    // 如果是缓存命中，增加计数
    if (response.cached) {
      cacheHits.value++;
    }
  } catch (error) {
    console.error('获取数据失败:', error);
  }
};

// 不使用缓存获取数据
const fetchDataWithoutCache = async () => {
  try {
    const startTime = Date.now();

    // 创建一个不带缓存的请求配置
    const response = await axios.get('/api/demo', {
      // 由于没有实际的API，我们使用模拟数据
      adapter: async (config) => {
        const result = await mockApiRequest();
        return {
          data: result,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config
        };
      },
      // 禁用缓存
      cache: false
    });

    // 计算响应时间
    responseTime.value = Date.now() - startTime;

    // 更新数据
    data.value = {
      ...response.data,
      cached: false
    };
  } catch (error) {
    console.error('获取数据失败:', error);
  }
};

// 使用自定义选项获取数据
const fetchDataWithOptions = async () => {
  try {
    const startTime = Date.now();

    // 创建一个带自定义缓存选项的请求配置
    const response = await axios.get('/api/demo/config', {
      // 由于没有实际的API，我们使用模拟数据
      adapter: async (config) => {
        const result = await mockApiRequest();
        return {
          data: result,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config
        };
      },
      // 使用自定义缓存选项
      cache: { ...cacheOptions }
    });

    // 计算响应时间
    responseTime.value = Date.now() - startTime;

    // 更新数据
    configData.value = {
      ...response.data,
      cached: response.cached,
      cacheOptions: { ...cacheOptions }
    };

    // 如果是缓存命中，增加计数
    if (response.cached) {
      cacheHits.value++;
    }

    // 刷新统计信息
    refreshStats();
  } catch (error) {
    console.error('获取数据失败:', error);
  }
};

// 清除缓存
const clearCache = () => {
  apiCache.clearByUrlPrefix('/api/demo');
  refreshStats();
};

// 清除指定标签缓存
const clearCacheByTag = () => {
  if (cacheOptions.tags && cacheOptions.tags.length > 0) {
    apiCache.clearByTags(cacheOptions.tags);
    refreshStats();
  }
};

// 清除所有缓存
const clearAllCache = () => {
  apiCache.clearAll();
  refreshStats();
};

// 刷新统计信息
const refreshStats = () => {
  const stats = apiCache.getStats();
  cacheStats.size = stats.size;
  cacheStats.tagCount = stats.tagCount;
};

// 初始化
refreshStats();
</script>

<style scoped>
.api-cache-demo {
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
  margin-bottom: 20px;
}

.request-info {
  margin: 20px 0;
  padding: 15px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

.request-info p {
  margin: 5px 0;
}

.response-display {
  margin-top: 20px;
  padding: 15px;
  background-color: var(--el-bg-color-page);
  border-radius: 4px;
  overflow: auto;
}

.response-display h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
}

.response-display pre {
  margin: 0;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.cache-form {
  margin-bottom: 20px;
}

.stats-display {
  margin-top: 20px;
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
