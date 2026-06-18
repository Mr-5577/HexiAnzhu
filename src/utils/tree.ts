
/**
 * @name 将扁平数组转换为树形结构
 * @param list 扁平数据数组
 * @returns 树形结构数组
 */
export const buildTree = <T extends { id: number; pid: number | null }>(
  list: T[] = [],
): (T & { children?: T[] })[] => {
  if (!list?.length) return [];

  const map = new Map<number, T & { children?: T[] }>();
  const tree: (T & { children?: T[] })[] = [];

  // 初始化所有节点
  list.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  // 构建父子关系
  list.forEach((item) => {
    const node = map.get(item.id)!;
    // 判断是否为根节点：pid 为 null 或 0 或 undefined
    const isRoot =
      item.pid === null || item.pid === 0 || item.pid === undefined;

    if (isRoot) {
      tree.push(node);
    } else {
      const parent = map.get(item.pid);
      if (parent) {
        parent.children!.push(node);
      } else {
        // 父节点不存在时也作为根节点
        tree.push(node);
      }
    }
  });

  return tree;
};
