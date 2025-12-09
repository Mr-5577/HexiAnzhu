/**
 * @name 防抖函数 - 在等待时间内只执行最后一次调用
 * @param func 要防抖的函数
 * @param wait 等待时间(毫秒)，默认300ms
 * @param immediate 是否立即执行，默认false
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let result: any;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    // 如果存在定时器，清除它
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      // 立即执行模式
      const callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
      if (callNow) result = func.apply(context, args);
    } else {
      // 延迟执行模式
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    }
    return result;
  };
}

/**
 * @name 节流函数 - 在指定时间内只执行一次调用
 * @param func 要节流的函数
 * @param limit 时间限制(毫秒)，默认300ms
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastResult: any;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func.apply(context, args);
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }

    return lastResult;
  };
}

/**
 * @name 深度克隆对象或数组
 * @param obj 要克隆的对象
 * @param cache 缓存Map，用于处理循环引用
 * @returns 克隆后的新对象
 */
export function deepClone<T>(obj: T, cache = new WeakMap()): T {
  // 处理基本类型和函数
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  // 处理循环引用
  if (cache.has(obj as object)) {
    return cache.get(obj as object);
  }
  // 处理日期对象
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  // 处理数组
  if (obj instanceof Array) {
    const clonedArray = obj.map((item) =>
      deepClone(item, cache)
    ) as unknown as T;
    cache.set(obj as object, clonedArray);
    return clonedArray;
  }
  // 处理普通对象
  if (obj instanceof Object) {
    const clonedObj = {} as T;
    cache.set(obj as object, clonedObj);

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key], cache);
      }
    }

    return clonedObj;
  }
  // 其他类型直接返回
  return obj;
}

/**
 * @name 对象转换为URL参数字符串
 * @param obj 要转换的对象
 * @param encode 是否进行URL编码，默认true
 * @returns URL参数字符串
 */
export function objectToParams(
  obj: Record<string, any>,
  encode: boolean = true
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      const stringValue = String(value);
      params.append(
        key,
        encode ? encodeURIComponent(stringValue) : stringValue
      );
    }
  }

  return params.toString();
}

/**
 * 等待指定时间
 * @param ms 等待时间(毫秒)，默认1000ms
 * @returns Promise对象
 */
export function sleep(ms: number = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @name 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns 复制是否成功的Promise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // 使用现代剪贴板API
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 兼容旧版本浏览器的方案
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);

      return successful;
    }
  } catch (error) {
    console.error("复制到剪贴板失败:", error);
    return false;
  }
}

/**
 * @name 获取数据类型
 * @param value 要检测的值
 * @returns 数据类型的字符串表示
 */
export function getType(value: any): string {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

/**
 * @name 数组去重
 * @param array 要去重的数组
 * @param key 对象数组的去重键名（可选）
 * @returns 去重后的新数组
 */
export function unique<T>(array: T[], key?: string): T[] {
  if (!Array.isArray(array)) {
    return [];
  }

  if (key && array.length > 0 && typeof array[0] === "object") {
    const seen = new Set();
    return array.filter((item) => {
      const value = (item as any)[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  return [...new Set(array)];
}

/**
 * @name 数字千分位格式化
 * @param num 要格式化的数字
 * @param decimals 小数位数，默认2
 * @returns 格式化后的字符串
 */
export function formatNumber(
  num: number | string,
  decimals: number = 2
): string {
  const number = Number(num);
  if (isNaN(number)) return "0";

  const fixedNum = number.toFixed(decimals);
  const parts = fixedNum.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return parts.join(".");
}
