// src/utils/exportExcel.ts
import * as XLSX from "xlsx";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";

interface ExportOptions {
  data: Record<string, any>[];
  headerMap: Record<string, string>;
  fileName?: string;
  sheetName?: string;
}
/**
 * 导出 Excel 文件（基于 XLSX 库）
 *
 * @description
 * 将 JSON 数组数据导出为 `.xlsx` 格式的 Excel 文件，支持自定义表头映射、文件名和 Sheet 名称。
 * 数据会按 `headerMap` 中定义的键值对进行字段映射和重命名，并自动在文件名后追加当前日期时间戳（YYYYMMDD）。
 *
 * @param {ExportOptions} options - 导出配置参数
 * @param {any[]} options.data - 要导出的数据数组（必填），每项为一个对象，键对应数据字段
 * @param {Record<string, string>} options.headerMap - 表头映射对象（必填），键为数据字段名，值为 Excel 表头显示名称
 * @param {string} [options.fileName="导出数据"] - 导出的文件名（不含扩展名），默认 "导出数据"
 * @param {string} [options.sheetName="Sheet1"] - Excel 工作表名称，默认 "Sheet1"
 *
 * @returns {void} 无返回值，直接触发浏览器下载
 *
 * @throws 不会主动抛出异常，但会在控制台打印错误并弹出提示
 *
 * @example
 * ```ts
 * // 基础用法
 * const data = [
 *   { id: 1, name: '张三', age: 25 },
 *   { id: 2, name: '李四', age: 30 }
 * ];
 * const headerMap = {
 *   id: '编号',
 *   name: '姓名',
 *   age: '年龄'
 * };
 * exportExcel({ data, headerMap, fileName: '用户列表' });
 * // 生成文件：用户列表_20250101.xlsx
 * ```
 *
 * @example
 * ```ts
 * // 自定义 Sheet 名称
 * exportExcel({
 *   data,
 *   headerMap,
 *   fileName: '月度报表',
 *   sheetName: '一月数据'
 * });
 * ```
 *
 * @remarks
 * - 依赖库：`xlsx`（SheetJS）、`dayjs`、`element-plus` 的 `ElMessage`
 * - 时间戳格式固定为 `YYYYMMDD`，如 `20250101`
 * - 如果数据为空或 `headerMap` 为空，会弹出警告/错误并提前返回
 * - 导出失败时会自动弹出错误提示，不影响页面其他功能
 */
export const exportExcel = (options: ExportOptions): void => {
  const {
    data,
    headerMap,
    fileName = "导出数据",
    sheetName = "Sheet1",
  } = options;

  // 1. 参数校验
  if (!data || !Array.isArray(data) || data.length === 0) {
    ElMessage.warning("没有数据可以导出");
    return;
  }
  if (!headerMap || Object.keys(headerMap).length === 0) {
    ElMessage.error("请提供表头映射 headerMap");
    return;
  }

  // 2. 根据 headerMap 格式化数据
  const exportData = data.map((item) => {
    const row: Record<string, any> = {};
    Object.entries(headerMap).forEach(([key, label]) => {
      row[label] = item[key] !== undefined ? item[key] : "";
    });
    return row;
  });

  // 3. 创建工作簿和工作表
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // 4. 触发下载
  try {
    const timeStamp = dayjs(new Date()).format("YYYYMMDD");
    XLSX.writeFile(wb, `${fileName}_${timeStamp}.xlsx`);
    ElMessage.success("导出成功！");
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("导出失败，请重试");
  }
};
