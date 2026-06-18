<!-- 楼栋指标管理 -->
<template>
  <div class="building-metrics-page">
    <div class="header-section">
      <div class="header-title">
        <span class="title">楼栋指标管理</span>
        <span class="subtitle">维护楼栋基础信息，录入各业态面积指标</span>
      </div>
      <el-form :model="queryParams" ref="queryRef" :inline="true">
        <el-form-item label="楼栋名称" prop="sss">
          <el-input
            v-model="queryParams.bldName"
            placeholder="请输入楼栋名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button icon="Refresh" @click="handleReset"> 重置 </el-button>
          <el-button type="primary" @click="handleAdd"> 新增楼栋 </el-button>
        </el-form-item>
      </el-form>
    </div>

    <base-table
      ref="tableRef"
      :columns="tableColumns"
      :tableData="tableList"
      rowKey="id"
      :border="true"
      :loading="tableLoading"
      :pagination="false"
      :total="total"
      :pageSize="pageSize"
      :currentPage="currentPage"
      @pagination-change="handlePageChange"
    >
      <!-- 是否地下室列 -->
      <template #isUnderGround="{ row }">
        <el-tag :type="row.isUnderGround ? 'success' : 'info'" size="small">
          {{ row.isUnderGround ? "是" : "否" }}
        </el-tag>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <!-- <el-button link type="primary" @click="handleViewDetail(row)">
            面积设置
          </el-button> -->
        <el-button link type="primary" @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button link type="danger" @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </base-table>

    <!-- 新增/编辑 楼栋弹窗 -->
    <add-edit-building-dialog
      v-model="dialogVisible"
      :project-id="props.projectId"
      :edit-data="currentEditData"
      @success="handleSaveSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import type { ProjectBuilding } from "@/types/cost/master-data/project-area-type.ts";
import AddEditBuildingDialog from "./add-edit-building-dialog.vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api.ts";

defineOptions({ name: "building-metrics" });

// Props
const props = defineProps<{
  projectId: number;
}>();

// 数据
const tableLoading = ref(false);
const tableList = ref<ProjectBuilding[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const queryParams = ref({
  projId: props.projectId,
  bldName: "",
});

// 弹窗相关
const dialogVisible = ref(false);
const currentEditData = ref<ProjectBuilding | null>(null);

// 表格列配置
const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60, align: "center" },
  { prop: "bldName", label: "楼栋名称" },
  {
    prop: "isUnderGround",
    label: "是否地下室",
    align: "center",
    slot: "isUnderGround",
  },
  { prop: "createDate", label: "创建时间", align: "center" },
  {
    label: "操作",
    width: 200,
    align: "center",
    slot: "actions",
    fixed: "right",
  },
];

// 获取楼栋列表
const getBuildingList = async () => {
  if (!props.projectId) return;
  try {
    tableLoading.value = true;
    tableList.value = [];
    const res = await projectAreaApi.getBuildingList(queryParams.value);
    if (res.code === 200) {
      tableList.value = res.data || [];
    }
  } catch (error) {
    ElMessage.error("加载数据失败");
  } finally {
    tableLoading.value = false;
  }
};
// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  getBuildingList();
};

// 重置
const handleReset = () => {
  queryParams.value.bldName = "";
  handleSearch();
};

// 新增楼栋
const handleAdd = () => {
  currentEditData.value = null;
  dialogVisible.value = true;
};

// 编辑楼栋
const handleEdit = (row: ProjectBuilding) => {
  currentEditData.value = row;
  dialogVisible.value = true;
};

// 删除楼栋
const handleDelete = async (row: ProjectBuilding) => {
  ElMessageBox.confirm(
    `确定删除楼栋"${row.bldName}"吗？删除后该楼栋下的业态面积数据也将被删除。`,
    "提示",
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(async () => {
      const res = await projectAreaApi.delBuilding({ id: row.id });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        getBuildingList();
      }
    })
    .catch(() => {});
};

// 分页变化
const handlePageChange = (params: {
  currentPage: number;
  pageSize: number;
}) => {
  currentPage.value = params.currentPage;
  pageSize.value = params.pageSize;
  getBuildingList();
};

// 保存成功回调
const handleSaveSuccess = () => {
  getBuildingList();
};

// 刷新数据
const refresh = () => {
  currentPage.value = 1;
  getBuildingList();
};
watch(
  () => props.projectId,
  (newVal) => {
    if (newVal) {
      queryParams.value.projId = newVal;
      getBuildingList();
    }
  },
  { immediate: true },
);

onMounted(() => {});

defineExpose({ refresh });
</script>

<style lang="scss" scoped>
.building-metrics-page {
  height: 100%;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  border: 1px solid #e6e6e6;

  .header-section {
    flex-shrink: 0;

    .header-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 20px;

      .title {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }

      .subtitle {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}
</style>
