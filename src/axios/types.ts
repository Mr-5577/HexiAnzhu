// API 响应基础类型
export interface ResponseData<T = any> {
  code: number;
  message: string;
  data: T;
  success?: boolean;
}

// 分页参数
export interface PageParams {
  page: number;
  pageSize: number;
  [key: string]: any;
}

// 分页响应
export interface PageResponse<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  pages?: number;
}

// 文件上传响应
export interface UploadResponse {
  url: string;
  name: string;
  size: number;
  type: string;
}

// 导出文件参数
export interface ExportParams {
  filename?: string;
  method?: "get" | "post";
  data?: any;
  onProgress?: (progress: number) => void;
}

// 错误响应
export interface ErrorResponse {
  code: number;
  message: string;
  timestamp?: string;
  path?: string;
}
