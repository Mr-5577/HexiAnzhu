import { ref } from "vue";
import { largeScreenApi } from "@/api/large-screen-api";
import { assetManagementApi } from "@/api/asset-management-api";
import type {
  ProjectInterface,
  TypeInterface,
  StatusInterface,
} from "@/types/asset-management-type";

/**
 * 管理共享数据 Hook
 * 用于获取项目、业态、状态等公共数据
 */
export function useSalesData() {
  // 响应式数据
  const projectOptions = ref<ProjectInterface[]>([]);
  const productTypeList = ref<TypeInterface[]>([]);
  const saleStatusList = ref<StatusInterface[]>([]);
  const loading = ref(false);

  // 通用请求封装
  const fetchData = async <T>(
    apiFunc: () => Promise<{ code: number; data?: T }>,
    defaultValue: T,
  ): Promise<T> => {
    try {
      const res = await apiFunc();
      return res.code === 200 ? res.data || defaultValue : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  /**
   * 获取最后一层ID集合
   * @param nodes 树形节点数组
   * @returns 叶子节点ID数组
   */
  const getLeafNodeIds = (nodes: any[]): number[] => {
    const result: number[] = [];
    const traverse = (node: any) => {
      if (!node.children || node.children.length === 0) {
        result.push(node.id);
        return;
      }
      node.children.forEach(traverse);
    };
    nodes.forEach(traverse);
    return result;
  };

  /**
   * 按需加载数据
   * @param options 配置需要加载的数据类型
   * @param options.projects - 是否加载项目树数据，默认 false
   * @param options.productTypes - 是否加载业态列表数据，默认 false
   * @param options.saleStatus - 是否加载销售状态列表数据，默认 false
   * @returns Promise<void> 无返回值，数据会直接更新到对应的响应式变量中
   */
  const loadData = async (options: {
    projects?: boolean;
    productTypes?: boolean;
    saleStatus?: boolean;
  }) => {
    const {
      projects = false,
      productTypes = false,
      saleStatus = false,
    } = options;
    loading.value = true;
    const promises = [];
    // 获取项目数据
    if (projects) {
      promises.push(
        fetchData(() => largeScreenApi.getProjTree(), []).then((data) => {
          projectOptions.value = data;
        }),
      );
    }
    // 获取业态数据
    if (productTypes) {
      promises.push(
        fetchData(() => assetManagementApi.getProductTypeList(), []).then(
          (data) => {
            productTypeList.value = data;
          },
        ),
      );
    }
    // 获取状态数据
    if (saleStatus) {
      promises.push(
        fetchData(() => assetManagementApi.getSaleStatusList(), []).then(
          (data) => {
            saleStatusList.value = data;
          },
        ),
      );
    }

    try {
      await Promise.all(promises);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 快速加载全部数据
   */
  const loadAllData = async () => {
    return loadData({
      projects: true,
      productTypes: true,
      saleStatus: true,
    });
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

    // 快捷方法
    getAllLeafProjectIds: () => getLeafNodeIds(projectOptions.value),
    getAllProductTypeIds: () => productTypeList.value.map((item) => item.id),
    getAllSaleStatusIds: () => saleStatusList.value.map((item) => item.id),
  };
}
