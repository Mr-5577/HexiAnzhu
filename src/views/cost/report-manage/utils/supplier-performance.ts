import { v4 as uuidv4 } from "uuid";

// ============================================================
// 供应商履约及支付报表 —— 扁平数据转「扁平树」（含多合同拆行）
//
// 与之前相比的关键差异：
//   - 输出的是「扁平数组 + parentId」，而不是嵌套 children
//   - 配合 vxe-table 的 tree-config.transform + parentField 使用
//   - 这样才能同时启用虚拟滚动（virtual-y）和树形展开
// ============================================================

export interface SupPerformReportRow {
  rowType: number;
  supId?: number | null;
  projId?: number | null;
  supName?: string;
  projName?: string;
  [key: string]: any;
}

export interface SupPerformTreeNode extends SupPerformReportRow {
  /** 唯一 key，供表格 rowKey 使用，同时作为 transform 的 rowField */
  id: string;

  /**
   * 父节点 id，null 表示顶级（供应商小计行 / 合计行）
   * 供 vxe-table tree-config.transform 的 parentField 使用
   */
  parentId: string | null;

  // ===== 多合同拆行标记（供 span-method 合并用） =====
  _groupId?: string;
  _groupIndex?: number;
  _groupSize?: number;
}

/** 判断 supId 是否有效（非 null / undefined / 空串） */
function isValidSupId(supId: any): boolean {
  if (supId === null || supId === undefined) return false;
  if (typeof supId === "number") return !Number.isNaN(supId);
  if (typeof supId === "string") return supId.trim() !== "";
  return true;
}

/** 按换行符拆分多值字段 */
function splitByNewline(value: any): string[] {
  if (value === null || value === undefined) return [""];
  const s = String(value);
  if (!s) return [""];
  return s.split("\n");
}

/**
 * 将供应商履约报表接口返回的扁平数组转换为「扁平树结构」
 *
 * 输出特点：
 *   - 所有节点（供应商 / 项目 / 合计）都在同一个数组里
 *   - 每条记录都有 id + parentId
 *   - vxe-table 通过 tree-config.transform=true + parentField='parentId' 自行构建树
 *
 * @param rows 后端返回的扁平行数组
 * @returns 扁平节点数组
 */
export function buildSupPerformTree(
  rows: SupPerformReportRow[],
): SupPerformTreeNode[] {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const flatList: SupPerformTreeNode[] = [];

  // 当前正在处理的供应商节点 id（作为后续项目行的 parentId）
  let currentSupNodeId: string | null = null;

  // 当前供应商的原始 supId（用于与项目行做匹配校验）
  let currentSupId: any = null;

  for (const row of rows) {
    switch (row.rowType) {
      // --------------------------------------------------------
      // 供应商小计行：作为父节点（parentId = null）
      // --------------------------------------------------------
      case 1: {
        const nodeId = uuidv4();

        if (!isValidSupId(row.supId)) {
          console.log(
            "[buildSupPerformTree] 供应商小计行缺少有效 supId，其下项目行将无法挂载",
            { supId: row.supId, supName: row.supName },
          );
        }

        currentSupNodeId = nodeId;
        currentSupId = row.supId ?? null;

        flatList.push({
          ...row,
          id: nodeId,
          parentId: null, // 供应商是顶级节点
        });
        break;
      }

      // --------------------------------------------------------
      // 项目行：拆多合同，parentId = 当前供应商节点 id
      // --------------------------------------------------------
      case 2: {
        const conSysNos = splitByNewline(row.conSysNo);
        const conNames = splitByNewline(row.conName);
        const groupSize = Math.max(conSysNos.length, conNames.length, 1);

        // 严格匹配：双方 supId 都有效且相等，才能挂到当前供应商下
        const childSupId = row.supId ?? null;
        const canAttach =
          currentSupNodeId !== null &&
          isValidSupId(currentSupId) &&
          isValidSupId(childSupId) &&
          currentSupId === childSupId;

        // 不满足条件则作为顶级节点兜底（parentId = null）
        const parentId = canAttach ? currentSupNodeId : null;

        if (!canAttach) {
          console.log(
            "[buildSupPerformTree] 项目行未匹配到 supId 一致的供应商父节点，已提升为顶级节点",
            {
              currentSupId,
              childSupId,
              projId: row.projId,
              projName: row.projName,
            },
          );
        }

        // ---------- 单合同：一行 ----------
        if (groupSize === 1) {
          flatList.push({
            ...row,
            conSysNo: conSysNos[0] ?? "",
            conName: conNames[0] ?? "",
            id: uuidv4(),
            parentId,
          });
          break;
        }

        // ---------- 多合同：拆成 groupSize 行 ----------
        const groupId = uuidv4();
        for (let i = 0; i < groupSize; i++) {
          flatList.push({
            ...row,
            conSysNo: conSysNos[i] ?? "",
            conName: conNames[i] ?? "",
            id: uuidv4(),
            parentId,
            _groupId: groupId,
            _groupIndex: i,
            _groupSize: groupSize,
          });
        }
        break;
      }

      // --------------------------------------------------------
      // 合计行：顶级节点
      // --------------------------------------------------------
      case 3: {
        flatList.push({
          ...row,
          id: uuidv4(),
          parentId: null,
        });
        break;
      }

      default: {
        console.log(
          `[buildSupPerformTree] 未知的 rowType: ${row.rowType}`,
          row,
        );
        break;
      }
    }
  }

  return flatList;
}
