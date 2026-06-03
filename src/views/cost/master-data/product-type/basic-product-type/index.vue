<!--基础产品类型 列表 -->
<template>
  <div class="basic-product-type-table">
    <el-form :model="queryParams" inline>
      <el-form-item label="产品名称">
        <el-input
          v-model="queryParams.prodName"
          placeholder="请输入产品名称"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="产品编号">
        <el-input
          v-model="queryParams.prodCode"
          placeholder="请输入产品编号"
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
    <AddEditBasicTypeDialog
      v-model="dialogVisible"
      :edit-data="currentRow"
      :parent-id="parentId"
      :tree-data="tableData"
      @success="getBasicProductTypeList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { productTypeApi } from "@/api/cost/product-type-api";
import type {
  ProductBase,
  ProductBaseTreeNode,
} from "@/types/cost/product-type";
import AddEditBasicTypeDialog from "./add-edit-basic-type-dialog.vue";
import { buildTree } from "@/utils/tree";

defineOptions({ name: "basic-product-type" });

// Emits
const emit = defineEmits<{
  (e: "data-changed", hasData: boolean): void;
}>();

// 查询参数
const queryParams = ref({
  prodName: "",
  prodCode: "",
});

const tableData = ref<ProductBase[]>([]);
const tableLoading = ref(false);
const enabledLoading = ref(false);

// 弹窗相关
const dialogVisible = ref(false);
const currentRow = ref<ProductBase | null>(null);
const parentId = ref<number>(0);

// 表格列配置
const tableColumns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "prodName", label: "产品名称", align: "left" },
  { prop: "prodCode", label: "产品编号", width: 120 },
  { prop: "prodDesc", label: "产品描述" },
  { prop: "sort", label: "排序", width: 100 },
  { label: "是否启用", width: 100, slot: "status" },
  { label: "操作", width: 200, slot: "actions", fixed: "right" },
];

// 获取字典项数据
const getBasicProductTypeList = async () => {
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await productTypeApi.getProductBaseList(queryParams.value);
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
  getBasicProductTypeList();
};

// 重置
const handleReset = () => {
  queryParams.value = {
    prodCode: "",
    prodName: "",
  };
  getBasicProductTypeList();
};

// 新增
const handleAdd = () => {
  currentRow.value = null;
  parentId.value = 0;
  dialogVisible.value = true;
};
// 添加下级
const handleAddSub = (row: ProductBase) => {
  currentRow.value = null;
  parentId.value = row.id;
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row: ProductBase) => {
  currentRow.value = row;
  parentId.value = row.pid;
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (row: ProductBaseTreeNode) => {
  if (row.children && row.children.length > 0) {
    ElMessage.warning("请先删除子级产品");
    return;
  }
  ElMessageBox.confirm(`确定删除产品"${row.prodName}"吗？`, "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const res = await productTypeApi.delProductBase({ id: row.id });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        getBasicProductTypeList();
      } else {
        ElMessage.error(res.msg || "删除失败");
      }
    })
    .catch(() => void 0);
};
// 启用/禁用
const handleEnabledChange = async (row: ProductBaseTreeNode) => {
  try {
    enabledLoading.value = true;
    const res = await productTypeApi.editProductBase({
      id: row.id,
      pid: row.pid,
      prodCode: row.prodCode,
      prodName: row.prodName,
      prodLevel: row.prodLevel,
      prodDesc: row.prodDesc,
      sort: row.sort,
      isEnabled: row.isEnabled,
    });
    if (res.code === 200) {
      ElMessage.success(`已${row.isEnabled ? "启用" : "禁用"}成功`);
      await getBasicProductTypeList();
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
  getBasicProductTypeList();
});

// 暴露刷新方法
defineExpose({
  refresh: getBasicProductTypeList,
});
</script>

<style lang="scss" scoped>
.basic-product-type-table {
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
