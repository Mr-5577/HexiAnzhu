/**
 * 过滤掉建安类下的预留费用
 * 过滤掉 土地成本和费用类
 */
export const filterReservedCost = (data: any[]): any[] => {
  const processNodes = (nodes: any[], parent: any = null): any[] => {
    const result: any[] = [];

    for (const node of nodes) {
      // 过滤规则
      if (
        (parent?.subName === "建安类" && node.subName === "预留费用") ||
        node.subName === "土地成本" ||
        node.subName === "费用类"
      ) {
        continue;
      }

      if (node.children?.length) {
        const filteredChildren = processNodes(node.children, node);

        // 如果建安类没有子节点了，移除
        if (node.subName === "建安类" && filteredChildren.length === 0) {
          continue;
        }

        result.push({ ...node, children: filteredChildren });
      } else {
        result.push(node);
      }
    }

    return result;
  };

  return processNodes(data);
};

/**
 * 从树形数据中过滤出指定ID的节点，并保留其父级路径
 * 返回的数据保持树形结构
 */
export const filterTreeByIds = (treeData, targetIds: number[]) => {
  const targetSet = new Set(targetIds);

  function filterNodes(nodes) {
    const result = [];

    for (const node of nodes) {
      const isTarget = targetSet.has(node.id);

      let filteredChildren = [];
      if (node.children && node.children.length > 0) {
        filteredChildren = filterNodes(node.children);
      }

      if (isTarget || filteredChildren.length > 0) {
        const newNode = {
          ...node,
          children: filteredChildren,
        };
        result.push(newNode);
      }
    }

    return result;
  }

  return filterNodes(treeData);
};

/**
 * 从数据中提取并去重产品业态
 * @param {Array} data - 原始数据数组
 * @returns {Array} - 去重后的 { prodId, prodName } 对象数组
 */
export const extractDistinctProducts = (data) => {
  if (!data || data.length === 0) {
    return [];
  }
  // 使用 Map 去重，键为 prodId（数值类型查找更快）
  const map = new Map();
  let item, prodId, prodName;

  // 使用 for 循环（比 forEach 性能更好，尤其是大数据量时）
  for (let i = 0, len = data.length; i < len; i++) {
    item = data[i];
    // 快速过滤无效数据
    if (!item) continue;

    prodId = item.prodId;
    // 如果 prodId 已存在则跳过（Map.has 比 Map.get 更快）
    if (map.has(prodId)) continue;

    prodName = item.prodName;
    // 只有在 prodName 有效时才存入
    if (prodName && typeof prodName === "string" && prodName.trim() !== "") {
      map.set(prodId, {
        prodId: prodId,
        prodName: prodName.trim(),
      });
    }
  }
  // 直接返回 values 数组（避免额外遍历）
  return Array.from(map.values());
};
