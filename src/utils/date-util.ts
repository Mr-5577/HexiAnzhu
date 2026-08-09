import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

// 设置全局为中文
dayjs.locale("zh-cn");

// 定义常用格式常量
const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss"; // 日期时间格式：2025-12-12 14:30:25
const DATE_FORMAT = "YYYY-MM-DD"; // 日期格式：2025-12-12

/**
 * 格式化为日期时间字符串
 * @param date - 要格式化的日期，支持 Date 对象、时间戳、ISO 字符串等。如果为空，使用当前时间
 * @param format - 目标格式字符串，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期时间字符串
 * @example
 * formatToDateTime(new Date()) // "2023-12-01 14:30:25"
 * formatToDateTime('2023-12-01T10:30:00Z') // "2023-12-01 18:30:00"
 * formatToDateTime(1701405025000, 'YYYY/MM/DD HH:mm') // "2023/12/01 14:30"
 */
export function formatToDateTime(
  date?: dayjs.ConfigType,
  format = DATE_TIME_FORMAT
): string {
  return dayjs(date).format(format);
}

/**
 * 格式化为日期字符串（不包含时间部分）
 * @param date - 要格式化的日期，支持 Date 对象、时间戳、ISO 字符串等。如果为空，使用当前时间
 * @param format - 目标格式字符串，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 * @example
 * formatToDate(new Date()) // "2023-12-01"
 * formatToDate('2023-12-01T10:30:00Z') // "2023-12-01"
 * formatToDate(1701405025000, 'YYYY年MM月DD日') // "2023年12月01日"
 */
export function formatToDate(
  date?: dayjs.ConfigType,
  format = DATE_FORMAT
): string {
  return dayjs(date).format(format);
}

/**
  * 计算两个日期之间的间隔天数（带符号）
  * 正数：date2 在 date1 之后
  * 负数：date2 在 date1 之前
  * 零：同一天
  * @param date1 - 第一个日期
  * @param date2 - 第二个日期
  * @returns 间隔天数
  * @example
   */
export function getDaysDiff(date1: string | Date | null, date2: string | Date | null): number {
  if (!date1 || !date2) return 0;
    
  const d1 = new Date(date1);
  const d2 = new Date(date2);
    
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
    
  const diffMs = d2.getTime() - d1.getTime();
  const rawDiff = Math.floor(diffMs / 86400000);
  
  // 根据正负情况决定是否+1
  if (rawDiff >= 0) {
    return rawDiff + 1; // 正数情况：包含首尾
  } else {
    return rawDiff; // 负数情况：不加1，保持负数
  }
}


/**
 * dayjs 实例，用于复杂的日期操作
 * @example
 * dateUtil().add(1, 'day') // 明天
 * dateUtil('2023-12-01').isBefore(dateUtil()) // 判断日期是否在今天之前
 */
export const dateUtil = dayjs;
