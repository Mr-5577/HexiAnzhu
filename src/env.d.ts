// src/env.d.ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 为 .vue 文件添加类型声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 其他文件类型声明（可选）
declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.bmp'
declare module '*.tiff'

interface ImportMetaEnv {
  // 基础配置
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  
  // API 配置
  readonly VITE_API_BASE_URL: string
  readonly VITE_UPLOAD_URL: string
  
  // 功能开关
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_ENABLE_MOCK: string
  
  // Vite 内置
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}