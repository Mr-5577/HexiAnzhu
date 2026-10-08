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
export interface ProjectHeader {
  mgu_id: number;
  mgu_name: string;
  proj_id: number;
  proj_name: string;
}

export interface ProjectRow {
  sub_id: number;
  sub_name: string;
  sub_code: string;
  sub_pid: number;
  sub_level: string;
  amt: number;
  mgu_id: number;
  proj_id: number;
  mgu_name: string;
  proj_name: string;
}

/**
 * 构建项目维度的树形数据
 * @param header 项目列表（含 proj_id, proj_name）
 * @param rows 原始数据行
 * @returns 树形结构数据，每个节点包含各项目金额、集团合计
 */
export function buildProjectTree(
  header: ProjectHeader[],
  rows: ProjectRow[],
): TreeNode[] {
  const projectFields = header.map((item) => `proj_${item.proj_id}`);

  // 1. 按 sub_id 分组，汇总各项目金额（使用 toBig）
  const groupMap = new Map<
    number,
    {
      sub_id: number;
      sub_name: string;
      sub_code: string;
      sub_pid: number;
      sub_level: string;
      projectAmounts: Record<string, BigNumber>; // 使用 BigNumber
    }
  >();

  rows.forEach((row) => {
    const key = `proj_${row.proj_id}`;
    if (!groupMap.has(row.sub_id)) {
      groupMap.set(row.sub_id, {
        sub_id: row.sub_id,
        sub_name: row.sub_name,
        sub_code: row.sub_code,
        sub_pid: row.sub_pid,
        sub_level: row.sub_level,
        projectAmounts: {},
      });
    }
    const group = groupMap.get(row.sub_id)!;
    const current = group.projectAmounts[key] || new BigNumber(0);
    group.projectAmounts[key] = current.plus(toBig(row.amt));
  });

  // 2. 创建节点对象
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
    let total = new BigNumber(0);
    projectFields.forEach((field) => {
      const val = group.projectAmounts[field] || new BigNumber(0);
      node[field] = val.toNumber();
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

  // 5. 递归汇总父节点（使用 toBig）
  const sumParentAmounts = (nodes: TreeNode[]) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sumParentAmounts(node.children);
        let total = new BigNumber(0);
        projectFields.forEach((field) => {
          let sum = new BigNumber(0);
          node.children.forEach((child) => {
            sum = sum.plus(toBig(child[field] || 0));
          });
          node[field] = sum.toNumber();
          total = total.plus(sum);
        });
        node.total = total.toNumber();
      }
    });
  };
  sumParentAmounts(rootNodes);

  return rootNodes;
}
