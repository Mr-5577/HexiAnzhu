import { ref } from "vue";
import { largeScreenApi } from "@/api/sales/large-screen-api";
import { assetManagementApi } from "@/api/sales/asset-management-api";
import type {
  ProjectInterface,
  TypeInterface,
  StatusInterface,
} from "@/types/sales/asset-management-type";

// ============ 全局单例 ============
const cache = {
  projects: null as ProjectInterface[] | null,
  productTypes: null as TypeInterface[] | null,
  saleStatus: null as StatusInterface[] | null,
};

let loadingPromise: Promise<void> | null = null;

// 需要加载的数据类型（位运算标记）
const FLAGS = {
  PROJECTS: 1 << 0, // 项目
  PRODUCT_TYPES: 1 << 1, // 业态
  SALE_STATUS: 1 << 2, // 销售状态
};

/**
 * 管理共享数据 Hook（单例缓存版）
 *
 * 使用示例：
 * ```ts
 * const { projectOptions, loadData, getAllLeafProjectIds } = useSalesData();
 * await loadData({ projects: true }); // 按需加载
 * ```
 */
export function useSalesData() {
  const projectOptions = ref<ProjectInterface[]>(cache.projects || []);
  const productTypeList = ref<TypeInterface[]>(cache.productTypes || []);
  const saleStatusList = ref<StatusInterface[]>(cache.saleStatus || []);
  const loading = ref(false);

  /**
   * 通用请求封装
   */
  const fetchData = async <T>(
    apiFunc: () => Promise<{ code: number; data?: T }>,
    defaultValue: T,
  ): Promise<T> => {
    try {
      const res = await apiFunc();
      return res.code === 200 ? (res.data ?? defaultValue) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  /**
   * 获取树形结构的叶子节点 ID 集合
   * 用于项目树：只取最底层的项目 ID，上级节点不选
   * @param nodes 树形节点数组
   * @returns 所有叶子节点的 ID 数组
   * @example
   * const projectTree = [{ id: 1, children: [{ id: 2, children: [] }] }]
   * getLeafNodeIds(projectTree) // 返回 [2]
   */
  const getLeafNodeIds = (nodes: any[]): number[] => {
    const result: number[] = [];

    const traverse = (node: any) => {
      // 如果没有 children 或 children 为空，说明是叶子节点
      if (!node.children || node.children.length === 0) {
        result.push(node.id);
        return;
      }
      // 否则递归遍历子节点
      node.children.forEach(traverse);
    };

    nodes.forEach(traverse);
    return result;
  };

  /**
   * 更新响应式数据（同步缓存）
   */
  const updateReactiveData = () => {
    if (cache.projects) projectOptions.value = cache.projects;
    if (cache.productTypes) productTypeList.value = cache.productTypes;
    if (cache.saleStatus) saleStatusList.value = cache.saleStatus;
  };

  /**
   * 按需加载数据（自动去重）
   */
  const loadData = async (options: {
    projects?: boolean;
    productTypes?: boolean;
    saleStatus?: boolean;
  }) => {
    // 计算需要加载的标记
    let flags = 0;
    if (options.projects && !cache.projects) flags |= FLAGS.PROJECTS;
    if (options.productTypes && !cache.productTypes)
      flags |= FLAGS.PRODUCT_TYPES;
    if (options.saleStatus && !cache.saleStatus) flags |= FLAGS.SALE_STATUS;

    // 所有数据都已缓存，直接返回
    if (flags === 0) {
      updateReactiveData();
      return;
    }

    // 如果有正在进行的请求，等待它完成
    if (loadingPromise) {
      await loadingPromise;
      updateReactiveData();
      return;
    }

    // 发起请求
    loading.value = true;
    loadingPromise = (async () => {
      const tasks: Promise<void>[] = [];
      // 请求项目数据
      if (flags & FLAGS.PROJECTS) {
        tasks.push(
          fetchData(() => largeScreenApi.getProjTree(), []).then((data) => {
            cache.projects = data;
          }),
        );
      }
      // 请求业态数据
      if (flags & FLAGS.PRODUCT_TYPES) {
        tasks.push(
          fetchData(() => assetManagementApi.getProductTypeList(), []).then(
            (data) => {
              cache.productTypes = data;
            },
          ),
        );
      }
      // 请求销售状态数据
      if (flags & FLAGS.SALE_STATUS) {
        tasks.push(
          fetchData(() => assetManagementApi.getSaleStatusList(), []).then(
            (data) => {
              cache.saleStatus = data;
            },
          ),
        );
      }

      await Promise.all(tasks);
      updateReactiveData();
    })();

    try {
      await loadingPromise;
    } finally {
      loading.value = false;
      loadingPromise = null;
    }
  };

  /**
   * 加载全部数据
   */
  const loadAllData = () =>
    loadData({
      projects: true,
      productTypes: true,
      saleStatus: true,
    });

  /**
   * 重置缓存（退出登录时调用）
   */
  const resetData = () => {
    cache.projects = null;
    cache.productTypes = null;
    cache.saleStatus = null;
    projectOptions.value = [];
    productTypeList.value = [];
    saleStatusList.value = [];
    loading.value = false;
    loadingPromise = null;
  };

  return {
    // 数据
    projectOptions,
    productTypeList,
    saleStatusList,
    loading,

    // 方法
    getLeafNodeIds,
    loadData,
    loadAllData,
    resetData,

    // 快捷方法
    getAllLeafProjectIds: () => getLeafNodeIds(projectOptions.value),
    getAllProductTypeIds: () => productTypeList.value.map((item) => item.id),
    getAllSaleStatusIds: () => saleStatusList.value.map((item) => item.id),
  };
}
