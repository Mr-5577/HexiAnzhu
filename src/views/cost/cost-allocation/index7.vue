<!-- 成本分摊 组件 -->
<template>
  <div
    class="cost-allocation-container"
    :class="{ 'dialog-mode': isDialogMode }"
  >
    <header class="header-card">
      <div class="header-top">
        <h2>成本分摊</h2>
      </div>

      <el-row :gutter="16" class="summary-cards">
        <el-col :span="6">
          <div class="summary-item">
            <div class="label">单据类型</div>
            <el-select
              v-model="billType"
              size="default"
              style="width: 100%; margin-top: 4px"
            >
              <el-option label="定标参考价分摊" :value="0" />
              <el-option label="合同分摊" :value="1" />
              <el-option label="变更分摊" :value="2" />
              <el-option label="签证分摊" :value="3" />
              <el-option label="结算分摊" :value="4" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item bg-gray">
            <div class="label">成本金额</div>
            <div class="value large">{{ pageParams.allocAmt || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item bg-green">
            <div class="label">已分摊金额</div>
            <div class="value large green">{{ allocatedAmount }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item bg-gray-light">
            <div class="label">待分摊金额</div>
            <div class="value large gray">{{ pendingAmount }}</div>
          </div>
        </el-col>
      </el-row>
    </header>

    <!-- <el-card class="base-card" shadow="never">
      <div class="card-header">
        <span>
          <el-icon><OfficeBuilding /></el-icon>产品分摊
        </span>
      </div>
      <base-table
        ref="baseTableRef"
        :columns="prodColumns"
        :table-data="productTableData"
        row-key="name"
        :pagination="false"
        :show-toolbar="false"
        :show-action-bar="false"
        :border="true"
        :stripe="true"
        :auto-height="false"
        :compact-empty="true"
        height="200px"
      />
    </el-card> -->

    <el-card class="subject-card" shadow="never">
      <div class="card-header">
        <span>
          <el-icon><List /></el-icon>成本分摊明细
        </span>
        <div>
          <el-button plain type="primary" @click="handleChoose">
            选择分摊科目
          </el-button>
          <el-button
            type="primary"
            :loading="confirmLoading"
            :disabled="editableSubjectData.length == 0"
            @click="autoAllocation"
          >
            自动分摊
          </el-button>
        </div>
      </div>

      <!-- 可编辑表格：只有叶子节点可编辑 -->
      <editable-table
        ref="editableTableRef"
        row-key="id"
        height="300px"
        v-model="editableSubjectData"
        :columns="subjectColumns"
        :pagination="false"
        :highlight-current-row="false"
        :show-summary="false"
        :compact-empty="true"
        :editable="true"
        :on-save="handleSave"
      />
    </el-card>

    <el-card class="warning-card" shadow="never">
      <div class="card-header">
        <span>
          <el-icon><WarningFilled /></el-icon>成本分摊预警
        </span>
        <el-button
          type="primary"
          :disabled="editableSubjectData.length == 0"
          @click="handleViewAlloc"
        >
          查看分摊预警
        </el-button>
        <!-- <el-button
          link
          type="primary"
          @click="warningVisible = !warningVisible"
        >
          <el-icon>
            <ArrowUp v-if="warningVisible" />
            <ArrowDown v-else />
          </el-icon>
          {{ warningVisible ? "收起面板" : "展开面板" }}
        </el-button> -->
      </div>

      <div style="height: 330px">
        <template v-if="warningVisible">
          <!-- 预警图例 -->
          <div class="warning-stats">
            <span><span class="dot dot0"></span>红色预警</span>
            <span><span class="dot dot1"></span>黄色预警</span>
            <span><span class="dot dot2"></span>绿色预警</span>
          </div>

          <base-table
            ref="warningTableRef"
            :columns="warningColumns"
            :table-data="warningData"
            row-key="id"
            :pagination="false"
            :show-toolbar="false"
            :show-action-bar="false"
            :border="true"
            :stripe="false"
            height="300px"
            :compact-empty="true"
          >
            <template #allocWarn="{ row }">
              <span class="dot" :class="`dot${row.allocWarn}`"></span>
            </template>
          </base-table>
        </template>
        <template v-else>
          <el-empty :image-size="60" description="暂无数据" />
        </template>
      </div>
    </el-card>

    <!-- OA打开该页面时显示该按钮 -->
    <div class="footer-actions" v-if="!isDialogMode">
      <el-button type="primary" @click="handleConfirm">
        确认分摊提交
      </el-button>
    </div>

    <!-- 选择分摊科目弹窗   -->
    <CostAlocationDialog
      v-model="dialogVisible"
      :projectId="pageParams.projId"
      :selectedSubIds="selectedSubIds"
      @select="getSelectData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  OfficeBuilding,
  List,
  WarningFilled,
  ArrowUp,
  ArrowDown,
} from "@element-plus/icons-vue";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";
import { productTypeApi } from "@/api/cost/master-data/product-type-api";
import CostAlocationDialog from "./choose-sub-dialog.vue";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api.ts";
import { allocRuleEnum } from "@/constants/master-data/enums.ts";
import { costAllocationApi } from "@/api/cost/contract-manage/cost-allocation-api.ts";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api.ts";

interface Props {
  projId?: number; // 项目ID
  bizType?: string | number; // 业务类型
  bizBillId?: number; // 单据ID

  bizKeyId?: string | number; // 业务主键ID
  allocAmt?: number; // 分摊金额(含税)
  allocExclAmt?: number; // 分摊金额(不含税)
  isDialogMode?: boolean; // 是否为弹窗模式
}

const props = withDefaults(defineProps<Props>(), {
  projId: undefined,
  bizType: "",
  bizBillId: undefined,
  bizKeyId: "0",
  allocAmt: 0,
  allocExclAmt: 0,
  isDialogMode: false, // 页面模式，默认非弹窗模式
});

const emit = defineEmits<{
  confirm: [data: any];
  cancel: [];
  "save-draft": [data: any];
}>();

const route = useRoute();
const router = useRouter();

// 是否为弹窗模式（通过props或路由名称判断）
const isDialogMode = computed(() => {
  return props.isDialogMode;
});

const billType = ref(0); // 单据类型
const warningVisible = ref(false); // 预警面板展开状态
const confirmLoading = ref(false); // 自动分摊加载状态
const dialogVisible = ref(false); // 选择科目弹窗
const selectedSubIds = ref([]); // 已选中的科目ID列表

// 下拉选项数据
const subjectOptions = ref([]); // 科目选项
const productOptions = ref([]); // 产品选项
const busiSegOptions = ref([]); // 业务归属选项
const currentProducts = ref([]); // 当前产品列表

// 表格数据
const productTableData = ref([]); // 产品分摊表格数据
const editableSubjectData = ref([]); // 可编辑科目表格数据（树形）
const warningData = ref([]); // 预警表格数据
const subjectColumns = ref<EditableColumn[]>([]); // 动态生成的列配置

// 分摊信息
const apportionInfo = ref({
  allocAmt: 0,
  allocAmtNeed: 0,
  allocExclAmt: 0,
  allocExclAmtNeed: 0,
  allocList: [] as any[],
  allocStatus: 0,
  allocWarn: 0,
});

// 页面参数
const pageParams = ref({
  projId: undefined,
  bizType: "",
  bizBillId: undefined,
  bizKeyId: 0,
  allocAmt: 0,
  allocExclAmt: 0,
});

/**
 * 本次已分摊金额计算
 * 把叶子节点的科目金额(含税)累加起来
 */
const allocatedAmount = computed(() => {
  let total = 0;
  const traverse = (data: any[]) => {
    for (const item of data) {
      if (item.children?.length) {
        traverse(item.children);
      } else {
        total += Number(item.subjectAmt || 0);
      }
    }
  };
  traverse(editableSubjectData.value);
  return total;
});

/**
 * 待分摊金额 = 总金额 - 已分摊金额
 */
const pendingAmount = computed(
  () => (pageParams.value.allocAmt || 0) - allocatedAmount.value,
);

/**
 * 产品分摊表格列配置
 */
const prodColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60, fixed: "left" },
  { prop: "prodName", label: "产品名称" },
  { prop: "allocAmt", label: "已分摊(含税)" },
  { prop: "allocExclAmt", label: "已分摊(不含税)" },
  {
    label: "建筑面积(m²)",
    children: [
      { prop: "agBuildArea", label: "地上" },
      { prop: "ugBuildArea", label: "地下" },
    ],
  },
  {
    label: "可售面积(m²)",
    children: [
      { prop: "agSaleArea", label: "地上" },
      { prop: "ugSaleArea", label: "地下" },
    ],
  },
  { prop: "houseNum", label: "户数" },
  { prop: "elvNum", label: "电梯数" },
];

/**
 * 预警表格列配置
 */
const warningColumns = [
  {
    prop: "subName",
    label: "成本科目",
    align: "left",
    width: 200,
    fixed: "left",
  },
  { slot: "allocWarn", label: "预警状态", width: 100, fixed: "left" },
  {
    label: "分摊后余额",
    children: [
      { prop: "totalBalanceAmt", label: "小计" },
      { prop: "balanceAmt", label: "金额(含税)" },
      { prop: "balanceExclAmt", label: "金额(不含税)" },
    ],
  },
  {
    label: "目标成本可用额",
    children: [
      { prop: "totalAvailAmt", label: "小计" },
      { prop: "availAmt", label: "金额(含税)" },
      { prop: "availExclAmt", label: "金额(不含税)" },
    ],
  },
  {
    label: "当前分摊额",
    children: [
      { prop: "totalAllocAmt", label: "小计" },
      { prop: "allocAmt", label: "金额(含税)" },
      { prop: "allocExclAmt", label: "金额(不含税)" },
    ],
  },
];

/**
 * 判断节点是否为叶子节点
 */
const isLeafNode = (node: any) => node?.isLeaf === true;

/**
 * 安全数字转换
 */
const safeNumber = (val: any): number => Number(val) || 0;

/**
 * 按指定key分组
 */
const groupBy = <T,>(arr: T[], key: keyof T): Map<any, T[]> => {
  const map = new Map();
  for (const item of arr) {
    const k = item[key];
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(item);
  }
  return map;
};
const handleConfirm = () => {
  if (!editableSubjectData.value?.length) {
    ElMessage.warning("没有可分摊的数据，请先选择科目并填写分摊金额");
    return;
  }
  console.log(
    "确认提交分摊明细",
    convertTreeDataToRows(editableSubjectData.value, currentProducts.value),
  );
};
// 查看分摊预警明细
const handleViewAlloc = async () => {
  if (!editableSubjectData.value?.length) {
    ElMessage.warning("没有可分摊的数据，请先选择科目并填写分摊金额");
    return;
  }
  // 获取分摊明细最末级节点数据
  const leafSubjects = getLeafSubjects(editableSubjectData.value);
  // 校验叶子节点数据
  const result = validateLeafNodes(leafSubjects);
  // console.log(result, leafSubjects);
  if (!result.valid) {
    // ElMessage.error("分摊金额不能大于科目金额");
    const [firstError] = result.errors;
    const msg = `科目“${firstError.nodeName}”的分摊金额不能大于科目金额`;
    ElMessage.error(msg || "分摊金额不能大于科目金额");
    return;
  }
  // 更新分摊预警数据
  try {
    const subList = leafSubjects.map((item) => {
      return {
        subId: item.id,
        allocAmt: safeNumber(item.subjectAmt),
        allocExclAmt: safeNumber(item.subjectAmtExcl),
      };
    });
    const params = {
      projId: pageParams.value.projId,
      subAllocList: subList,
    };
    await getWarnSubAlloc(params);
    warningVisible.value = true;
  } catch (error) {}
};
/**
 * 校验叶子节点数据
 * @param leafNodes - 叶子节点数组
 * @returns 校验结果
 */
const validateLeafNodes = (leafNodes: any[]) => {
  const errors: any[] = [];

  leafNodes.forEach((node) => {
    // 1. 计算所有 allocAmt_* 的累计值
    let totalAllocAmt = 0;
    let totalAllocExclAmt = 0;

    Object.keys(node).forEach((key) => {
      if (key.startsWith("allocAmt_")) {
        totalAllocAmt += Number(node[key]) || 0;
      }
      if (key.startsWith("allocExclAmt_")) {
        totalAllocExclAmt += Number(node[key]) || 0;
      }
    });

    // 修复浮点数精度
    totalAllocAmt = Number(totalAllocAmt.toFixed(2));
    totalAllocExclAmt = Number(totalAllocExclAmt.toFixed(2));

    // 2. 获取科目金额
    const subjectAmt = Number((Number(node.subjectAmt) || 0).toFixed(2));
    const subjectAmtExcl = Number(
      (Number(node.subjectAmtExcl) || 0).toFixed(2),
    );

    // 3. 校验
    if (subjectAmt < totalAllocAmt) {
      errors.push({
        nodeId: node.id,
        nodeName: node.subName,
        field: "subjectAmt",
        subjectAmt,
        totalAllocAmt,
        diff: Number((totalAllocAmt - subjectAmt).toFixed(2)),
      });
    }

    if (subjectAmtExcl < totalAllocExclAmt) {
      errors.push({
        nodeId: node.id,
        nodeName: node.subName,
        field: "subjectAmtExcl",
        subjectAmtExcl,
        totalAllocExclAmt,
        diff: Number((totalAllocExclAmt - subjectAmtExcl).toFixed(2)),
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    totalNodes: leafNodes.length,
    errorCount: errors.length,
  };
};
/**
 * 1. 获取树形科目数据中的所有叶子节点（最末级科目）
 */
const getLeafSubjects = (treeData: any[]): any[] => {
  const leaves: any[] = [];
  const traverse = (nodes: any[], parentPath: string[] = []) => {
    for (const node of nodes) {
      const currentPath = [...parentPath, node.subName];
      if (node.children?.length) {
        traverse(node.children, currentPath);
      } else {
        leaves.push({
          ...node,
          fullPath: currentPath.join(" > "),
          isLeaf: true,
          parentIds: node.idPath?.split(",").filter(Boolean).map(Number) || [],
        });
      }
    }
  };
  traverse(treeData);
  return leaves;
};

/**
 * 2. 核心方法：合并树形科目数据和接口数据，进行行转列
 * 只有叶子节点才会显示业务归属、分摊规则等字段
 */
const mergeTreeWithApiData = (treeData: any[], apiData: any[]) => {
  // 获取所有叶子节点
  const leafSubjects = getLeafSubjects(treeData);

  // 提取唯一的业态列表
  const products = Array.from(
    new Map(apiData.map((item) => [item.prodId, { ...item }])).values(),
  );

  // 按 subId 分组接口数据
  const apiDataBySubId = groupBy(apiData, "subId");

  // 创建叶子节点数据映射
  const leafDataMap = new Map();
  for (const subject of leafSubjects) {
    const apiItems = apiDataBySubId.get(subject.id) || [];
    const row: any = {
      id: subject.id,
      subId: subject.id,
      subName: subject.subName,
      subCode: subject.subCode,
      fullPath: subject.fullPath || subject.subName,
      level: subject.subLevel || 1,
      isLeaf: true,
      // 只有叶子节点才有业务归属和分摊规则
      busiSegId: apiItems[0]?.busiSegId || 0,
      segName: apiItems[0]?.segName || "",
      allocRule: apiItems[0]?.allocRule || "",
      subjectAmt: 0,
      subjectAmtExcl: 0,
      _treeNode: subject,
    };

    // 初始化业态相关字段
    for (const product of products) {
      const pid = product.prodId;
      row[`costAmt_${pid}`] = 0;
      row[`costExclAmt_${pid}`] = 0;
      row[`allocAmt_${pid}`] = 0;
      row[`allocExclAmt_${pid}`] = 0;
      row[`allocWarn_${pid}`] = 0;
    }

    leafDataMap.set(subject.id, row);
  }

  // 构建树形结构：非叶子节点不显示业务归属和分摊规则
  const buildTree = (nodes: any[]): any[] => {
    return nodes.map((node) => {
      const hasChildren = !!node.children?.length;

      if (hasChildren) {
        // 非叶子节点：只保留结构，不显示业务归属和分摊规则
        return {
          ...node,
          id: node.id,
          subId: node.id,
          subName: node.subName,
          subCode: node.subCode,
          level: node.subLevel || 1,
          hasChildren: true,
          isLeaf: false,
          // 非叶子节点强制设为 undefined
          busiSegId: undefined,
          segName: undefined,
          allocRule: undefined,
          subjectAmt: 0,
          subjectAmtExcl: 0,
          ...Object.fromEntries(
            products.map((p) => [`costAmt_${p.prodId}`, 0]),
          ),
          ...Object.fromEntries(
            products.map((p) => [`costExclAmt_${p.prodId}`, 0]),
          ),
          ...Object.fromEntries(
            products.map((p) => [`allocAmt_${p.prodId}`, 0]),
          ),
          ...Object.fromEntries(
            products.map((p) => [`allocExclAmt_${p.prodId}`, 0]),
          ),
          ...Object.fromEntries(
            products.map((p) => [`allocWarn_${p.prodId}`, 0]),
          ),
          children: buildTree(node.children),
        };
      }

      // 叶子节点：使用合并后的数据
      return { ...node, ...leafDataMap.get(node.id), children: [] };
    });
  };

  return {
    subjects: leafSubjects,
    products: products,
    mergedData: buildTree(treeData),
  };
};

/**
 * 3. 合并已有数据到新数据中（保留已填写的金额和配置）
 */
const mergeExistingData = (newData: any[], oldData: any[]): any[] => {
  // 构建已有数据的映射（按 subId）
  const existingMap = new Map();
  const traverse = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.children?.length) {
        traverse(node.children);
      } else if (node.isLeaf) {
        const data: any = {
          subjectAmt: node.subjectAmt || 0,
          subjectAmtExcl: node.subjectAmtExcl || 0,
          busiSegId: node.busiSegId,
          segName: node.segName,
          allocRule: node.allocRule,
        };
        // 保存业态金额
        for (const key of Object.keys(node)) {
          if (key.startsWith("costAmt_") || key.startsWith("costExclAmt_")) {
            data[key] = node[key];
          }
        }
        existingMap.set(node.subId, data);
      }
    }
  };
  traverse(oldData);

  // 遍历新数据，合并已有数据
  const mergeTree = (nodes: any[]): any[] => {
    return nodes.map((node) => {
      if (node.children?.length) {
        return { ...node, children: mergeTree(node.children) };
      }
      const existing = existingMap.get(node.subId);
      return existing ? { ...node, ...existing } : node;
    });
  };

  return mergeTree(newData);
};

/**
 * 4. 检查是否有已填写的数据
 */
const checkHasData = (treeData: any[]): boolean => {
  let hasData = false;
  const traverse = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.children?.length) {
        traverse(node.children);
      } else if (node.isLeaf) {
        // 检查科目金额
        if (
          safeNumber(node.subjectAmt) > 0 ||
          safeNumber(node.subjectAmtExcl) > 0
        ) {
          hasData = true;
          return;
        }
        // 检查业态金额
        for (const key of Object.keys(node)) {
          if (key.startsWith("costAmt_") && safeNumber(node[key]) > 0) {
            hasData = true;
            return;
          }
        }
      }
    }
  };
  traverse(treeData);
  return hasData;
};

/**
 * 5. 生成动态表头（只有叶子节点可编辑）
 */
const generateColumns = (
  products: any[],
  busiSegOptions: any[],
): EditableColumn[] => {
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
      width: 100,
      editable: true,
      editType: "select",
      optionLabelField: "segName",
      optionValueField: "id",
      options: busiSegOptions,
      placeholder: " ",
      showOverflowTooltip: false,
      disabled: (row: any) => !isLeafNode(row), // 只有叶子节点可编辑
    },
    {
      prop: "allocRule",
      label: "分摊规则",
      width: 160,
      editable: true,
      editType: "select",
      optionLabelField: "label",
      optionValueField: "value",
      options: allocRuleEnum as any,
      placeholder: " ",
      showOverflowTooltip: false,
      disabled: (row: any) => !isLeafNode(row),
    },
    {
      prop: "subjectAmt",
      label: "科目金额(含税)",
      width: 140,
      editable: true,
      editType: "number",
      placeholder: " ",
      showOverflowTooltip: false,
      disabled: (row: any) => !isLeafNode(row),
    },
    {
      prop: "subjectAmtExcl",
      label: "科目金额(不含税)",
      width: 140,
      editable: true,
      editType: "number",
      placeholder: " ",
      showOverflowTooltip: false,
      disabled: (row: any) => !isLeafNode(row),
    },
  ];

  // 如果有产品，添加业态分摊明细列
  if (products.length) {
    const productColumns: EditableColumn[] = products.map((product) => ({
      prop: `prod_${product.prodId}`,
      label: product.prodName,
      children: [
        {
          prop: `allocAmt_${product.prodId}`,
          label: "金额(含税)",
          width: 100,
          editable: true,
          editType: "number",
          placeholder: " ",
          showOverflowTooltip: false,
          disabled: (row: any) => !isLeafNode(row),
        },
        {
          prop: `allocExclAmt_${product.prodId}`,
          label: "金额(不含税)",
          width: 100,
          editable: true,
          editType: "number",
          placeholder: " ",
          showOverflowTooltip: false,
          disabled: (row: any) => !isLeafNode(row),
        },
      ],
    }));

    baseColumns.push({
      label: "业态分摊明细",
      align: "center",
      children: productColumns,
    });
  }

  return baseColumns;
};

/**
 * 6. 列转行：将树形数据转回原始行数据格式（只提取叶子节点）
 */
const convertTreeDataToRows = (treeData: any[], products: any[]): any[] => {
  console.log("treeData", treeData, products);
  const rows: any[] = [];
  const traverse = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.children?.length) {
        traverse(node.children);
      } else if (node.isLeaf) {
        for (const product of products) {
          const pid = product.prodId;
          rows.push({
            subId: node.subId,
            subName: node.subName,
            subCode: node.subCode,
            prodId: pid,
            prodName: product.prodName,
            allocAmt: safeNumber(node[`allocAmt_${pid}`]),
            allocExclAmt: safeNumber(node[`allocExclAmt_${pid}`]),
            busiSegId: node.busiSegId || 0,
            segName: node.segName || "",
            allocRule: node.allocRule || "",
            level: node.level,
            fullPath: node.fullPath,
          });
        }
      }
    }
  };
  traverse(treeData);
  return rows;
};

/**
 * 增量更新预警数据（只更新指定科目的字段）
 * @param currentData 当前完整的预警树形数据
 * @param apiDataList 接口返回的预警数据列表（只包含部分科目）
 * @returns 更新后的完整数据
 */
// const mergeTreeDetailData = (currentData: any[], apiDataList: any[]) => {
//   // 如果没有当前数据，返回空数组
//   if (!currentData || !currentData.length) {
//     return [];
//   }

//   // 如果没有 API 数据，返回原数据
//   if (!apiDataList || !apiDataList.length) {
//     return currentData;
//   }

//   // 构建 API 数据的映射（按 subId）
//   const apiMap = new Map();
//   for (const item of apiDataList) {
//     if (item.subId) {
//       apiMap.set(item.subId, item);
//     }
//   }

//   // 需要更新的字段列表
//   const updateFields = [
//     "allocWarn",
//     "balanceAmt",
//     "balanceExclAmt",
//     "availAmt",
//     "availExclAmt",
//     "allocAmt",
//     "allocExclAmt",
//     "totalBalanceAmt",
//     "totalAvailAmt",
//     "totalAllocAmt",
//     "costAmt",
//     "costExclAmt",
//     "histAmt",
//     "histExclAmt",
//     "cumUsedAmt",
//     "cumUsedExclAmt",
//   ];

//   // 递归更新节点
//   const updateNode = (node: any): any => {
//     // 如果是叶子节点，检查是否有对应的 API 数据
//     if (!node.children || node.children.length === 0) {
//       const subId = node.subId || node.id;
//       const apiItem = apiMap.get(subId);

//       if (apiItem) {
//         // 只更新 API 返回的字段，保留其他所有字段
//         const updated = { ...node };
//         for (const key of updateFields) {
//           if (apiItem[key] !== undefined && apiItem[key] !== null) {
//             updated[key] = apiItem[key];
//           } else {
//             // 如果 API 没有返回该字段，设置默认值为 0
//             updated[key] = 0;
//           }
//         }
//         return updated;
//       }
//       // 没有 API 数据，返回原节点（保持不变）
//       return node;
//     }

//     // 非叶子节点：递归更新子节点
//     return {
//       ...node,
//       children: node.children.map((child: any) => updateNode(child)),
//     };
//   };

//   // 对每个根节点进行更新
//   return currentData.map((node: any) => updateNode(node));
// };

const mergeTreeDetailData = (currentData: any[], apiDataList: any[]) => {
  if (!currentData?.length || !apiDataList?.length) {
    return currentData;
  }

  // 构建 API 数据映射
  const apiMap = new Map(apiDataList.map((item) => [item.subId, item]));

  // 需要更新的字段
  const fields = [
    "allocWarn",
    "balanceAmt",
    "balanceExclAmt",
    "availAmt",
    "availExclAmt",
    "allocAmt",
    "allocExclAmt",
    "totalBalanceAmt",
    "totalAvailAmt",
    "totalAllocAmt",
    "costAmt",
    "costExclAmt",
    "histAmt",
    "histExclAmt",
    "cumUsedAmt",
    "cumUsedExclAmt",
  ];

  const updateNode = (node: any): void => {
    // 当前节点：如果有 API 数据则覆盖，否则设置默认值
    const apiItem = apiMap.get(node.subId || node.id);
    if (apiItem) {
      fields.forEach((key) => {
        node[key] = apiItem[key] ?? (key === "allocWarn" ? 2 : 0);
      });
    } else {
      fields.forEach((key) => {
        if (node[key] === undefined || node[key] === null) {
          node[key] = key === "allocWarn" ? 2 : 0;
        }
      });
    }

    // 递归处理子节点
    if (node.children?.length) {
      node.children.forEach((child: any) => updateNode(child));
    }
  };

  currentData.forEach((node) => updateNode(node));
  return currentData;
};
/**
 * 8. 将接口返回的分摊数据回填到表格
 */
const fillAllocationDataToTable = (
  treeData: any[],
  allocList: any[],
  products: any[],
): any[] => {
  // 构建 allocList 的映射（按 subId + prodId 组合）
  const allocMap = new Map(
    allocList.map((item) => [`${item.subId}_${item.prodId}`, item]),
  );

  const traverse = (nodes: any[]): any[] => {
    return nodes.map((node) => {
      if (node.children?.length) {
        return { ...node, children: traverse(node.children) };
      }
      if (!node.isLeaf) return node;

      const newNode = { ...node };
      // 遍历所有产品，回填分摊数据
      for (const product of products) {
        const pid = product.prodId;
        const key = `${node.subId}_${pid}`;
        const data = allocMap.get(key);
        newNode[`costAmt_${pid}`] = data?.costAmt || 0;
        newNode[`costExclAmt_${pid}`] = data?.costExclAmt || 0;
        newNode[`allocAmt_${pid}`] = data?.allocAmt || 0;
        newNode[`allocExclAmt_${pid}`] = data?.allocExclAmt || 0;
        newNode.allocWarn = data?.allocWarn ?? newNode.allocWarn ?? 0;
      }
      return newNode;
    });
  };

  return traverse(treeData);
};

/**
 * 9. 将分摊数据回填到产品主数据
 */
const fillDataToMain = (mainData: any[], tableData: any[]) => {
  const tableDataMap = groupBy(tableData, "prodId");

  return mainData.map((mainItem) => {
    const matched = tableDataMap.get(mainItem.prodId) || [];
    if (!matched.length) {
      return {
        ...mainItem,
        costAmt: 0,
        costExclAmt: 0,
        allocAmt: 0,
        allocExclAmt: 0,
        allocWarn: 0,
        subIds: [],
      };
    }

    // 合并多条数据
    const merged = matched.reduce(
      (acc, cur) => ({
        costAmt: safeNumber(acc.costAmt) + safeNumber(cur.costAmt),
        costExclAmt: safeNumber(acc.costExclAmt) + safeNumber(cur.costExclAmt),
        allocAmt: safeNumber(acc.allocAmt) + safeNumber(cur.allocAmt),
        allocExclAmt:
          safeNumber(acc.allocExclAmt) + safeNumber(cur.allocExclAmt),
        allocWarn: Math.max(
          safeNumber(acc.allocWarn),
          safeNumber(cur.allocWarn),
        ),
      }),
      {},
    );

    return {
      ...mainItem,
      ...merged,
      subIds: matched.map((item) => item.subId),
    };
  });
};

/**
 * 10. 构建非合同自动分摊接口提交参数
 */
const buildSubmitParams = (treeData: any[]) => {
  const subMap = new Map();
  const traverse = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.children?.length) {
        traverse(node.children);
      } else if (node.isLeaf && !subMap.has(node.subId)) {
        subMap.set(node.subId, {
          subId: node.subId,
          allocAmt: safeNumber(node.subjectAmt),
          allocExclAmt: safeNumber(node.subjectAmtExcl),
          allocRule: node.allocRule,
        });
      }
    }
  };
  traverse(treeData);

  const prodMap = new Map(
    currentProducts.value.map((p) => [
      p.prodId,
      { id: p.prodId, prodName: p.prodName },
    ]),
  );

  return {
    projId: pageParams.value.projId, // 项目ID
    subList: Array.from(subMap.values()), // 科目列表
    prodList: Array.from(prodMap.values()), // 产品列表
    isHasAlloc: true, // true表示查询动态成本总额
  };
};

/**
 * 获取业务归属列表
 */
const getBusiSegList = async () => {
  try {
    const res = await dictionaryApi.getsegmentList();
    if (res.code === 200) busiSegOptions.value = res.data || [];
  } catch (error) {
    console.error("获取业务归属失败:", error);
  }
};

/**
 * 获取项目产品类型列表
 */
const getProductList = async () => {
  if (!pageParams.value.projId) return;
  try {
    const res = await productTypeApi.getProductProjList({
      projId: pageParams.value.projId,
      withDetail: true,
    });
    if (res.code === 200) productOptions.value = res.data || [];
    else ElMessage.error(res.msg || "获取数据失败");
  } catch (error) {
    console.error("获取业态列表失败:", error);
  }
};

/**
 * 获取目标成本科目列表
 */
const getCostSubjectProjList = async () => {
  if (!pageParams.value.projId) {
    ElMessage.warning("请先选择项目");
    return;
  }
  try {
    const res = await costCategoryApi.getCostSubjectProjList({
      projId: pageParams.value.projId,
      withDetail: true,
    });
    if (res.code === 200) subjectOptions.value = res.data || [];
    else ElMessage.error(res.msg || "获取数据失败");
  } catch (error) {
    console.error("获取科目列表失败:", error);
  }
};

/**
 * 计算单次分摊预警状态
 */
const getWarnSubAlloc = async (params: any) => {
  if (!pageParams.value.projId) return;
  try {
    const res = await costAllocationApi.getWarnSubAlloc(params);
    if (res.code === 200 && res.data) {
      const { statusList } = res.data;

      // 为 statusList 添加小计字段
      const processedAllocList = (statusList || []).map((item: any) => ({
        ...item,
        totalBalanceAmt:
          (Number(item.balanceAmt) || 0) + (Number(item.balanceExclAmt) || 0),
        totalAvailAmt:
          (Number(item.availAmt) || 0) + (Number(item.availExclAmt) || 0),
        totalAllocAmt:
          (Number(item.allocAmt) || 0) + (Number(item.allocExclAmt) || 0),
      }));

      // ====== 关键修改：增量更新，只更新返回的科目 ======
      // 如果 warningData 为空，先初始化
      if (!warningData.value || !warningData.value.length) {
        // 使用 editableSubjectData 作为基础结构
        warningData.value = JSON.parse(
          JSON.stringify(editableSubjectData.value),
        );
      }
      // console.log("warningData:", warningData.value);
      // console.log("processedAllocList:", processedAllocList);
      // 增量更新：只更新 statusList 中存在的科目
      warningData.value = mergeTreeDetailData(
        warningData.value, // 传入当前完整的预警数据
        processedAllocList, // 传入需要更新的科目列表
      );
    }
  } catch (error) {
    console.error("获取预警状态失败:", error);
  }
};

/**
 * 获取当前面积版本明细数据
 */
const getAreaVersionDetail = async () => {
  if (!props.projId) return;
  try {
    // 先获取当前可用的目标成本版本
    const res = await costAllocationApi.getProjectCostMEnabled({
      projId: props.projId,
    });
    if (res.code === 200 && res.data?.areaVerMid) {
      const result = await projectAreaApi.getAreaVerDList({
        verMid: res.data.areaVerMid,
      });
      if (result.code === 200 && result.data) {
        productTableData.value = fillDataToMain(
          result.data,
          apportionInfo.value.allocList || [],
        );
      }
    }
  } catch (error) {
    console.error("获取面积版本明细失败:", error);
  }
};

/**
 * 从URL或Props获取参数
 */
const getParams: any = () => {
  if (props.projId) {
    return {
      projId: props.projId,
      bizType: props.bizType || "",
      bizBillId: props.bizBillId,
      bizKeyId: safeNumber(props.bizKeyId),
      allocAmt: props.allocAmt || 0,
      allocExclAmt: props.allocExclAmt || 0,
    };
  }
  return {
    projId: route.query.projId ? Number(route.query.projId) : undefined,
    bizType: (route.query.bizType as string) || "",
    bizBillId: route.query.bizBillId as string,
    bizKeyId: Number(route.query.bizKeyId) || 0,
    allocAmt: Number(route.query.allocAmt) || 0,
    allocExclAmt: Number(route.query.allocExclAmt) || 0,
  };
};

/**
 * 初始化页面
 */
const initPage = async () => {
  await getBusiSegList();

  // 解析参数，OA打开和业务弹窗打开
  pageParams.value = getParams();

  if (!pageParams.value.projId) {
    ElMessage.warning("缺少项目ID参数");
    return;
  }

  if (pageParams.value.bizType) {
    billType.value = pageParams.value.bizType as any;
  }

  await Promise.all([getCostSubjectProjList(), getProductList()]);

  if (pageParams.value.bizBillId) {
    await loadAllocationData(pageParams.value.bizBillId);
  }
};

/**
 * 加载已保存的分摊数据
 */
const loadAllocationData = async (bizBillId: number | string) => {
  try {
    console.log("加载分摊数据:", bizBillId);
  } catch (error) {
    console.error("加载分摊数据失败:", error);
  }
};

/**
 * 获取当前已选中的科目ID列表（用于回显）
 */
const getSelectedSubIds = (): number[] => {
  const ids: number[] = [];
  const traverse = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.children?.length) {
        traverse(node.children);
      } else if (node.isLeaf && node.subId) {
        ids.push(node.subId);
      }
    }
  };
  traverse(editableSubjectData.value);
  return ids;
};

/**
 * 弹窗选择科目
 */
const handleChoose = () => {
  selectedSubIds.value = getSelectedSubIds();
  dialogVisible.value = true;
};

/**
 * 接收选择的科目数据（包含合并逻辑）
 */
const getSelectData = (treeData: any, goalCostDetailList: any) => {
  // 重新选择分摊科目时隐藏分摊预警明细
  warningVisible.value = false;

  // 检查是否有已有数据
  const hasExistingData = checkHasData(editableSubjectData.value);

  // 执行数据合并（行转列）
  const result = mergeTreeWithApiData(treeData, goalCostDetailList);
  currentProducts.value = result.products;

  // 如果有已有数据，进行合并保留
  let finalData = result.mergedData;
  if (hasExistingData && editableSubjectData.value.length) {
    finalData = mergeExistingData(result.mergedData, editableSubjectData.value);
  }

  // 生成动态表头
  subjectColumns.value = generateColumns(result.products, busiSegOptions.value);
  editableSubjectData.value = finalData;

  // ====== 初始化预警数据（复制一份 editableSubjectData 的结构） ======
  // 深拷贝一份作为预警数据的基础结构
  warningData.value = JSON.parse(JSON.stringify(finalData));

  // 如果有接口返回的预警数据，进行合并
  if (goalCostDetailList && goalCostDetailList.length) {
    warningData.value = mergeTreeDetailData(
      warningData.value,
      goalCostDetailList,
    );
  }
  // console.log("初始化预警数据完成", warningData.value);
};

/**
 * 保存编辑（带防抖）
 */
const handleSave = async (data: any) => {
  // 只要修改表格分摊金额数据就隐藏分摊预警明细
  warningVisible.value = false;

  // 当改变科目金额含税/不含税时请求数据
  // const { column, row } = data;
  // const fieldMap: Record<string, string> = {
  //   subjectAmt: "allocAmt",
  //   subjectAmtExcl: "allocExclAmt",
  // };
  // const field = fieldMap[column];
  // if (!field) return;
  // // 防抖处理：避免频繁调用
  // clearTimeout((handleSave as any)._timer);
  // (handleSave as any)._timer = setTimeout(() => {
  //   // 只传递当前修改的科目数据
  //   getWarnSubAlloc({
  //     projId: pageParams.value.projId,
  //     subAllocList: [
  //       {
  //         subId: row.subId,
  //         allocAmt: row.subjectAmt || 0,
  //         allocExclAmt: row.subjectAmtExcl || 0,
  //       },
  //     ],
  //   });
  // }, 300);
};

/**
 * 自动分摊
 */
const autoAllocation = async () => {
  if (!editableSubjectData.value?.length) {
    ElMessage.warning("没有可分摊的数据，请先选择科目并填写分摊金额");
    return;
  }

  // 这里是非合同分摊的自动分摊调取接口的数据格式====合同自动分摊数据格式需要另外处理
  try {
    confirmLoading.value = true;
    // 调取非合同自动分摊接口获取各业态的分摊数据
    const params: any = buildSubmitParams(editableSubjectData.value);
    const result = await costAllocationApi.getNconAutoAlloc(params);
    if (result.code === 200 && result.data) {
      apportionInfo.value = { ...apportionInfo.value, ...result.data };
      const { allocList } = result.data;

      // 回填数据到分摊表格
      editableSubjectData.value = fillAllocationDataToTable(
        editableSubjectData.value,
        allocList,
        currentProducts.value,
      );

      console.log("自动分摊结果:", editableSubjectData.value);

      // ====== 更新预警数据（只更新 allocList 中的科目） ======
      // if (allocList && allocList.length) {
      //   // 将 allocList 转换为预警数据格式
      //   const warningUpdateList = allocList.map((item: any) => ({
      //     subId: item.subId,
      //     allocAmt: item.allocAmt || 0,
      //     allocExclAmt: item.allocExclAmt || 0,
      //     allocWarn: item.allocWarn || 0,
      //   }));

      //   // 确保 warningData 已初始化
      //   if (!warningData.value || !warningData.value.length) {
      //     warningData.value = JSON.parse(
      //       JSON.stringify(editableSubjectData.value),
      //     );
      //   }

      //   // 增量更新
      //   warningData.value = mergeTreeDetailData(
      //     warningData.value,
      //     warningUpdateList,
      //   );
      // }
      // 更新面积明细
      // await getAreaVersionDetail();
    }
  } catch (error) {
    console.error("自动分摊失败:", error);
  } finally {
    confirmLoading.value = false;
  }
};

onMounted(async () => {
  // 非弹窗模式时初始化
  if (!isDialogMode.value) {
    await initPage();
  }
});

// 监听弹窗模式下的参数变化
watch(
  () => [props.projId, props.bizBillId],
  () => {
    if (isDialogMode.value && props.projId) {
      initPage();
    }
  },
  { immediate: true },
);

defineExpose({
  initPage,
  // 分摊列表基础数据，树形数据结构数据
  getData: () => editableSubjectData.value,
  getBaseData: () => productTableData.value,
  // 页面查询参数
  getPageParams: () => pageParams.value,
  // 获取所有叶子节点
  getleafSubjects: () => {
    const leafSubjects = getLeafSubjects(editableSubjectData.value);
    // console.log("所有叶子节点", leafSubjects);
    return leafSubjects;
  },
  // 获取分摊的明细列表，列转行过后的数据
  getSubmitData: () =>
    convertTreeDataToRows(editableSubjectData.value, currentProducts.value),
});
</script>

<style scoped>
.cost-allocation-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px;
  background: #f3f4f6;
  font-size: 14px;
}

.cost-allocation-container.dialog-mode {
  padding: 0;
  background: transparent;
}

.cost-allocation-container.dialog-mode .header-card {
  margin-top: 0;
}

.header-card {
  padding: 16px 20px;
}

.header-card,
.base-card,
.subject-card,
.warning-card {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.header-card {
  position: sticky;
  top: 0;
  z-index: 30;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.header-top h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.summary-cards {
  margin: 12px 0;
}

.summary-item {
  height: 82px;
  background: #f0f7ff;
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid #dbeafe;
}

.summary-item .label {
  font-size: 14px;
  color: #6b7280;
}

.summary-item .value.large {
  font-size: 24px;
  font-weight: 700;
  margin-top: 4px;
}

.summary-item.bg-gray {
  background: #f9fafb;
  border-color: #e5e7eb;
}

.summary-item.bg-green {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.summary-item.bg-green .value {
  color: #10b981;
}

.summary-item.bg-gray-light {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.summary-item.bg-gray-light .value {
  color: #9ca3af;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 15px;
}

.card-header .el-icon {
  color: #2563eb;
  margin-right: 6px;
}

.warning-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
}

.warning-stats span {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.dot0 {
  background: #ef4444;
}

.dot.dot1 {
  background: #f59e0b;
}

.dot.dot2 {
  background: #10b981;
}
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  background: #ffffff;
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin-top: 16px;
  z-index: 20;
}
</style>
