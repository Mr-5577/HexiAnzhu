// 应用配置对象
export const config = {
  // API 配置 - 完全依赖环境变量
  get apiBaseUrl(): string {
    if (!import.meta.env.VITE_API_BASE_URL) {
      console.warn("VITE_API_BASE_URL 未配置，使用默认值");
      return "http://localhost:8080/api";
    }
    return import.meta.env.VITE_API_BASE_URL;
  },

  get uploadUrl(): string {
    if (!import.meta.env.VITE_UPLOAD_URL) {
      console.warn("VITE_UPLOAD_URL 未配置，使用默认值");
      return "http://localhost:8080/upload";
    }
    return import.meta.env.VITE_UPLOAD_URL;
  },

  // 应用信息
  get appTitle(): string {
    return import.meta.env.VITE_APP_TITLE || "My Project";
  },

  get appVersion(): string {
    return import.meta.env.VITE_APP_VERSION || "1.0.0";
  },

  // 环境标识
  get isDev(): boolean {
    return import.meta.env.MODE === "development";
  },

  get isProd(): boolean {
    return import.meta.env.MODE === "production";
  },

  get isStaging(): boolean {
    return import.meta.env.MODE === "staging";
  },

  get isTest(): boolean {
    return import.meta.env.MODE === "test";
  },

  get mode(): string {
    return import.meta.env.MODE || "development";
  },

  // 功能开关
  get enableDebug(): boolean {
    return import.meta.env.VITE_ENABLE_DEBUG === "true";
  },

  get enableMock(): boolean {
    return import.meta.env.VITE_ENABLE_MOCK === "true";
  },
};

// ================================ 工具函数 ===============================

// API 相关
export const getApiBaseUrl = (): string => config.apiBaseUrl;

export const getFullApiUrl = (endpoint: string): string => {
  const base = config.apiBaseUrl.replace(/\/$/, "");
  const path = endpoint.replace(/^\//, "");
  return `${base}/${path}`;
};

export const getUploadUrl = (): string => config.uploadUrl;

// 应用信息
export const getAppTitle = (): string => config.appTitle;
export const getAppVersion = (): string => config.appVersion;

// 环境判断
export const isDevelopment = (): boolean => config.isDev;
export const isProduction = (): boolean => config.isProd;
export const isStaging = (): boolean => config.isStaging;
export const isTest = (): boolean => config.isTest;
export const getCurrentMode = (): string => config.mode;

// 功能开关
export const isDebugEnabled = (): boolean => config.enableDebug;
export const isMockEnabled = (): boolean => config.enableMock;

// 环境描述
export const getEnvironmentName = (): string => {
  return config.mode;
};

export const getEnvironmentDisplayName = (): string => {
  switch (config.mode) {
    case "development":
      return "开发环境";
    case "production":
      return "生产环境";
    case "staging":
      return "预发布环境";
    case "test":
      return "测试环境";
    default:
      return "未知环境";
  }
};

// 获取环境颜色（用于 UI 显示）
export const getEnvironmentColor = (): string => {
  switch (config.mode) {
    case "development":
      return "#1677ff"; // 蓝色
    case "production":
      return "#52c41a"; // 绿色
    case "staging":
      return "#fa8c16"; // 橙色
    case "test":
      return "#722ed1"; // 紫色
    default:
      return "#8c8c8c"; // 灰色
  }
};

// 默认导出
export default config;
