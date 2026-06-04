<!-- 供应商选择弹窗组件 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="选择供应商"
    width="1000px"
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
        <el-form-item label="供应商编码" prop="supCode">
          <el-input
            v-model="queryParams.supCode"
            placeholder="请输入供应商编码"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="供应商名称" prop="supName">
          <el-input
            v-model="queryParams.supName"
            placeholder="请输入供应商名称"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="供应商类别" prop="supTypeId">
          <el-cascader
            v-model="queryParams.supTypeId"
            :options="treeData"
            :props="cascaderProps"
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
        <!-- 供应商类别列插槽 -->
        <template #supTypeId="{ row }">
          <span>{{ getSupTypeName(row.supTypeId) }}</span>
        </template>
      </base-table>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { buildTree } from "@/utils/tree";
import { supTypeApi } from "@/api/cost/supplier-category-api";
import { supplierApi } from "@/api/cost/supplier-ledger-api";
import type {
  Supplier,
  SupplierQueryParams,
} from "@/types/cost/supplier-ledger-type";
import type {
  SupplierTypeTreeNode,
  SupplierType,
} from "@/types/cost/supplier-category-type";

// Props
interface Props {
  modelValue: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
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

// 树形数据（供应商类别）
const treeData = ref<SupplierTypeTreeNode[]>([]);
// 供应商类别列表（用于显示名称）
const supTypeList = ref<SupplierType[]>([]);

// 级联选择器配置
const cascaderProps = {
  value: "id",
  label: "supTypeName",
  children: "children",
  checkStrictly: false,
  emitPath: false, // 只返回最后一级的ID
};

// 查询参数
const queryParams = ref<SupplierQueryParams>({
  supCode: "",
  supName: "",
  supTypeId: null,
});

// 表格列配置
const tableColumns = [
  { type: "selection", width: 50, fixed: "left" },
  { type: "index", label: "序号", width: 60, fixed: "left" },
  {
    label: "供应商编码",
    prop: "supCode",
    width: 150,
    showOverflowTooltip: true,
  },
  {
    label: "供应商名称",
    prop: "supName",
    width: 200,
    showOverflowTooltip: true,
  },
  { label: "供应商类别", slot: "supTypeId", width: 150 },
  {
    label: "企业性质",
    prop: "supNatureName",
    width: 120,
    showOverflowTooltip: true,
  },
  {
    label: "纳税类型",
    prop: "taxTypeName",
    width: 120,
    showOverflowTooltip: true,
  },
  {
    label: "法人代表",
    prop: "legalPerson",
    width: 120,
    showOverflowTooltip: true,
  },
  { label: "法人电话", prop: "legalPhone", width: 120 },
  {
    label: "信用编码",
    prop: "uscCardNo",
    width: 180,
    showOverflowTooltip: true,
  },
  {
    label: "供应商地址",
    prop: "address",
    width: 200,
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
      loadSupplierTree();
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
    supCode: "",
    supName: "",
    supTypeId: null,
  };
  // 清除表格高亮
  setTimeout(() => {
    if (tableRef.value) {
      tableRef.value.clearCurrentRow();
    }
  }, 0);
};

// 加载供应商类别树
const loadSupplierTree = async () => {
  try {
    const res = await supTypeApi.getSupTypeList({ supTypeName: "" });
    if (res.code === 200 && res.data) {
      supTypeList.value = res.data || [];
      treeData.value = buildTree(res.data || []);
    }
  } catch (error) {
    console.error("加载供应商类别失败:", error);
  }
};

// 获取供应商类别名称
const getSupTypeName = (id: number | null) => {
  if (!id) return "-";
  return supTypeList.value.find((item) => item.id === id)?.supTypeName || id;
};

// 查询供应商列表
const getSupplierList = async () => {
  try {
    tableLoading.value = true;
    const res = await supplierApi.getSupplierList({ ...queryParams.value });
    if (res.code === 200) {
      tableData.value = res.data || [];
      total.value = tableData.value.length;
    } else {
      ElMessage.error(res.message || "加载供应商列表失败");
    }
  } catch (error) {
    console.error("加载供应商列表失败:", error);
    ElMessage.error("加载供应商列表失败");
  } finally {
    tableLoading.value = false;
  }
};

// 查询
const handleQuery = () => {
  currentPage.value = 1;
  getSupplierList();
};

// 重置
const handleReset = () => {
  queryParams.value = {
    supCode: "",
    supName: "",
    supTypeId: null,
  };
  handleQuery();
};

// 分页改变
const handlePaginationChange = (page: number, size: number) => {
  currentPage.value = page;
  pageSize.value = size;
  getSupplierList();
};

const handleSelectionChange = (row: Supplier[]) => {
  selectedRows.value = row;
};

// 确认选择
const handleConfirm = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage.warning("请先选择一条供应商数据");
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
