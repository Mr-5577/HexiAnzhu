import { computed, unref, type MaybeRef, type Ref } from 'vue';
import { normalizeCode } from './common';
// /**
//  * @name 将扁平数组转换为树形结构
//  * @param list 扁平数据数组
//  * @returns 树形结构数组
//  */
// export const buildTree = <T extends { id: number; pid: number | null }>(
//   list: T[] = [],
// ): (T & { children?: T[] })[] => {
//   if (!list?.length) return [];

//   const map = new Map<number, T & { children?: T[] }>();
//   const tree: (T & { children?: T[] })[] = [];

//   // 初始化所有节点
//   list.forEach((item) => {
//     map.set(item.id, { ...item, children: [] });
//   });

//   // 构建父子关系
//   list.forEach((item) => {
//     const node = map.get(item.id)!;
//     // 判断是否为根节点：pid 为 null 或 0 或 undefined
//     const isRoot =
//       item.pid === null || item.pid === 0 || item.pid === undefined;

//     if (isRoot) {
//       tree.push(node);
//     } else {
//       const parent = map.get(item.pid);
//       if (parent) {
//         parent.children!.push(node);
//       } else {
//         // 父节点不存在时也作为根节点
//         tree.push(node);
//       }
//     }
//   });

//   return tree;
// };


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
  const allIds = new Set<number>();

  // 收集所有 id
  list.forEach((item) => {
    allIds.add(item.id);
    map.set(item.id, { ...item, children: [] });
  });

  // 构建父子关系
  list.forEach((item) => {
    const node = map.get(item.id)!;
    const parentId = item.pid;

    // 判断是否为根节点：
    // 1. pid 为 null / undefined / 0
    // 2. pid 不在数据中作为 id 存在（即父节点不存在）
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
        // 兜底：父节点不存在时也作为根节点
        tree.push(node);
      }
    }
  });

  return tree;
};

////////////////////按条件查询树的节点-start////////////////////////////////////
export interface ClassificationNode {
  [key: string]: any;
  children?: ClassificationNode[];
}

export interface ClassificationQueryOptions {
  // 字段名配置
  idField?: string;           // id字段名，默认 'id'
  pidField?: string;          // 父id字段名，默认 'pid'
  codeField?: string;         // 编码字段名，默认 'conTypeCode'
  nameField?: string;         // 名称字段名，默认 'conTypeName'
  childrenField?: string;     // 子节点字段名，默认 'children'
  
  // 层级配置
  targetLevel?: number;       // 目标层级，1表示顶级，2表示第二级，以此类推
  
  // 编码处理
  normalizeCode?: (code: any) => string;  // 编码标准化函数
  
  // 顶级节点判断函数（优先级高于targetLevel）
  isTopNode?: (node: any) => boolean;
}

export interface ClassificationResult<T = any> {
  id: string | number | null;
  code: string | null;
  name: string | null;
  level: number;              // 实际找到的层级
  node: T | null;             // 原始节点数据
}

/**
 * 获取节点路径（从当前节点到根节点）
 */
function getNodePath(
  tree: ClassificationNode[],
  nodeId: string | number | null | undefined,
  options: Required<Pick<ClassificationQueryOptions, 'idField' | 'pidField' | 'childrenField'>>
): ClassificationNode[] {
  const { idField, pidField, childrenField } = options;
  
  // 查找节点
  const findNode = (nodes: ClassificationNode[], id: any): ClassificationNode | undefined => {
    for (const node of nodes) {
      if (String(node[idField]) === String(id)) return node;
      if (node[childrenField]?.length) {
        const found = findNode(node[childrenField], id);
        if (found) return found;
      }
    }
    return undefined;
  };
  
  const path: ClassificationNode[] = [];
  let current = findNode(tree, nodeId);
  
  while (current) {
    path.unshift(current); // 添加到路径开头，保持从根到当前节点的顺序
    
    const parentId = current[pidField];
    if (parentId === 0 || parentId === null || parentId === undefined) {
      break; // 到达顶级节点
    }
    
    current = findNode(tree, parentId);
  }
  
  return path;
}

/**
 * 根据节点路径获取指定层级的节点
 */
function getNodeByLevel(
  path: ClassificationNode[],
  targetLevel: number,
  isTopNode?: (node: any) => boolean
): { node: ClassificationNode | null; actualLevel: number } {
  if (path.length === 0) {
    return { node: null, actualLevel: 0 };
  }
  
  // 如果提供了自定义顶级节点判断函数，使用它来确定层级
  if (isTopNode) {
    for (let i = 0; i < path.length; i++) {
      if (isTopNode(path[i])) {
        // 找到顶级节点，计算实际层级
        const actualLevel = i + 1;
        if (targetLevel <= actualLevel) {
          return { node: path[targetLevel - 1] || null, actualLevel };
        }
        break;
      }
    }
  }
  
  // 默认逻辑：路径中第一个节点是顶级（level 1）
  if (targetLevel <= path.length) {
    return { node: path[targetLevel - 1], actualLevel: path.length };
  }
  
  return { node: null, actualLevel: path.length };
}

/**
 * 查询分类节点信息（支持 ref）
 * @param tree 分类树数据（支持普通数组或 ref）
 * @param nodeId 要查询的节点ID
 * @param options 查询配置
 * @returns 查询结果，包含id、code、name、层级和原始节点
 */
export function queryClassificationNode<T extends ClassificationNode = ClassificationNode>(
  tree: MaybeRef<ClassificationNode[]>,
  nodeId: string | number | null | undefined,
  options: ClassificationQueryOptions = {}
): ClassificationResult<T> {
  const defaultOptions: Required<ClassificationQueryOptions> = {
    idField: 'id',
    pidField: 'pid',
    codeField: 'conTypeCode',
    nameField: 'conTypeName',
    childrenField: 'children',
    targetLevel: 1, // 默认查询顶级节点
    normalizeCode: normalizeCode,
    isTopNode: (node) => {
      const pid = node[defaultOptions.pidField];
      return pid === 0 || pid === null || pid === undefined;
    },
  };
  
  const opts = { ...defaultOptions, ...options };
  
  // 使用 unref 解包 ref
  const treeData = unref(tree);
  
  // 空值处理
  if (nodeId == null || !treeData?.length) {
    return {
      id: null,
      code: null,
      name: null,
      level: 0,
      node: null,
    };
  }
  
  // 获取节点路径
  const path = getNodePath(treeData, nodeId, {
    idField: opts.idField,
    pidField: opts.pidField,
    childrenField: opts.childrenField,
  });
  
  if (path.length === 0) {
    return {
      id: null,
      code: null,
      name: null,
      level: 0,
      node: null,
    };
  }
  
  // 获取指定层级的节点
  const { node: targetNode, actualLevel } = getNodeByLevel(
    path,
    opts.targetLevel,
    opts.isTopNode
  );
  
  if (!targetNode) {
    return {
      id: null,
      code: null,
      name: null,
      level: actualLevel,
      node: null,
    };
  }
  
  // 提取字段值
  const id = targetNode[opts.idField] || null;
  let code = targetNode[opts.codeField] || null;
  const name = targetNode[opts.nameField] || null;
  
  // 标准化编码
  if (code !== null && opts.normalizeCode) {
    code = opts.normalizeCode(code);
  }
  
  return {
    id,
    code,
    name,
    level: opts.targetLevel <= actualLevel ? opts.targetLevel : actualLevel,
    node: targetNode as T,
  };
}

/**
 * 判断节点是否属于指定分类（简化版，支持 ref）
 */
export function isNodeInClassification(
  tree: MaybeRef<ClassificationNode[]>,
  nodeId: string | number | null | undefined,
  targetCode: string,
  options: ClassificationQueryOptions = {}
): boolean {
  const result = queryClassificationNode(tree, nodeId, {
    ...options,
    targetLevel: 1, // 默认查询顶级节点
  });
  
  if (result.code == null) return false;
  
  const normalize = options.normalizeCode || normalizeCode;
  return normalize(result.code) === normalize(targetCode);
}

/**
 * 获取节点的完整分类路径（支持 ref）
 */
export function getClassificationPath(
  tree: MaybeRef<ClassificationNode[]>,
  nodeId: string | number | null | undefined,
  options: ClassificationQueryOptions = {}
): ClassificationResult[] {
  const defaultOptions: Required<ClassificationQueryOptions> = {
    idField: 'id',
    pidField: 'pid',
    codeField: 'conTypeCode',
    nameField: 'conTypeName',
    childrenField: 'children',
    targetLevel: 1,
    normalizeCode: normalizeCode,
    isTopNode: (node) => {
      const pid = node[defaultOptions.pidField];
      return pid === 0 || pid === null || pid === undefined;
    },
  };
  
  const opts = { ...defaultOptions, ...options };
  
  const treeData = unref(tree);
  
  if (nodeId == null || !treeData?.length) return [];
  
  const path = getNodePath(treeData, nodeId, {
    idField: opts.idField,
    pidField: opts.pidField,
    childrenField: opts.childrenField,
  });
  
  return path.map((node, index) => {
    const id = node[opts.idField] || null;
    let code = node[opts.codeField] || null;
    const name = node[opts.nameField] || null;
    
    if (code !== null && opts.normalizeCode) {
      code = opts.normalizeCode(code);
    }
    
    return {
      id,
      code,
      name,
      level: index + 1,
      node,
    };
  });
}

/**
 * 组合式函数版本（更符合 Vue 3 风格）
 */
export function useClassification<T extends ClassificationNode = ClassificationNode>(
  tree: MaybeRef<ClassificationNode[]>,
  options: ClassificationQueryOptions = {}
) {
  const treeData = computed(() => unref(tree));
  
  /**
   * 查询指定节点的分类信息
   */
  const queryNode = (
    nodeId: MaybeRef<string | number | null | undefined>,
    queryOptions: ClassificationQueryOptions = {}
  ): ClassificationResult<T> => {
    return queryClassificationNode<T>(treeData.value, unref(nodeId), {
      ...options,
      ...queryOptions,
    });
  };
  
  /**
   * 判断节点是否属于指定分类
   */
  const isInClassification = (
    nodeId: MaybeRef<string | number | null | undefined>,
    targetCode: string,
    queryOptions: ClassificationQueryOptions = {}
  ): boolean => {
    return isNodeInClassification(treeData.value, unref(nodeId), targetCode, {
      ...options,
      ...queryOptions,
    });
  };
  
  /**
   * 获取节点的完整分类路径
   */
  const getPath = (
    nodeId: MaybeRef<string | number | null | undefined>,
    queryOptions: ClassificationQueryOptions = {}
  ): ClassificationResult[] => {
    return getClassificationPath(treeData.value, unref(nodeId), {
      ...options,
      ...queryOptions,
    });
  };
  
  /**
   * 获取指定层级的分类信息
   */
  const getLevelInfo = (
    nodeId: MaybeRef<string | number | null | undefined>,
    targetLevel: number,
    queryOptions: ClassificationQueryOptions = {}
  ): ClassificationResult<T> => {
    return queryNode(nodeId, {
      ...queryOptions,
      targetLevel,
    });
  };
  
  return {
    queryNode,
    isInClassification,
    getPath,
    getLevelInfo,
    treeData,
  };
}

/**
 * 创建针对合同分类的工具函数
 */
export function createContractClassificationUtils(
  tree: MaybeRef<ClassificationNode[]>
) {
  const defaultOptions: ClassificationQueryOptions = {
    idField: 'id',
    pidField: 'pid',
    codeField: 'conTypeCode',
    nameField: 'conTypeName',
    childrenField: 'children',
    targetLevel: 1,
  };
  
  return useClassification(tree, defaultOptions);
}

////////////////////按条件查询树的节点-end////////////////////////////////////