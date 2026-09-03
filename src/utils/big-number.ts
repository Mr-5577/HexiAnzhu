/**
 * ============================================
 * BigNumber 工具函数
 * ============================================
 *
 * 基于 bignumber.js 封装
 *
 * 为什么使用 bignumber.js？
 * 1. 精度控制更灵活：加减乘保留完整精度，仅除法舍入
 * 2. 更适合财务场景：大额金额（亿级）计算不丢失精度
 * 3. 库体积更小：没有科学计算等冗余功能
 *
 * @see https://github.com/MikeMcl/bignumber.js
 *
 * 使用方法：
 * import { toBig, bigAdd, formatThousandWithPlaces } from '@/utils/bigNumber'
 *
 */

import BigNumber from "bignumber.js";

// ============================================
// 一、核心转换
// ============================================

/**
 * 安全创建 BigNumber 实例
 *
 * 自动处理 null/undefined/空字符串，避免计算时报错
 *
 * @param {any} value - 要转换的值（支持 string、number、null、undefined、BigNumber）
 * @returns {BigNumber} BigNumber 实例
 *
 * @example
 * toBig(100)           // => BigNumber(100)
 * toBig('123.45')      // => BigNumber(123.45)
 * toBig(null)          // => BigNumber(0)
 * toBig(undefined)     // => BigNumber(0)
 * toBig('')            // => BigNumber(0)
 * toBig('1,234.56')    // => BigNumber(1234.56) 自动去除逗号
 */
export const toBig = (value: any): BigNumber => {
  // 边界处理：null/undefined/空字符串 转为 0
  if (value === null || value === undefined || value === "") {
    return new BigNumber(0);
  }

  // 如果已经是 BigNumber 实例，直接返回，避免重复转换
  if (BigNumber.isBigNumber(value)) {
    return value;
  }

  // 如果是字符串，去除千位分隔符（逗号）
  // 注意：BigNumber 不支持带逗号的字符串，会转成 NaN
  if (typeof value === "string") {
    value = value.replace(/,/g, "");
  }

  // 统一转为字符串再创建，避免浮点数精度损失
  // 例如：new BigNumber(0.1 + 0.2) 会得到 0.30000000000000004
  // 而 new BigNumber('0.1') 会得到 0.1
  return new BigNumber(String(value));
};

// ============================================
// 二、格式化函数
// ============================================

/**
 * 格式化数字带千分位（自定义小数位数）
 *
 * 用于在页面上展示金额，自动添加千位分隔符，补全小数位
 *
 * @param {any} value - 要格式化的数字
 * @param {number} decimalPlaces - 小数位数，默认 2 位
 * @returns {string} 格式化后的字符串
 *
 * @example
 * formatThousandWithPlaces(1234567.89)        // => "1,234,567.89"
 * formatThousandWithPlaces(1234567.8)         // => "1,234,567.80"
 * formatThousandWithPlaces(1234567, 0)        // => "1,234,568"
 * formatThousandWithPlaces(1234567, 4)        // => "1,234,567.0000"
 * formatThousandWithPlaces(null)              // => "0.00"
 * formatThousandWithPlaces('')                // => "0.00"
 * formatThousandWithPlaces(undefined, 0)      // => "0"
 */
export const formatThousandWithPlaces = (
  value: any,
  decimalPlaces: number = 2,
): string => {
  // 1. 边界处理：null/undefined/空字符串
  if (value === null || value === undefined || value === "") {
    if (decimalPlaces === 0) {
      return "0";
    }
    return `0.${"0".repeat(decimalPlaces)}`;
  }

  // 2. 转换为 BigNumber
  const dec = toBig(value);

  // 3. 处理 NaN 和 Infinity（非法值统一返回 0）
  if (!dec.isFinite() || dec.isNaN()) {
    if (decimalPlaces === 0) {
      return "0";
    }
    return `0.${"0".repeat(decimalPlaces)}`;
  }

  // 4. 固定小数位数
  const fixed = dec.toFixed(decimalPlaces);
  const parts = fixed.split(".");

  // 5. 整数部分添加千位分隔符
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // 6. 小数位数为 0，只返回整数部分
  if (decimalPlaces === 0) {
    return integerPart;
  }

  // 7. 补齐小数位（如果不足指定位数）
  const decimalPart = (parts[1] || "").padEnd(decimalPlaces, "0");
  return `${integerPart}.${decimalPart}`;
};

/**
 * 格式化数字为两位小数（用于显示）
 *
 * 简化版格式化，不带千位分隔符，只保留 2 位小数
 * 适用于表格、表单等需要简洁展示的场景
 *
 * @param {any} value - 要格式化的数字
 * @returns {string} 保留两位小数的字符串
 *
 * @example
 * formatDecimal(123.456)   // => "123.46"
 * formatDecimal(123.4)     // => "123.40"
 * formatDecimal(123)       // => "123.00"
 * formatDecimal(null)      // => "0.00"
 */
export const formatDecimal = (value: any): string => {
  return toBig(value).toFixed(2);
};

/**
 * 将小数格式化为百分比字符串
 *
 * @param {any} value - 小数（如 0.0001）
 * @param {number} decimalPlaces - 保留小数位数，默认 2
 * @param {boolean} showSpace - 是否在数字和%之间加空格，默认 false
 * @returns {string} 百分比字符串（如 "0.01%"）
 *
 * @example
 * formatPercent(0.0001)          // => "0.01%"
 * formatPercent(0.1234)          // => "12.34%"
 * formatPercent(1)               // => "100.00%"
 * formatPercent(null)            // => "-"
 * formatPercent(0.0001, 4)       // => "0.0100%"
 * formatPercent(0.1234, 0)       // => "12%"
 */
export const formatPercent = (
  value: any,
  decimalPlaces: number = 2,
): string => {
  // 边界处理
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const num = toBig(value);
  // 非法值
  if (!num.isFinite() || num.isNaN()) {
    return "-";
  }

  // 乘以100得到百分比数值
  const percent = num.times(100);
  
  // 如果为0，返回指定显示
  if (percent.eq(0)) {
    return '0';
  }
  // 使用 formatThousandWithPlaces 格式化（自带千分位）
  const formatted = formatThousandWithPlaces(percent.toNumber(), decimalPlaces);
  return formatted + "%";
};

// ============================================
// 三、加法运算
// ============================================

/**
 * 安全的加法（返回 BigNumber）
 *
 * 解决 JS 浮点数精度问题：0.1 + 0.2 !== 0.3
 *
 * @param {any} a - 加数1
 * @param {any} b - 加数2
 * @returns {BigNumber} BigNumber 实例
 *
 * @example
 * bigAdd(0.1, 0.2)           // => BigNumber(0.3)
 * bigAdd('100.50', '200.30') // => BigNumber(300.80)
 * bigAdd(null, 100)          // => BigNumber(100)
 */
export const bigAdd = (a: any, b: any): BigNumber => {
  return toBig(a).plus(toBig(b));
};

/**
 * 安全的加法（返回数字）
 *
 * @param {any} a - 加数1
 * @param {any} b - 加数2
 * @returns {number} 数字结果
 *
 * @example
 * bigAddNum(0.1, 0.2)  // => 0.3
 * bigAddNum(100, 200)  // => 300
 */
export const bigAddNum = (a: any, b: any): number => {
  return bigAdd(a, b).toNumber();
};

/**
 * 安全的求和（数组）- 返回 BigNumber
 *
 * 适用于汇总多个金额的场景，如：合同金额汇总、付款金额汇总
 *
 * @param {any[]} values - 数字数组
 * @returns {BigNumber} BigNumber 实例
 *
 * @example
 * bigSum([100, 200, 300])                    // => BigNumber(600)
 * bigSum([0.1, 0.2, 0.3])                    // => BigNumber(0.6)
 * bigSum([100, null, 200])                   // => BigNumber(300)
 * bigSum([])                                 // => BigNumber(0)
 */
export const bigSum = (values: any[]): BigNumber => {
  if (!Array.isArray(values) || values.length === 0) {
    return new BigNumber(0);
  }
  return values.reduce((sum, val) => sum.plus(toBig(val)), new BigNumber(0));
};

/**
 * 安全的求和（数组）- 返回数字
 *
 * @param {any[]} values - 数字数组
 * @returns {number} 数字结果
 *
 * @example
 * bigSumNum([100, 200, 300]) // => 600
 */
export const bigSumNum = (values: any[]): number => {
  return bigSum(values).toNumber();
};

// ============================================
// 四、减法运算
// ============================================

/**
 * 安全的减法（返回 BigNumber）
 *
 * @param {any} a - 被减数
 * @param {any} b - 减数
 * @returns {BigNumber} BigNumber 实例
 *
 * @example
 * bigSub(100, 30)     // => BigNumber(70)
 * bigSub(100.5, 30.2) // => BigNumber(70.3)
 */
export const bigSub = (a: any, b: any): BigNumber => {
  return toBig(a).minus(toBig(b));
};

/**
 * 安全的减法（返回数字）
 *
 * @param {any} a - 被减数
 * @param {any} b - 减数
 * @returns {number} 数字结果
 *
 * @example
 * bigSubNum(100, 30) // => 70
 */
export const bigSubNum = (a: any, b: any): number => {
  return bigSub(a, b).toNumber();
};

// ============================================
// 五、乘法运算
// ============================================

/**
 * 安全的乘法（返回 BigNumber）
 *
 * @param {any} a - 被乘数
 * @param {any} b - 乘数
 * @returns {BigNumber} BigNumber 实例
 *
 * @example
 * bigMul(10, 20)        // => BigNumber(200)
 * bigMul(10.5, 2.5)     // => BigNumber(26.25)
 * bigMul(100, 0.03)     // => BigNumber(3)
 */
export const bigMul = (a: any, b: any): BigNumber => {
  return toBig(a).times(toBig(b));
};

/**
 * 安全的乘法（返回数字）
 *
 * @param {any} a - 被乘数
 * @param {any} b - 乘数
 * @returns {number} 数字结果
 *
 * @example
 * bigMulNum(10, 20) // => 200
 */
export const bigMulNum = (a: any, b: any): number => {
  return bigMul(a, b).toNumber();
};

// ============================================
// 六、除法运算
// ============================================

/**
 * 安全的除法（返回 BigNumber）
 *
 * 注意：除数为 0 时返回 0，避免程序崩溃
 *
 * @param {any} a - 被除数
 * @param {any} b - 除数
 * @returns {BigNumber} BigNumber 实例
 *
 * @example
 * bigDiv(100, 3)     // => BigNumber(33.333333333333336)
 * bigDiv(100, 0)     // => BigNumber(0) 并打印警告
 */
export const bigDiv = (a: any, b: any): BigNumber => {
  const divisor = toBig(b);
  if (divisor.eq(0)) {
    console.warn("[BigNumber] 除数为 0，返回 0");
    return new BigNumber(0);
  }
  return toBig(a).dividedBy(divisor);
};

/**
 * 安全的除法（返回数字）
 *
 * @param {any} a - 被除数
 * @param {any} b - 除数
 * @returns {number} 数字结果
 *
 * @example
 * bigDivNum(100, 3) // => 33.333333333333336
 */
export const bigDivNum = (a: any, b: any): number => {
  return bigDiv(a, b).toNumber();
};

// ============================================
// 七、四舍五入
// ============================================

/**
 * 四舍五入到两位小数（返回数字）
 *
 * 用于最终展示前的金额舍入
 * 使用 ROUND_HALF_UP 模式（即：四舍五入，0.5 进位）
 * 符合中国财务做账习惯
 *
 * @param {any} value - 要舍入的数字
 * @returns {number} 保留两位小数的数字
 *
 * @example
 * roundToTwo(3.14159)   // => 3.14
 * roundToTwo(3.145)     // => 3.15
 * roundToTwo(3.999)     // => 4.00
 * roundToTwo(null)      // => 0
 *
 * @see https://mikemcl.github.io/bignumber.js/#rounding-mode
 */
export const roundToTwo = (value: any): number => {
  return toBig(value).decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
};

// ============================================
// 八、导出 BigNumber 类
// ============================================

/**
 * 导出 BigNumber 类，方便直接使用原生方法
 *
 * @example
 * import { BigNumber } from '@/utils/bigNumber'
 * const bn = new BigNumber(100)
 *
 * // 或使用 toBig 函数
 * import { toBig } from '@/utils/bigNumber'
 * const bn = toBig(100)
 */
export { BigNumber };
