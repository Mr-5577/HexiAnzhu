<!-- 版本管理 -->
<template>
  <div class="version-management-page">
    <template v-if="currentView === 'list'">
      <div class="table-header">
        <div class="header-title">
          <span class="title">项目版本管理</span>
          <span class="subtitle">
            管理项目不同阶段的面积指标版本，支持版本创建和生效切换
          </span>
        </div>
        <el-form :model="queryParams" ref="queryRef" :inline="true">
          <el-form-item label="版本类型" prop="verTypeId">
            <el-select
              v-model="queryParams.verTypeId"
              placeholder="请选择版本类型"
              style="width: 200px"
            >
              <el-option
                v-for="item in verTypeList"
                :key="item.id"
                :label="item.dicLabel"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleSearch">
              搜索
            </el-button>
            <el-button icon="Refresh" @click="handleReset"> 重置 </el-button>
            <el-button type="primary" @click="handleCreate">
              创建版本
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <base-table
        ref="tableRef"
        :columns="tableColumns"
        :tableData="listData"
        rowKey="id"
        :border="true"
        :loading="tableLoading"
        :pagination="false"
      >
        <!-- 是否启用渲染 -->
        <template #isEnabled="{ row }">
          <el-tag :type="row.isEnabled ? 'success' : 'danger'" size="small">
            {{ row.isEnabled ? "生效" : "未生效" }}
          </el-tag>
        </template>

        <!-- 操作列 -->
        <template #actions="{ row }">
          <el-button link type="primary" @click="handleViewDetail(row)">
            面积设置
          </el-button>
          <el-button
            link
            type="primary"
            :disabled="row.isEnabled"
            @click="handleEnableSetting(row)"
          >
            设置生效
          </el-button>
          <el-button link type="primary" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </base-table>
    </template>

    <template v-if="currentView === 'setting'">
      <!-- 面积设置 -->
      <area-setting
        :current-data="currentEditData"
        :project-id="props.projectId"
        @back="handleBackToList"
        @saveSuccess="saveSuccess"
      />
    </template>

    <!-- 新增/编辑 版本弹窗 -->
    <add-edit-version-dialog
      v-model="dialogVisible"
      :project-id="props.projectId"
      :edit-data="currentEditData"
      :verTypeList="verTypeList"
      @success="handleSaveSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import type {
  ProjectAreaVersion,
  VersionTypeOption,
} from "@/types/cost/master-data/project-area-type.ts";
import AddEditVersionDialog from "./add-edit-version-dialog.vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api.ts";
import AreaSetting from "./area-setting.vue";

defineOptions({ name: "version-management" });

// Props
const props = defineProps<{
  projectId: number;
}>();

// 数据
const verTypeList = ref<VersionTypeOption[]>([]);
const tableLoading = ref(false);
const listData = ref<ProjectAreaVersion[]>([]);
const queryParams = ref({
  projId: props.projectId,
  verTypeId: null,
});

// 弹窗相关
const dialogVisible = ref(false);
const currentEditData = ref<ProjectAreaVersion | null>(null);

// 面积设置相关
const currentView = ref<"list" | "setting">("list");

// 表格列配置
const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "verTitle", label: "版本标题", minWidth: 200 },
  { prop: "verTypeName", label: "版本类型", width: 150 },
  { prop: "remark", label: "版本说明", minWidth: 250 },
  { label: "是否生效", width: 120, slot: "isEnabled" },
  { prop: "createDate", label: "创建时间", width: 180 },
  {
    label: "操作",
    width: 250,
    slot: "actions",
    fixed: "right",
  },
];

// 获取版本列表
const getVersionList = async () => {
  if (!props.projectId) return;

  try {
    tableLoading.value = true;
    listData.value = [];
    const res = await projectAreaApi.getAreaVerMList(queryParams.value);
    if (res.code === 200) {
      const list = res.data || [];
      listData.value = list.map((item) => ({
        ...item,
        verTypeName: getNameById(item.verTypeId),
      }));
    }
  } catch (error) {
    ElMessage.error("加载数据失败");
  } finally {
    tableLoading.value = false;
  }
};
const getNameById = (id: number) => {
  const item = verTypeList.value.find((item) => item.id === id);
  return item?.dicLabel || "";
};
// 搜索
const handleSearch = () => {
  getVersionList();
};
// 重置
const handleReset = () => {
  queryParams.value.verTypeId = null;
  getVersionList();
};
// 创建版本
const handleCreate = () => {
  currentEditData.value = null;
  dialogVisible.value = true;
};

// 编辑版本
const handleEdit = (row: ProjectAreaVersion) => {
  currentEditData.value = row;
  dialogVisible.value = true;
};

// 删除版本
const handleDelete = async (row: ProjectAreaVersion) => {
  ElMessageBox.confirm(
    `确定删除版本"${row.verTitle}"吗？删除后不可恢复。`,
    "提示",
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(async () => {
      const res = await projectAreaApi.delAreaVerM({ id: row.id });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        getVersionList();
      }
    })
    .catch(() => {});
};
// 设置版本生效
const handleEnableSetting = async (row: ProjectAreaVersion) => {
  ElMessageBox.confirm(
    `确定设置版本"${row.verTitle}"生效吗？设置成功后之前已生效的版本将自动失效。`,
    "提示",
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    },
  ).then(async () => {
    const res = await projectAreaApi.setAreaVerMEnable({ id: row.id });
    if (res.code === 200) {
      ElMessage.success("设置生效成功");
      getVersionList();
    }
  });
};

// 保存成功回调
const handleSaveSuccess = () => {
  getVersionList();
};

// 查看面积设置
const handleViewDetail = (row: ProjectAreaVersion) => {
  currentEditData.value = row;
  currentView.value = "setting";
};

// 返回列表
const handleBackToList = () => {
  currentView.value = "list";
  currentEditData.value = null;
};
// 保存成功回调
const saveSuccess = () => {
  currentView.value = "list";
  currentEditData.value = null;
  getVersionList();
};

// 刷新数据
const refresh = () => {
  getVersionList();
};
const getVerTypeList = async () => {
  try {
    // 版本列表-接口
    const res = await projectAreaApi.getAreaVerList();
    if (res.code === 200) {
      verTypeList.value = res.data || [];
    }
  } catch (error) {}
};

watch(
  () => props.projectId,
  async (newVal) => {
    if (newVal) {
      queryParams.value.projId = newVal;
      await getVerTypeList(); // 先获取版本类型列表
      getVersionList();
    }
  },
  { immediate: true },
);

onMounted(() => {});

defineExpose({ refresh });
</script>

<style lang="scss" scoped>
.version-management-page {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  border: 1px solid #e6e6e6;

  .table-header {
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
