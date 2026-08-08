<!-- 供应商选择弹窗组件 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="选择定标事项明细"
    width="1400px"
    :confirm-loading="confirmLoading"
    :confirm-text="'确定'"
    @confirm="handleConfirm"
    @close="handleClose"
  >
    <div class="supplier-select-wrapper">
      <!-- 筛选区域 -->
      <el-form
        :model="queryParams"
        ref="queryRef"
        :inline="true"
        size="default"
      >
        <el-form-item label="所属项目" prop="projName" required>
          <projectSelector
            v-model="queryParams.projId"
            :show-all-levels="false"
            placeholder="请选择项目"
            style="width: 100%"
            filterable
            disabled
          />
        </el-form-item>
        <el-form-item label="招标明细事项" prop="tenderItemName">
          <el-input
            v-model="queryParams.tenderItemName"
            placeholder="请输入招标明细事项"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="供应商名称" prop="supName">
          <el-input
            v-model="queryParams.supName"
            placeholder="请输入供应商名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="合同分类" prop="conTypeId">
          <conTypeSelector
            v-model="queryParams.conTypeId"
            placeholder="请选择供应商类别"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <!-- <el-button @click="handleReset">重置</el-button> -->
        </el-form-item>
      </el-form>

      <base-table
        ref="tableRef"
        :row-key="'awardId'"
        :columns="tableColumns"
        :table-data="tableData"
        :loading="tableLoading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :height="'400px'"
        :highlight-current-row="true"
        :selectionMode="props.selectionMode"
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
import { biddingManageApi } from "@/api/cost/bidding/bidding-management-api";
import projectSelector from "@/components/business/project-selector.vue";
import conTypeSelector from "@/components/business/con-type-selector.vue";
import type {
  Supplier,
} from "@/types/cost/supplier/supplier-ledger-type";

// Props
interface Props {
  modelValue: boolean;
  selectionMode?: "single" | "multiple"; // 选择模式，单选或多选
  projId: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  selectionMode: "single",
  projId : null,
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  select: [row: Supplier[]];
}>();

// 弹窗显示状态
const dialogVisible = ref(props.modelValue);
// 确认按钮loading
const confirmLoading = ref(false);
// 表格loading
const tableLoading = ref(false);
// 表格数据
const tableData = ref<Supplier[]>([]);
// 总条数
const total = ref(0);
// 当前页码
const currentPage = ref(1);
// 每页条数
const pageSize = ref(20);
// 选中行数据
const selectedRows = ref<Supplier[]>([]);
// 表格ref
const tableRef = ref();

// 查询参数
const queryParams = ref({
  tenderItemName: "",
  supName: "",
  conTypeId: null,
  projId:null
});

// 表格列配置
const tableColumns = [
  { type: "selection", width: 50, fixed: "left" },
  { type: "index", label: "序号", width: 60, fixed: "left" },
  {
    label: "项目名称",
    prop: "projName",
    width: 130,
    showOverflowTooltip: true,
  },
  {
    label: "招标事项",
    prop: "tenderName",
    width: 250,
    showOverflowTooltip: true,
  },
  {
    label: "招标明细事项",
    prop: "tenderItemName",
    width: 250,
    showOverflowTooltip: true,
  },
  {
    label: "供应商名称",
    prop: "supName",
    width: 250,
    showOverflowTooltip: true,
  },
  {
    label: "合同类别",
    prop: "conTypeName",
    width: 180,
    showOverflowTooltip: true,
  },
  {
    label: "定标金额",
    prop: "bidAmount",
    width: 120,
    formatType:"#,##0.00",
    showOverflowTooltip: true,
  },
];

// 监听modelValue
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      // 打开弹窗时重置状态并加载数据
      resetState();
      queryParams.value.projId=props.projId;
      handleQuery();
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});

// 重置状态
const resetState = () => {
  selectedRows.value = [];
  currentPage.value = 1;
  pageSize.value = 20;
  queryParams.value = {
    tenderItemName: "",
    supName: "",
    conTypeId: null,
    projId:null,
  };
  // 清除表格高亮
  setTimeout(() => {
    if (tableRef.value) {
      tableRef.value.clearCurrentRow();
    }
  }, 0);
};

// 查询供应商列表
const getAwardList = async () => {
  try {
    tableLoading.value = true;
    const res = await biddingManageApi.getAwardItemList({ ...queryParams.value });
    if (res.code === 200) {
      tableData.value = res.data || [];
      total.value = tableData.value.length;
    } else {
      ElMessage.error(res.message || "加载定标明细列表失败");
    }
  } catch (error) {
    console.error("加载定标明细列表失败:", error);
    ElMessage.error("加载定标明细列表失败");
  } finally {
    tableLoading.value = false;
  }
};

// 查询
const handleQuery = () => {
  currentPage.value = 1;
  getAwardList();
};

// 重置
const handleReset = () => {
  queryParams.value = {
    tenderItemName: "",
    supName: "",
    conTypeId: null,
    projId:null,
  };
  handleQuery();
};

// 分页改变
const handlePaginationChange = (page: number, size: number) => {
  currentPage.value = page;
  pageSize.value = size;
  getAwardList();
};

const handleSelectionChange = (row: Supplier[]) => {
  selectedRows.value = row;
};

// 确认选择
const handleConfirm = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage.warning("请先选择一条定标明细数据");
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
.supplier-select-wrapper {
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
