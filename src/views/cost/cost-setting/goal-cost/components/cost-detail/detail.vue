<!-- 目标成本明细列表 -->
<template>
  <div class="cost-detail-page">
    <div>
      <div class="toolbar">
        <el-button
          type="primary"
          :loading="saveLoading"
          @click="handleBatchSave"
          v-if="!isDetail"
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
        :height="'500px'"
      >
      </editable-table>
    </div>

    <!-- 附件上传 -->
    <div class="item-card">
      <div class="section-title">相关附件</div>

      <el-form ref="formRef" label-width="120px" :inline="true">
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <el-form-item label="上传附件" label-width="90px">
              <base-upload
                v-model:file-list="annexFileList"
                :limit="9"
                :multiple="false"
                :showIcon="true"
                :showTip="true"
                :maxSize="20"
                :unrestricted="true"
                :accept="''"
                button-text="选择文件"
                size="default"
                :disabled="isDetail"
                @success="handleAnnexSuccess"
              ></base-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
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
  nextTick,
} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api.ts";
import { productTypeApi } from "@/api/cost/master-data/product-type-api.ts";
import { useRoute } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { buildTree } from "@/utils/tree";
import { allocRuleEnum } from "@/constants/master-data/enums";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";

defineOptions({ name: "cost-detail-list" });

interface Props {
  mode: "add" | "edit" | "detail";
  costMid?: undefined | number;
  projId?: undefined | number;
  areaVerMid?: undefined | number;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  costMid: undefined,
  projId: undefined,
  areaVerMid: undefined,
});

const route = useRoute();

const mode = ref<"add" | "edit" | "detail">(props.mode);

const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");

const saveLoading = ref(false);
// 表格相关
const tableLoading = ref(false);
const tableData = ref([]);
const annexFileList = ref([]);
const detailTableList = ref([]); // 目标成本明细列表

const flowBaseData = ref(null); // 流程基础信息

// 使用 shallowRef 减少响应式深度
const subjectOptions = shallowRef([]);
const productOptions = shallowRef([]);
const busiSegOptions = shallowRef([]);

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
    { type: "index", label: "序号", width: 60, editable: false, fixed: "left" },
    {
      prop: "subName",
      label: "成本科目",
      align: "left",
      width: 180,
      editable: false,
      showOverflowTooltip: true,
      fixed: "left",
    },
    {
      prop: "busiSegId",
      label: "业务归属",
      width: 120,
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
      showOverflowTooltip: false,
      disabled: (row: any) => !row.isLeaf,
      placeholder: " ",
      options: allocRuleEnum as any,
    },
    // 添加成本小计列
    {
      label: "成本小计",
      children: [
        {
          prop: "totalCostAmt",
          label: "含税小计",
          width: 120,
          editable: false,
          showOverflowTooltip: false,
        },
        {
          prop: "totalCostExclAmt",
          label: "不含税小计",
          width: 120,
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
          width: 120,
          editable: isDetail.value ? false : true,
          editType: "number",
          showOverflowTooltip: false,
          // 只有叶子节点可编辑
          disabled: (row: any) => !row.isLeaf,
          placeholder: " ",
        },
        {
          prop: `costExclAmt_${product.id}`,
          label: "金额(不含税)",
          width: 120,
          editable: isDetail.value ? false : true,
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

// 附件上传成功
const handleAnnexSuccess = (file: any) => {
  // console.log("相关附件上传成功", file);
  annexFileList.value.push(file);
  console.log("附件列表", annexFileList.value);
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
      projId: props.projId,
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
      projId: props.projId,
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

// 为每个科目节点添加业态数据,提取 buildTreeWithProducts 为独立函数
const buildTreeWithProducts = (nodes: any[]): any[] => {
  return nodes.map((node) => {
    const isLeaf = !node.children || node.children.length === 0;

    const rowData: any = {
      uuid: uuidv4(),
      _meta: Object.freeze({
        subId: node.id,
        subName: node.subName,
        subCode: node.subCode,
        subLevel: node.subLevel || 0,
      }),
      subId: node.id,
      subName: node.subName,
      subCode: node.subCode,
      subLevel: node.subLevel || 0,
      isLeaf: isLeaf,
      busiSegId: isLeaf ? node.busiSegId : null,
      segName: isLeaf ? node.segName : "",
      allocRule: isLeaf ? node.allocRule : null,
      allocRuleName: isLeaf ? node.allocRuleName : "",
      totalCostAmt: 0,
      totalCostExclAmt: 0,
      children: node.children ? buildTreeWithProducts(node.children) : [],
    };

    productOptions.value.forEach((product) => {
      rowData[`costAmt_${product.id}`] = isLeaf ? null : 0;
      rowData[`costExclAmt_${product.id}`] = isLeaf ? null : 0;
    });

    return rowData;
  });
};

/**
 * 生成所有科目列表
 * 为所有节点（包括父级）初始化业态金额字段
 */
const generateCombinations = async () => {
  // 为每个科目节点添加基础业态数据
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
          segName: targetData.segName,
        }));
      }
    } else {
      tableData.value = updateTreeNode(tableData.value, row.uuid, (node) => ({
        ...node,
        busiSegId: null,
        segName: "",
      }));
    }
    // 重置叶子节点缓存版本
    leafNodesVersion = 0;
    return;
  }

  // 选择分摊规则
  if (column === "allocRule") {
    if (newValue) {
      const targetData = allocRuleEnum.find((item) => item.value == newValue);
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

// 校验列表
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

  // for (let i = 0; i < leafNodes.length; i++) {
  //   const item = leafNodes[i];
  //   let hasValidAmount = false;

    // 检查业务归属是否已选择
    // if (!item.busiSegId) {
    //   ElMessage.error(`科目 "${item.subName}"：请选择业务归属`);
    //   return false;
    // }

    // // 检查分摊规则是否已选择
    // if (!item.allocRule) {
    //   ElMessage.error(`科目 "${item.subName}"：请选择分摊规则`);
    //   return false;
    // }

    // 检查所有业态的金额
    // productOptions.value.forEach((product) => {
    //   const costAmt = item[`costAmt_${product.id}`];
    //   const costExclAmt = item[`costExclAmt_${product.id}`];

    //   if (costAmt && costAmt > 0 && costExclAmt && costExclAmt > 0) {
    //     hasValidAmount = true;
    //   }
    // });

    // if (!hasValidAmount) {
    //   ElMessage.error(`科目 "${item.subName}"：至少需要填写一个业态的金额`);
    //   return false;
    // }
  // }
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
      // if (costAmt && costAmt > 0 && costExclAmt && costExclAmt > 0) {
      saveData.push({
        subId: row.subId,
        subName: row.subName,
        prodId: product.id,
        prodName: product.prodName,
        busiSegId: row.busiSegId,
        segName: row.segName,
        costAmt: costAmt || 0,
        costExclAmt: costExclAmt || 0,
        allocRule: row.allocRule,
        allocRuleName: row.allocRuleName,
      });
      // }
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

  try {
    saveLoading.value = true;
    const params = {
      costM: { id: props.costMid },
      costDList: saveData || [],
      annexList: annexFileList.value || [],
    };
    const res = await goalCostApi.saveProjectCostD(params);
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
// 获取详情数据
const getDetailData = async () => {
  try {
    detailTableList.value = [];
    const res = await goalCostApi.getProjectCostM({
      id: props.costMid,
    });
    console.log("详情res", res);
    if (res.code === 200 && res.data) {
      const { costDList, annexList } = res.data;
      // 如果详情信息里面有明细数据表示之前已经保存过，直接回显，否则查询上一版面积明细
      if (costDList && costDList.length > 0) {
        detailTableList.value = costDList || [];
      } else {
        // 查询上一版面积明细
        await getPrevVersionDetail();
      }

      annexFileList.value = (annexList || [])?.map((item) => {
        return {
          ...item,
          url: item.annexPath,
          name: item.annexName,
        };
      });
    }
  } catch (error) {}
};

// 获取上一版面积版本明细
const getPrevVersionDetail = async () => {
  if (!props.areaVerMid) return;
  try {
    const res = await goalCostApi.getCostPrevList({
      costMid: props.costMid,
    });
    if (res.code === 200 && res.data) {
      // console.log("上一版面积版本明细:", res.data);
      // 回显上一版本明细数据到表格
      detailTableList.value = res.data || [];
    }
  } catch (error) {
    ElMessage.error("加载数据失败");
  }
};

// 1. 新增：回显详情数据到表格（在表格数据生成后调用）
const fillDetailDataToTable = (detailData: any[]) => {
  if (!detailData?.length) return;

  // 构建 Map：key = "subId_prodId"
  const detailMap = new Map(
    detailData.map((item) => [`${item.subId}_${item.prodId}`, item]),
  );

  // 递归遍历 tableData，匹配并填充数据
  const fillTree = (nodes: any[]): any[] => {
    return nodes.map((node) => {
      // 如果是叶子节点，匹配详情数据
      if (node.isLeaf) {
        let hasData = false;
        // 遍历所有业态，查找对应的详情
        productOptions.value.forEach((prod) => {
          const key = `${node.subId}_${prod.id}`;
          const detail = detailMap.get(key);
          if (detail) {
            hasData = true;
            node[`costAmt_${prod.id}`] = detail.costAmt || 0;
            node[`costExclAmt_${prod.id}`] = detail.costExclAmt || 0;
          }
        });
        // 如果有数据，设置公共字段（取第一条）
        if (hasData) {
          const firstDetail = detailData.find((d) => d.subId === node.subId);
          if (firstDetail) {
            node.busiSegId = firstDetail.busiSegId;
            node.segName = firstDetail.segName || "";
            node.allocRule = firstDetail.allocRule;
            const rule = allocRuleEnum.find(
              (r) => r.value === firstDetail.allocRule,
            );
            node.allocRuleName = rule?.label || "";
          }
        }
      }
      // 递归子节点
      if (node.children?.length) {
        node.children = fillTree(node.children);
      }
      return node;
    });
  };

  // 直接在 tableData 上修改（引用传递）
  fillTree(tableData.value);
  // 重新计算汇总
  tableData.value = calculateAllTotals(tableData.value);
  leafNodesVersion = 0;
};

// 获取下拉数据
const initOptions = async () => {
  await Promise.all([
    getBusiSegList(), // 业务归属
    getSubjectProjList(), // 项目下的科目
    getProductList(), // 项目下的业态
  ]);
};

// 初始化处理
const syncRouteState = async () => {
  try {
    tableLoading.value = true;
    // 获取下拉数据
    await initOptions();

    // 先把基础科目和业态组合成基础列表数据
    await generateCombinations(); // 生成组合列表数据并回填基础数据

    // 获取详情数据
    await getDetailData();

    // 如果有明细数据，回显到表格
    if (detailTableList.value && detailTableList.value.length > 0) {
      fillDetailDataToTable(detailTableList.value);
    }
    // console.log("组合列表数据", tableData.value);
  } catch (error) {
    console.error("初始化数据失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

// watch(
//   () => [props.mode, props.costMid, props.projId],
//   () => {
//     syncRouteState();
//   },
//   { deep: true, immediate: true },
// );

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
  // min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  // flex: 1;
  // padding: 15px;
  // box-sizing: border-box;
  background: #fff;

  .toolbar {
    margin-bottom: 16px;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
  }
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  padding: 0 0 12px 14px;
  position: relative;

  &::before {
    content: "";
    width: 4px;
    height: 18px;
    background: linear-gradient(180deg, #409eff, #66b1ff);
    border-radius: 2px;
    position: absolute;
    left: 0;
    top: 4px;
  }
}
</style>
