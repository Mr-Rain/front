<template>
  <div class="image-optimization-demo">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <h2>图片资源优化示例</h2>
          <p class="subtitle">展示图片懒加载、WebP格式支持、图片压缩等优化功能</p>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <!-- 懒加载示例 -->
        <el-tab-pane label="懒加载" name="lazy">
          <div class="section">
            <h3>图片懒加载</h3>
            <p>只有当图片进入视口时才会加载，减少初始页面加载时间</p>
            
            <div class="image-grid">
              <div v-for="(image, index) in lazyImages" :key="index" class="image-item">
                <OptimizedImage
                  :src="image.src"
                  :alt="image.alt"
                  width="200"
                  height="150"
                  rounded
                />
                <div class="image-caption">{{ image.alt }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- WebP格式支持示例 -->
        <el-tab-pane label="WebP格式" name="webp">
          <div class="section">
            <h3>WebP格式支持</h3>
            <p>
              WebP格式提供更好的压缩率，同等质量下文件更小
              <el-tag v-if="webpSupported" type="success">您的浏览器支持WebP</el-tag>
              <el-tag v-else type="warning">您的浏览器不支持WebP</el-tag>
            </p>
            
            <div class="comparison">
              <div class="comparison-item">
                <h4>原始图片 (JPG)</h4>
                <img :src="originalImage" alt="原始图片" class="comparison-image" />
                <div class="image-info">
                  <p>文件大小: 约 150KB</p>
                </div>
              </div>
              
              <div class="comparison-item">
                <h4>WebP格式</h4>
                <img :src="webpImage" alt="WebP格式" class="comparison-image" />
                <div class="image-info">
                  <p>文件大小: 约 70KB</p>
                  <p>减少约 53%</p>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 图片上传优化示例 -->
        <el-tab-pane label="图片上传优化" name="upload">
          <div class="section">
            <h3>图片上传优化</h3>
            <p>上传前自动压缩图片并转换为WebP格式（如果浏览器支持）</p>
            
            <div class="upload-demo">
              <OptimizedUploader
                :auto-upload="false"
                :enable-web-p="true"
                :enable-compression="true"
                :max-width="800"
                :max-height="600"
                :quality="0.8"
                :limit="3"
                list-type="picture-card"
                :tip-text="'支持JPG、PNG、GIF等格式，单个文件不超过5MB，自动优化为WebP格式'"
                @change="handleUploadChange"
              >
                <template #tip>
                  <div class="el-upload__tip">
                    支持JPG、PNG、GIF等格式，单个文件不超过5MB
                    <br />
                    <el-tag size="small" type="info">自动压缩</el-tag>
                    <el-tag v-if="webpSupported" size="small" type="success">自动转换为WebP</el-tag>
                  </div>
                </template>
              </OptimizedUploader>
              
              <div v-if="uploadedFiles.length > 0" class="upload-results">
                <h4>上传结果</h4>
                <el-table :data="uploadedFiles" style="width: 100%">
                  <el-table-column prop="name" label="文件名" width="180" />
                  <el-table-column prop="type" label="类型" width="120" />
                  <el-table-column prop="size" label="大小">
                    <template #default="scope">
                      {{ formatFileSize(scope.row.size) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="optimized" label="是否优化">
                    <template #default="scope">
                      <el-tag :type="scope.row.optimized ? 'success' : 'info'">
                        {{ scope.row.optimized ? '是' : '否' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import OptimizedImage from '@/components/common/OptimizedImage.vue';
import OptimizedUploader from '@/components/common/OptimizedUploader.vue';
import type { UploadFile } from 'element-plus';

// 获取图片优化器
const imageOptimizer = inject('imageOptimizer') as any;

// 状态
const activeTab = ref('lazy');
const webpSupported = ref(false);
const uploadedFiles = ref<any[]>([]);

// 示例图片
const originalImage = '/src/assets/images/default-avatar.svg';
const webpImage = '/src/assets/images/default-avatar.svg'; // 实际项目中应该是WebP版本

// 懒加载示例图片
const lazyImages = [
  { src: '/src/assets/images/default-avatar.svg', alt: '示例图片 1' },
  { src: '/src/assets/images/default-company.svg', alt: '示例图片 2' },
  { src: '/src/assets/images/empty-search.svg', alt: '示例图片 3' },
  { src: '/src/assets/images/default-avatar.svg', alt: '示例图片 4' },
  { src: '/src/assets/images/default-company.svg', alt: '示例图片 5' },
  { src: '/src/assets/images/empty-search.svg', alt: '示例图片 6' },
];

// 处理上传变化
const handleUploadChange = (fileList: UploadFile[]) => {
  uploadedFiles.value = fileList.map(file => ({
    name: file.name,
    type: file.raw?.type || '未知',
    size: file.size || 0,
    optimized: file.raw?.type === 'image/webp' || false
  }));
};

// 格式化文件大小
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return size + ' B';
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB';
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB';
  }
};

// 组件挂载时
onMounted(async () => {
  // 检查WebP支持
  if (imageOptimizer) {
    webpSupported.value = imageOptimizer.isWebPSupported();
  }
});
</script>

<style scoped>
.image-optimization-demo {
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

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.image-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-caption {
  margin-top: 8px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.comparison {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-top: 20px;
}

.comparison-item {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.comparison-item h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
}

.comparison-image {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.image-info {
  margin-top: 10px;
  text-align: center;
}

.image-info p {
  margin: 5px 0;
  font-size: 14px;
}

.upload-demo {
  margin-top: 20px;
}

.upload-results {
  margin-top: 30px;
}

.upload-results h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .comparison {
    flex-direction: column;
  }
  
  .comparison-item {
    width: 100%;
  }
}
</style>
