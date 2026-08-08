<!-- 供应商选择弹窗组件 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="选择合同签证"
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
        <el-form-item label="签证名称" prop="visaName">
          <el-input
            v-model="queryParams.visaName"
            placeholder="请输入签证名称"
            clearable
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <base-table
        ref="tableRef"
        :row-key="'visaId'"
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
import { visaManagementApi } from "@/api/cost/contract-manage/visa-management-api";

// Props
interface Props {
  modelValue: boolean;
  selectionMode?: "single" | "multiple"; // 选择模式，单选或多选
  conId: number;
  isToAdd? : boolean ,//是否已转补充合同
  status?:number, //审批状态
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  selectionMode: "single",
  conId : null,
  isToAdd: null ,
  status : null ,
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  select: [row:any];
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
const queryParams = ref({
  visaName: "",
  conId:props.conId,
  isToAdd: props.isToAdd ,
  status : props.status ,
});

// 表格列配置
const tableColumns = [
  { type: "selection", width: 50, fixed: "left" },
  { type: "index", label: "序号", width: 60, fixed: "left" },
  {
    label: "合同名称",
    prop: "conName",
    width: 130,
    showOverflowTooltip: true,
  },
  {
    label: "签证名称",
    prop: "visaName",
    width: 250,
    showOverflowTooltip: true,
  },
  {
    label: "签证金额",
    prop: "auditReviewAmt",
    width: 250,
    formatType:"#,##0.00",
    showOverflowTooltip: true,
  },
  {
    label: "创建人",
    prop: "createName",
    width: 180,
    showOverflowTooltip: true,
  },
  {
    label: "创建日期",
    prop: "createDate",
    width: 120,
    showOverflowTooltip: true,
  },
  {
    label: "签证说明",
    prop: "remark",
    width: 120,
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
    visaName: "",
    conId:props.conId,
    isToAdd: props.isToAdd ,
    status : props.status ,
  };
  // 清除表格高亮
  setTimeout(() => {
    if (tableRef.value) {
      tableRef.value.clearCurrentRow();
    }
  }, 0);
};

// 查询数据列表
const getDataList = async () => {
  try {
    tableLoading.value = true;
    const res = await visaManagementApi.getVisaList({ ...queryParams.value });
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
  getDataList();
};

// 重置
const handleReset = () => {
  queryParams.value = {
    visaName: "",
    conId:props.conId,
    isToAdd: props.isToAdd ,
    status : props.status ,
  };
  handleQuery();
};

// 分页改变
const handlePaginationChange = (page: number, size: number) => {
  currentPage.value = page;
  pageSize.value = size;
  getDataList();
};

const handleSelectionChange = (row:any) => {
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
