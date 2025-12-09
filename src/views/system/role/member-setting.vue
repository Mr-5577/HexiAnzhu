<template>
  <div class="member-setting-page">
    <base-table
      :columns="columns"
      :tableData="tableData"
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :dictData="dictData"
      @pagination-change="handlePaginationChange"
      @refresh="handleRefresh"
      @selection-change="handleSelectionChange"
    >
      <!-- 列表外操作栏 -->
      <template #actionBar>
        <div class="actionBar-buttons">
          <el-button type="primary" size="small" plain @click="handleAdd()">
            新增
          </el-button>
          <el-button
            type="danger"
            size="small"
            plain
            :disabled="selectionData.length == 0"
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
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </div>
      </template>
    </base-table>
    <!-- 新增/编辑成员 -->
    <add-edit-member
      v-model="modalVisible"
      :edit-data="currentData"
      :tree-data="treeData"
      :roleId="props?.roleId"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import BaseTable from "@/components/base-table.vue";
import type { TableColumnItem } from "@/components/base-table.vue";
import { roleApi } from "@/api/role-api";
import { RoleMemberItem } from "@/types/role-type";
import { ElMessage, ElMessageBox } from "element-plus";
import AddEditMember from "./components/add-edit-member.vue";

interface Props {
  roleId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  roleId: 0,
});
// 字典数据
const dictData = {
  memberType: [
    { value: 0, label: "人员" },
    { value: 1, label: "部门" },
    { value: 2, label: "公司" },
    { value: 3, label: "板块" },
  ],
};
// 响应式数据
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
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
    prop: "memberType",
    label: "成员类型",
    dict: "memberType",
  },
  {
    prop: "memberName",
    label: "成员名称",
  },
  {
    label: "操作",
    slot: "action",
  },
];
const tableData = ref<RoleMemberItem[]>([]);
// 获取成员列表
const getMemberListByRoleId = async () => {
  try {
    loading.value = true;
    const res = await roleApi.getRoleMemberList({ roleId: props.roleId });
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

// 刷新
const handleRefresh = () => {};
const selectionData = ref<RoleMemberItem[]>([]);
// 多选
const handleSelectionChange = (selection: RoleMemberItem[]) => {
  // console.log("选中的数据:", selection);
  selectionData.value = selection;
};
// 批量删除
const batchDelete = () => {
  ElMessageBox.confirm("确定批量删除选中的成员吗?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {})
    .catch(() => {});
};

// 当前选中的成员
const currentData = ref<RoleMemberItem | null>(null);
const modalVisible = ref(false);
// 新增
const handleAdd = () => {
  currentData.value = null;
  modalVisible.value = true;
};
// 编辑
const handleEdit = (row: RoleMemberItem) => {
  const targetVal = findTreeNodeByMember(treeData.value, row);
  const newData = { ...row, memberId: targetVal.treeId || row.memberId };
  currentData.value = newData;
  modalVisible.value = true;
};
// 查找匹配的树节点
const findTreeNodeByMember = (treeData: any[], memberData: any): any => {
  const { memberId, memberType } = memberData;
  // 参数检查
  if (memberId === undefined || memberType === undefined) {
    console.warn("缺少必要的匹配字段");
    return null;
  }
  // 递归查找
  const search = (nodes: any[]): any => {
    for (const node of nodes) {
      // 精确匹配：dataType 和 orgId 都必须相等
      if (node.dataType === memberType && node.orgId === memberId) {
        return node;
      }
      // 深度优先搜索子节点
      if (node.children && node.children.length > 0) {
        const result = search(node.children);
        if (result) return result;
      }
    }
    return null;
  };
  return search(treeData);
};
// 单个删除
const handleDelete = (row: RoleMemberItem) => {
  ElMessageBox.confirm("确定删除这个的成员吗?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const params = {
        id: row.id,
        isDel: true,
      };
      const res = await roleApi.delRoleMember(params);
      if (res.code === 200) {
        ElMessage.success("删除成功！");
        // 重新获取列表
        getMemberListByRoleId();
      }
    })
    .catch(() => {});
};

// 新增/编辑操作成功
const handleSuccess = () => {
  getMemberListByRoleId();
};

// 人员树形结构数据
const treeData = ref([]);
// 获取人员树形数据
const getEmpTreeData = async () => {
  const res = await roleApi.getEmpTree({ empName: "", isIncludeLeave: false });
  // console.log("获取人员列表", res);
  if (res.code === 200) {
    treeData.value = res.data || [];
  }
};

watch(
  () => props.roleId,
  (val) => {
    if (val) {
      // console.log("新的ID：", val);
      getMemberListByRoleId();
      getEmpTreeData();
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
.member-setting-page {
  flex: 1;
  .actionBar-buttons {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
