<!-- 组织权限 -->
<template>
  <div class="permissions-container">
    <base-table
      :columns="columns"
      :tableData="tableData"
      :loading="loading"
      :total="total"
      :rowKey="'treeId'"
      :current-page="currentPage"
      :page-size="pageSize"
      :pagination="false"
      @pagination-change="handlePaginationChange"
    >
      <!-- 列表外操作栏 -->
      <template #actionBar>
        <div class="actionBar-buttons">
          <el-button
            class="save-btn"
            type="primary"
            size="small"
            plain
            :loading="saveLoading"
            @click="handleSave"
            :disabled="
              !menuStore.hasExactPermission('department-permissions:edit')
            "
          >
            保存设置
          </el-button>
        </div>
      </template>
      <!-- 自定义插槽 ==> scope 包含：row, column, $index 等 -->
      <template #isPower="scope">
        <!-- 是否授权 -->
        <el-checkbox
          v-model="scope.row.isPower"
          @change="handlePowerChange(scope.row)"
        ></el-checkbox>
      </template>
      <template #isAutoRefresh="scope">
        <!-- 是否自动权限扩张 -->
        <el-checkbox
          v-model="scope.row.isAutoRefresh"
          @change="handleAutoRefreshChange(scope.row)"
        ></el-checkbox>
      </template>
    </base-table>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { roleApi } from "@/api/role-api";
import { ElMessage } from "element-plus";
import BaseTable from "@/components/base-table.vue";
import type { TableColumnItem } from "@/components/base-table.vue";
import { useMenuStore } from "@/stores/menu-store";
const menuStore = useMenuStore();

interface Props {
  roleId?: number | null;
}
const props = withDefaults(defineProps<Props>(), {
  roleId: null,
});

const saveLoading = ref(false);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const columns: TableColumnItem[] = [
  {
    type: "index",
    label: "序号",
    width: "60",
  },
  {
    prop: "orgName",
    label: "项目名称",
    align: "left",
  },
  {
    prop: "isPower",
    label: "授权",
    slot: "isPower",
  },
  {
    prop: "isAutoRefresh",
    label: "自动权限扩张",
    slot: "isAutoRefresh",
  },
];
const tableData = ref<any[]>([]);
// 获取数据列表
const getDataList = async () => {
  try {
    loading.value = true;
    const res = await roleApi.getRoleDataPowerDeptList({
      roleId: props.roleId,
    });
    console.log("组织权限数据：", res);
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } finally {
    loading.value = false;
  }
};
// 分页变化
const handlePaginationChange = (params: any) => {
  currentPage.value = params.currentPage;
  pageSize.value = params.pageSize;
};
// 处理授权状态变化
const handlePowerChange = (row: any) => {
  // console.log("授权状态变化isPower:", row.isPower);
  updateChildrenPower(row.children, row.isPower);
};
// 递归更新所有子节点的授权状态
const updateChildrenPower = (nodes: any[], isPower: boolean) => {
  for (const node of nodes) {
    node.isPower = isPower;
    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      updateChildrenPower(node.children, isPower);
    }
  }
};
// 处理自动权限扩张状态变化
const handleAutoRefreshChange = (row: any) => {
  console.log("自动权限扩张变化isAutoRefresh:", row.isAutoRefresh);
};

const handleSave = async () => {
  console.log(tableData.value);
  saveLoading.value = true;
  try {
    const params = {
      roleId: props.roleId,
      listDept: tableData.value,
    };
    const res = await roleApi.editRoleDataPowerDeptList(params);
    if (res.code === 200) {
      ElMessage.success("保存成功");
      getDataList();
    } else {
      ElMessage.error("保存失败");
    }
  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error("保存失败");
  } finally {
    saveLoading.value = false;
  }
};

watch(
  () => props.roleId,
  (val) => {
    if (val) {
      // console.log("新的ID：", val);
      nextTick(() => {
        getDataList();
      });
    }
  },
  { immediate: true }
);

// 生命周期
onMounted(() => {});
// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.permissions-container {
  margin-top: 8px;
  flex: 1;
  overflow: auto;
  background: #fff;
  .actionBar-buttons {
    height: 24px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
