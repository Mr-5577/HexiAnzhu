import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ElMessage } from "element-plus";
import { saveAs } from "file-saver";

// 扩展 AxiosRequestConfig 类型
declare module "axios" {
  interface AxiosRequestConfig {
    // 是否显示错误消息
    showErrorMessage?: boolean;
    // 是否显示成功消息
    showSuccessMessage?: boolean;
    // 自定义错误消息
    errorMessage?: string;
    // 自定义成功消息
    successMessage?: string;
  }
}
// 创建 Axios 实例
const service = axios.create({
  baseURL: import.meta.env.PROD ? import.meta.env.VITE_APP_BASE_API : "/api", // url地址
  timeout: 15000, // 超时时间
  withCredentials: true, // 所有通过这个实例的请求都会自动携带 Cookie
});

// 请求队列，用于取消请求
const pendingRequests = new Map<string, (message: string) => void>();

// 生成请求的 key
function generateRequestKey(config: AxiosRequestConfig): string {
  const { method, url, params, data } = config;
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join("&");
}

// 从响应头中获取文件名
function getFilenameFromHeaders(headers: any): string {
  const contentDisposition =
    headers["content-disposition"] || headers["Content-Disposition"];
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    );
    if (filenameMatch && filenameMatch[1]) {
      let filename = filenameMatch[1].replace(/['"]/g, "");
      // 处理中文文件名编码问题
      if (filename.includes("%")) {
        try {
          filename = decodeURIComponent(filename);
        } catch (e) {
          console.warn("文件名解码失败:", e);
        }
      }
      // 移除可能包含的路径
      return filename.split("/").pop() || filename;
    }
  }
  return "";
}

// 检查是否是 JSON 错误响应
async function checkBlobError(blob: Blob): Promise<void> {
  if (blob.type === "application/json" || blob.size < 1024) {
    const text = await blob.text();
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || "导出文件失败");
    } catch (e) {
      // 如果不是 JSON，可能是其他错误信息
      if (text.includes("error") || text.includes("Error")) {
        throw new Error(text.slice(0, 100));
      }
    }
  }
}

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加 Token
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加请求时间戳，防止缓存
    if (config.method?.toLowerCase() === "get" && config.params) {
      config.params._t = Date.now();
    }

    // 检查并取消重复请求
    const requestKey = generateRequestKey(config);
    // if (pendingRequests.has(requestKey)) {
    //   pendingRequests.get(requestKey)!("取消重复请求");
    //   pendingRequests.delete(requestKey);
    // }

    config.cancelToken = new axios.CancelToken((cancel) => {
      pendingRequests.set(requestKey, cancel);
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 请求完成后，从 pendingRequests 中移除
    const requestKey = generateRequestKey(response.config);
    pendingRequests.delete(requestKey);

    // 如果是导出文件的响应，直接返回整个 response
    if (response.config.responseType === "blob") {
      return response;
    }

    const { data } = response;
    // 根据后端返回的 code 进行判断
    switch (data.code) {
      case 200:
        // 显示成功消息
        if (response.config.showSuccessMessage) {
          ElMessage.success(
            response.config.successMessage || data.message || "操作成功"
          );
        }
        return data;
      case 401:
        ElMessage.warning("登录已过期，请重新登录");
        localStorage.clear();
        sessionStorage.clear();
        // 跳转到登录页
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        return Promise.reject(new Error("未授权"));
      case 403:
        ElMessage.error("没有权限访问");
        return Promise.reject(new Error("禁止访问"));
      case 404:
        ElMessage.error("请求资源不存在");
        return Promise.reject(new Error("资源不存在"));
      case 500:
        ElMessage.error("服务器内部错误");
        return Promise.reject(new Error("服务器错误"));
      case 503:
        ElMessage.error("服务不可用");
        return Promise.reject(new Error("服务不可用"));
      default:
        if (data.code !== 200 && response.config.showErrorMessage !== false) {
          ElMessage.error(data.message || "请求失败");
        }
        return Promise.reject(new Error(data.message || "Error"));
    }
  },
  (error) => {
    // 请求完成后，从 pendingRequests 中移除
    if (error.config) {
      const requestKey = generateRequestKey(error.config);
      pendingRequests.delete(requestKey);
    }

    if (axios.isCancel(error)) {
      console.log("请求被取消:", error.message);
      return Promise.reject(error);
    }

    // 处理 blob 类型的错误响应
    if (
      error.config?.responseType === "blob" &&
      error.response?.data instanceof Blob
    ) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const errorData = JSON.parse(reader.result as string);
          ElMessage.error(errorData.message || "文件操作失败");
        } catch (e) {
          ElMessage.error("文件操作失败");
        }
      };
      reader.readAsText(error.response.data);
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.message || error.message;

      switch (status) {
        case 400:
          ElMessage.error(errorMessage || "请求参数错误");
          break;
        case 401:
          ElMessage.warning("登录已过期，请重新登录");
          localStorage.clear();
          sessionStorage.clear();
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
          break;
        case 403:
          ElMessage.error("没有权限访问");
          break;
        case 404:
          ElMessage.error("请求资源不存在");
          break;
        case 408:
          ElMessage.error("请求超时");
          break;
        case 500:
          ElMessage.error("服务器内部错误");
          break;
        case 502:
          ElMessage.error("网关错误");
          break;
        case 503:
          ElMessage.error("服务不可用");
          break;
        case 504:
          ElMessage.error("网关超时");
          break;
        default:
          if (error.config?.showErrorMessage !== false) {
            ElMessage.error(errorMessage || "网络错误");
          }
      }
    } else if (error.request) {
      ElMessage.error("网络连接失败，请检查网络");
    } else {
      ElMessage.error(error.message || "网络错误");
    }

    return Promise.reject(error);
  }
);

// 封装通用请求方法
export const http = {
  get<T = any>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return service.get(url, { params, ...config });
  },

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return service.post(url, data, config);
  },

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return service.put(url, data, config);
  },

  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return service.patch(url, data, config);
  },

  delete<T = any>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return service.delete(url, { params, ...config });
  },

  // 上传文件
  upload<T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return service.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...config,
    });
  },

  // 下载文件（直接下载）
  download(
    url: string,
    params?: any,
    filename?: string,
    config?: AxiosRequestConfig
  ): Promise<Blob> {
    return service
      .get(url, {
        params,
        responseType: "blob",
        ...config,
      })
      .then(async (response) => {
        const blob = response.data;

        // 检查是否是错误响应
        await checkBlobError(blob);

        const finalFilename =
          filename || getFilenameFromHeaders(response.headers) || "download";
        saveAs(blob, finalFilename);
        return blob;
      });
  },

  // 导出文件（支持 POST 请求和更复杂的参数）
  exportFile(
    url: string,
    data?: any,
    filename?: string,
    method: "get" | "post" = "post",
    config?: AxiosRequestConfig
  ): Promise<Blob> {
    const requestConfig: AxiosRequestConfig = {
      responseType: "blob",
      ...config,
    };

    let request: Promise<AxiosResponse>;

    if (method === "get") {
      request = service.get(url, { params: data, ...requestConfig });
    } else {
      request = service.post(url, data, requestConfig);
    }

    return request.then(async (response) => {
      const blob = response.data;

      // 检查是否是错误响应
      await checkBlobError(blob);

      const finalFilename =
        filename || getFilenameFromHeaders(response.headers) || "export";
      saveAs(blob, finalFilename);
      return blob;
    });
  },

  // 获取文件 Blob 对象（不直接下载，用于预览等场景）
  getFileBlob(
    url: string,
    params?: any,
    config?: AxiosRequestConfig
  ): Promise<Blob> {
    return service
      .get(url, {
        params,
        responseType: "blob",
        ...config,
      })
      .then(async (response) => {
        const blob = response.data;

        // 检查是否是错误响应
        await checkBlobError(blob);

        return blob;
      });
  },

  // 带进度回调的导出
  exportWithProgress(
    url: string,
    data: any,
    filename: string,
    onProgress?: (progress: number) => void,
    method: "get" | "post" = "post"
  ): Promise<Blob> {
    return service
      .request({
        url,
        method,
        data: method === "post" ? data : undefined,
        params: method === "get" ? data : undefined,
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(Math.round(progress));
          }
        },
      })
      .then(async (response) => {
        const blob = response.data;

        // 检查是否是错误响应
        await checkBlobError(blob);

        const finalFilename =
          filename || getFilenameFromHeaders(response.headers) || "export";
        saveAs(blob, finalFilename);
        return blob;
      });
  },
};

// 取消请求
export const cancelRequest = (key: string) => {
  if (pendingRequests.has(key)) {
    pendingRequests.get(key)!("手动取消请求");
    pendingRequests.delete(key);
  }
};

// 取消所有 pending 的请求
export const cancelAllRequests = () => {
  pendingRequests.forEach((cancel, key) => {
    cancel("取消所有请求");
    pendingRequests.delete(key);
  });
};

// 获取所有 pending 的请求
export const getPendingRequests = () => {
  return Array.from(pendingRequests.keys());
};

export default service;
