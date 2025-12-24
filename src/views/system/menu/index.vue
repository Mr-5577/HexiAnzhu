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
      :loading="tableLoading"
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
      <template #isInner="scope">
        <!-- 页面缓存 -->
        <el-tag :type="scope.row.isInner ? 'success' : 'info'" size="small">
          {{ scope.row.isInner ? "是" : "否" }}
        </el-tag>
      </template>
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
      <template #action="scope">
        <div class="action-buttons">
          <el-button
            link
            :icon="EditPen"
            type="primary"
            size="small"
            @click="handleAddEditMenu(scope.row, 'edit')"
          >
            修改
          </el-button>
          <el-button
            link
            :icon="Plus"
            type="primary"
            size="small"
            @click="handleAddEditMenu(scope.row, 'add')"
          >
            新增
          </el-button>
          <el-button
            link
            :icon="Delete"
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </div>
      </template>
    </base-table>
    <add-edit-menu
      v-model="modalVisible"
      :currentData="formData"
      :menu-tree="tableData"
      :title="dialogTitle"
      :dialog-type="dialogType"
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
import { menuApi } from "@/api/menu-api";

const queryParams = ref({
  menuName: "",
});
// 对话框控制
// 对话框类型：add-root(新增根级), add-child(新增子级), edit(编辑)
const dialogType = ref<"add-root" | "add-child" | "edit">("add-root");
const modalVisible = ref(false);
const dialogTitle = ref("添加菜单");
const formData = ref<Partial<MenuForm>>({});

const tableLoading = ref(false);
const refreshTable = ref(true);
const isExpandAll = ref(false);
const columns: TableColumnItem[] = [
  { prop: "title", label: "菜单名称", align: "left" },
  { prop: "sort", label: "排序", width: 60 },
  { prop: "isAutoRefresh", label: "权限标识" },
  { prop: "component", label: "组件路径", align: "left" },
  { label: "是否内置", slot: "isInner", width: 90 },
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
  queryParams.value = { menuName: "" };
  getDataList();
};
const handleAddMenu = () => {
  formData.value = {
    pid: 0,
    menuType: 0,
    sort: 1,
    isControl: true,
    isVisible: true,
  };
  dialogTitle.value = "新增菜单";
  dialogType.value = "add-root"; // 设置为新增根级
  modalVisible.value = true;
};
const handleAddEditMenu = (menu: MenuItem, type: string) => {
  if (type === "edit") {
    // 编辑菜单
    formData.value = { ...menu };
    dialogTitle.value = "编辑菜单";
    dialogType.value = "edit";
  } else {
    // 新增子菜单
    formData.value = {
      pid: menu.id, // 父级是当前选中的菜单
      menuType: menu.menuType === 0 ? 1 : 2, // 父级是模块则子级是菜单，父级是菜单则子级是按钮
      sort: 1,
      isControl: true,
      isVisible: menu.menuType !== 2, // 按钮默认不可见
    };
    dialogTitle.value = "新增子菜单";
    dialogType.value = "add-child";
  }
  modalVisible.value = true;
};
const handleDelete = (menu: MenuItem) => {
  ElMessageBox.confirm(`是否确认删除名称为"${menu.title}"的数据项？`, "删除", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const res = await menuApi.delMenu({ ...menu, isDel: true });
      if (res.code === 200) {
        ElMessage.success("删除成功！");
        getDataList();
      }
    })
    .catch(() => {});
};
const handleSubmit = (form: MenuForm) => {
  console.log("提交的表单数据:", form);
  modalVisible.value = false;
  getDataList();
};

// 对话框关闭
const handleDialogClose = () => {
  formData.value = {};
  dialogType.value = "add-root"; // 重置为默认
};

// 获取数据列表
const getDataList = async () => {
  try {
    tableLoading.value = true;
    // const res = await userApi.getUserMenuPowerList();
    const res = await menuApi.getMenuList({ ...queryParams.value });
    if (res.code === 200) {
      console.log("sds", convertToTreeOptimized(res.data || []));
      tableData.value = convertToTreeOptimized(res.data || []);
    }
  } finally {
    tableLoading.value = false;
  }
};
/**
 * 优化性能的树形结构转换
 * @param flatData 扁平菜单数据
 * @returns 树形结构数据
 */
const convertToTreeOptimized = (flatData: MenuItem[]): MenuItem[] => {
  if (!flatData?.length) return [];
  const menuMap = new Map<number, MenuItem & { children: MenuItem[] }>();
  const tree: MenuItem[] = [];
  // 初始化所有节点
  flatData.forEach((item) => {
    menuMap.set(item.id, { ...item, children: [] });
  });

  // 建立父子关系
  flatData.forEach((item) => {
    const menuItem = menuMap.get(item.id)!;
    const parent = menuMap.get(item.pid);
    if (item.pid === 0) {
      // pid为0表示根节点
      tree.push(menuItem);
    } else if (parent) {
      parent.children.push(menuItem);
    } else {
      tree.push(menuItem); // 处理孤儿节点
    }
  });
  // 后置排序：递归排序整个树
  const sortTreeRecursive = (nodes: MenuItem[]) => {
    if (!nodes.length) return;
    // 排序当前层级
    nodes.sort((a, b) => a.sort - b.sort);
    // 递归排序所有子层级
    nodes.forEach((node) => {
      if (node.children?.length) {
        sortTreeRecursive(node.children);
      }
    });
  };
  // 从根节点开始排序
  sortTreeRecursive(tree);
  return tree;
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
