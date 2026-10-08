import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * 导出列配置接口
 * 支持单级表头（无 children）和多级表头（有 children）
 */
export interface ExportColumn {
  label: string; // 列标题（显示在表头）
  prop?: string; // 对应数据对象的字段名，若为 '_index' 则特殊处理为序号
  formatter?: (row: any, index?: number) => any; // 自定义格式化函数，接收行数据和行索引
  width?: number; // 列宽（像素值），内部会转换为 Excel 字符宽度
  minWidth?: number; // 最小宽度（像素），当 width 未指定时使用
  children?: ExportColumn[]; // 子列，用于生成多级表头
}

/**
 * 导出选项接口
 */
export interface ExportOptions {
  sheetName?: string; // 工作表名称，默认 'Sheet1'
  headerBgColor?: string; // 表头背景色（ARGB 格式，如 'FFD3D3D3'）
  fontName?: string; // 全局字体名称，默认 '微软雅黑'
  headerFontSize?: number; // 表头字号，默认 10
  bodyFontSize?: number; // 数据行字号，默认 10
  includeIndex?: boolean; // 是否在首列自动添加序号列
  indexLabel?: string; // 序号列标题，默认 '序号'
}

/**
 * 导出 Excel（带样式）
 * @param data 要导出的数据数组（对象数组）
 * @param columns 列配置（支持嵌套 children 实现多级表头）
 * @param fileName 导出文件名（不含扩展名）
 * @param options 可选样式配置
 *
 * @example
 * // 单级表头
 * await exportExcelWithStyle(
 *   [{ name: '张三', age: 28 }],
 *   [{ label: '姓名', prop: 'name' }, { label: '年龄', prop: 'age' }],
 *   '人员信息'
 * );
 *
 * // 多级表头
 * await exportExcelWithStyle(
 *   data,
 *   [
 *     {
 *       label: '个人信息',
 *       children: [
 *         { label: '姓名', prop: 'name' },
 *         { label: '年龄', prop: 'age' }
 *       ]
 *     },
 *     {
 *       label: '工作信息',
 *       children: [
 *         { label: '部门', prop: 'dept' },
 *         { label: '职位', prop: 'position' }
 *       ]
 *     }
 *   ],
 *   '员工报表',
 *   { includeIndex: true, headerBgColor: 'FFD3D3D3' }
 * );
 */
export async function exportExcelWithStyle(
  data: any[],
  columns: ExportColumn[],
  fileName: string,
  options: ExportOptions = {},
) {
  // 解构选项，设置默认值
  const {
    sheetName = "Sheet1",
    headerBgColor = "FFD3D3D3",
    fontName = "微软雅黑",
    headerFontSize = 10,
    bodyFontSize = 10,
    includeIndex = false,
    indexLabel = "序号",
  } = options;

  // ---------- 1. 构建叶子列（扁平化） ----------
  // 由于多级表头需要合并单元格，我们需要知道每一列的完整路径（从顶层到叶子）
  // leafColumns 存储每个叶子列的元信息：标题、字段名、宽度、格式化函数、路径数组
  let leafColumns: {
    label: string; // 叶子列标题
    prop: string; // 数据字段名
    formatter?: (row: any, index?: number) => any;
    width?: number;
    path: string[]; // 从顶层表头到当前列的路径，如 ['合同基本信息', '供应商名称']
    pathLen: number; // 新增，缓存路径长度
  }[] = [];

  /**
   * 递归提取叶子列
   * @param cols 当前层级的列配置
   * @param parentPath 父级路径（用于构建完整路径）
   */
  const extractLeaves = (cols: ExportColumn[], parentPath: string[] = []) => {
    cols.forEach((col) => {
      const currentPath = [...parentPath, col.label];
      if (col.children && col.children.length) {
        // 如果有子列，继续递归
        extractLeaves(col.children, currentPath);
      } else {
        // 叶子列：必须有 prop 才视为有效数据列（如操作列、序号列等无 prop 则忽略）
        if (col.prop) {
          leafColumns.push({
            label: col.label,
            prop: col.prop,
            formatter: col.formatter,
            width: col.width || col.minWidth,
            path: currentPath,
            pathLen: currentPath.length,
          });
        }
      }
    });
  };

  // 开始提取用户定义的列
  extractLeaves(columns);

  // 如果 includeIndex 为 true，则在最前面插入序号列
  if (includeIndex) {
    leafColumns = [
      {
        label: indexLabel,
        prop: "_index", // 特殊字段名，在数据填充时识别
        formatter: (_row: any, index: number) => index + 1,
        width: 60,
        path: [indexLabel], // 单独一层表头
        pathLen: 1,
      },
      ...leafColumns,
    ];
  }

  // 如果没有有效列，则警告并返回
  if (leafColumns.length === 0) {
    console.warn("没有可导出的列");
    return;
  }

  // ---------- 2. 构建表头矩阵 ----------
  // 表头矩阵是一个二维数组：matrix[row][col]，行数 = 最大路径深度，列数 = 叶子列数
  // 用于后续生成合并单元格的行列信息
  const maxDepth = Math.max(...leafColumns.map((l) => l.path.length), 0);
  const headerMatrix: (string | null)[][] = Array.from(
    { length: maxDepth },
    () => Array(leafColumns.length).fill(null),
  );

  // 根据路径填充矩阵：每列的每一层放入对应的标题
  leafColumns.forEach((leaf, colIdx) => {
    leaf.path.forEach((label, level) => {
      headerMatrix[level][colIdx] = label;
    });
  });

  // ---------- 3. 计算合并区间 ----------
  // 对于同一行中连续相同的文本，我们需要合并这些单元格
  // 例如：表头第一行中 '合同基本信息' 连续出现两列，则合并该两列
  const getMergeRanges = (matrix: (string | null)[][]) => {
    const ranges: { row: number; startCol: number; endCol: number }[] = [];
    matrix.forEach((row, rowIdx) => {
      let col = 0;
      while (col < row.length) {
        const text = row[col];
        if (text !== null) {
          let end = col;
          // 向后寻找连续相同的文本
          while (end + 1 < row.length && row[end + 1] === text) {
            end++;
          }
          // 如果连续长度 > 1，则记录合并区间
          if (end > col) {
            ranges.push({ row: rowIdx, startCol: col, endCol: end });
          }
          col = end + 1;
        } else {
          col++;
        }
      }
    });
    return ranges;
  };

  const mergeRanges = getMergeRanges(headerMatrix);

  // ---------- 4. 创建工作簿和工作表 ----------
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // ---------- 5. 设置列宽 ----------
  // ExcelJS 列宽单位为字符宽度，像素值除以 7.5 为近似换算（可根据实际情况调整）
  leafColumns.forEach((col, idx) => {
    if (col.width) {
      worksheet.getColumn(idx + 1).width = col.width / 7.5;
    } else {
      worksheet.getColumn(idx + 1).width = 15; // 默认宽度
    }
  });

  // ---------- 6. 填充表头行 ----------
  // 逐行添加，每行数据来自 headerMatrix 对应行
  for (let r = 0; r < maxDepth; r++) {
    const rowData = headerMatrix[r].map((cell) => cell || "");
    worksheet.addRow(rowData);
  }

  // ---------- 7. 合并表头单元格 ----------
  // 根据 mergeRanges 执行合并，注意 ExcelJS 行/列从 1 开始
  mergeRanges.forEach(({ row, startCol, endCol }) => {
    worksheet.mergeCells(row + 1, startCol + 1, row + 1, endCol + 1);
  });

  // 垂直合并
  leafColumns.forEach((leaf, colIdx) => {
    const pathLen = leaf.pathLen;
    if (pathLen < maxDepth) {
      const startRow = pathLen;     // 最后一级内容所在行（从1开始）
      const endRow = maxDepth;
      if (startRow <= endRow) {
        worksheet.mergeCells(startRow, colIdx + 1, endRow, colIdx + 1);
      }
    }
  });

  // ---------- 8. 设置表头样式 ----------
  const headerRows = worksheet.getRows(1, maxDepth);
  if (headerRows) {
    headerRows.forEach((row) => {
      row.eachCell((cell) => {
        // 字体：名称、大小、加粗
        cell.font = {
          name: fontName,
          size: headerFontSize,
          bold: true,
        };
        // 背景填充（纯色）
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: headerBgColor },
        };
        // 边框（全边框，细线）
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        };
        // 对齐：居中
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
    });
  }

  // ---------- 9. 填充数据行 ----------
  data.forEach((item, index) => {
    // 构建行数据：遍历所有叶子列，根据 prop 取值，并应用 formatter
    const rowData = leafColumns.map((col) => {
      if (col.prop === "_index") {
        // 序号列：使用 formatter 或默认 index+1
        return col.formatter ? col.formatter(item, index) : index + 1;
      }
      // 普通字段：获取原始值，若有格式化函数则调用
      const rawValue = item[col.prop];
      return col.formatter ? col.formatter(item, index) : (rawValue ?? "");
    });
    const row = worksheet.addRow(rowData);

    // 数据行样式
    row.eachCell((cell) => {
      // 字体（不加粗）
      cell.font = {
        name: fontName,
        size: bodyFontSize,
      };
      // 边框（全边框）
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };
      // 对齐：数值右对齐，其他左对齐
      if (typeof cell.value === "number") {
        cell.alignment = { horizontal: "right", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      }
    });
  });

  // ---------- 10. 导出文件 ----------
  // 生成 Excel 文件缓冲区，构建 Blob，使用 file-saver 保存
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${fileName}.xlsx`);
}
