// composables/useBuildingFilter.ts
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { projectAreaApi } from '@/api/cost/master-data/project-area-api';
import type { BuildingInfo, ProductInfo } from './types';

export function useBuildingFilter(
  treeData: any,
  products: any,
  onProductsChange?: (prodList: ProductInfo[]) => void
) {
  // ========== 状态 ==========
  const buildingOptions = ref<BuildingInfo[]>([]);
  const selectedBuildings = ref<number[]>([]);

  // ========== 计算属性 ==========
  const businessTypeNames = computed(() => {
    debugger
    if (!selectedBuildings.value.length || !buildingOptions.value.length) {
      return '';
    }

    const prodNames = buildingOptions.value
      .filter((item) => selectedBuildings.value.includes(item.id))
      .map((item) => item.prodNames || '')
      .filter((name) => name);

    return [...new Set(prodNames)].join('、');
  });

  // 获取当前选中的业态列表
  const currentProducts = computed<ProductInfo[]>(() => {
    const prodList: ProductInfo[] = [];

    buildingOptions.value
      .filter((item) => selectedBuildings.value.includes(item.id))
      .forEach((item) => {
        const ids = item.prodIds?.split(',').map(Number) || [];
        const names = item.prodNames?.split(',') || [];

        ids.forEach((id, index) => {
          if (id) {
            prodList.push({
              prodId: id,
              prodName: names[index]?.trim() || `业态${id}`,
            });
          }
        });
      });

    // 去重
    const unique = Array.from(
      new Map(prodList.map((p) => [p.prodId, p])).values()
    );
    return unique;
  });

  // ========== 方法 ==========

  /**
   * 加载楼栋列表
   */
  async function loadBuildings(projId?: number) {
    if (!projId) return;
    try {
      const res = await projectAreaApi.getBuildingList({ projId });
      if (res.code === 200) {
        buildingOptions.value = res.data || [];
      }
    } catch (error) {
      console.error('获取楼栋列表失败:', error);
    }
  }

  /**
   * 楼栋选择变化
   */
  function handleBuildingChange(selectedIds: number[]) {
    if (!selectedIds || selectedIds.length === 0) {
      // 清空所有楼栋
      selectedBuildings.value = [];
      // 清空产品
      products.value = [];
      if (onProductsChange) {
        onProductsChange([]);
      }
      return;
    }

    // 获取选中楼栋关联的业态
    const prodList = currentProducts.value;

    if (prodList.length === 0) {
      ElMessage.warning('所选楼栋暂无关联业态');
      products.value = [];
      if (onProductsChange) {
        onProductsChange([]);
      }
      return;
    }

    products.value = prodList;
    if (onProductsChange) {
      onProductsChange(prodList);
    }
  }

  /**
   * 自动匹配楼栋
   */
  function autoMatchBuildings(prodIds: number[]) {
    if (!prodIds?.length || !buildingOptions.value.length) return;

    const matched = buildingOptions.value
      .filter((bld) => {
        const bldProdIds = bld.prodIds?.split(',').map(Number) || [];
        return prodIds.some((id) => bldProdIds.includes(id));
      })
      .map((bld) => bld.id);

    if (matched.length) {
      selectedBuildings.value = matched;
      // 触发变化
      handleBuildingChange(matched);
    }
  }

  /**
   * 重置楼栋选择
   */
  function resetBuildings() {
    selectedBuildings.value = [];
  }

  return {
    // 状态
    buildingOptions,
    selectedBuildings,
    currentProducts,
    businessTypeNames,

    // 方法
    loadBuildings,
    handleBuildingChange,
    autoMatchBuildings,
    resetBuildings,
  };
}