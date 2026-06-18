/**
 * 常用正则表达式
 */

// 手机号正则（中国大陆）
export const phoneRegex = /^1[3-9]\d{9}$/;

// 邮箱正则
export const emailRegex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

// 统一社会信用代码正则（18位数字或大写字母）
export const uscRegex = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;

// 身份证正则（15+18位 严格版）
export const idCardRegex =
  /^([1-9]\d{5}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}|[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx])$/;

// 数字正则（正整数）
export const numberRegex = /^\d+$/;

// 金额正则（最多两位小数）
export const amountRegex = /^\d+(\.\d{1,2})?$/;

// 网址URL正则
export const urlRegex =
  /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

// 邮政编码正则
export const postalCodeRegex = /^[1-9]\d{5}$/;

// 传真号码正则
export const faxRegex = /^(\d{3,4}-)?\d{7,8}$/;

// 银行卡号正则（16-19位数字）
export const bankCardRegex = /^\d{16,19}$/;

// 增值税号正则
export const taxNoRegex =
  /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;

// 汉字正则
export const chineseRegex = /^[\u4e00-\u9fa5]+$/;

// 字母数字下划线
export const alphanumericUnderscoreRegex = /^\w+$/;

// IP地址正则
export const ipRegex =
  /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
