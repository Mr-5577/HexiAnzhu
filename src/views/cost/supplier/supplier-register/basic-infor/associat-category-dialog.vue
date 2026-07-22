<!-- 服务类别选择弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="选择服务类别"
    width="700px"
    :confirm-loading="confirmLoading"
    @confirm="handleConfirm"
    @close="handleClose"
  >
    <div class="category-select-wrapper">
      <base-table
        ref="tableRef"
        :columns="columns"
        :table-data="tableData"
        :loading="tableLoading"
        :row-key="'id'"
        :pagination="false"
        :show-toolbar="false"
        :show-action-bar="false"
        :height="'350px'"
        @selection-change="handleSelectionChange"
      />
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { ElMessage } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { supTypeApi } from "@/api/cost/master-data/supplier-category-api";

interface Props {
  modelValue: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [selectedRows: any[]];
}>();

const dialogVisible = ref(props.modelValue);
const confirmLoading = ref(false);
const tableLoading = ref(false);
const tableRef = ref(null);
const tableData = ref([]);
const selectedRows = ref([]);

// 查询参数
const queryParams = ref({
  supTypeName: "",
  supTypeCode: "",
});

// 表格列配置
const columns: TableColumnItem[] = [
  { type: "selection", width: 50, fixed: "left" },
  { type: "index", label: "序号", width: 60 },
  { prop: "supTypeName", label: "类别名称" },
  { prop: "supTypeCode", label: "类别编码" },
  { prop: "remark", label: "备注" },
];

/**
 * 获取列表
 */
const getDataList = async () => {
  try {
    tableLoading.value = true;
    const res = await supTypeApi.getSupTypeList(queryParams.value);
    if (res.code === 200) {
      // 这里需要转为树形结构
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("获取列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

/**
 * 处理表格选择变化
 */
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

/**
 * 确认选择
 */
const handleConfirm = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("至少选择一条数据!");
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
.category-select-wrapper {
  width: 100%;
  height: 100%;

  :deep(.pro-table-container) {
    padding-bottom: 0;
  }
}
</style>
