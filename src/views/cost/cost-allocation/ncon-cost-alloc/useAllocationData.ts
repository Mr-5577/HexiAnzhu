// composables/useAllocationData.ts
import { ref, computed } from "vue";
import type { ProductInfo } from "./types";
import { getLeafNodes, removeNodeFromTree } from "./treeUtils";
import {
  summarizeTree,
  filterTreeByProducts,
  toNumber,
  round2,
  mergeDetailsToTree,
  summarizeTreeParentsOnly,
} from "./allocUtils";

export function useAllocationData() {
  // ========== 核心数据 ==========
  const treeData = ref<any[]>([]);
  const products = ref<ProductInfo[]>([]);
  const warningData = ref<any[]>([]);

  // ========== 派生状态 ==========
  const allocatedAmount = computed(() => {
    const leaves = getLeafNodes(treeData.value);
    return leaves.reduce((sum, node) => sum + toNumber(node.subjectAmt), 0);
  });

  const allocatedExclAmount = computed(() => {
    const leaves = getLeafNodes(treeData.value);
    return leaves.reduce((sum, node) => sum + toNumber(node.subjectAmtExcl), 0);
  });

  const leafNodes = computed(() => getLeafNodes(treeData.value));

  const hasData = computed(() => treeData.value.length > 0);

  const productIds = computed(() => products.value.map((p) => p.prodId));

  // ========== 操作方法 ==========

  /**
   * 设置数据
   */
  function setData(data: any[], prodList: ProductInfo[]) {
    treeData.value = data;
    products.value = prodList;
    if (data.length) {
      warningData.value = JSON.parse(JSON.stringify(data));
    }
  }

  /**
   * 汇总数据（从子节点累加到父节点）
   * 注意：叶子节点的 subjectAmt 由业态金额累加计算，会覆盖用户输入的 subjectAmt
   */
  function summarize() {
    if (!treeData.value.length || !products.value.length) return;
    treeData.value = summarizeTree(treeData.value, productIds.value);
  }

  /**
   * 仅汇总父级节点（不改变叶子节点的 subjectAmt）
   * 用于用户编辑 subjectAmt / subjectAmtExcl 后，只更新父级汇总值
   */
  function summarizeParentsOnly() {
    if (!treeData.value.length || !products.value.length) return;
    treeData.value = summarizeTreeParentsOnly(treeData.value, productIds.value);
  }

  /**
   * 过滤业态字段
   */
  function filterByProducts(prodIds: number[]) {
    if (!treeData.value.length) return;
    treeData.value = filterTreeByProducts(treeData.value, prodIds);
    summarize();
  }

  /**
   * 删除节点
   */
  function deleteNode(nodeId: number) {
    treeData.value = removeNodeFromTree(treeData.value, nodeId);
    if (products.value.length) {
      summarize();
    }
    if (warningData.value.length) {
      warningData.value = JSON.parse(JSON.stringify(treeData.value));
    }
  }

  /**
   * 合并明细数据到树
   */
  function mergeDetails(details: any[]) {
    if (!treeData.value.length || !products.value.length) return;
    treeData.value = mergeDetailsToTree(
      treeData.value,
      details,
      products.value,
    );
    summarize();
  }

  /**
   * 同步预警数据
   */
  function syncWarning() {
    if (treeData.value.length) {
      warningData.value = JSON.parse(JSON.stringify(treeData.value));
    } else {
      warningData.value = [];
    }
  }

  /**
   * 重置数据
   */
  function reset() {
    treeData.value = [];
    products.value = [];
    warningData.value = [];
  }

  /**
   * 更新树数据（外部直接赋值）
   */
  function updateTree(data: any[]) {
    treeData.value = data;
  }

  return {
    // 状态
    treeData,
    products,
    warningData,
    allocatedAmount,
    allocatedExclAmount,
    leafNodes,
    hasData,
    productIds,

    // 方法
    setData,
    summarize,
    summarizeParentsOnly,
    filterByProducts,
    deleteNode,
    mergeDetails,
    syncWarning,
    reset,
    updateTree,
  };
}
