import { ref } from "vue";
import { largeScreenApi } from "@/api/large-screen-api";
import { assetManagementApi } from "@/api/asset-management-api";
import type {
  ProjectInterface,
  TypeInterface,
  StatusInterface,
} from "@/types/asset-management-type";

// ============ 全局单例变量（模块级别，不在函数内部） ============

/** 全局缓存的项目数据，null 表示未加载 */
let globalProjectOptions: ProjectInterface[] | null = null;

/** 全局缓存的业态数据，null 表示未加载 */
let globalProductTypeList: TypeInterface[] | null = null;

/** 全局缓存的状态数据，null 表示未加载 */
let globalSaleStatusList: StatusInterface[] | null = null;

/** 是否正在加载中，用于防止并发重复请求 */
let isLoading = false;

/** 当前的加载 Promise，用于等待正在进行的请求 */
let loadPromise: Promise<void> | null = null;

/** 记录需要加载的数据类型（合并多次调用的配置） */
let pendingConfig = {
  projects: false,
  productTypes: false,
  saleStatus: false,
};

/**
 * 管理共享数据 Hook
 * 特点：
 * 1. 单例模式：多次调用只请求一次接口，所有页面共享同一份数据
 * 2. 自动合并：多个页面同时调用 loadData 时，只会发起一次请求
 * 3. 零改动：现有页面代码无需修改，直接使用即可
 *
 * 使用示例：
 * ```ts
 * const { projectOptions, productTypeList, loadData, getAllLeafProjectIds } = useSalesData();
 * // 在页面初始化时调用
 * await loadData({ projects: true, productTypes: true });
 * // 直接使用数据
 * console.log(projectOptions.value);
 * console.log(getAllLeafProjectIds());
 * ```
 */
export function useSalesData() {
  // 使用全局缓存的数据初始化响应式变量
  // 如果全局已有数据，新创建的页面会立即获得数据，无需等待
  const projectOptions = ref<ProjectInterface[]>(globalProjectOptions || []);
  const productTypeList = ref<TypeInterface[]>(globalProductTypeList || []);
  const saleStatusList = ref<StatusInterface[]>(globalSaleStatusList || []);
  const loading = ref(isLoading);

  /**
   * 封装 API 请求，统一处理响应码和错误
   * @param apiFunc API 调用函数
   * @param defaultValue 请求失败时的默认值
   * @returns 请求成功返回数据，失败返回默认值
   */
  const fetchData = async <T>(
    apiFunc: () => Promise<{ code: number; data?: T }>,
    defaultValue: T,
  ): Promise<T> => {
    try {
      const res = await apiFunc();
      return res.code === 200 ? res.data || defaultValue : defaultValue;
    } catch {
      // 静默失败，不抛出错误，避免影响页面渲染
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
   * 按需加载数据（单例模式，全局只请求一次）
   *
   * 工作原理：
   * 1. 第一次调用时，发起真实请求，缓存结果
   * 2. 后续调用时，直接返回已缓存的数据，不再请求
   * 3. 多个页面同时调用时，只会发起一次请求，其他页面等待同一个 Promise
   *
   * @param options 配置需要加载的数据类型
   * @param options.projects - 是否加载项目树数据
   * @param options.productTypes - 是否加载业态列表数据
   * @param options.saleStatus - 是否加载销售状态列表数据
   *
   * @example
   * // 页面中使用
   * const { loadData, projectOptions } = useSalesData();
   * await loadData({ projects: true, productTypes: true });
   * // 之后直接使用 projectOptions.value
   */
  const loadData = async (options: {
    projects?: boolean;
    productTypes?: boolean;
    saleStatus?: boolean;
  }) => {
    // 步骤1：合并配置 - 记录需要加载哪些数据
    // 这样即使多个页面传不同的配置，最终也会加载所有需要的数据
    pendingConfig = {
      projects: pendingConfig.projects || options.projects || false,
      productTypes: pendingConfig.productTypes || options.productTypes || false,
      saleStatus: pendingConfig.saleStatus || options.saleStatus || false,
    };

    // 步骤2：检查数据是否已存在
    const hasProjects =
      !pendingConfig.projects || globalProjectOptions !== null;
    const hasProductTypes =
      !pendingConfig.productTypes || globalProductTypeList !== null;
    const hasSaleStatus =
      !pendingConfig.saleStatus || globalSaleStatusList !== null;

    // 如果所有需要的数据都已存在，直接返回，不发起请求
    if (hasProjects && hasProductTypes && hasSaleStatus) {
      return;
    }

    // 步骤3：防止并发重复请求
    // 如果有正在进行的请求，直接等待它完成
    if (loadPromise) {
      await loadPromise;
      // 等待完成后，更新当前页面的响应式数据
      if (globalProjectOptions) projectOptions.value = globalProjectOptions;
      if (globalProductTypeList) productTypeList.value = globalProductTypeList;
      if (globalSaleStatusList) saleStatusList.value = globalSaleStatusList;
      loading.value = isLoading;
      return;
    }

    // 步骤4：发起真实请求
    isLoading = true;
    loading.value = true;

    loadPromise = (async () => {
      const promises = [];

      // 加载项目数据（仅当需要且未加载时）
      if (pendingConfig.projects && globalProjectOptions === null) {
        promises.push(
          fetchData(() => largeScreenApi.getProjTree(), []).then((data) => {
            globalProjectOptions = data;
            projectOptions.value = data;
          }),
        );
      }

      // 加载业态数据（仅当需要且未加载时）
      if (pendingConfig.productTypes && globalProductTypeList === null) {
        promises.push(
          fetchData(() => assetManagementApi.getProductTypeList(), []).then(
            (data) => {
              globalProductTypeList = data;
              productTypeList.value = data;
            },
          ),
        );
      }

      // 加载状态数据（仅当需要且未加载时）
      if (pendingConfig.saleStatus && globalSaleStatusList === null) {
        promises.push(
          fetchData(() => assetManagementApi.getSaleStatusList(), []).then(
            (data) => {
              globalSaleStatusList = data;
              saleStatusList.value = data;
            },
          ),
        );
      }

      // 等待所有请求完成
      await Promise.all(promises);

      // 重置加载状态
      isLoading = false;
      loading.value = false;
      loadPromise = null;
    })();

    await loadPromise;
  };

  const loadAllData = async () => {
    return loadData({
      projects: true,
      productTypes: true,
      saleStatus: true,
    });
  };

  /**
   * 重置所有缓存数据
   * 通常在用户退出登录时调用，清空缓存
   * @example
   * // 退出登录时调用
   * const { resetData } = useSalesData();
   * resetData();
   */
  const resetData = () => {
    globalProjectOptions = null;
    globalProductTypeList = null;
    globalSaleStatusList = null;
    isLoading = false;
    loadPromise = null;
    pendingConfig = { projects: false, productTypes: false, saleStatus: false };

    // 清空响应式数据
    projectOptions.value = [];
    productTypeList.value = [];
    saleStatusList.value = [];
    loading.value = false;
  };

  // ============ 返回给页面使用的方法和数据 ============
  return {
    // 响应式数据
    projectOptions, // 项目树数据
    productTypeList, // 业态列表
    saleStatusList, // 销售状态列表
    loading, // 加载状态

    // 工具方法
    getLeafNodeIds, // 获取叶子节点ID

    // 核心方法
    loadData, // 加载数据（自动处理单例）
    loadAllData, // 加载所有数据（自动处理单例）
    resetData, // 重置缓存（退出登录时调用）

    // 快捷方法（常用场景的封装）
    getAllLeafProjectIds: () => getLeafNodeIds(projectOptions.value),
    getAllProductTypeIds: () => productTypeList.value.map((item) => item.id),
    getAllSaleStatusIds: () => saleStatusList.value.map((item) => item.id),
  };
}
