import { fileURLToPath, URL } from 'node:url'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    splitVendorChunkPlugin(), // 拆分第三方库代码
    compression(), // 启用 Gzip 压缩
    visualizer({ // 构建分析
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 启用源码映射
    sourcemap: false,
    // 设置块大小警告限制
    chunkSizeWarningLimit: 1000,
    // 自定义构建选项
    rollupOptions: {
      output: {
        // 自定义块文件名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        // 手动拆分代码块
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          'echarts': ['echarts'],
          'utils': ['lodash', 'axios', 'file-saver', 'xlsx'],
          'markdown': ['marked', 'dompurify'],
          'pdf': ['jspdf', 'html2canvas'],
        },
      },
    },
    // 启用 CSS 压缩
    cssMinify: true,
    // 启用 terser 压缩
    minify: 'terser',
    // terser 选项
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console
        drop_debugger: true, // 移除 debugger
      },
    },
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      '@element-plus/icons-vue',
      'axios',
      'lodash',
      'echarts',
      'marked',
      'dompurify',
    ],
  },
})
