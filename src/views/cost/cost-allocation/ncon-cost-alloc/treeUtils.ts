// utils/treeUtils.ts
import type { SubjectItem } from "./types";

/**
 * 获取树形数据中的所有叶子节点
 */
export function getLeafNodes<T extends { children?: T[] }>(tree: T[]): T[] {
  const leaves: T[] = [];
  const traverse = (nodes: T[]) => {
    for (const node of nodes) {
      if (node.children?.length) {
        traverse(node.children);
      } else {
        leaves.push(node);
      }
    }
  };
  traverse(tree);
  return leaves;
}

/**
 * 从树中删除节点（自动清理空父节点）
 */
export function removeNodeFromTree<T extends { id: number; children?: T[] }>(
  tree: T[],
  nodeId: number,
): T[] {
  const result: T[] = [];

  for (const node of tree) {
    if (node.id === nodeId) continue;

    if (node.children?.length) {
      const filteredChildren = removeNodeFromTree(node.children, nodeId);
      if (filteredChildren.length === 0) continue;
      result.push({ ...node, children: filteredChildren });
    } else {
      result.push(node);
    }
  }

  return result;
}

/**
 * 遍历树形数据
 */
export function traverseTree<T>(
  tree: T[],
  callback: (node: T, path: T[]) => boolean | void,
  path: T[] = [],
): boolean {
  for (const node of tree) {
    const currentPath = [...path, node];
    const shouldStop = callback(node, currentPath);
    if (shouldStop === true) return true;
    if (node.children?.length) {
      const stopped = traverseTree(node.children, callback, currentPath);
      if (stopped) return true;
    }
  }
  return false;
}

/**
 * 从树形数据中过滤出指定ID的节点，并保留其父级路径
 */
export function filterTreeByIds<T extends { id: number; children?: T[] }>(
  treeData: T[],
  targetIds: number[],
): T[] {
  const targetSet = new Set(targetIds);

  function filterNodes(nodes: T[]): T[] {
    const result: T[] = [];

    for (const node of nodes) {
      const isTarget = targetSet.has(node.id);
      let filteredChildren: T[] = [];

      if (node.children && node.children.length > 0) {
        filteredChildren = filterNodes(node.children);
      }

      if (isTarget || filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren,
        });
      }
    }

    return result;
  }

  return filterNodes(treeData);
}

/**
 * 构建树形结构（扁平数组转树）
 */
export function buildTree<T extends { id: number; pid: number | null }>(
  list: T[] = [],
): (T & { children?: T[] })[] {
  if (!list?.length) return [];

  const map = new Map<number, T & { children?: T[] }>();
  const tree: (T & { children?: T[] })[] = [];
  const allIds = new Set<number>();

  list.forEach((item) => {
    allIds.add(item.id);
    map.set(item.id, { ...item, children: [] });
  });

  list.forEach((item) => {
    const node = map.get(item.id)!;
    const parentId = item.pid;

    const isRoot =
      parentId === null ||
      parentId === undefined ||
      parentId === 0 ||
      !allIds.has(parentId);

    if (isRoot) {
      tree.push(node);
    } else {
      const parent = map.get(parentId);
      if (parent) {
        parent.children!.push(node);
      } else {
        tree.push(node);
      }
    }
  });

  return tree;
}
