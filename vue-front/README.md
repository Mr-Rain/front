# 基于智能推荐的校园招聘系统前端

基于 Vue3 + TypeScript + Pinia + Vite 开发的校园招聘系统前端部分，支持学生、企业、管理员三大角色，涵盖注册登录、信息完善、职位浏览与申请、面试反馈、企业岗位管理、智能推荐等核心功能。

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **状态管理**：Pinia
- **UI组件库**：Element Plus
- **构建工具**：Vite
- **HTTP客户端**：Axios
- **路由管理**：Vue Router
- **测试工具**：Vitest (单元测试) + Playwright (端到端测试)
- **代码规范**：ESLint + Prettier

## 项目结构

```
src/
├── api/                # 接口封装
├── assets/             # 静态资源
├── components/         # 通用/业务组件
├── layouts/            # 布局组件
├── router/             # 路由配置
├── stores/             # Pinia 状态管理
├── types/              # TS 类型定义
├── utils/              # 工具函数
├── views/              # 页面
└── App.vue, main.ts    # 入口文件
```

## 功能模块

- **认证模块**：登录、注册、找回密码
- **学生模块**：个人信息、简历管理、职位浏览、申请管理、智能推荐
- **企业模块**：企业信息、职位管理、申请处理
- **管理模块**：用户管理、企业审核、数据统计

## 开发环境设置

### 推荐的IDE设置

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (并禁用Vetur)。

### 项目设置

```sh
# 安装依赖
pnpm install

# 开发环境启动
pnpm dev

# 生产环境构建
pnpm build

# 预览生产构建
pnpm preview
```

## 测试

### 单元测试 (Vitest)

```sh
# 运行单元测试
pnpm test:unit

# 运行单元测试并生成覆盖率报告
pnpm test:unit:coverage
```

### 端到端测试 (Playwright)

```sh
# 首次运行需安装浏览器
npx playwright install

# 运行所有端到端测试
pnpm test:e2e

# 使用UI模式运行测试
pnpm test:e2e:ui

# 仅在Chromium上运行测试
pnpm test:e2e --project=chromium

# 运行特定测试文件
pnpm test:e2e e2e/auth.spec.ts
```

### 运行所有测试

```sh
pnpm test
```

## 代码规范

```sh
# 运行ESLint检查并自动修复
pnpm lint

# 使用Prettier格式化代码
pnpm format
```

## 项目文档

详细的项目文档请参考 `开发须知` 目录下的文件：

- `前端项目开发大纲.md`：项目结构与开发规范
- `前端开发实施文档.md`：开发流程与任务拆解
- `前端开发进度记录.md`：开发进度与完成情况

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个 Pull Request

## 许可证

[MIT](LICENSE)
