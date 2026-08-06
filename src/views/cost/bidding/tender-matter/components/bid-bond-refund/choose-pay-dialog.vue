<!-- 招标缴纳明细 选择弹窗组件 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="缴纳明细选择"
    width="1100px"
    :confirm-loading="confirmLoading"
    :confirm-text="'确定'"
    @confirm="handleConfirm"
    @close="handleClose"
  >
    <div class="pay-select-wrapper">
      <base-table
        ref="tableRef"
        :row-key="'id'"
        :columns="tableColumns"
        :table-data="tableData"
        :loading="tableLoading"
        :height="'500px'"
        :highlight-current-row="true"
        :pagination="false"
        :selectionMode="props.selectionMode"
        @selection-change="handleSelectionChange"
      >
      </base-table>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { biddingManageApi } from "@/api/cost/bidding/bidding-management-api";

// Props
interface Props {
  modelValue: boolean;
  tenderId: number | undefined;
  selectionMode?: "single" | "multiple"; // 选择模式，单选或多选
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  tenderId: undefined,
  selectionMode: "single",
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  select: [row: any[]];
}>();

// 弹窗显示状态
const dialogVisible = ref(props.modelValue);
// 确认按钮loading
const confirmLoading = ref(false);
// 表格loading
const tableLoading = ref(false);
// 表格数据
const tableData = ref([]);
// 选中行数据
const selectedRows = ref([]);
// 表格ref
const tableRef = ref();

// 表格列配置
const tableColumns = [
  { type: "selection", width: 50, fixed: "left" },
  { type: "index", label: "序号", width: 60, fixed: "left" },
  {
    label: "招标明细事项",
    prop: "tenderItemName",
    // width: 200,
  },
  { label: "项目名称", prop: "projName", width: 120 },
  { label: "楼栋范围", prop: "bldNames", width: 180 },
  { label: "供应商名称", prop: "supName", width: 180 },
  { label: "实交保证金金额", prop: "recvAmount", width: 120 },
  { label: "缴纳方式", prop: "recvMethodName", width: 120 },
  // { label: "退款金额", prop: "ww", width: 120 },
];

// 重置状态
const resetState = () => {
  selectedRows.value = [];
  // 清除表格高亮
  setTimeout(() => {
    if (tableRef.value) {
      tableRef.value.clearCurrentRow();
    }
  }, 0);
};

// 通过事项ID获取保证金缴纳明细列表
const getBondRecvTableByTenderId = async () => {
  if (!props.tenderId) return;
  try {
    const res = await biddingManageApi.getBondRecvList({
      tenderId: props.tenderId,
      isNoRefund: true,
    });
    if (res.code === 200 && res.data) {
      const list = res.data || [];
      // 把事项ID加入到列表里面提供给后面使用
      tableData.value = list.map((item: any) => ({
        ...item,
        tenderId: props.tenderId,
      }));
    }
  } catch (error) {}
};

// 查询
const handleQuery = () => {
  getBondRecvTableByTenderId();
};
const handleSelectionChange = (row: any[]) => {
  selectedRows.value = row;
};

// 确认选择
const handleConfirm = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage.warning("请先选择一条缴纳明细");
    return;
  }
  confirmLoading.value = true;
  emit("select", selectedRows.value);
  handleClose();
  confirmLoading.value = false;
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  selectedRows.value = [];
};

// 监听modelValue
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      // 打开弹窗时重置状态并加载数据
      resetState();
      handleQuery();
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});

// 暴露方法供父组件调用
defineExpose({
  open: () => {
    dialogVisible.value = true;
  },
  close: () => {
    handleClose();
  },
});
</script>

<style lang="scss" scoped>
.pay-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 500px;

  :deep(.base-table) {
    .el-table__row {
      cursor: pointer;
    }

    .current-row {
      background-color: #ecf5ff;
    }
  }
}
</style>
