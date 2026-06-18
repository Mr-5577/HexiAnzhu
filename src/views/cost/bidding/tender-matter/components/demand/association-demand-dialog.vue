<!-- 招标需求选择弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="选择招标需求"
    width="1000px"
    :confirm-loading="confirmLoading"
    @confirm="handleConfirm"
    @cancel="handleClose"
    @close="handleClose"
  >
    <div class="demand-select-wrapper">
      <base-table
        ref="tableRef"
        :columns="columns"
        :table-data="tableData"
        :loading="tableLoading"
        :row-key="'id'"
        :pagination="false"
        :show-toolbar="false"
        :show-action-bar="false"
        :selectionMode="'single'"
        :height="'500px'"
        @selection-change="handleSelectionChange"
      />
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { ElMessage } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import type {
  BidDemand,
  BidDemandQueryParams,
} from "@/types/cost/bidding/bidding-management-type";
import { biddingManageApi } from "@/api/cost/bidding/bidding-management-api";

interface Props {
  /** 弹窗显示状态 */
  modelValue: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [selectedRows: BidDemand[]];
}>();

// ==================== 响应式数据 ====================
const dialogVisible = ref(props.modelValue);
const confirmLoading = ref(false);
const tableLoading = ref(false);
const tableRef = ref(null);
const tableData = ref<BidDemand[]>([]);
const selectedRows = ref<BidDemand[]>([]);

// 查询参数
const queryParams = ref<BidDemandQueryParams>({
  segId: undefined,
  companyId: undefined,
  projId: undefined,
  tenderName: "",
});

// 表格列配置
const columns: TableColumnItem[] = [
  { type: "selection", width: 50, fixed: "left" },
  { type: "index", label: "序号", width: 60 },
  { prop: "segName", label: "业务板块" },
  { prop: "projName", label: "项目名称", width: 120 },
  { prop: "companyName", label: "公司名称" },
  { prop: "tenderName", label: "招标事项" },
  { prop: "demandDate", label: "需求时间", width: 120 },
  { prop: "demandRemark", label: "需求说明" },
];

// ==================== 方法 ====================

/**
 * 获取招标需求列表
 */
const getDataList = async () => {
  try {
    tableLoading.value = true;
    const res = await biddingManageApi.getDemandList(queryParams.value);
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("获取招标需求列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

/**
 * 处理表格选择变化
 */
const handleSelectionChange = (rows: BidDemand[]) => {
  selectedRows.value = rows;
};

/**
 * 确认选择
 */
const handleConfirm = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请至少选择一条招标需求");
    return;
  }
  confirmLoading.value = true;
  try {
    emit("success", selectedRows.value);
    handleClose();
  } finally {
    confirmLoading.value = false;
  }
};

/**
 * 关闭弹窗
 */
const handleClose = () => {
  dialogVisible.value = false;
  // 重置选中状态
  selectedRows.value = [];
  if (tableRef.value) {
    tableRef.value.clearSelection();
  }
};

/**
 * 重置数据
 */
const resetData = () => {
  selectedRows.value = [];
  if (tableRef.value) {
    tableRef.value.clearSelection();
  }
};

// ==================== 监听器 ====================
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      getDataList();
    } else {
      resetData();
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});
</script>

<style lang="scss" scoped>
.demand-select-wrapper {
  width: 100%;
  height: 100%;

  :deep(.pro-table-container) {
    padding-bottom: 0;
  }
}
</style>
