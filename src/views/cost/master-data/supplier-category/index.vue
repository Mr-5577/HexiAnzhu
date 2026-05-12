<!-- 供应商类别 -->
<template>
  <div class="supplier-type-page">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="类别名称" prop="supTypeName">
        <el-input
          v-model="queryParams.supTypeName"
          placeholder="请输入类别名称"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="类别编码" prop="supTypeCode">
        <el-input
          v-model="queryParams.supTypeCode"
          placeholder="请输入类别编码"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">
          搜索
        </el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAddTopLevel">
          新建顶级分类
        </el-button>
      </el-form-item>
    </el-form>

    <base-table
      v-if="refreshTable"
      :columns="columns"
      :tableData="tableData"
      :loading="loading"
      :total="total"
      :rowKey="'id'"
      :current-page="currentPage"
      :page-size="pageSize"
      :pagination="false"
      @pagination-change="handlePaginationChange"
      :isExpandAll="isExpandAll"
    >
      <!-- 是否启用 -->
      <template #isEnabled="{ row }">
        <!-- <el-tag :type="row.isEnabled ? 'success' : 'danger'" size="small">
          {{ row.isEnabled ? "启用" : "禁用" }}
        </el-tag> -->
        <el-switch
          v-model="row.isEnabled"
          :active-value="true"
          :inactive-value="false"
          size="small"
          :loading="enabledLoading"
          @change="handleEnabledChange(row)"
        />
      </template>

      <template #actions="{ row }">
        <el-button type="primary" link @click="handleAddSub(row)">
          添加下级
        </el-button>
        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </base-table>

    <!-- 新增/编辑 供应商类别弹窗 -->
    <supplier-type-dialog
      v-model="dialogVisible"
      :edit-data="currentEditData"
      :parent-id="parentId"
      @success="handleSaveSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import type {
  SupplierType,
  SupplierTypeTreeNode,
} from "@/types/cost/supplier-category-type";
import SupplierTypeDialog from "./supplier-type-dialog.vue";
import { supTypeApi } from "@/api/cost/supplier-category-api";

defineOptions({ name: "supplier-category" });

// 查询参数
const queryParams = ref({
  supTypeName: "",
  supTypeCode: "",
});

// 表格相关
const refreshTable = ref(true);
const isExpandAll = ref(false);
const loading = ref(false);
const enabledLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref<SupplierTypeTreeNode[]>([]);

// 弹窗相关
const dialogVisible = ref(false);
const currentEditData = ref<SupplierType | null>(null);
const parentId = ref<number>(0);

// 表格列配置
const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: "60" },
  { prop: "supTypeName", label: "类别名称", align: "left" },
  { prop: "supTypeCode", label: "类别编码", width: 150 },
  { prop: "remark", label: "备注", minWidth: 200 },
  { label: "是否启用", width: 100, slot: "isEnabled" },
  { label: "操作", width: 200, slot: "actions", fixed: "right" },
];

// 扁平数据转树形结构
const buildTree = (list: SupplierType[]): SupplierTypeTreeNode[] => {
  if (!list?.length) return [];

  const map = new Map<number, SupplierTypeTreeNode>();
  const tree: SupplierTypeTreeNode[] = [];

  list.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  list.forEach((item) => {
    const node = map.get(item.id)!;
    // 判断是否为根节点：pid 为 null 或 0 或 undefined 都视为根节点
    const isRoot = item.pid === null || item.pid === 0 || item.pid === undefined;
    if (isRoot) {
      tree.push(node);
    } else {
      const parent = map.get(item.pid);
      if (parent) {
        parent.children!.push(node);
      } else {
        tree.push(node);
      }
    }
  });

  return tree;
};

// 获取数据列表
const getDataList = async () => {
  try {
    loading.value = true;
    tableData.value = [];
    const res = await supTypeApi.getSupTypeList(queryParams.value);
    if (res.code === 200) {
      tableData.value = buildTree(res.data);
    }
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  getDataList();
};

// 重置
const handleReset = () => {
  queryParams.value = { supTypeName: "", supTypeCode: "" };
  handleSearch();
};

// 新建顶级分类
const handleAddTopLevel = () => {
  currentEditData.value = null;
  parentId.value = 0;
  dialogVisible.value = true;
};

// 添加下级
const handleAddSub = (row: SupplierTypeTreeNode) => {
  currentEditData.value = null;
  parentId.value = row.id;
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row: SupplierTypeTreeNode) => {
  currentEditData.value = row;
  parentId.value = row.pid;
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (row: SupplierTypeTreeNode) => {
  if (row.children?.length) {
    ElMessage.warning("请先删除所有子分类");
    return;
  }
  ElMessageBox.confirm(`确定删除分类"${row.supTypeName}"吗？`, "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const res = await supTypeApi.delSupType({ id: row.id });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        getDataList();
      }
    })
    .catch(() => {});
};
// 启用/禁用
const handleEnabledChange = async (row: SupplierTypeTreeNode) => {
  try {
    enabledLoading.value = true;
    const res = await supTypeApi.editSupType({
      id: row.id,
      pid: row.pid,
      supTypeCode: row.supTypeCode,
      supTypeName: row.supTypeName,
      remark: row.remark,
      isEnabled: row.isEnabled,
    });
    if (res.code === 200) {
      ElMessage.success(`已${row.isEnabled ? "启用" : "禁用"}成功`);
      await getDataList();
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

// 分页变化
const handlePaginationChange = (params: {
  currentPage: number;
  pageSize: number;
}) => {
  currentPage.value = params.currentPage;
  pageSize.value = params.pageSize;
  getDataList();
};

// 保存成功
const handleSaveSuccess = () => {
  getDataList();
};

onMounted(() => {
  getDataList();
});
</script>

<style lang="scss" scoped>
.supplier-type-page {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
