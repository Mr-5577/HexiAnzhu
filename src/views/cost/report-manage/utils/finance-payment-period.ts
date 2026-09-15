import { BigNumber, toBig } from "@/utils/big-number";

export interface TreeNode {
  sub_id: number;
  sub_name: string;
  sub_code: string;
  sub_pid: number;
  sub_level: string;
  children: TreeNode[];
  id: string; // VXE Table rowKey
  total: number; // 所有月份合计
  [month: string]: any; // 动态月份字段，如 '2026-01'
}

export interface RawRow {
  sub_id: number;
  sub_name: string;
  sub_code: string;
  sub_pid: number;
  sub_level: string;
  amt: number;
  ym: string;
}
/**
 * 构建树形数据并填充各月金额（汇总）
 * @param header 月份列表，如 ['2026-01', '2026-02', ...]
 * @param rows 原始数据行（每行是某科目某月的金额）
 * @returns 树形结构数据
 */
export function buildTreeAndFillData(
  header: string[],
  rows: RawRow[],
): TreeNode[] {
  // 1. 按 sub_id 分组，汇总各月金额（使用 toBig 累加）
  const groupMap = new Map<
    number,
    {
      sub_id: number;
      sub_name: string;
      sub_code: string;
      sub_pid: number;
      sub_level: string;
      monthData: Record<string, BigNumber>; // 使用 BigNumber 存储
    }
  >();

  rows.forEach((row) => {
    if (!groupMap.has(row.sub_id)) {
      groupMap.set(row.sub_id, {
        sub_id: row.sub_id,
        sub_name: row.sub_name,
        sub_code: row.sub_code,
        sub_pid: row.sub_pid,
        sub_level: row.sub_level,
        monthData: {},
      });
    }
    const group = groupMap.get(row.sub_id)!;
    if (header.includes(row.ym)) {
      // 使用 toBig 进行累加
      const current = group.monthData[row.ym] || new BigNumber(0);
      group.monthData[row.ym] = current.plus(toBig(row.amt));
    }
  });

  // 2. 创建节点对象，初始化月份字段（转为 number）
  const nodeMap = new Map<number, TreeNode>();
  const rootNodes: TreeNode[] = [];

  groupMap.forEach((group) => {
    const node: TreeNode = {
      sub_id: group.sub_id,
      sub_name: group.sub_name,
      sub_code: group.sub_code,
      sub_pid: group.sub_pid,
      sub_level: group.sub_level,
      children: [],
      id: `row_${group.sub_id}`,
      total: 0,
    };
    // 填充月份字段（从 BigNumber 转为 number）
    let total = new BigNumber(0);
    header.forEach((month) => {
      const val = group.monthData[month] || new BigNumber(0);
      node[month] = val.toNumber(); // 转为 number 存储
      total = total.plus(val);
    });
    node.total = total.toNumber();
    nodeMap.set(group.sub_id, node);
  });

  // 3. 构建树形结构（保持不变）
  nodeMap.forEach((node) => {
    if (node.sub_pid === 0) {
      rootNodes.push(node);
    } else {
      const parent = nodeMap.get(node.sub_pid);
      if (parent) {
        parent.children.push(node);
      } else {
        console.warn(
          `父节点 ${node.sub_pid} 不存在，将 ${node.sub_name} 作为根节点`,
        );
        rootNodes.push(node);
      }
    }
  });

  // 4. 排序（保持不变）
  const sortByCode = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => (a.sub_code || "").localeCompare(b.sub_code || ""));
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortByCode(node.children);
      }
    });
  };
  sortByCode(rootNodes);

  // 5. 递归汇总父节点（使用 toBig 求和）
  const sumParentAmounts = (nodes: TreeNode[]) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sumParentAmounts(node.children);
        // 使用 BigNumber 汇总子节点
        let total = new BigNumber(0);
        header.forEach((month) => {
          let sum = new BigNumber(0);
          node.children.forEach((child) => {
            sum = sum.plus(toBig(child[month] || 0));
          });
          node[month] = sum.toNumber();
          total = total.plus(sum);
        });
        node.total = total.toNumber();
      }
    });
  };
  sumParentAmounts(rootNodes);

  return rootNodes;
}
