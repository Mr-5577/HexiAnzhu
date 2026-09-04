<!-- 选择目标成本版本 弹窗组件 -->
<template>
  <base-modal v-model="dialogVisible" title="选择目标成本版本" width="1100px" :confirm-loading="confirmLoading"
    :confirm-text="'确定'" @confirm="handleConfirm" @close="handleClose">
    <div class="costM-select-wrapper">
      <!-- 筛选区域 -->
      <el-form :model="queryParams" ref="queryRef" :inline="true" size="default">
        <el-form-item label="版本号" prop="versionNo">
          <el-input v-model="queryParams.versionNo" placeholder="请输入版本号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <base-table ref="tableRef" :row-key="'id'" :columns="tableColumns" :table-data="tableData" :loading="tableLoading"
        :total="total" :current-page="currentPage" :page-size="pageSize" :height="'400px'" :highlight-current-row="true"
        :selectionMode="props.selectionMode" @selection-change="handleSelectionChange"
        @pagination-change="handlePaginationChange">
        <template #isEnabled="{ row }">
          <el-tag size="small" :type="row.isEnabled ? 'success' : 'info'">
            {{ row.isEnabled ? "是" : "否" }}
          </el-tag>
        </template>
      </base-table>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { visaManagementApi } from "@/api/cost/contract-manage/visa-management-api";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api";

// Props
interface Props {
  modelValue: boolean;
  selectionMode?: "single" | "multiple"; // 选择模式，单选或多选
  projId: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  selectionMode: "single",
  projId: null,
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  select: [row: any];
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
  versionNo: "", // 版本号
});

// 表格列配置
const tableColumns = [
  { type: "selection", width: 50, fixed: "left" },
  { type: "index", label: "序号", width: "60" },
  { prop: "remark", label: "版本说明", minWidth: 150 },
  { prop: "projName", label: "项目名称", width: 150 },
  { prop: "versionNo", label: "版本号", width: 170 },
  { prop: "versionTypeName", label: "版本类型", width: 120 },
  { prop: "areaVerMTitle", label: "面积版本", width: 180 },
  { prop: "segName", label: "业务板块", width: 90 },
  { slot: "isEnabled", label: "当前使用", width: 90 },
];

// 重置状态
const resetState = () => {
  selectedRows.value = [];
  currentPage.value = 1;
  pageSize.value = 20;
  queryParams.value.versionNo = "";
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
    const query = { ...queryParams.value, projId: props.projId };
    const res = await goalCostApi.getProjectCostMList(query);
    if (res.code === 200) {
      tableData.value = res.data || [];
      total.value = tableData.value.length;
    }
  } catch (error) {
    console.error("加载列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

// 查询
const handleQuery = () => {
  currentPage.value = 1;
  pageSize.value = 20;
  getDataList();
};

// 重置
const handleReset = () => {
  queryParams.value.versionNo = "";
  currentPage.value = 1;
  pageSize.value = 20;
  handleQuery();
};

// 分页改变
const handlePaginationChange = (page: number, size: number) => {
  currentPage.value = page;
  pageSize.value = size;
  getDataList();
};

const handleSelectionChange = (row: any) => {
  selectedRows.value = row;
};

// 确认选择
const handleConfirm = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage.warning("请先选择一条数据");
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
.costM-select-wrapper {
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
