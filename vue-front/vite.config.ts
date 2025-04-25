import { fileURLToPath, URL } from 'node:url'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression2'
import { VitePWA } from 'vite-plugin-pwa'

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
    VitePWA({ // PWA 配置
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: '校园招聘系统',
        short_name: '校招系统',
        description: '校园招聘系统 - 连接学生与企业的桥梁',
        theme_color: '#4c8dff',
        background_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Service Worker 配置
        runtimeCaching: [
          {
            // 缓存API请求
            urlPattern: /^https:\/\/api\.example\.com\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1天
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // 缓存图片资源
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
              }
            }
          },
          {
            // 缓存字体资源
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90天
              }
            }
          },
          {
            // 缓存CSS和JS资源
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7天
              }
            }
          },
          {
            // 缓存其他静态资源
            urlPattern: /\.(?:json|xml)$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'other-resources',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1天
              }
            }
          }
        ],
        // 预缓存列表
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg}'
        ],
        // 不缓存的资源
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/admin\//
        ]
      }
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
