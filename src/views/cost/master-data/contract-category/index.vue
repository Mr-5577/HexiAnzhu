<template>
  <div class="contract-category-page">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="类别名称" prop="conTypeName">
        <el-input
          v-model="queryParams.conTypeName"
          placeholder="请输入类别名称"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAddTopLevel">新建顶级分类</el-button>
      </el-form-item>
    </el-form>

    <div class="content">
      <!-- 左：合同类别树形表格 -->
      <div class="left">
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
          highlight-current-row
          @row-click="onRowClick"
          @pagination-change="handlePaginationChange"
          :isExpandAll="isExpandAll"
        >
          <template #isEnabled="{ row }">
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
            <el-button type="primary" link @click="handleAddSub(row)">添加下级</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </base-table>
      </div>

      <!-- 右：合同模板设置 -->
      <contract-template-setting
        ref="tplRef"
        :conTypeId="selectedCatId"
        class="right"
      />
    </div>

    <!-- 新增/编辑 合同类别弹窗 -->
    <contract-category-dialog
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
  ContractType,
  ContractTypeTreeNode,
} from "@/types/cost/master-data/contract-category-type.ts";
import ContractCategoryDialog from "./contract-category-dialog.vue";
import ContractTemplateSetting from "./contract-template-setting.vue";
import { conTypeApi } from "@/api/cost/master-data/contract-category-api.ts";
import { buildTree } from "@/utils/tree";

defineOptions({ name: "contract-category" });

// 查询参数
const queryParams = ref({
  conTypeName: "",
});

// 表格相关
const refreshTable = ref(true);
const isExpandAll = ref(false);
const loading = ref(false);
const enabledLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref<ContractTypeTreeNode[]>([]);

// 右侧模板设置：当前选中的合同分类
const selectedCatId = ref<number | null>(null);
const tplRef = ref<InstanceType<typeof ContractTemplateSetting> | null>(null);

// 弹窗相关
const dialogVisible = ref(false);
const currentEditData = ref<ContractType | null>(null);
const parentId = ref<number>(0);

// 表格列配置
const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: "60" },
  { prop: "conTypeName", label: "类别名称", align: "left" },
  { prop: "conTypeCode", label: "类别编码" },
  { prop: "remark", label: "类别说明" },
  { label: "是否启用", width: 100, slot: "isEnabled" },
  { label: "操作", width: 200, slot: "actions", fixed: "right" },
];

// 统一解析树节点主键（兼容 base-table 把 row 包成 { row, event } 的情况）
const getNodeId = (row: any): number | null => {
  const actualRow = row?.row ?? row;
  if (!actualRow) return null;
  const v = actualRow.id ?? actualRow.conTypeId ?? actualRow.categoryId ?? actualRow.typeId;
  return v == null ? null : Number(v);
};

// 点击树表格行 -> 选中分类（切换前若模板有改动会提示保存）
const onRowClick = async (payload: any) => {
  const row = payload?.row ?? payload;
  const id = getNodeId(row);
  if (id == null) return;
  if (selectedCatId.value === id) return; // 已选中，避免重复触发
  if (selectedCatId.value && tplRef.value) {
    const ok = await tplRef.value.beforeLeave();
    if (!ok) return; // 用户取消切换
  }
  selectedCatId.value = id;
};

// 获取数据列表
const getDataList = async () => {
  try {
    loading.value = true;
    tableData.value = [];
    const res = await conTypeApi.getConTypeList(queryParams.value);
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
  queryParams.value = { conTypeName: "" };
  handleSearch();
};

// 新建顶级分类
const handleAddTopLevel = () => {
  currentEditData.value = null;
  parentId.value = 0;
  dialogVisible.value = true;
};

// 添加下级
const handleAddSub = (row: ContractTypeTreeNode) => {
  currentEditData.value = null;
  parentId.value = row.id;
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row: ContractTypeTreeNode) => {
  currentEditData.value = row;
  parentId.value = row.pid;
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (row: ContractTypeTreeNode) => {
  if (row.children?.length) {
    ElMessage.warning("请先删除所有子分类");
    return;
  }
  ElMessageBox.confirm(`确定删除分类"${row.conTypeName}"吗？`, "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const res = await conTypeApi.delConType({ id: row.id });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        getDataList();
      } else {
        ElMessage.error(res.msg || "删除失败");
      }
    })
    .catch(() => {});
};

// 启用/禁用
const handleEnabledChange = async (row: ContractTypeTreeNode) => {
  try {
    enabledLoading.value = true;
    const res = await conTypeApi.editConType({
      id: row.id,
      pid: row.pid,
      conTypeCode: row.conTypeCode,
      conTypeName: row.conTypeName,
      majorId: row.majorId,
      isNeedOutValue: row.isNeedOutValue,
      remark: row.remark,
      isEnabled: row.isEnabled,
    });
    if (res.code === 200) {
      ElMessage.success(`已${row.isEnabled ? "启用" : "禁用"}成功`);
      await getDataList();
    } else {
      row.isEnabled = !row.isEnabled;
      ElMessage.error(res.message || "操作失败");
    }
  } catch (error) {
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
.contract-category-page {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px;
  box-sizing: border-box;
  background: #fff;

  .content {
    flex: 1;
    display: flex;
    min-height: 0;
    margin-top: 12px;
    gap: 12px;
  }
  .left {
    flex: 1 1 55%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    overflow: hidden;
  }
  .right {
    flex: 1 1 45%;
    min-width: 420px;
    max-width: 620px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    overflow: hidden;
  }
}
</style>
