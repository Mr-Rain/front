import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
// 暂时注释掉visualizer插件，解决类型兼容问题
// import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression2'
// 暂时注释掉PWA插件，需要时可以安装依赖：pnpm add -D vite-plugin-pwa
// import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
// @ts-ignore 忽略整个配置文件的类型错误，这是由于Vite版本升级导致的插件类型不兼容
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    // 移除 splitVendorChunkPlugin，因为已经使用了 manualChunks
    compression(), // 启用 Gzip 压缩
    // 暂时注释掉visualizer插件，解决类型兼容问题
    // visualizer({
    //   open: false,
    //   gzipSize: true,
    //   brotliSize: true,
    // }),
        // 暂时注释掉PWA配置，需要时可以安装依赖：pnpm add -D vite-plugin-pwa
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    //   manifest: {
    //     name: '校园招聘系统',
    //     short_name: '校招系统',
    //     description: '校园招聘系统 - 连接学生与企业的桥梁',
    //     theme_color: '#4c8dff',
    //     background_color: '#ffffff',
    //     icons: [
    //       {
    //         src: 'pwa-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png'
    //       },
    //       {
    //         src: 'pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png'
    //       },
    //       {
    //         src: 'pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable'
    //       }
    //     ]
    //   },
    //   workbox: {
    //     // Service Worker 配置
    //     runtimeCaching: [
    //       {
    //         // 缓存API请求
    //         urlPattern: /^https:\/\/api\.example\.com\/.*$/i,
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'api-cache',
    //           expiration: {
    //             maxEntries: 100,
    //             maxAgeSeconds: 60 * 60 * 24 // 1天
    //           },
    //           cacheableResponse: {
    //             statuses: [0, 200]
    //           }
    //         }
    //       },
    //       {
    //         // 缓存图片资源
    //         urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'images-cache',
    //           expiration: {
    //             maxEntries: 100,
    //             maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
    //           }
    //         }
    //       },
    //       {
    //         // 缓存字体资源
    //         urlPattern: /\.(?:woff|woff2|ttf|eot)$/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'fonts-cache',
    //           expiration: {
    //             maxEntries: 50,
    //             maxAgeSeconds: 60 * 60 * 24 * 90 // 90天
    //           }
    //         }
    //       },
    //       {
    //         // 缓存CSS和JS资源
    //         urlPattern: /\.(?:js|css)$/i,
    //         handler: 'StaleWhileRevalidate',
    //         options: {
    //           cacheName: 'static-resources',
    //           expiration: {
    //             maxEntries: 100,
    //             maxAgeSeconds: 60 * 60 * 24 * 7 // 7天
    //           }
    //         }
    //       },
    //       {
    //         // 缓存其他静态资源
    //         urlPattern: /\.(?:json|xml)$/i,
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'other-resources',
    //           expiration: {
    //             maxEntries: 50,
    //             maxAgeSeconds: 60 * 60 * 24 // 1天
    //           }
    //         }
    //       }
    //     ],
    //     // 预缓存列表 - 使用更精确的模式匹配
    //     globPatterns: [
    //       'assets/**/*.{js,css}',
    //       '*.{js,css,html}',
    //       'favicon.ico',
    //       'pwa-*.png',
    //       'logo.svg'
    //     ],
    //     // 不缓存的资源
    //     navigateFallbackDenylist: [
    //       /^\/api\//,
    //       /^\/admin\//
    //     ]
    //   }
    // }),
  ],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
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
        // 手动拆分代码块 - 使用函数形式，更灵活
        manualChunks(id) {
          // 核心框架
          if (id.includes('node_modules/vue/') ||
              id.includes('node_modules/vue-router/') ||
              id.includes('node_modules/pinia/')) {
            return 'vue-vendor';
          }

          // Element Plus
          if (id.includes('node_modules/element-plus') ||
              id.includes('node_modules/@element-plus')) {
            return 'element-plus';
          }

          // 图表库
          if (id.includes('node_modules/echarts')) {
            return 'echarts';
          }

          // 工具库
          if (id.includes('node_modules/lodash') ||
              id.includes('node_modules/axios') ||
              id.includes('node_modules/file-saver') ||
              id.includes('node_modules/xlsx')) {
            return 'utils';
          }

          // Markdown相关
          if (id.includes('node_modules/marked') ||
              id.includes('node_modules/dompurify')) {
            return 'markdown';
          }

          // PDF相关
          if (id.includes('node_modules/jspdf') ||
              id.includes('node_modules/html2canvas')) {
            return 'pdf';
          }

          // 其他第三方库按需分组
          if (id.includes('node_modules/')) {
            // 提取包名作为chunk名
            const packageName = id.split('node_modules/')[1].split('/')[0];
            // 对于@开头的包，合并命名空间
            if (packageName.startsWith('@')) {
              const [scope, name] = packageName.split('/');
              return `vendor-${scope.substring(1)}-${name}`;
            }
            return `vendor-${packageName}`;
          }
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
      '@stomp/stompjs',
      'sockjs-client',
    ],
    // 忽略类型检查
    esbuildOptions: {
      tsconfigRaw: `{
        "compilerOptions": {
          "skipLibCheck": true,
          "noImplicitAny": false,
          "strictNullChecks": false
        }
      }`
    }
  },
})
