import { ref, reactive, onMounted } from "vue";
import { dictionaryApi } from "@/api/cost/dictionary-api";
import type { DictItem, DictItemTreeNode } from "@/types/cost/dict-type";
import { buildTree } from "@/utils/tree";

export interface UseDictOptions {
  /** 是否只获取启用的字典项，默认true */
  onlyEnabled?: boolean;
  /** 是否立即加载，默认false */
  immediate?: boolean;
  /** 需要转换为树形结构的字典编码列表 */
  treeDictCodes?: string[];
}

/**
 * @name 数据字典Hook
 * @param dictList 需要加载的字典编码列表
 * @param options 配置选项
 */
export function useDict(dictList: string[], options: UseDictOptions = {}) {
  const { onlyEnabled = true, immediate = false, treeDictCodes = [] } = options;

  // 存储过滤后的字典数据（扁平结构）
  const dictListMap = reactive<Record<string, DictItem[]>>({});
  // 存储树形结构的字典数据
  const dictTreeMap = reactive<Record<string, DictItemTreeNode[]>>({});
  // 全局加载状态
  const loading = ref(false);
  // 每个字典的独立加载状态
  const loadingMap = reactive<Record<string, boolean>>({});

  /**
   * 过滤字典数据，根据onlyEnabled决定是否过滤禁用项
   */
  const normalize = (items: DictItem[]) =>
    onlyEnabled ? items.filter((item) => item.isEnabled === true) : items;

  /** 解析字典值，将纯数字字符串转成 number */
  const parseDictValue = (value: unknown) => {
    if (typeof value !== "string") return value;
    return /^-?\d+$/.test(value) ? Number(value) : value;
  };

  /**
   * @name 加载单个字典
   * @param groupCode 字典编码
   */
  const loadDict = async (groupCode: string) => {
    loadingMap[groupCode] = true;
    try {
      const res = await dictionaryApi.getDicItemByGroupCode({
        groupCode,
        onlyEnabled,
      });
      if (res.code === 200) {
        const raw = res.data || [];
        const enabledList = normalize(raw);
        const normalized = enabledList;
        // 存储扁平数据
        dictListMap[groupCode] = normalized;
        // 如果该字典需要树形结构，则构建树形数据
        if (treeDictCodes.includes(groupCode)) {
          dictTreeMap[groupCode] = buildTree(normalized);
        }
      }
      return res;
    } finally {
      loadingMap[groupCode] = false;
    }
  };

  /**
   * @name 批量加载所有字典
   */
  const loadDicts = async () => {
    loading.value = true;
    try {
      await Promise.all(dictList.map((code) => loadDict(code)));
    } finally {
      loading.value = false;
    }
  };

  /**
   * @name 获取字典的扁平数据列表
   * @param groupCode 字典编码
   */
  const getDictList = (groupCode: string) => dictListMap[groupCode] || [];

  /**
   * @name 获取字典的树形数据列表
   * @param groupCode 字典编码
   */
  const getDictTree = (groupCode: string) => dictTreeMap[groupCode] || [];

  /**
   * @name 通用的树形查找函数
   * @param tree 树形数据
   * @param predicate 判断函数
   * @returns
   */
  const findInTree = <T extends { children?: T[] }>(
    tree: T[],
    predicate: (node: T) => boolean,
  ): T | null => {
    for (const node of tree) {
      if (predicate(node)) return node;
      if (node.children?.length) {
        const found = findInTree(node.children, predicate);
        if (found) return found;
      }
    }
    return null;
  };

  /**
   * @name 根据字典值获取对应的显示标签
   * @param groupCode 字典编码
   * @param value 字典值
   * @returns 显示标签，找不到时返回原值
   */
  const getDictLabel = (groupCode: string, value: string | number) => {
    // 先在扁平数据中查找
    const flatItem = getDictList(groupCode).find(
      (item) => item.id == value,
    );
    if (flatItem) return flatItem.dicLabel;

    // 树形字典递归查找
    if (isTreeDict(groupCode)) {
      const node = findInTree(
        getDictTree(groupCode),
        (n) => n.id == value,
      );
      if (node) return node.dicLabel;
    }

    return String(value);
  };

  /**
   * @name 判断指定字典是否为树形结构
   * @param groupCode 字典编码
   */
  const isTreeDict = (groupCode: string) => treeDictCodes.includes(groupCode);

  // 立即加载
  if (immediate) {
    onMounted(loadDicts);
  }

  return {
    // 数据
    dictListMap, // 扁平数据映射
    dictTreeMap, // 树形数据映射
    loading, // 全局加载状态
    loadingMap, // 各字典独立加载状态

    // 方法
    loadDicts, // 批量加载所有字典
    loadDict, // 加载单个字典
    reloadDict: loadDict, // 重新加载字典（别名）

    // 获取数据
    getDictList, // 获取扁平数据
    getDictTree, // 获取树形数据
    getDictLabel, // 值转标签
    isTreeDict, // 判断是否为树形字典
  };
}
