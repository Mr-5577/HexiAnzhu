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
 * @name 格式化数值（返回数字类型）
 * @description 将输入值格式化为指定小数位数的数字，支持不同的舍入模式
 * @param value - 要格式化的值（支持数字、字符串、null、undefined）
 * @param decimals - 保留小数位数，默认2位
 * @param rounding - 舍入模式：round（四舍五入，默认）、floor（向下取整）、ceil（向上取整）
 * @returns 格式化后的数字，如果输入无效则返回0
 * @example formatNumber(1234567.891) // 1234567.89
 * @example formatNumber(1234567.895) // 1234567.90
 * @example formatNumber(null) // 0
 * @example formatNumber('abc') // 0
 * @example formatNumber(1234567.891, 0) // 1234568
 * @example formatNumber(1234567.891, 4) // 1234567.8910
 * @example formatNumber(123.456, 2, 'floor') // 123.45（向下取整）
 * @example formatNumber(123.451, 2, 'ceil') // 123.46（向上取整）
 */
export const formatNumber = (
  value: any,
  decimals: number = 2,
  rounding: "round" | "floor" | "ceil" = "round"
): number => {
  // 处理空值
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  // 转换为数字
  const num = Number(value);
  // 处理非数字值
  if (isNaN(num)) {
    return 0;
  }

  const factor = Math.pow(10, decimals);

  // 根据舍入模式处理
  switch (rounding) {
    case "floor": // 向下取整（截断）
      return Math.floor(num * factor) / factor;
    case "ceil": // 向上取整
      return Math.ceil(num * factor) / factor;
    case "round": // 四舍五入（默认）
    default:
      return Math.round(num * factor) / factor;
  }
};

/**
 * @name 格式化数值,带千分位分隔符（字符串）
 * @param value - 要格式化的值
 * @param decimals - 保留小数位数，默认2位
 * @param nullText - 空值显示文本，默认'0.00'
 * @returns 格式化后的字符串（带千分位）
 * @example formatNumberDisplay(1234567.891) // "1,234,567.89" (string)
 * @example formatNumberDisplay(1234567.891, 2, '暂无') // "1,234,567.89" (string)
 * @example formatNumberDisplay(null) // "0" (string)
 * @example formatNumberDisplay('') // "0" (string)
 * @example formatNumberDisplay('abc') // "0" (string)
 */
export const formatNumberDisplay = (
  value: any,
  decimals: number = 2,
  nullText: string = "0"
): string => {
  // 转成number类型
  const num = formatNumber(value, decimals);
  // 如果结果是0且原始值是空值，返回自定义文本
  if (num === 0 && (value === null || value === undefined || value === "")) {
    return nullText;
  }
  // 使用 Intl.NumberFormat 添加千分位
  if (typeof Intl !== "undefined" && Intl.NumberFormat) {
    try {
      return new Intl.NumberFormat("zh-CN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: true,
      }).format(num);
    } catch (error) {
      // 降级处理
      return fallbackFormatDisplay(num, decimals);
    }
  }

  // 降级方案
  return fallbackFormatDisplay(num, decimals);
};

/**
 * 降级显示格式化
 */
const fallbackFormatDisplay = (num: number, decimals: number): string => {
  const fixedNum = num.toFixed(decimals);
  const [integerPart, decimalPart] = fixedNum.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimals > 0 ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};
