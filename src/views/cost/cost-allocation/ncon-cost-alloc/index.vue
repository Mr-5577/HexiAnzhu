<!-- index.vue -->
<template>
  <div
    class="cost-allocation-container"
    :class="{ 'dialog-mode': isDialogMode }"
  >
    <!-- 顶部汇总 -->
    <AllocationHeader
      :bizType="pageParams.bizType"
      :allocAmt="pageParams.allocAmt"
      :allocatedAmount="allocatedAmount"
      :pendingAmount="pendingAmount"
      :isDialogMode="isDialogMode"
    />

    <!-- 分摊明细表格 -->
    <SubjectTable
      v-model:treeData="treeData"
      v-model:selectedBuildings="selectedBuildings"
      :products="products"
      :pageParams="pageParams"
      :buildingOptions="buildingOptions"
      :isView="isView"
      :hasData="hasData"
      :confirmLoading="confirmLoading"
      :businessTypeNames="businessTypeNames"
      :busiSegOptions="busiSegOptions"
      @choose="handleChoose"
      @autoAlloc="autoAllocation"
      @delete="handleDelete"
      @save="handleSave"
    />

    <!-- 预警面板 -->
    <WarningPanel
      v-model:warningData="warningData"
      :hasData="hasData"
      :warningVisible="warningVisible"
      @view="handleViewWarning"
    />

    <!-- 底部操作 -->
    <div class="footer-actions" v-if="!isDialogMode && !isView">
      <el-button type="primary" :loading="submitLoading" @click="handleConfirm">
        确认分摊提交
      </el-button>
    </div>

    <!-- 选择科目弹窗 -->
    <CostAllocationDialog
      v-model="dialogVisible"
      :projectId="pageParams.projId"
      :selectedSubIds="selectedSubIds"
      @select="onDialogSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import AllocationHeader from "./allocation-header.vue";
import SubjectTable from "./subject-table.vue";
import WarningPanel from "./warning-panel.vue";
import CostAllocationDialog from "../choose-sub-dialog.vue";

// Composables
import { useAllocationData } from "./useAllocationData";
import { useBuildingFilter } from "./useBuildingFilter";
import { useAllocationActions } from "./useAllocationActions";

// Utils
import { toNumber, round2 } from "./allocUtils";
import { getLeafNodes } from "./treeUtils";
import { buildTree } from "./treeUtils";
import { filterTreeByIds } from "./treeUtils";
import { costAllocationApi } from "@/api/cost/contract-manage/cost-allocation-api";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";

// ========== Props & Emits ==========
interface Props {
  projId?: number;
  projName?: string;
  displayName?: string;
  bizType?: string;
  allocAmt?: number;
  allocExclAmt?: number;
  isDialogMode?: boolean;
  cstMData?: any;
  dialogMode?: string;
}

const props = withDefaults(defineProps<Props>(), {
  projId: undefined,
  projName: "",
  displayName: "",
  bizType: "",
  allocAmt: 0,
  allocExclAmt: 0,
  isDialogMode: false,
  cstMData: null,
  dialogMode: "edit",
});

const emit = defineEmits<{
  confirm: [data: any];
  cancel: [];
  "save-draft": [data: any];
}>();

// ========== Router ==========
const route = useRoute();

// ========== 页面参数 ==========
const pageParams = ref({
  projId: props.projId,
  projName: props.projName || "",
  displayName: props.displayName || "",
  bizType: props.bizType || "",
  billId: undefined as string | undefined,
  bizKeyId: 0,
  allocAmt: props.allocAmt || 0,
  allocExclAmt: props.allocExclAmt || 0,
});

// ========== 判断模式 ==========
const isDialogMode = computed(() => props.isDialogMode);
const isView = computed(() => {
  return route.query.mode === "view" || props.dialogMode === "view";
});

// ========== 数据管理 ==========
const {
  treeData,
  products,
  warningData,
  allocatedAmount,
  allocatedExclAmount,
  hasData,
  setData,
  summarize,
  deleteNode: removeNode,
  mergeDetails,
  syncWarning,
  updateTree,
  summarizeParentsOnly,
} = useAllocationData();

// ========== 待分摊金额 ==========
const pendingAmount = computed(() => {
  const total = toNumber(pageParams.value.allocAmt);
  return round2(total - allocatedAmount.value);
});

// ========== 楼栋过滤 ==========
const {
  buildingOptions,
  selectedBuildings,
  businessTypeNames,
  loadBuildings,
  handleBuildingChange,
  autoMatchBuildings,
} = useBuildingFilter(treeData, products, (prodList) => {
  products.value = prodList;
});

// ========== 业务操作 ==========
const {
  loading: confirmLoading,
  submitLoading,
  dialogVisible,
  warningVisible,
  selectedSubIds,
  busiSegOptions,
  handleChoose,
  handleSelect,
  handleDelete: deleteAction,
  handleSave,
  autoAllocation,
  handleViewWarning,
  handleConfirm,
  getSubmitData,
  validate,
  loadBaseData,
  loadSubjects,
  getSelectedIds,
} = useAllocationActions(
  treeData,
  products,
  warningData,
  pageParams,
  selectedBuildings,
  mergeDetails,
  summarize,
  summarizeParentsOnly, // ✅ 第8个参数：summarizeParentsOnlyFn
  syncWarning, // ✅ 第9个参数：syncWarningFn
);

// ========== 封装删除 ==========
const handleDelete = (node: any) => {
  const nodeId = node.id || node.subId;
  const result: any = deleteAction(node);
  if (result) {
    removeNode(nodeId);
  }
};

// ========== 弹窗选择回调 ==========
const onDialogSelect = async (
  selectedTree: any[],
  goalCostDetailList: any[],
) => {
  const prodIds = await handleSelect(selectedTree, goalCostDetailList);
  if (prodIds?.length) {
    autoMatchBuildings(prodIds);
  }
};

// ========== 处理弹窗数据回显 ==========
const processPopupData = async (detailList: any[]) => {
  if (!detailList?.length) return;

  const subIds = new Set(detailList.map((item: any) => item.subId));
  const res = await costCategoryApi.getCostSubjectBase({ isWithParent: true });

  if (res.code === 200) {
    const rawTreeData = res.data || [];
    const subTreeData = buildTree(rawTreeData);
    const treeDataFiltered = filterTreeByIds(subTreeData, Array.from(subIds));

    const prodList = detailList
      .filter((item: any) => item.prodId)
      .map((item: any) => ({
        prodId: item.prodId,
        prodName: item.prodName || `业态${item.prodId}`,
      }));
    const uniqueProdList = Array.from(
      new Map(prodList.map((p: any) => [p.prodId, p])).values(),
    );

    products.value = uniqueProdList;
    treeData.value = treeDataFiltered;
    mergeDetails(detailList);
    summarize();
    syncWarning();

    if (uniqueProdList.length) {
      autoMatchBuildings(uniqueProdList.map((p) => p.prodId));
    }
  }
};

// ========== 加载OA数据 ==========
const loadAllocationData = async () => {
  try {
    const billId = route.query.billId as string;
    const bizType = route.query.bizType as string;

    if (!billId || !bizType) return;

    const res = await costAllocationApi.getProjectAlloc({
      bizBillId: billId,
      bizType: bizType,
    });

    if (res.code === 200 && res.data) {
      pageParams.value.projId = res.data.projId;
      pageParams.value.projName = res.data.projName;
      pageParams.value.bizType = res.data.bizType;
      pageParams.value.billId = billId;
      pageParams.value.allocAmt = res.data.allocAmt || 0;
      pageParams.value.allocExclAmt = res.data.costExclAmt || 0;

      await loadBuildings(pageParams.value.projId);
      await loadBaseData();
      await loadSubjects();

      const allocDs = res.data.allocDs || [];
      const validData = allocDs.filter((item: any) => item.prodId);
      if (validData.length) {
        await processPopupData(validData);
      }
    }
  } catch (error) {
    console.error("加载分摊数据失败:", error);
  }
};

// ========== 弹窗初始化 ==========
const initDialog = async () => {
  await loadBaseData();
  await loadSubjects();
  await loadBuildings(props.projId);

  if (props.cstMData?.allocDs?.length) {
    await processPopupData(props.cstMData.allocDs);
  }
};

// ========== 暴露方法 ==========
defineExpose({
  getData: () => treeData.value,
  getPageParams: () => pageParams.value,
  getLeafSubjects: () => getLeafNodes(treeData.value),
  getSubmitData,
  validateTable: validate,
});

// ========== 生命周期 ==========
onMounted(async () => {
  if (isDialogMode.value && props.projId) {
    await initDialog();
  } else {
    await loadAllocationData();
  }
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