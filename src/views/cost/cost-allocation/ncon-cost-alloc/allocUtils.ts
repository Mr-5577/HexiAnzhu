// utils/allocUtils.ts
import type { ProductInfo } from "./types";
import { getLeafNodes } from "./treeUtils";

/**
 * 安全数字转换
 */
export function toNumber(val: any): number {
  return Number(val) || 0;
}

/**
 * 保留两位小数
 */
export function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

/**
 * 汇总树形数据：从子节点累加到父节点
 * 叶子节点：subjectAmt = 各业态金额之和
 * 父级节点：subjectAmt = 子节点 subjectAmt 之和
 */
export function summarizeTree<T extends Record<string, any>>(
  treeData: T[],
  productIds: number[],
): T[] {
  const cloneData = JSON.parse(JSON.stringify(treeData));

  const summarize = (node: any): any => {
    const isLeaf = !node.children?.length;

    if (isLeaf) {
      // 叶子节点：科目金额 = 各业态金额之和
      let totalAmt = 0;
      let totalExclAmt = 0;

      productIds.forEach((id) => {
        const amt = toNumber(node[`allocAmt_${id}`]);
        const exclAmt = toNumber(node[`allocExclAmt_${id}`]);
        node[`allocAmt_${id}`] = round2(amt);
        node[`allocExclAmt_${id}`] = round2(exclAmt);
        totalAmt += amt;
        totalExclAmt += exclAmt;
      });

      node.subjectAmt = round2(totalAmt);
      node.subjectAmtExcl = round2(totalExclAmt);
      return node;
    }

    // 递归处理子节点
    node.children = node.children.map(summarize);

    // 重置汇总字段
    productIds.forEach((id) => {
      node[`allocAmt_${id}`] = 0;
      node[`allocExclAmt_${id}`] = 0;
      node[`allocWarn_${id}`] = 0;
    });
    node.subjectAmt = 0;
    node.subjectAmtExcl = 0;
    node.allocWarn = 0;

    // 累加子节点
    node.children.forEach((child: any) => {
      productIds.forEach((id) => {
        node[`allocAmt_${id}`] += toNumber(child[`allocAmt_${id}`]);
        node[`allocExclAmt_${id}`] += toNumber(child[`allocExclAmt_${id}`]);
        node[`allocWarn_${id}`] = Math.max(
          node[`allocWarn_${id}`] || 0,
          toNumber(child[`allocWarn_${id}`]),
        );
      });
      node.subjectAmt += toNumber(child.subjectAmt);
      node.subjectAmtExcl += toNumber(child.subjectAmtExcl);
      node.allocWarn = Math.max(node.allocWarn || 0, toNumber(child.allocWarn));
    });

    // 保留两位小数
    productIds.forEach((id) => {
      node[`allocAmt_${id}`] = round2(node[`allocAmt_${id}`]);
      node[`allocExclAmt_${id}`] = round2(node[`allocExclAmt_${id}`]);
    });
    node.subjectAmt = round2(node.subjectAmt);
    node.subjectAmtExcl = round2(node.subjectAmtExcl);

    return node;
  };

  return cloneData.map(summarize);
}

/**
 * 仅汇总父级节点（不改变叶子节点的 subjectAmt）
 * 用于用户编辑 subjectAmt / subjectAmtExcl 后，只更新父级汇总值
 */
export function summarizeTreeParentsOnly<T extends Record<string, any>>(
  treeData: T[],
  productIds: number[],
): T[] {
  const cloneData = JSON.parse(JSON.stringify(treeData));

  const summarize = (node: any): any => {
    const isLeaf = !node.children?.length;

    if (isLeaf) {
      // 叶子节点：保持用户输入的值不变，只确保金额保留两位小数
      productIds.forEach((id) => {
        node[`allocAmt_${id}`] = round2(toNumber(node[`allocAmt_${id}`]));
        node[`allocExclAmt_${id}`] = round2(
          toNumber(node[`allocExclAmt_${id}`]),
        );
      });
      // 叶子节点的 subjectAmt 保持用户输入不变
      node.subjectAmt = round2(toNumber(node.subjectAmt));
      node.subjectAmtExcl = round2(toNumber(node.subjectAmtExcl));
      return node;
    }

    // 先递归处理所有子节点（子节点会先完成汇总）
    node.children = node.children.map(summarize);

    // ========== 重置父级汇总字段 ==========
    productIds.forEach((id) => {
      node[`allocAmt_${id}`] = 0;
      node[`allocExclAmt_${id}`] = 0;
      node[`allocWarn_${id}`] = 0;
    });
    node.subjectAmt = 0;
    node.subjectAmtExcl = 0;
    node.allocWarn = 0;

    // ========== 累加所有子节点的值 ==========
    node.children.forEach((child: any) => {
      // 累加业态金额
      productIds.forEach((id) => {
        node[`allocAmt_${id}`] += toNumber(child[`allocAmt_${id}`]);
        node[`allocExclAmt_${id}`] += toNumber(child[`allocExclAmt_${id}`]);
        node[`allocWarn_${id}`] = Math.max(
          node[`allocWarn_${id}`] || 0,
          toNumber(child[`allocWarn_${id}`]),
        );
      });

      // 累加科目金额（含税和不含税）
      node.subjectAmt += toNumber(child.subjectAmt);
      node.subjectAmtExcl += toNumber(child.subjectAmtExcl);
    });

    // ========== 保留两位小数 ==========
    productIds.forEach((id) => {
      node[`allocAmt_${id}`] = round2(node[`allocAmt_${id}`]);
      node[`allocExclAmt_${id}`] = round2(node[`allocExclAmt_${id}`]);
    });
    node.subjectAmt = round2(node.subjectAmt);
    node.subjectAmtExcl = round2(node.subjectAmtExcl);

    return node;
  };

  return cloneData.map(summarize);
}

/**
 * 过滤树形数据，只保留指定业态的字段
 */
export function filterTreeByProducts<T extends Record<string, any>>(
  treeData: T[],
  validProdIds: number[],
): T[] {
  const traverse = (nodes: any[]): any[] => {
    return nodes.map((node) => {
      const newNode = { ...node };

      // 删除不相关的业态字段
      Object.keys(newNode).forEach((key) => {
        const match = key.match(/^(allocAmt|allocExclAmt|allocWarn)_(\d+)$/);
        if (match && !validProdIds.includes(Number(match[2]))) {
          delete newNode[key];
        }
      });

      if (node.children?.length) {
        newNode.children = traverse(node.children);
      }

      return newNode;
    });
  };

  return traverse(treeData);
}

/**
 * 校验叶子节点的科目金额是否等于业态金额之和
 */
export function validateLeafNodes(leafNodes: any[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  leafNodes.forEach((node) => {
    let totalAmt = 0;
    let totalExclAmt = 0;

    Object.keys(node).forEach((key) => {
      if (key.startsWith("allocAmt_")) totalAmt += toNumber(node[key]);
      if (key.startsWith("allocExclAmt_")) totalExclAmt += toNumber(node[key]);
    });

    totalAmt = round2(totalAmt);
    totalExclAmt = round2(totalExclAmt);

    const subjectAmt = round2(toNumber(node.subjectAmt));
    const subjectAmtExcl = round2(toNumber(node.subjectAmtExcl));

    if (totalAmt !== subjectAmt) {
      errors.push(
        `科目 "${node.subName}" 含税金额 ${subjectAmt} ≠ 业态合计 ${totalAmt}`,
      );
    }
    if (totalExclAmt !== subjectAmtExcl) {
      errors.push(
        `科目 "${node.subName}" 不含税金额 ${subjectAmtExcl} ≠ 业态合计 ${totalExclAmt}`,
      );
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * 树形数据转行数据（只提取叶子节点）
 */
export function convertTreeToRows(treeData: any[], products: any[]): any[] {
  const leaves = getLeafNodes(treeData);
  const rows: any[] = [];

  leaves.forEach((node: any) => {
    products.forEach((prod: any) => {
      rows.push({
        subId: node.subId || node.id,
        subName: node.subName,
        subCode: node.subCode,
        prodId: prod.prodId,
        prodName: prod.prodName,
        allocAmt: toNumber(node[`allocAmt_${prod.prodId}`]),
        allocExclAmt: toNumber(node[`allocExclAmt_${prod.prodId}`]),
        allocWarn: node.allocWarn || 0,
        busiSegId: node.busiSegId || 0,
        segName: node.segName || "",
        allocRule: node.allocRule || "",
      });
    });
  });

  return rows;
}

/**
 * 合并明细数据到树形数据
 */
export function mergeDetailsToTree(
  treeData: any[],
  details: any[],
  products: any[],
): any[] {
  const detailMap = new Map();
  details.forEach((d: any) => {
    const key = `${d.subId}_${d.prodId}`;
    detailMap.set(key, d);
  });

  const traverse = (nodes: any[]): any[] => {
    return nodes.map((node) => {
      if (node.children?.length) {
        return { ...node, children: traverse(node.children) };
      }

      const newNode = { ...node };
      let totalAmt = 0;
      let totalExclAmt = 0;

      products.forEach((prod: any) => {
        const key = `${node.subId || node.id}_${prod.prodId}`;
        const detail = detailMap.get(key);
        const amt = detail?.allocAmt ?? 0;
        const exclAmt = detail?.allocExclAmt ?? 0;

        newNode[`allocAmt_${prod.prodId}`] = amt;
        newNode[`allocExclAmt_${prod.prodId}`] = exclAmt;
        newNode[`allocWarn_${prod.prodId}`] = detail?.allocWarn ?? 0;
        totalAmt += amt;
        totalExclAmt += exclAmt;
      });

      newNode.subjectAmt = round2(totalAmt);
      newNode.subjectAmtExcl = round2(totalExclAmt);
      return newNode;
    });
  };

  return traverse(treeData);
}
