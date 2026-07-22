<!-- 目标成本明细列表 -->
<template>
  <div class="cost-detail-page">
    <template v-if="!isDetail">
      <div class="toolbar">
        <el-button
          type="primary"
          :loading="saveLoading"
          @click="handleBatchSave"
        >
          批量保存
        </el-button>
      </div>
      <editable-table
        ref="detailtableRef"
        :row-key="'uuid'"
        v-model="tableData"
        :columns="dynamicColumns"
        :loading="tableLoading"
        :pagination="false"
        :highlight-current-row="false"
        :show-summary="false"
        :compactEmpty="true"
        :on-save="handleSave"
        :tree-props="{ children: 'children' }"
        :default-expand-all="false"
      >
      </editable-table>
    </template>
    <template v-else>
      <base-table
        :columns="detailColumns"
        :tableData="detailTableList"
        :rowKey="'id'"
        :pagination="false"
      >
        <template #allocRule="{ row }">
          {{ getAllocRuleName(row.allocRule) }}
        </template>
      </base-table>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  computed,
  onMounted,
  onBeforeUnmount,
  shallowRef,
  markRaw,
  nextTick,
} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import type { HCstProjectCostD } from "@/types/cost/cost-setting/goal-cost-type.ts";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api.ts";
import { productTypeApi } from "@/api/cost/master-data/product-type-api.ts";
import { useRoute } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { buildTree } from "@/utils/tree";

defineOptions({ name: "cost-detail-list" });

const route = useRoute();

const mode = ref<"add" | "edit" | "detail">("add");
const projId = ref(null);
const costMid = ref(null);

const isDetail = computed(() => route.query.mode === "detail");

const saveLoading = ref(false);
// 表格相关
const tableLoading = ref(false);
const tableData = ref([]);

// 使用 shallowRef 减少响应式深度
const subjectOptions = shallowRef([]);
const productOptions = shallowRef([]);
const busiSegOptions = shallowRef([]);

// 使用 markRaw 标记静态数据为非响应式
const allocRuleOptions = markRaw([
  { value: "RL_ALL", label: "按产品面积分摊" },
  { value: "RL_UP", label: "按地上产品面积分摊" },
  { value: "RL_DOWN", label: "按地下产品面积分摊" },
  { value: "RL_RF", label: "按地下人防面积分摊" },
  { value: "RL_NRF", label: "按地下非人防面积分摊" },
  { value: "RL_HS", label: "按户数分摊" },
  { value: "RL_DTS", label: "按电梯数分摊" },
]);

// 缓存动态列，避免重复计算
let cachedColumns: EditableColumn[] = [];
let lastProductOptionsHash = "";

// 缓存叶子节点列表
const leafNodesCache = ref([]);
let leafNodesVersion = 0;

// 生成动态表头（支持编辑）
const generateColumns = (): EditableColumn[] => {
  // 基础列
  const baseColumns: EditableColumn[] = [
    { type: "index", label: "序号", width: 60, editable: false },
    {
      prop: "subName",
      label: "成本科目",
      align: "left",
      width: 180,
      editable: false,
      showOverflowTooltip: true,
    },
    {
      prop: "busiSegId",
      label: "业务归属",
      width: 140,
      editable: true,
      editType: "select",
      optionLabelField: "segName",
      optionValueField: "id",
      options: busiSegOptions.value,
      showOverflowTooltip: false,
      disabled: (row: any) => !row.isLeaf,
      placeholder: " ",
    },
    {
      prop: "allocRule",
      label: "分摊规则",
      width: 160,
      editable: true,
      editType: "select",
      optionLabelField: "label",
      optionValueField: "value",
      options: allocRuleOptions,
      showOverflowTooltip: false,
      disabled: (row: any) => !row.isLeaf,
      placeholder: " ",
    },
    // 添加成本小计列
    {
      label: "成本小计",
      children: [
        {
          prop: "totalCostAmt",
          label: "含税小计",
          width: 140,
          editable: false,
          showOverflowTooltip: false,
        },
        {
          prop: "totalCostExclAmt",
          label: "不含税小计",
          width: 150,
          editable: false,
          showOverflowTooltip: false,
        },
      ],
    },
  ];

  // 生成业态多级表头
  const productColumns: EditableColumn[] = productOptions.value.map(
    (product) => ({
      prop: `prod_${product.id}`,
      label: product.prodName,
      children: [
        {
          prop: `costAmt_${product.id}`,
          label: "金额(含税)",
          width: 140,
          editable: true,
          editType: "number",
          showOverflowTooltip: false,
          // 只有叶子节点可编辑
          disabled: (row: any) => !row.isLeaf,
          placeholder: " ",
        },
        {
          prop: `costExclAmt_${product.id}`,
          label: "金额(不含税)",
          width: 140,
          editable: true,
          editType: "number",
          showOverflowTooltip: false,
          disabled: (row: any) => !row.isLeaf,
          placeholder: " ",
        },
      ],
    }),
  );

  // 如果业态数据存在，添加业态列
  if (productColumns.length > 0) {
    baseColumns.push({
      label: "业态",
      align: "center",
      children: productColumns,
    });
  }

  return baseColumns;
};

// 动态列使用缓存
const dynamicColumns = computed(() => {
  const hash = JSON.stringify(productOptions.value.map((p: any) => p.id));
  if (lastProductOptionsHash !== hash) {
    cachedColumns = generateColumns();
    lastProductOptionsHash = hash;
  }
  return cachedColumns;
});

const detailTableList = ref([]);
const detailColumns = ref([]);

const getAllocRuleName = (allocRule: string) => {
  const target = allocRuleOptions.find((item) => item.value === allocRule);
  return target ? target.label : "";
};

/**
 * 递归计算节点的所有汇总值（包括各业态汇总和总汇总）
 * 父级节点的业态金额 = 所有子节点该业态金额之和
 */
const calculateNodeTotal = (node: any): any => {
  // 初始化各业态汇总值
  const productTotals = {};
  productOptions.value.forEach((product) => {
    productTotals[`costAmt_${product.id}`] = 0;
    productTotals[`costExclAmt_${product.id}`] = 0;
  });

  let totalCostAmt = 0;
  let totalCostExclAmt = 0;

  // 如果是叶子节点，计算自身金额
  if (node.isLeaf) {
    productOptions.value.forEach((product) => {
      const costAmt = node[`costAmt_${product.id}`];
      const costExclAmt = node[`costExclAmt_${product.id}`];

      if (
        costAmt !== null &&
        costAmt !== undefined &&
        !isNaN(Number(costAmt))
      ) {
        const numValue = Number(costAmt);
        productTotals[`costAmt_${product.id}`] = numValue;
        totalCostAmt += numValue;
      }
      if (
        costExclAmt !== null &&
        costExclAmt !== undefined &&
        !isNaN(Number(costExclAmt))
      ) {
        const numValue = Number(costExclAmt);
        productTotals[`costExclAmt_${product.id}`] = numValue;
        totalCostExclAmt += numValue;
      }
    });
  } else {
    // 【关键】如果是父节点，从子节点汇总各业态金额
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        // 累加各业态金额（子节点的业态金额已经在递归计算时更新）
        productOptions.value.forEach((product) => {
          const childCostAmt = child[`costAmt_${product.id}`] || 0;
          const childCostExclAmt = child[`costExclAmt_${product.id}`] || 0;

          productTotals[`costAmt_${product.id}`] += childCostAmt;
          productTotals[`costExclAmt_${product.id}`] += childCostExclAmt;
        });

        // 累加总汇总
        totalCostAmt += child.totalCostAmt || 0;
        totalCostExclAmt += child.totalCostExclAmt || 0;
      });
    }
  }

  // 四舍五入保留两位小数
  const roundedProductTotals = {};
  productOptions.value.forEach((product) => {
    roundedProductTotals[`costAmt_${product.id}`] =
      Math.round(productTotals[`costAmt_${product.id}`] * 100) / 100;
    roundedProductTotals[`costExclAmt_${product.id}`] =
      Math.round(productTotals[`costExclAmt_${product.id}`] * 100) / 100;
  });

  return {
    ...node,
    ...roundedProductTotals, // 【关键】各业态汇总值也写入节点
    totalCostAmt: Math.round(totalCostAmt * 100) / 100,
    totalCostExclAmt: Math.round(totalCostExclAmt * 100) / 100,
  };
};

/**
 * 递归计算所有节点的小计（后序遍历：先子后父）
 */
const calculateAllTotals = (nodes: any) => {
  return nodes.map((node) => {
    // 先递归处理子节点
    let processedNode = node;
    if (node.children && node.children.length > 0) {
      processedNode = {
        ...node,
        children: calculateAllTotals(node.children),
      };
    }
    // 再计算当前节点（此时子节点已更新）
    return calculateNodeTotal(processedNode);
  });
};

/**
 * 递归更新树形数据中的节点
 */
const updateTreeNode = (
  nodes: any[],
  targetUuid: string,
  updater: (node: any) => any,
): any[] => {
  return nodes.map((node) => {
    // 找到目标节点
    if (node.uuid === targetUuid) {
      return updater(node);
    }
    // 递归查找子节点
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: updateTreeNode(node.children, targetUuid, updater),
      };
    }
    return node;
  });
};

/**
 * 递归获取所有叶子节点
 */
const getAllLeafNodes = (nodes: any[]): any[] => {
  const leaves: any[] = [];

  const traverse = (items: any[]) => {
    items.forEach((node) => {
      if (node.isLeaf) {
        leaves.push(node);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };

  traverse(nodes);
  return leaves;
};

/**
 * 获取缓存的叶子节点
 */
const getCachedLeafNodes = (nodes: any[]): any[] => {
  // 使用版本号判断是否需要重新计算
  const currentVersion = nodes.length;
  if (leafNodesVersion !== currentVersion) {
    leafNodesCache.value = getAllLeafNodes(nodes);
    leafNodesVersion = currentVersion;
  }
  return leafNodesCache.value;
};

/**
 * 获取目标成本科目列表
 */
const getSubjectProjList = async () => {
  try {
    const res = await costCategoryApi.getCostSubjectProjList({
      projId: projId.value,
      withDetail: true,
    });
    if (res.code === 200) {
      subjectOptions.value = buildTree(res.data || []);
    } else {
      ElMessage.error(res.msg || "获取数据失败");
    }
  } catch (error) {
    console.error("获取数据失败:", error);
  }
};

// 获取项目产品类型
const getProductList = async () => {
  try {
    const res = await productTypeApi.getProductProjList({
      projId: projId.value,
      withDetail: true,
    });
    if (res.code === 200) {
      productOptions.value = res.data || [];
    }
  } catch (error) {
    throw error;
  }
};

// 获取业务归属
const getBusiSegList = async () => {
  try {
    const res = await dictionaryApi.getsegmentList();
    if (res.code === 200) {
      busiSegOptions.value = res.data || [];
    }
  } catch (error) {
    throw error;
  }
};

/**
 * 生成所有科目列表
 * 为所有节点（包括父级）初始化业态金额字段
 */
const generateCombinations = () => {
  // 为每个科目节点添加业态数据
  const buildTreeWithProducts = (nodes: any[]): any[] => {
    return nodes.map((node) => {
      const isLeaf = !node.children || node.children.length === 0;

      const rowData: any = {
        uuid: uuidv4(),
        // 冻结静态元数据，减少响应式追踪
        _meta: Object.freeze({
          subId: node.id,
          subName: node.subName,
          subCode: node.subCode,
          subLevel: node.subLevel || 0,
        }),
        // 动态字段
        subId: node.id,
        subName: node.subName,
        subCode: node.subCode,
        subLevel: node.subLevel || 0,
        isLeaf: isLeaf,
        // 基础字段
        busiSegId: null,
        busiSegName: "",
        allocRule: null,
        allocRuleName: "",
        totalCostAmt: 0,
        totalCostExclAmt: 0,
        // 子节点
        children: node.children ? buildTreeWithProducts(node.children) : [],
      };

      // 为所有节点（包括父级）初始化业态金额字段
      // 叶子节点：用户可编辑，初始为 null
      // 父级节点：只读显示汇总值，初始为 0（后续由 calculateAllTotals 计算）
      productOptions.value.forEach((product) => {
        rowData[`costAmt_${product.id}`] = isLeaf ? null : 0;
        rowData[`costExclAmt_${product.id}`] = isLeaf ? null : 0;
      });

      return rowData;
    });
  };

  const treeData = buildTreeWithProducts(subjectOptions.value);
  // 计算所有节点的小计（包括各业态汇总）
  tableData.value = calculateAllTotals(treeData);
  // 重置叶子节点缓存版本
  leafNodesVersion = 0;
};

/**
 * 处理保存事件 - 确保父级汇总正确更新
 */
const handleSave = async (data: any) => {
  const { row, column, newValue, oldValue, rowIndex } = data;

  // 判断是否是动态业态列
  if (column && typeof column === "string") {
    // 处理业态金额列
    if (column.startsWith("costAmt_") || column.startsWith("costExclAmt_")) {
      // 只允许编辑叶子节点
      if (!row.isLeaf) {
        return;
      }

      // 更新叶子节点的金额
      tableData.value = updateTreeNode(tableData.value, row.uuid, (node) => {
        return { ...node, [column]: newValue };
      });

      // 【关键】重新计算所有节点的汇总（包括各业态汇总）
      // calculateAllTotals 会递归计算所有节点，父级节点的业态金额也会被正确汇总
      tableData.value = calculateAllTotals(tableData.value);

      // 重置叶子节点缓存版本
      leafNodesVersion = 0;
      return;
    }
  }

  // 选择业务归属
  if (column === "busiSegId") {
    if (newValue) {
      const targetData = busiSegOptions.value.find(
        (item) => item.id == newValue,
      );
      if (targetData) {
        tableData.value = updateTreeNode(tableData.value, row.uuid, (node) => ({
          ...node,
          busiSegId: newValue,
          busiSegName: targetData.segName,
        }));
      }
    } else {
      tableData.value = updateTreeNode(tableData.value, row.uuid, (node) => ({
        ...node,
        busiSegId: null,
        busiSegName: "",
      }));
    }
    // 重置叶子节点缓存版本
    leafNodesVersion = 0;
    return;
  }

  // 选择分摊规则
  if (column === "allocRule") {
    if (newValue) {
      const targetData = allocRuleOptions.find(
        (item) => item.value == newValue,
      );
      if (targetData) {
        tableData.value = updateTreeNode(tableData.value, row.uuid, (node) => ({
          ...node,
          allocRule: newValue,
          allocRuleName: targetData.label,
        }));
      }
    } else {
      tableData.value = updateTreeNode(tableData.value, row.uuid, (node) => ({
        ...node,
        allocRule: null,
        allocRuleName: "",
      }));
    }
    // 重置叶子节点缓存版本
    leafNodesVersion = 0;
    return;
  }
};

// 校验价税明细表
const validateTable = () => {
  if (tableData.value.length === 0) {
    ElMessage.error("暂无保存的数据");
    return false;
  }

  // 使用缓存的叶子节点
  const leafNodes = getCachedLeafNodes(tableData.value);

  if (leafNodes.length === 0) {
    ElMessage.error("没有可保存的科目数据");
    return false;
  }

  for (let i = 0; i < leafNodes.length; i++) {
    const item = leafNodes[i];
    let hasValidAmount = false;

    // 检查业务归属是否已选择
    if (!item.busiSegId) {
      ElMessage.error(`科目 "${item.subName}"：请选择业务归属`);
      return false;
    }

    // 检查分摊规则是否已选择
    if (!item.allocRule) {
      ElMessage.error(`科目 "${item.subName}"：请选择分摊规则`);
      return false;
    }

    // 检查所有业态的金额
    productOptions.value.forEach((product) => {
      const costAmt = item[`costAmt_${product.id}`];
      const costExclAmt = item[`costExclAmt_${product.id}`];

      if (costAmt && costAmt > 0 && costExclAmt && costExclAmt > 0) {
        hasValidAmount = true;
      }
    });

    if (!hasValidAmount) {
      ElMessage.error(`科目 "${item.subName}"：至少需要填写一个业态的金额`);
      return false;
    }
  }
  return true;
};

// 转换数据格式用于保存 - 每个叶子节点 × 每个业态 = 一条记录
const transformDataForSave = () => {
  const saveData = [];

  // 使用缓存的叶子节点
  const leafNodes = getCachedLeafNodes(tableData.value);

  leafNodes.forEach((row) => {
    // 遍历每个业态
    productOptions.value.forEach((product) => {
      const costAmt = row[`costAmt_${product.id}`];
      const costExclAmt = row[`costExclAmt_${product.id}`];
      // 只保存有金额的行
      if (costAmt && costAmt > 0 && costExclAmt && costExclAmt > 0) {
        saveData.push({
          subId: row.subId,
          subName: row.subName,
          prodId: product.id,
          prodName: product.prodName,
          busiSegId: row.busiSegId,
          busiSegName: row.busiSegName,
          costAmt: costAmt,
          costExclAmt: costExclAmt,
          allocRule: row.allocRule,
          allocRuleName: row.allocRuleName,
        });
      }
    });
  });

  return saveData;
};

const handleBatchSave = async () => {
  // 转换数据格式
  const saveData = transformDataForSave();
  console.log("保存数据", saveData);

  // 校验列表
  if (!validateTable()) return;

  if (saveData.length === 0) {
    ElMessage.warning("没有可保存的数据");
    return;
  }
  try {
    saveLoading.value = true;
    const res = await goalCostApi.batchSaveProjectCostD(
      costMid.value,
      saveData,
    );
    if (res.code === 200) {
      ElMessage.success("保存成功");
    } else {
      ElMessage.error(res.msg || "保存失败");
    }
  } catch (error) {
    console.error("保存失败", error);
  } finally {
    saveLoading.value = false;
  }
};

/**
 * 并行请求优化
 */
const syncRouteState = async () => {
  const queryMode = route.query.mode as string;
  mode.value = queryMode === "detail" ? queryMode : "add";

  const projIdValue = route.query.projId ? Number(route.query.projId) : null;
  projId.value = projIdValue || null;

  const costMidValue = route.query.costMid ? Number(route.query.costMid) : null;
  costMid.value = costMidValue || null;

  if (mode.value === "detail") {
    try {
      detailTableList.value = [];
      const res = await goalCostApi.getProjectCostM({
        id: costMid.value,
      });
      if (res.code === 200) {
        detailTableList.value = res.data || [];
      }
    } catch (error) {}
  } else {
    // 并行请求所有数据
    try {
      tableLoading.value = true;
      // 并行执行所有请求
      await Promise.all([
        getBusiSegList(),
        getSubjectProjList(),
        getProductList(),
      ]);

      // 所有数据加载完成后，组合列表数据
      await nextTick(); // 确保数据已更新
      generateCombinations();
    } catch (error) {
      console.error("初始化数据失败:", error);
    } finally {
      tableLoading.value = false;
    }
  }
};

onMounted(() => {
  syncRouteState();
});

/**
 * 清理资源
 */
onBeforeUnmount(() => {
  // 清理大数组引用，释放内存
  tableData.value = [];
  subjectOptions.value = [];
  productOptions.value = [];
  busiSegOptions.value = [];
  leafNodesCache.value = [];
  cachedColumns = [];

  // 重置缓存
  lastProductOptionsHash = "";
  leafNodesVersion = 0;
});
</script>

<style lang="scss" scoped>
.cost-detail-page {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px;
  box-sizing: border-box;
  background: #fff;

  .toolbar {
    margin-bottom: 16px;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
