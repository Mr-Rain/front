<template>
  <div class="theme-switcher">
    <el-dropdown trigger="click" @command="handleCommand">
      <el-button class="theme-button" :icon="themeIcon" circle />
      
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="light" :class="{ 'active': themeStore.themeType === 'light' }">
            <el-icon><Sunny /></el-icon>
            <span>浅色模式</span>
          </el-dropdown-item>
          
          <el-dropdown-item command="dark" :class="{ 'active': themeStore.themeType === 'dark' }">
            <el-icon><Moon /></el-icon>
            <span>深色模式</span>
          </el-dropdown-item>
          
          <el-dropdown-item command="system" :class="{ 'active': themeStore.themeType === 'system' }">
            <el-icon><Monitor /></el-icon>
            <span>跟随系统</span>
          </el-dropdown-item>
          
          <el-dropdown-item divided command="customize">
            <el-icon><Setting /></el-icon>
            <span>主题设置</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    
    <!-- 主题设置对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="主题设置"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="theme-settings">
        <h3>主题模式</h3>
        <div class="theme-mode-selector">
          <div
            class="theme-mode-item"
            :class="{ 'active': themeStore.themeType === 'light' }"
            @click="themeStore.setTheme('light')"
          >
            <div class="theme-mode-preview light-preview">
              <div class="preview-header"></div>
              <div class="preview-sidebar"></div>
              <div class="preview-content"></div>
            </div>
            <span>浅色模式</span>
          </div>
          
          <div
            class="theme-mode-item"
            :class="{ 'active': themeStore.themeType === 'dark' }"
            @click="themeStore.setTheme('dark')"
          >
            <div class="theme-mode-preview dark-preview">
              <div class="preview-header"></div>
              <div class="preview-sidebar"></div>
              <div class="preview-content"></div>
            </div>
            <span>深色模式</span>
          </div>
          
          <div
            class="theme-mode-item"
            :class="{ 'active': themeStore.themeType === 'system' }"
            @click="themeStore.setTheme('system')"
          >
            <div class="theme-mode-preview system-preview">
              <div class="preview-header"></div>
              <div class="preview-sidebar"></div>
              <div class="preview-content"></div>
            </div>
            <span>跟随系统</span>
          </div>
        </div>
        
        <el-divider />
        
        <h3>主题颜色</h3>
        <div class="color-picker-section">
          <div class="color-picker-item">
            <span class="color-label">主题色</span>
            <el-color-picker
              v-model="themeColors.primary"
              show-alpha
              @change="updateThemeColors"
            />
          </div>
          
          <div class="color-picker-item">
            <span class="color-label">成功色</span>
            <el-color-picker
              v-model="themeColors.success"
              show-alpha
              @change="updateThemeColors"
            />
          </div>
          
          <div class="color-picker-item">
            <span class="color-label">警告色</span>
            <el-color-picker
              v-model="themeColors.warning"
              show-alpha
              @change="updateThemeColors"
            />
          </div>
          
          <div class="color-picker-item">
            <span class="color-label">危险色</span>
            <el-color-picker
              v-model="themeColors.danger"
              show-alpha
              @change="updateThemeColors"
            />
          </div>
          
          <div class="color-picker-item">
            <span class="color-label">信息色</span>
            <el-color-picker
              v-model="themeColors.info"
              show-alpha
              @change="updateThemeColors"
            />
          </div>
        </div>
        
        <div class="theme-preview">
          <div class="preview-item" style="background-color: var(--el-color-primary)">主题色</div>
          <div class="preview-item" style="background-color: var(--el-color-success)">成功色</div>
          <div class="preview-item" style="background-color: var(--el-color-warning)">警告色</div>
          <div class="preview-item" style="background-color: var(--el-color-danger)">危险色</div>
          <div class="preview-item" style="background-color: var(--el-color-info)">信息色</div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="danger" @click="resetTheme">重置</el-button>
          <el-button type="primary" @click="saveTheme">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useThemeStore } from '@/stores/theme';
import type { ThemeColors } from '@/stores/theme';
import { Sunny, Moon, Monitor, Setting } from '@element-plus/icons-vue';

const themeStore = useThemeStore();
const dialogVisible = ref(false);

// 主题颜色
const themeColors = reactive<ThemeColors>({
  primary: themeStore.themeColors.primary,
  success: themeStore.themeColors.success,
  warning: themeStore.themeColors.warning,
  danger: themeStore.themeColors.danger,
  info: themeStore.themeColors.info
});

// 主题图标
const themeIcon = computed(() => {
  switch (themeStore.themeType) {
    case 'light':
      return Sunny;
    case 'dark':
      return Moon;
    case 'system':
      return Monitor;
    default:
      return themeStore.currentTheme === 'dark' ? Moon : Sunny;
  }
});

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (command === 'customize') {
    // 打开主题设置对话框
    dialogVisible.value = true;
  } else {
    // 设置主题
    themeStore.setTheme(command as 'light' | 'dark' | 'system');
  }
};

// 更新主题颜色
const updateThemeColors = () => {
  themeStore.setThemeColors(themeColors);
};

// 保存主题设置
const saveTheme = () => {
  themeStore.setThemeColors(themeColors);
  dialogVisible.value = false;
};

// 重置主题设置
const resetTheme = () => {
  themeStore.resetTheme();
  
  // 更新本地颜色变量
  themeColors.primary = themeStore.themeColors.primary;
  themeColors.success = themeStore.themeColors.success;
  themeColors.warning = themeStore.themeColors.warning;
  themeColors.danger = themeStore.themeColors.danger;
  themeColors.info = themeStore.themeColors.info;
};
</script>

<style scoped>
.theme-switcher {
  display: inline-block;
}

.theme-button {
  font-size: 18px;
  color: var(--el-text-color-primary);
  background-color: transparent;
  border: none;
  transition: all 0.3s;
}

.theme-button:hover {
  color: var(--el-color-primary);
  background-color: var(--el-fill-color-light);
}

:deep(.el-dropdown-menu__item.active) {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 8px;
}

/* 主题设置样式 */
.theme-settings {
  padding: 10px;
}

.theme-settings h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.theme-mode-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.theme-mode-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: 10px;
  border-radius: 4px;
}

.theme-mode-item:hover {
  background-color: var(--el-fill-color-light);
}

.theme-mode-item.active {
  background-color: var(--el-color-primary-light-9);
}

.theme-mode-preview {
  width: 100px;
  height: 70px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
  margin-bottom: 8px;
  position: relative;
}

.light-preview {
  background-color: #f5f7fa;
}

.dark-preview {
  background-color: #1a1a1a;
}

.system-preview {
  background: linear-gradient(to right, #f5f7fa 50%, #1a1a1a 50%);
}

.preview-header {
  height: 15px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.dark-preview .preview-header {
  background-color: #252525;
  border-color: #363637;
}

.system-preview .preview-header {
  background: linear-gradient(to right, #fff 50%, #252525 50%);
  border-color: #e4e7ed;
}

.preview-sidebar {
  position: absolute;
  left: 0;
  top: 15px;
  bottom: 0;
  width: 20px;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
}

.dark-preview .preview-sidebar {
  background-color: #252525;
  border-color: #363637;
}

.system-preview .preview-sidebar {
  background: linear-gradient(to right, #fff 50%, #252525 50%);
  border-color: #e4e7ed;
}

.preview-content {
  position: absolute;
  left: 20px;
  top: 15px;
  right: 0;
  bottom: 0;
  background-color: #f5f7fa;
}

.dark-preview .preview-content {
  background-color: #1a1a1a;
}

.system-preview .preview-content {
  background: linear-gradient(to right, #f5f7fa 50%, #1a1a1a 50%);
}

.color-picker-section {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.color-picker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.color-label {
  margin-bottom: 5px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.theme-preview {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.preview-item {
  flex: 1;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .theme-mode-selector {
    flex-direction: column;
    gap: 10px;
  }
  
  .theme-mode-item {
    flex-direction: row;
    justify-content: flex-start;
    gap: 10px;
  }
  
  .theme-mode-preview {
    width: 60px;
    height: 40px;
    margin-bottom: 0;
  }
  
  .color-picker-section {
    justify-content: space-between;
  }
  
  .theme-preview {
    flex-direction: column;
  }
  
  .preview-item {
    height: 30px;
  }
}
</style>
