<!-- 项目产品类型列表 -->
<template>
  <div class="project-product-type-page">
    <el-form :model="queryParams" inline>
      <el-form-item label="项目名称">
        <el-tree-select
          v-model="queryParams.projId"
          :data="projectTreeData"
          :props="projectTreeProps"
          node-key="orgId"
          :render-after-expand="false"
          placeholder="请选择项目"
          :clearable="false"
          :check-strictly="false"
          :filterable="false"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd"> 新增 </el-button>
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
      <template #status="{ row }">
        <el-tag :type="row.isEnabled ? 'success' : 'danger'" size="small">
          {{ row.isEnabled ? "启用" : "禁用" }}
        </el-tag>
      </template>
      <!-- 操作列 -->
      <template #actions="{ row }">
        <el-button link type="danger" @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </base-table>

    <!-- 新增/编辑弹窗 -->
    <add-edit-project-type-dialog
      v-model="dialogVisible"
      :project-tree-data="projectTreeData"
      :project-id="queryParams.projId"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { productTypeApi } from "@/api/cost/master-data/product-type-api.ts";
import type { ProductProjDetail } from "@/types/cost/master-data/product-type.ts";
import AddEditProjectTypeDialog from "./add-edit-project-type-dialog.vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api.ts";

defineOptions({ name: "project-product-type" });

// 查询参数
const queryParams = ref({
  projId: undefined as number | undefined,
});

const tableData = ref<ProductProjDetail[]>([]);
const tableLoading = ref(false);
const projectTreeData = ref<any[]>([]);

// 弹窗相关
const dialogVisible = ref(false);

// 表格列配置
const tableColumns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "prodName", label: "产品名称" },
  { prop: "prodCode", label: "产品编码" },
  { label: "是否启用", width: 120, slot: "status" },
  { label: "操作", width: 200, slot: "actions" },
];

// 项目树配置
const projectTreeProps = {
  children: "children",
  label: "orgName",
  value: "orgId",
};

/**
 * 递归获取树形数据中的第一个项目ID
 * @param treeData 树形数据
 * @returns 第一个项目的orgId，如果没有则返回undefined
 */
const getFirstProjectId = (treeData: any[]): number | undefined => {
  for (const node of treeData) {
    // 如果当前节点是项目（dataType === 1），返回其orgId
    if (node.dataType === 1) {
      return node.orgId;
    }
    // 如果有子节点，递归查找
    if (node.children && node.children.length > 0) {
      const childId = getFirstProjectId(node.children);
      if (childId) {
        return childId;
      }
    }
  }
  return undefined;
};
/**
 * 获取项目树数据
 */
const getProjectTree = async () => {
  try {
    const res = await projectAreaApi.getMguProjList();
    if (res.code === 200) {
      projectTreeData.value = res.data || [];
      // 获取第一个项目ID并设置默认值
      const firstProjectId = getFirstProjectId(projectTreeData.value);
      if (firstProjectId) {
        queryParams.value.projId = firstProjectId;
        // 有默认项目ID后，自动查询列表
        await getProjectProductList();
      }
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};

/**
 * 获取项目产品类型列表
 */
const getProjectProductList = async () => {
  if (!queryParams.value.projId) {
    tableData.value = [];
    ElMessage.warning("请先选择项目");
    return;
  }

  try {
    tableLoading.value = true;
    const res = await productTypeApi.getProductProjList({
      projId: queryParams.value.projId,
      withDetail: true,
    });
    if (res.code === 200) {
      tableData.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取数据失败");
    }
  } catch (error) {
    console.error("获取数据失败:", error);
    ElMessage.error("获取数据失败");
  } finally {
    tableLoading.value = false;
  }
};

/**
 * 搜索
 */
const handleSearch = () => {
  getProjectProductList();
};

/**
 * 重置
 */
const handleReset = async () => {
  tableData.value = [];
  // 重置为第一个项目ID
  const firstProjectId = getFirstProjectId(projectTreeData.value);
  if (firstProjectId) {
    queryParams.value.projId = firstProjectId;
    // 查询列表
    await getProjectProductList();
  }
};

/**
 * 新增
 */
const handleAdd = () => {
  dialogVisible.value = true;
};

/**
 * 删除
 */
const handleDelete = async (row: ProductProjDetail) => {
  await ElMessageBox.confirm(`确定移除产品"${row.prodName}"吗？`, "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  });

  try {
    const res = await productTypeApi.delProductProj({
      projId: queryParams.value.projId,
      prodId: row.id,
    });
    if (res.code === 200) {
      ElMessage.success("删除成功");
      getProjectProductList();
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error) {
    console.error("删除失败:", error);
  }
};

/**
 * 弹窗提交成功回调
 */
const handleDialogSuccess = () => {
  getProjectProductList();
};

// 暴露刷新方法
defineExpose({
  refresh: getProjectProductList,
});

// 初始化
onMounted(() => {
  getProjectTree();
  //   getProjectProductList();
});
</script>

<style lang="scss" scoped>
.project-product-type-page {
  width: 100%;
  height: 100%;
  background: #fff;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 15px;
  box-sizing: border-box;

  .el-form {
    flex-shrink: 0;
    margin-bottom: 15px;
  }

  :deep(.base-table) {
    flex: 1;
    overflow: auto;
  }
}
</style>
