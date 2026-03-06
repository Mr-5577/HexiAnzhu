<!-- 人员权限 -->
<template>
  <div class="permissions-container">
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
      @selection-change="handleSelectionChange"
    >
      <!-- 列表外操作栏 -->
      <template #actionBar>
        <div class="actionBar-buttons">
          <el-button
            type="primary"
            size="small"
            plain
            @click="handleAdd()"
            :disabled="
              !menuStore.hasExactPermission('personnel-permissions:add')
            "
          >
            新增
          </el-button>
          <el-button
            type="danger"
            size="small"
            plain
            :disabled="
              !menuStore.hasExactPermission('personnel-permissions:del')
            "
            @click="batchDelete()"
          >
            批量删除
          </el-button>
        </div>
      </template>
      <!-- 列表内操作列自定义插槽 -->
      <template #action="scope">
        <div class="action-buttons">
          <el-button
            link
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
            :disabled="
              !menuStore.hasExactPermission('personnel-permissions:del')
            "
          >
            删除
          </el-button>
        </div>
      </template>
    </base-table>
    <add-personnel-permissions
      v-model="modalVisible"
      :tree-data="empTreeData"
      :roleId="props?.roleId"
      :isSuper="props?.isSuper"
      :tableData="tableData"
      @success="handleSuccess"
    ></add-personnel-permissions>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { roleApi } from "@/api/role-api";
import { ElMessage, ElMessageBox } from "element-plus";

import type { TableColumnItem } from "@/components/base/base-table.vue";
import AddPersonnelPermissions from "./add-personnel-permissions.vue";
import { useMenuStore } from "@/stores/menu-store";
const menuStore = useMenuStore();

interface Props {
  roleId?: number | null;
  isSuper?: boolean | null;
}
const props = withDefaults(defineProps<Props>(), {
  roleId: null,
  isSuper: null,
});

const loading = ref(false);
const modalVisible = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const selectionData = ref<any[]>([]);
const columns: TableColumnItem[] = [
  {
    type: "selection",
    width: "60",
  },
  {
    type: "index",
    label: "序号",
    width: "60",
  },
  {
    prop: "empName",
    label: "人员名称",
  },
  {
    label: "操作",
    slot: "action",
  },
];
const tableData = ref<any[]>([]);
// 获取数据列表
const getDataList = async () => {
  try {
    loading.value = true;
    const res = await roleApi.getRoleDataPowerUserList({
      roleId: props.roleId,
    });
    console.log("人员权限数据：", res);
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

// 多选
const handleSelectionChange = (selection: any[]) => {
  selectionData.value = selection;
};

const handleAdd = () => {
  modalVisible.value = true;
};
const batchDelete = async () => {
  const dataList = selectionData.value || [];
  if (dataList.length === 0) {
    ElMessage.warning("请至少选择一条数据进行删除！");
    return;
  }
  ElMessageBox.confirm(
    `确定删除选中的 ${dataList.length} 条数据吗？`,
    "批量删除",
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      const deleteData = dataList.map((item) => ({
        id: item.id,
        isDel: true,
      }));
      const params = {
        roleId: props.roleId,
        isSuper: props.isSuper,
        listUser: deleteData,
      };
      const res = await roleApi.editRoleDataPowerUserList(params);
      if (res.code === 200) {
        ElMessage.success("删除成功！");
        // 清空选择
        selectionData.value = [];
        // 重新获取列表
        getDataList();
      }
    })
    .catch(() => {});
};

const handleDelete = async (row: any) => {
  ElMessageBox.confirm("确定要删除选中的数据吗?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const params = {
        isSuper: true,
        roleId: row.roleId,
        listUser: [
          {
            id: row.id,
            roleId: row.roleId,
            isDel: true,
          },
        ],
      };
      const res = await roleApi.editRoleDataPowerUserList(params);
      if (res.code === 200) {
        ElMessage.success("删除成功！");
        // 重新获取列表
        getDataList();
      }
    })
    .catch(() => {});
};
const handleSuccess = () => {
  getDataList();
};
// 人员树形结构数据
const empTreeData = ref([]);
// 获取人员树形数据
const getEmpTreeData = async () => {
  const res = await roleApi.getEmpTree({ empName: "", isIncludeLeave: false });
  // console.log("获取人员列表", res);
  if (res.code === 200) {
    empTreeData.value = res.data || [];
  }
};
watch(
  () => props.roleId,
  (val) => {
    if (val) {
      // console.log("新的ID：", val);
      nextTick(() => {
        getEmpTreeData();
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
    display: flex;
    justify-content: flex-end;
  }
}
</style>
