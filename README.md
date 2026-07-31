# HexiAnzhu 项目说明

本项目基于 Vue 3 + TypeScript + Vite 开发，包含 Element Plus、Pinia、Axios、ECharts 等常用前端依赖，支持多环境构建与预览。

## 技术栈
- 框架: Vue 3 + Composition API
- 构建工具: Vite 5
- 语言: TypeScript 5.x
- UI 框架: Element Plus（按需引入）
- 状态管理: Pinia
- HTTP 请求: Axios
- 图表: ECharts
- 其他: unplugin-icons、unplugin-vue-components、vue-router
- 包管理器: npm
- 运行环境: Node.js 22.20.0+

## 快速开始
```bash
npm install
npm run dev
```

默认开发服务器地址:
```text
http://localhost:3000
```

## npm 脚本说明
- `npm run dev`
  - 启动本地开发服务器，默认使用 `development` 模式
- `npm run build`
  - 进行类型检查后构建生产包
- `npm run build:dev`
  - 以 `development` 模式构建
- `npm run build:test`
  - 以 `test` 模式构建
- `npm run build:staging`
  - 以 `staging` 模式构建
- `npm run build:prod`
  - 以 `production` 模式构建
- `npm run preview`
  - 预览生产构建包
- `npm run preview:dev`
  - 预览 `development` 模式构建包
- `npm run preview:staging`
  - 预览 `staging` 模式构建包
- `npm run preview:prod`
  - 预览 `production` 模式构建包
- `npm run type-check`
  - 仅执行 TypeScript 类型检查，不输出构建产物

## 构建输出
- 构建目录根据当前模式输出到 `dist-{mode}`，例如：
  - `dist-development`
  - `dist-test`
  - `dist-staging`
  - `dist-production`
- `production` 模式下会为资源文件生成带时间戳的输出文件名，便于缓存控制。

## 开发环境配置
Vite 默认开发服务器配置：
- 端口: `3000`
- 自动打开浏览器: `true`
- 代理配置: `/api` 转发到 `http://192.168.1.200:8091`
  - 代理同时支持跨域和 websocket
  - 请求路径会去掉 `/api` 前缀

## 常用目录说明
- `src/api` - 接口请求封装
- `src/assets` - 静态资源
- `src/components` - 公共组件
- `src/composables` - 复用逻辑函数
- `src/constants` - 常量定义
- `src/directives` - 自定义指令
- `src/layouts` - 布局组件
- `src/router` - 路由配置
- `src/stores` - Pinia 状态管理
- `src/types` - TypeScript 类型声明
- `src/utils` - 工具函数
- `src/views` - 页面视图

## 其他说明
- 本项目使用 `vue-tsc` 进行类型检查。
- 若需要修改代理目标地址，可在 `vite.config.ts` 中调整 `server.proxy` 配置。
- 若使用 Git 管理，请在提交前检查代码格式和类型。

## 推荐浏览器
建议使用最新版本的 Chrome / Edge / Firefox 进行开发与调试。
