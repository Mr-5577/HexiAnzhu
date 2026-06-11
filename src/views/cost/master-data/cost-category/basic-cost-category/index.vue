<!--基础成本科目 列表 -->
<template>
  <div class="basic-cost-category-table">
    <el-form :model="queryParams" inline>
      <el-form-item label="科目名称">
        <el-input
          v-model="queryParams.subName"
          placeholder="请输入科目名称"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="科目编号">
        <el-input
          v-model="queryParams.subCode"
          placeholder="请输入科目编号"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增顶级</el-button>
      </el-form-item>
    </el-form>
    <base-table
      ref="tableRef"
      :columns="tableColumns"
      :tableData="tableData"
      rowKey="id"
      :border="true"
      :tableLoading="tableLoading"
      :pagination="false"
    >
      <!-- 是否启用 -->
      <template #status="{ row }">
        <el-switch
          v-model="row.isEnabled"
          :active-value="true"
          :inactive-value="false"
          size="small"
          :loading="enabledLoading"
          @change="handleEnabledChange(row)"
        />
      </template>
      <!-- 操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleAddSub(row)">
          新增下级
        </el-button>
        <el-button link type="primary" @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button link type="danger" @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </base-table>
    <!-- 新增/编辑弹窗 -->
    <add-edit-basic-category-dialog
      v-model="dialogVisible"
      :edit-data="currentRow"
      :parent-id="parentId"
      :tree-data="tableData"
      @success="getBasicCostSubjectBaseList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api.ts";
import type {
  CostCategoryBase,
  CostCategoryBaseNode,
} from "@/types/cost/master-data/cost-category-type.ts";
import AddEditBasicCategoryDialog from "./add-edit-basic-category-dialog.vue";
import { buildTree } from "@/utils/tree";

defineOptions({ name: "basic-cost-category" });

// Emits
const emit = defineEmits<{
  (e: "data-changed", hasData: boolean): void;
}>();

// 查询参数
const queryParams = ref({
  subName: "",
  subCode: "",
});

const tableData = ref<CostCategoryBase[]>([]);
const tableLoading = ref(false);
const enabledLoading = ref(false);

// 弹窗相关
const dialogVisible = ref(false);
const currentRow = ref<CostCategoryBase | null>(null);
const parentId = ref<number>(0);

// 表格列配置
const tableColumns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "subName", label: "科目名称", align: "left" },
  { prop: "subCode", label: "科目编号", width: 200 },
  { prop: "remark", label: "说明" },
  { label: "是否启用", width: 200, slot: "status" },
  { label: "操作", width: 200, slot: "actions", fixed: "right" },
];

// 获取数据
const getBasicCostSubjectBaseList = async () => {
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await costCategoryApi.getCostSubjectBaseList(queryParams.value);
    if (res.code === 200) {
      tableData.value = buildTree(res.data || []);
      if (tableData.value.length > 0) {
        emit("data-changed", true); // 通知父组件有数据
      } else {
        emit("data-changed", false); // 通知父组件没有数据
      }
    }
  } catch (error) {
    console.error("获取基础产品类型数据失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  getBasicCostSubjectBaseList();
};

// 重置
const handleReset = () => {
  queryParams.value = {
    subCode: "",
    subName: "",
  };
  getBasicCostSubjectBaseList();
};

// 新增
const handleAdd = () => {
  currentRow.value = null;
  parentId.value = 0;
  dialogVisible.value = true;
};
// 添加下级
const handleAddSub = (row: CostCategoryBase) => {
  currentRow.value = null;
  parentId.value = row.id;
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row: CostCategoryBase) => {
  currentRow.value = row;
  parentId.value = row.pid;
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (row: CostCategoryBaseNode) => {
  if (row.children && row.children.length > 0) {
    ElMessage.warning("请先删除子级科目");
    return;
  }
  ElMessageBox.confirm(`确定删除科目"${row.subName}"吗？`, "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const res = await costCategoryApi.delCostSubjectBase({ id: row.id });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        getBasicCostSubjectBaseList();
      } else {
        ElMessage.error(res.msg || "删除失败");
      }
    })
    .catch(() => void 0);
};
// 启用/禁用
const handleEnabledChange = async (row: CostCategoryBaseNode) => {
  try {
    enabledLoading.value = true;
    const res = await costCategoryApi.editCostSubjectBase({
      id: row.id,
      pid: row.pid,
      subCode: row.subCode,
      subName: row.subName,
      subLevel: row.subLevel,
      ctrlMode: row.ctrlMode,
      remark: row.remark,
      isEnabled: row.isEnabled,
    });
    if (res.code === 200) {
      ElMessage.success(`已${row.isEnabled ? "启用" : "禁用"}成功`);
      await getBasicCostSubjectBaseList();
    } else {
      // 失败时回滚状态
      row.isEnabled = !row.isEnabled;
      ElMessage.error(res.message || "操作失败");
    }
  } catch (error) {
    // 出错时回滚状态
    row.isEnabled = !row.isEnabled;
    ElMessage.error("操作失败");
  } finally {
    enabledLoading.value = false;
  }
};
onMounted(() => {
  getBasicCostSubjectBaseList();
});

// 暴露刷新方法
defineExpose({
  refresh: getBasicCostSubjectBaseList,
});
</script>

<style lang="scss" scoped>
.basic-cost-category-table {
  width: 100%;
  height: 100%;
  background: #fff;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 15px 15px;
  box-sizing: border-box;
  .el-form {
    flex-shrink: 0;
  }

  .base-table {
    flex: 1;
  }
}
</style>
