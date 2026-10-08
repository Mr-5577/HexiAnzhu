/**
 * 将带有层级编码（如 '1', '1.1', '1.1.1'）的扁平数据转换为树形结构
 * @param list 扁平数据数组，每个元素需包含 subCode 字段
 * @param codeField 编码字段名，默认 'subCode'
 * @param childrenField 子节点数组字段名，默认 'children'
 * @returns 树形数据（根节点数组）
 */
export function buildTreeFromList<T extends Record<string, any>>(
  list: T[],
  codeField: string = "subCode",
  childrenField: string = "children",
): T[] {
  if (!list || list.length === 0) return [];

  // 1. 构建所有节点的映射（保留原始对象，并初始化 children）
  const nodeMap: Record<string, T> = {};
  list.forEach((item) => {
    // 为避免修改原始对象，创建一个副本
    const node = { ...item, [childrenField]: [] };
    nodeMap[item[codeField]] = node;
  });

  const roots: T[] = [];

  // 2. 建立父子关系
  list.forEach((item) => {
    const node = nodeMap[item[codeField]];
    const code = item[codeField];
    const lastDotIndex = code.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      const parentCode = code.substring(0, lastDotIndex);
      const parent = nodeMap[parentCode];
      if (parent) {
        // 将当前节点添加到父节点的 children 中
        parent[childrenField].push(node);
      } else {
        // 父节点不存在（可能数据不完整），作为根节点
        roots.push(node);
      }
    } else {
      // 没有点号，是根节点
      roots.push(node);
    }
  });

  return roots;
}
