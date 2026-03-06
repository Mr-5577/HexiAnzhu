/**
 * TypeScript 类型判断工具函数库
 * 提供一系列类型检查工具函数，使用 Object.prototype.toString 进行精确类型判断
 */

const toString = Object.prototype.toString;

/**
 * 精确类型判断
 * @param val - 要判断的值
 * @param type - 期望的类型名称，如 'String', 'Number', 'Object' 等
 * @returns 是否为指定类型
 */
export const is = (val: unknown, type: string) => {
  return toString.call(val) === `[object ${type}]`;
};

/**
 * 判断值是否已定义（非 undefined）
 * @param val - 要判断的值
 * @returns 是否已定义
 */
export const isDef = <T = unknown>(val?: T): val is T => {
  return typeof val !== "undefined";
};

/**
 * 判断值是否未定义（undefined）
 * @param val - 要判断的值
 * @returns 是否未定义
 */
export const isUnDef = <T = unknown>(val?: T): val is T => {
  return !isDef(val);
};

/**
 * 判断是否为普通对象（不包括 null、数组、日期等）
 * @param val - 要判断的值
 * @returns 是否为普通对象
 */
export const isObject = (val: any): val is Record<any, any> => {
  return val !== null && is(val, "Object");
};

/**
 * 判断值是否为空
 * 支持数组、字符串、Map、Set、对象等类型
 * @param val - 要判断的值
 * @returns 是否为空
 */
export const isEmpty = <T = unknown>(val: T): val is T => {
  if (isArray(val) || isString(val)) {
    return val.length === 0;
  }

  if (val instanceof Map || val instanceof Set) {
    return val.size === 0;
  }

  if (isObject(val)) {
    return Object.keys(val).length === 0;
  }

  return false;
};

/**
 * 判断是否为 Date 对象
 * @param val - 要判断的值
 * @returns 是否为 Date 对象
 */
export const isDate = (val: unknown): val is Date => {
  return is(val, "Date");
};

/**
 * 判断是否为 null
 * @param val - 要判断的值
 * @returns 是否为 null
 */
export const isNull = (val: unknown): val is null => {
  return val === null;
};

/**
 * 判断是否为 null 且未定义
 * @param val - 要判断的值
 * @returns 是否为 null 或 undefined
 */
export const isNullAndUnDef = (val: unknown): val is null | undefined => {
  return isUnDef(val) && isNull(val);
};

/**
 * 判断是否为 null 或未定义
 * @param val - 要判断的值
 * @returns 是否为 null 或 undefined
 */
export const isNullOrUnDef = (val: unknown): val is null | undefined => {
  return isUnDef(val) || isNull(val);
};

/**
 * 判断是否为数字类型（包括 NaN）
 * @param val - 要判断的值
 * @returns 是否为 Number 类型
 */
export const isNumber = (val: unknown): val is number => {
  return is(val, "Number");
};

/**
 * 判断是否为 Promise 对象
 * @param val - 要判断的值
 * @returns 是否为 Promise
 */
export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return (
    is(val, "Promise") &&
    isObject(val) &&
    isFunction(val.then) &&
    isFunction(val.catch)
  );
};

/**
 * 判断是否为字符串类型
 * @param val - 要判断的值
 * @returns 是否为字符串
 */
export const isString = (val: unknown): val is string => {
  return is(val, "String");
};

/**
 * 判断是否为函数
 * @param val - 要判断的值
 * @returns 是否为函数
 */
export const isFunction = (val: unknown): val is Function => {
  return typeof val === "function";
};

/**
 * 判断是否为布尔类型
 * @param val - 要判断的值
 * @returns 是否为布尔值
 */
export const isBoolean = (val: unknown): val is boolean => {
  return is(val, "Boolean");
};

/**
 * 判断是否为正则表达式
 * @param val - 要判断的值
 * @returns 是否为正则表达式
 */
export const isRegExp = (val: unknown): val is RegExp => {
  return is(val, "RegExp");
};

/**
 * 判断是否为数组
 * @param val - 要判断的值
 * @returns 是否为数组
 */
export const isArray = (val: any): val is Array<any> => {
  return val && Array.isArray(val);
};

/**
 * 判断是否为 Window 对象
 * @param val - 要判断的值
 * @returns 是否为 Window 对象
 */
export const isWindow = (val: any): val is Window => {
  return typeof window !== "undefined" && is(val, "Window");
};

/**
 * 判断是否为 DOM 元素
 * @param val - 要判断的值
 * @returns 是否为 DOM 元素
 */
export const isElement = (val: unknown): val is Element => {
  return isObject(val) && !!val.tagName;
};

/**
 * 判断是否为 Map 对象
 * @param val - 要判断的值
 * @returns 是否为 Map
 */
export const isMap = (val: unknown): val is Map<any, any> => {
  return is(val, "Map");
};

/**
 * 判断是否在服务端环境（Node.js）
 * @returns 是否为服务端环境
 */
export const isServer = typeof window === "undefined";

/**
 * 判断是否在客户端环境（浏览器）
 * @returns 是否为客户端环境
 */
export const isClient = !isServer;

/**
 * 判断是否为有效的 URL 字符串
 * @param path - 要判断的路径
 * @returns 是否为有效的 URL
 */
export const isUrl = (path: string): boolean => {
  try {
    new URL(path);
    return true;
  } catch (_error) {
    return false;
  }
};

/**
 * 判断是否为图片链接
 * 支持 http/https 链接和 data:image 格式的 base64 图片
 * @param path - 要判断的路径
 * @returns 是否为图片链接
 */
export const isImgPath = (path: string): boolean => {
  return /(https?:\/\/|data:image\/).*?\.(png|jpg|jpeg|gif|svg|webp|ico)/gi.test(
    path
  );
};

/**
 * 判断值是否为空值（空字符串、null、undefined）
 * 常用于表单验证场景
 * @param val - 要判断的值
 * @returns 是否为空值
 */
export const isEmptyVal = (val: any): boolean => {
  return val === "" || val === null || val === undefined;
};

/**
 * 判断是否为有效的数字（不是 NaN 且有限）
 * @param val - 要判断的值
 * @returns 是否为有效数字
 */
export const isValidNumber = (val: unknown): val is number => {
  return isNumber(val) && !isNaN(val) && isFinite(val);
};

/**
 * 判断是否为整数
 * @param val - 要判断的值
 * @returns 是否为整数
 */
export const isInteger = (val: unknown): val is number => {
  return isNumber(val) && Number.isInteger(val);
};

/**
 * 判断是否为浮点数
 * @param val - 要判断的值
 * @returns 是否为浮点数
 */
export const isFloat = (val: unknown): val is number => {
  return (
    isNumber(val) && !Number.isInteger(val) && !isNaN(val) && isFinite(val)
  );
};

/**
 * 判断是否为有效的手机号码格式
 * @param phone - 要判断的手机号
 * @returns 是否为有效的手机号
 */
export const isPhoneNumber = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};

/**
 * 判断是否为有效的邮箱格式
 * @param email - 要判断的邮箱
 * @returns 是否为有效的邮箱
 */
export const isEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * 判断是否为身份证号码格式
 * @param idCard - 要判断的身份证号
 * @returns 是否为身份证号码
 */
export const isIdCard = (idCard: string): boolean => {
  return /^\d{17}[\dXx]$/.test(idCard);
};
