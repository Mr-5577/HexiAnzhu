<!-- 管理单元（公司） -->
<template>
  <div class="management-unit-page">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="管理单元名称" prop="mguName">
        <el-input
          v-model="queryParams.mguName"
          placeholder="请输入名称"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="管理单元编号" prop="mguNo">
        <el-input
          v-model="queryParams.mguNo"
          placeholder="请输入编码"
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
      <template #segId="{ row }">
        {{ getSegName(row.segId) }}
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

    <!-- 新增/编辑 管理单元弹窗 -->
    <add-edit-unit-dialog
      v-model="dialogVisible"
      :edit-data="currentEditData"
      :parent-id="parentId"
      :segOptions="segOptions"
      @success="handleSaveSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import AddEditUnitDialog from "./add-edit-unit-dialog.vue";
import { manageunitApi } from "@/api/cost/master-data/management-unit-api.ts";
import { buildTree } from "@/utils/tree";
import { ManageUnitTreeNode } from "@/types/cost/master-data/management-unit-type.ts";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api.ts";

defineOptions({ name: "supplier-category" });

// 查询参数
const queryParams = ref({
  mguName: "",
  mguNo: "",
});

// 表格相关
const isExpandAll = ref(false);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref<ManageUnitTreeNode[]>([]);
const segOptions = ref([]);

// 弹窗相关
const dialogVisible = ref(false);
const currentEditData = ref<ManageUnitTreeNode | null>(null);
const parentId = ref<number>(0);

// 表格列配置
const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "mguName", label: "管理单元名称" },
  { prop: "mguNo", label: "组织编码" },
  { slot: "segId", label: "业务板块名称" },
  { prop: "memo", label: "说明" },
  { label: "操作", width: 200, slot: "actions", fixed: "right" },
];

const getSegName = (segId: number) => {
  const seg = segOptions.value.find((item) => item.id == segId);
  return seg ? seg.segName : "";
};

// 获取数据列表
const getDataList = async () => {
  try {
    loading.value = true;
    tableData.value = [];
    const res = await manageunitApi.getManageunitList(queryParams.value);
    if (res.code === 200) {
      tableData.value = buildTree(res.data || []);
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
  queryParams.value = { mguName: "", mguNo: "" };
  handleSearch();
};

// 新建顶级分类
const handleAddTopLevel = () => {
  currentEditData.value = null;
  parentId.value = 0;
  dialogVisible.value = true;
};

// 添加下级
const handleAddSub = (row: ManageUnitTreeNode) => {
  currentEditData.value = null;
  parentId.value = row.id;
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row: ManageUnitTreeNode) => {
  currentEditData.value = row;
  parentId.value = row.pid;
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (row: ManageUnitTreeNode) => {
  if (row.children?.length) {
    ElMessage.warning("请先删除所有子分类");
    return;
  }
  ElMessageBox.confirm(`确定删除“${row.mguName}”吗？`, "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const res = await manageunitApi.delManageunit({ id: row.id });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        getDataList();
      }
    })
    .catch(() => {});
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
// 获取业务板块列表
const getSegOptions = async () => {
  try {
    const res = await dictionaryApi.getsegmentList();
    if (res.code === 200) {
      segOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取业务板块列表失败:", error);
  }
};

onMounted(async () => {
  await getSegOptions();
  await getDataList();
});
</script>

<style lang="scss" scoped>
.management-unit-page {
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
