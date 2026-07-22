<!-- 合同选择弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="选择合同"
    width="1000px"
    :confirm-loading="confirmLoading"
    :confirm-text="'确定'"
    @confirm="handleConfirm"
    @close="handleClose"
  >
    <div class="choose-con-wrapper">
      <el-form
        :model="queryParams"
        ref="queryRef"
        :inline="true"
        size="default"
      >
        <el-form-item label="合同名称" prop="conName">
          <el-input
            v-model="queryParams.conName"
            placeholder="请输入合同名称"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <!-- <el-button @click="handleReset">重置</el-button> -->
        </el-form-item>
      </el-form>

      <base-table
        ref="tableRef"
        :row-key="'id'"
        :columns="tableColumns"
        :table-data="tableData"
        :loading="tableLoading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :height="'400px'"
        :highlight-current-row="true"
        :selectionMode="'single'"
        @selection-change="handleSelectionChange"
        @pagination-change="handlePaginationChange"
      >
      </base-table>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import {
  HConMain,
  HConMainQuery,
} from "@/types/cost/contract-manage/contract-ledger-type";

// Props
interface Props {
  modelValue: boolean;
  projId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  projId: null,
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  select: [row: HConMain[]];
}>();

// 弹窗显示状态
const dialogVisible = ref(props.modelValue);
// 确认按钮loading
const confirmLoading = ref(false);
// 表格loading
const tableLoading = ref(false);
// 表格数据
const tableData = ref([]);
// 总条数
const total = ref(0);
// 当前页码
const currentPage = ref(1);
// 每页条数
const pageSize = ref(20);
// 选中行数据
const selectedRows = ref([]);
// 表格ref
const tableRef = ref();

// 查询参数
const queryParams = ref<HConMainQuery>({
  conName: "",
  projId: props.projId,
});

// 表格列配置
const tableColumns = [
  { type: "selection", width: 50, fixed: "left" },
  { type: "index", label: "序号", width: 60, fixed: "left" },
  {
    label: "合同名称",
    prop: "conName",
    width: 180,
    showOverflowTooltip: true,
  },
  {
    label: "合同编号",
    prop: "conSysNo",
    width: 220,
    showOverflowTooltip: true,
  },
  {
    label: "签订日期",
    prop: "signDate",
    width: 120,
    showOverflowTooltip: true,
  },
  {
    label: "生效日期",
    prop: "effectiveDate",
    width: 120,
    showOverflowTooltip: true,
  },
  {
    label: "到期日期",
    prop: "expiryDate",
    width: 120,
    showOverflowTooltip: true,
  },
  {
    label: "合同状态",
    prop: "conStatus",
    width: 120,
    showOverflowTooltip: true,
  },
];

// 重置状态
const resetState = () => {
  selectedRows.value = [];
  currentPage.value = 1;
  pageSize.value = 20;
  queryParams.value = {
    conName: "",
    projId: props.projId,
  };
  // 清除表格高亮
  setTimeout(() => {
    if (tableRef.value) {
      tableRef.value.clearCurrentRow();
    }
  }, 0);
};

// 查询列表
const getConList = async () => {
  try {
    const res = await contractLedgerApi.getContractLedgerList({
      ...queryParams.value,
    });
    if (res.code === 200) {
      tableData.value = res.data || [];
      total.value = tableData.value.length;
    } else {
      ElMessage.error(res.message || "加载合同列表失败");
    }
  } catch (error) {
    console.error("加载合同列表失败:", error);
    ElMessage.error("加载合同列表失败");
  }
};

// 查询
const handleQuery = () => {
  currentPage.value = 1;
  getConList();
};

// 重置
const handleReset = () => {
  queryParams.value = {
    conName: "",
    projId: props.projId,
  };
  handleQuery();
};

// 分页改变
const handlePaginationChange = (page: number, size: number) => {
  currentPage.value = page;
  pageSize.value = size;
  getConList();
};

const handleSelectionChange = (row: HConMain[]) => {
  selectedRows.value = row;
};

// 确认选择
const handleConfirm = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage.warning("请先选择合同数据");
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
.choose-con-wrapper {
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
