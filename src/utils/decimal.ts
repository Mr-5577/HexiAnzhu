import Decimal from "decimal.js";

/**
 * 安全创建 Decimal 实例
 * 自动处理 null/undefined/空字符串
 */
export const toDecimal = (value: any): Decimal => {
  if (value === null || value === undefined || value === "") {
    return new Decimal(0);
  }
  // 如果已经是 Decimal 实例，直接返回
  if (value instanceof Decimal) {
    return value;
  }
  // 统一转为字符串再创建，避免精度损失
  return new Decimal(String(value));
};
/**
 * 格式化数字带千分位（自定义小数位数）
 * @param value 数字
 * @param decimalPlaces 小数位数，默认2
 */
export const formatThousandWithPlaces = (value: any, decimalPlaces: number = 2): string => {
  const dec = toDecimal(value);
  const parts = dec.toFixed(decimalPlaces).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] || '0'.repeat(decimalPlaces);
  
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return `${formattedInteger}.${decimalPart}`;
};

/**
 * 格式化数字为两位小数（用于显示）
 */
export const formatDecimal = (value: any): string => {
  const dec = toDecimal(value);
  return dec.toFixed(2);
};

/**
 * 安全的加法
 */
export const decimalAdd = (a: any, b: any): Decimal => {
  return toDecimal(a).plus(toDecimal(b));
};

/**
 * 安全的加法并返回数字
 */
export const decimalAddNum = (a: any, b: any): number => {
  return decimalAdd(a, b).toNumber();
};

/**
 * 安全的求和（数组）
 */
export const decimalSum = (values: any[]): Decimal => {
  return values.reduce((sum, val) => sum.plus(toDecimal(val)), new Decimal(0));
};

/**
 * 安全的求和并返回数字
 */
export const decimalSumNum = (values: any[]): number => {
  return decimalSum(values).toNumber();
};

/**
 * 四舍五入到两位小数（返回数字）
 */
export const roundToTwo = (value: any): number => {
  return toDecimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
};
