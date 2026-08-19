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
