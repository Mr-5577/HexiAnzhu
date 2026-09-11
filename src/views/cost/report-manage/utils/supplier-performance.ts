// ============================================================
// 供应商履约及支付报表 —— 扁平数据转树形
// 数据规则：
//   rowType === 1  供应商小计行（父节点，含 supId）
//   rowType === 2  项目行（子节点，含 supId + projId）
//   rowType === 3  合计行（顶层，单独输出）
// 后端按 rowType 顺序返回，rowType=1 后紧跟若干 rowType=2
// ============================================================

export interface SupPerformReportRow {
  /** 行类型：1=供应商小计行 2=项目行 3=合计行 */
  rowType: number;
  /** 供应商ID（穿透用；项目/合计行为 null） */
  supId?: number | null;
  /** 项目ID（穿透用；供应商小计/合计行为 null） */
  projId?: number | null;
  /** 供应商名称 */
  supName?: string;
  /** 项目名称 */
  projName?: string;
  /** 其他业务字段（signAmt、payAmt、invcAmt 等） */
  [key: string]: any;
}

export interface SupPerformTreeNode extends SupPerformReportRow {
  /** 唯一 key，供表格 rowKey 使用 */
  id: string;
  /** 子节点（仅供应商小计行有） */
  children?: SupPerformTreeNode[];
}

/**
 * 将供应商履约报表接口返回的扁平数组转换为树形结构
 *
 * @param rows 后端返回的扁平行数组
 * @returns 顶级节点数组（供应商树 + 合计行）
 */
export function buildSupPerformTree(
  rows: SupPerformReportRow[],
): SupPerformTreeNode[] {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const list: SupPerformTreeNode[] = [];
  let currentSup: SupPerformTreeNode | null = null;
  let totalRow: SupPerformTreeNode | null = null;

  for (const row of rows) {
    switch (row.rowType) {
      // ---------- 供应商小计行 ----------
      case 1: {
        currentSup = {
          ...row,
          id: `sup-${row.supId}`,
          children: [],
        };
        list.push(currentSup);
        break;
      }

      // ---------- 项目行 ----------
      case 2: {
        const node: SupPerformTreeNode = {
          ...row,
          id: `sup-${row.supId}-proj-${row.projId}`,
        };

        if (currentSup && currentSup.supId === row.supId) {
          // 正常情况：挂到当前供应商节点下
          currentSup.children!.push(node);
        } else {
          // 数据异常兜底：找不到父供应商时提升为顶级节点
          console.warn(
            `[buildSupPerformTree] 项目行未匹配到供应商父节点: supId=${row.supId}, projId=${row.projId}`,
          );
          list.push(node);
        }
        break;
      }

      // ---------- 合计行 ----------
      case 3: {
        totalRow = {
          ...row,
          id: "total",
        };
        break;
      }

      default:
        console.warn(
          `[buildSupPerformTree] 未知的 rowType: ${row.rowType}`,
          row,
        );
        break;
    }
  }

  // 清理无子节点的供应商行（避免表格误显示展开图标）
  for (const item of list) {
    if (item.children && item.children.length === 0) {
      item.children = undefined;
    }
  }

  // 合计行放到末尾
  if (totalRow) {
    list.push(totalRow);
  }

  return list;
}
