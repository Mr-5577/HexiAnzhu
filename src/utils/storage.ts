// Cookie 管理器
class CookieManager {
  // 设置 Cookie
  setItem(key: string, value: any, days = 7): void {
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

      const cookieValue = encodeURIComponent(JSON.stringify(value));
      document.cookie = `${key}=${cookieValue};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    } catch (error) {
      console.error("设置 Cookie 失败:", error);
    }
  }

  // 获取 Cookie
  getItem(key: string): any {
    try {
      const name = key + "=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const ca = decodedCookie.split(";");

      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
          const cookieValue = c.substring(name.length, c.length);
          return JSON.parse(cookieValue);
        }
      }
      return null;
    } catch (error) {
      console.error("读取 Cookie 失败:", error);
      return null;
    }
  }

  // 删除 Cookie
  removeItem(key: string): void {
    try {
      document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    } catch (error) {
      console.error("删除 Cookie 失败:", error);
    }
  }

  // 获取所有 Cookie 键名
  getAllKeys(): string[] {
    try {
      const cookies = document.cookie.split(";");
      return cookies.map((cookie) => {
        const eqPos = cookie.indexOf("=");
        return eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      });
    } catch (error) {
      console.error("获取 Cookie 键名失败:", error);
      return [];
    }
  }
}

export const cookieManager = new CookieManager();

export enum StorageType {
  LOCAL = "local",
  SESSION = "session",
  COOKIE = "cookie",
}

class StorageManager {
  private storage: Storage | null = null;
  private type: StorageType;

  constructor(type: StorageType = StorageType.SESSION) {
    this.type = type;

    if (type === StorageType.LOCAL) {
      this.storage = localStorage;
    } else if (type === StorageType.SESSION) {
      this.storage = sessionStorage;
    }
    // Cookie 类型不需要设置 storage
  }

  // 设置存储项
  setItem(key: string, value: any, options?: { expires?: number }): void {
    try {
      if (this.storage) {
        this.storage.setItem(key, JSON.stringify(value));
      } else if (this.type === StorageType.COOKIE) {
        const days = options?.expires || 7;
        cookieManager.setItem(key, value, days);
      }
    } catch (error) {
      console.error(`存储到 ${this.type} 失败:`, error);
      // 降级处理
      this.fallbackToCookie(key, value, options);
    }
  }

  // 获取存储项
  getItem(key: string): any {
    try {
      if (this.storage) {
        const item = this.storage.getItem(key);
        return item ? JSON.parse(item) : null;
      } else if (this.type === StorageType.COOKIE) {
        return cookieManager.getItem(key);
      }
      return null;
    } catch (error) {
      console.error(`从 ${this.type} 读取失败:`, error);
      return null;
    }
  }

  // 删除存储项
  removeItem(key: string): void {
    try {
      if (this.storage) {
        this.storage.removeItem(key);
      }
      // 同时清理 Cookie 中的对应项
      cookieManager.removeItem(key);
    } catch (error) {
      console.error(`从 ${this.type} 删除失败:`, error);
    }
  }

  // 清空所有存储项
  clear(): void {
    try {
      if (this.storage) {
        this.storage.clear();
      }
      // 清理所有相关 Cookie
      this.clearAllCookies();
    } catch (error) {
      console.error(`清空 ${this.type} 失败:`, error);
    }
  }

  // 获取所有键名
  getAllKeys(): string[] {
    try {
      if (this.storage) {
        return Object.keys(this.storage);
      } else if (this.type === StorageType.COOKIE) {
        return cookieManager.getAllKeys();
      }
      return [];
    } catch (error) {
      console.error(`获取 ${this.type} 键名失败:`, error);
      return [];
    }
  }

  // 检查是否支持该存储类型
  isSupported(): boolean {
    try {
      if (this.storage) {
        const testKey = "__storage_test__";
        this.storage.setItem(testKey, "test");
        this.storage.removeItem(testKey);
        return true;
      }
      return true; // Cookie 总是支持的
    } catch {
      return false;
    }
  }

  // 降级到 Cookie
  private fallbackToCookie(
    key: string,
    value: any,
    options?: { expires?: number }
  ): void {
    console.warn(`存储降级到 Cookie: ${key}`);
    const days = options?.expires || 7;
    cookieManager.setItem(key, value, days);
  }

  // 清空所有 Cookie
  private clearAllCookies(): void {
    try {
      const cookies = cookieManager.getAllKeys();
      cookies.forEach((cookie) => {
        cookieManager.removeItem(cookie);
      });
    } catch (error) {
      console.error("清空 Cookie 失败:", error);
    }
  }
}

// 创建不同的存储实例
export const sessionStorageManager = new StorageManager(StorageType.SESSION);
export const localStorageManager = new StorageManager(StorageType.LOCAL);
export const cookieStorageManager = new StorageManager(StorageType.COOKIE);
