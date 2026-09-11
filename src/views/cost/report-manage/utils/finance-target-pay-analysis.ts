/**
 * 将扁平数据转换为树形结构
 * @param list 扁平数据数组
 * @param idKey 节点唯一标识字段，默认 'subId'
 * @param parentKey 父级标识字段，默认 'subPid'
 * @param childrenKey 子节点存放字段，默认 'children'
 * @returns 树形结构数组（根节点）
 */
export function buildTreeFromFlatList<T extends Record<string, any>>(
  list: T[],
  idKey: keyof T = "subId",
  parentKey: keyof T = "subPid",
  childrenKey: string = "children",
): (T & { [childrenKey]: any[] })[] {
  if (!list || list.length === 0) return [];

  // 1. 创建 Map：id -> 节点（含空 children）
  const nodeMap = new Map<number, T & { [childrenKey]: any[] }>();
  list.forEach((item) => {
    const id = item[idKey];
    if (id !== undefined && id !== null) {
      nodeMap.set(id, { ...item, [childrenKey]: [] });
    }
  });

  // 2. 建立父子关系
  const roots: (T & { [childrenKey]: any[] })[] = [];
  nodeMap.forEach((node) => {
    const parentId = node[parentKey];
    if (parentId === 0 || parentId === null || parentId === undefined) {
      roots.push(node);
    } else {
      const parent = nodeMap.get(parentId);
      if (parent) {
        parent[childrenKey].push(node);
      } else {
        // 父节点不存在，作为根节点
        console.warn(
          `父节点 ${parentId} 不存在，将 ${node.subName} 作为根节点`,
        );
        roots.push(node);
      }
    }
  });

  // 3. 按 subCode 排序（保持层级有序）
  // const sortByCode = (nodes: any[]) => {
  //   nodes.sort((a, b) => (a.subCode || '').localeCompare(b.subCode || ''));
  //   nodes.forEach((node) => {
  //     if (node[childrenKey] && node[childrenKey].length > 0) {
  //       sortByCode(node[childrenKey]);
  //     }
  //   });
  // };
  // sortByCode(roots);

  return roots;
}
