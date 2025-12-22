<!-- 菜单管理 -->
<template>
  <div class="menu-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="菜单名称" prop="menuName">
        <el-input
          v-model="queryParams.menuName"
          placeholder="请输入菜单名称"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="菜单状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="菜单状态"
          clearable
          style="width: 200px"
        >
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <base-table
      v-if="refreshTable"
      :columns="columns"
      :tableData="tableData"
      :loading="loading"
      :rowKey="'id'"
      :border="false"
      :pagination="false"
      :isExpandAll="isExpandAll"
    >
      <!-- 列表外操作栏 -->
      <template #actionBar>
        <div class="actionBar-buttons">
          <el-button
            class="add-btn"
            type="primary"
            size="small"
            plain
            :icon="Plus"
            @click="handleAddMenu"
          >
            新增
          </el-button>
          <el-button
            type="info"
            size="small"
            plain
            :icon="Sort"
            @click="toggleExpandAll"
          >
            展开/折叠
          </el-button>
        </div>
      </template>
      <!-- 自定义插槽 ==> scope 包含：row, column, $index 等 -->
      <template #isKeepAlive="scope">
        <!-- 页面缓存 -->
        <el-tag :type="scope.row.isKeepAlive ? 'success' : 'info'" size="small">
          {{ scope.row.isKeepAlive ? "开启" : "关闭" }}
        </el-tag>
      </template>
      <template #isMultiOpen="scope">
        <!-- 页面多开 -->
        <el-tag :type="scope.row.isMultiOpen ? 'success' : 'info'" size="small">
          {{ scope.row.isMultiOpen ? "是" : "否" }}
        </el-tag>
      </template>
      <template #isVisible="scope">
        <!-- 页面隐藏 -->
        <el-tag :type="scope.row.isVisible ? 'info' : 'success'" size="small">
          {{ scope.row.isVisible ? "否" : "是" }}
        </el-tag>
      </template>
      <template #isPower="scope">
        <!-- 菜单状态 -->
        <el-tag :type="scope.row.status ? 'success' : 'info'" size="small">
          {{ scope.row.status ? "启用" : "停用" }}
        </el-tag>
      </template>
      <template #action="scope">
        <div class="action-buttons">
          <el-button
            link
            :icon="EditPen"
            type="primary"
            size="small"
            @click="handleEditMenu(scope.row)"
            v-permission="'menuList:edit'"
          >
            修改
          </el-button>
          <el-button link :icon="Plus" type="primary" size="small">
            新增
          </el-button>
          <el-button
            link
            :icon="Delete"
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
            v-permission="['menuList:edit22','menuList:edit']"
          >
            删除
          </el-button>
        </div>
      </template>
    </base-table>
    <add-edit-menu
      v-model="modalVisible"
      :form-data="formData"
      :menu-tree="tableData"
      :title="dialogTitle"
      @submit="handleSubmit"
      @close="handleDialogClose"
    ></add-edit-menu>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { Delete, EditPen, Plus, Sort } from "@element-plus/icons-vue";
import { userApi } from "@/api/user-api";
import { ElMessage, ElMessageBox } from "element-plus";
import BaseTable from "@/components/base-table.vue";
import AddEditMenu from "./add-edit-menu.vue";
import type { TableColumnItem } from "@/components/base-table.vue";
import { MenuForm, MenuItem } from "@/types/menu-type";


const queryParams = ref({
  menuName: "",
  status: "",
});
// 对话框控制
const modalVisible = ref(false);
const dialogTitle = ref("添加菜单");
const formData = ref<Partial<MenuForm>>({});

const loading = ref(false);
const refreshTable = ref(true);
const isExpandAll = ref(false);
const columns: TableColumnItem[] = [
  { prop: "title", label: "菜单名称", align: "left" },
  { prop: "sort", label: "排序", width: 60 },
  { prop: "isAutoRefresh", label: "权限标识" },
  { prop: "component", label: "组件路径", align: "left" },
  {
    prop: "isKeepAlive",
    label: "页面缓存",
    slot: "isKeepAlive",
    width: 90,
    // formatter: (row: any, column: any, index: number) => {
    //   return row.isKeepAlive ? '是' : '否';
    // },
  },
  { label: "支持多开", slot: "isMultiOpen", width: 90 },
  { label: "是否可见", slot: "isVisible", width: 90 },
  { label: "菜单状态", slot: "status", width: 90 },
  { label: "操作", slot: "action", width: 220 },
];
const tableData = ref<any[]>([]);
const toggleExpandAll = () => {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
};

const handleQuery = () => {
  getDataList();
};
const resetQuery = () => {
  queryParams.value = { menuName: "", status: "" };
  getDataList();
};
const handleAddMenu = () => {
  console.log("新增");
  formData.value = {
    pid: 0,
    menuType: 0,
    sort: 1,
    isControl: true,
    isVisible: true,
  };
  dialogTitle.value = "添加菜单";
  modalVisible.value = true;
};
const handleEditMenu = (menu: MenuItem) => {
  formData.value = {
    id: menu.id,
    pid: menu.pid,
    name: menu.name,
    title: menu.title,
    icon: menu.icon,
    menuType: menu.menuType,
    component: menu.component || "",
    path: menu.path,
    isKeepAlive: menu.isKeepAlive,
    isMultiOpen: menu.isMultiOpen,
    isControl: menu.isControl,
    isVisible: menu.isVisible,
    sort: menu.sort,
  };
  dialogTitle.value = "编辑菜单";
  modalVisible.value = true;
};
const handleDelete = (menu: MenuItem) => {
  ElMessageBox.confirm(`是否确认删除名称为"${menu.title}"的数据项？`, "删除", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      ElMessage.success("删除成功！");
    })
    .catch(() => {});
};
const handleSubmit = (form: MenuForm) => {
  console.log("提交的表单数据:", form);
  // 这里调用API接口
  if (form.id) {
    // 更新菜单
    // updateMenuApi(form)
  } else {
    // 新增菜单
    // addMenuApi(form)
  }
  modalVisible.value = false;
};

// 对话框关闭
const handleDialogClose = () => {
  formData.value = {};
};

// 获取数据列表
const getDataList = async () => {
  try {
    loading.value = true;
    const data = await userApi.getUserMenuPowerList();
    tableData.value = data || [];
  } finally {
    loading.value = false;
  }
};

// 生命周期
onMounted(() => {
  getDataList();
});
// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.menu-container {
  flex: 1;
  overflow: auto;
  background: #fff;
  padding: 15px 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .actionBar-buttons {
    height: 24px;
    display: flex;
    justify-content: flex-start;
  }
}
</style>
