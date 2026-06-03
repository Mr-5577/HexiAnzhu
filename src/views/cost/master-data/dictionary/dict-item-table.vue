<!--数据字典项 列表 -->
<template>
  <div class="dict-item-table">
    <template v-if="groupId">
      <el-form :model="queryParams" ref="queryRef" :inline="true">
        <el-form-item label="字典名称" prop="dicLabel">
          <el-input
            v-model="queryParams.dicLabel"
            placeholder="搜索字典名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="字典编码" prop="dicCode">
          <el-input
            v-model="queryParams.dicCode"
            placeholder="搜索字典编码"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button icon="Refresh" @click="handleReset"> 重置 </el-button>
          <el-button type="primary" @click="handleAdd"> 新增字典 </el-button>
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
        <!-- 是否启用列 -->
        <template #status="{ row }">
          <el-tag :type="row.isEnabled ? 'success' : 'danger'" size="small">
            {{ row.isEnabled ? "启用" : "禁用" }}
          </el-tag>
        </template>
        <!-- 操作列 -->
        <template #actions="{ row }">
          <el-button type="primary" link @click="handleAddSub(row)">
            添加下级
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

    <el-empty v-else description="请从左侧选择字典分组" />

    <!-- 新增/编辑 字典项弹窗 -->
    <add-edit-item-dialog
      v-model="itemDialogVisible"
      :edit-data="currentRow"
      :group-id="props.groupId"
      :group-data="props.groupData"
      :parent-id="parentId"
      @success="handleItemSaveSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { dictionaryApi } from "@/api/cost/dictionary-api";
import type {
  DictItem,
  DictGroupTreeNode,
  DictItemTreeNode,
} from "@/types/cost/dict-type";
import AddEditItemDialog from "./add-edit-item-dialog.vue";
import { buildTree } from "@/utils/tree";

// Props
const props = defineProps<{
  groupId?: number | null;
  groupData?: DictGroupTreeNode[] | [];
}>();

// Emits
const emit = defineEmits<{
  delete: [id: number];
}>();

// 查询参数
const queryParams = ref({
  dicLabel: "",
  dicCode: "",
});

const tableData = ref<DictItem[]>([]);
const tableLoading = ref(false);

// 弹窗相关
const itemDialogVisible = ref(false);
const currentRow = ref<DictItem | null>(null);
const parentId = ref<number>(0);

// 表格列配置
const tableColumns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "dicLabel", label: "字典名称", width: 200 },
  { prop: "dicCode", label: "字典编码", width: 150 },
  { prop: "dicValue", label: "字典值", width: 150 },
  { prop: "dicDesc", label: "描述", minWidth: 200 },
  { prop: "sort", label: "排序", width: 80 },
  { label: "是否启用", width: 100, slot: "status" },
  { label: "操作", width: 200, slot: "actions", fixed: "right" },
];

// 获取字典项数据
const getDictItemData = async () => {
  if (!props.groupId) {
    tableData.value = [];
    return;
  }

  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await dictionaryApi.getDictDList({
      groupId: props.groupId,
      ...queryParams.value,
    });
    if (res.code === 200) {
      tableData.value = buildTree(res.data || []);
    }
  } finally {
    tableLoading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  getDictItemData();
};

// 重置
const handleReset = () => {
  queryParams.value = {
    dicLabel: "",
    dicCode: "",
  };
  getDictItemData();
};

// 新增
const handleAdd = () => {
  if (!props.groupId) {
    ElMessage.warning("请先选择字典分组");
    return;
  }
  currentRow.value = null;
  parentId.value = 0;
  itemDialogVisible.value = true;
};
// 添加下级
const handleAddSub = (row: DictItem) => {
  currentRow.value = null;
  parentId.value = row.id;
  itemDialogVisible.value = true;
};

// 编辑
const handleEdit = (row: DictItem) => {
  currentRow.value = row;
  parentId.value = row.pid;
  itemDialogVisible.value = true;
};

// 删除
const handleDelete = async (row: DictItem) => {
  ElMessageBox.confirm(`确定删除字典"${row.dicLabel}"吗？`, "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const res = await dictionaryApi.delDictD({ id: row.id });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        getDictItemData();
        emit("delete", row.id);
      } else {
        ElMessage.error(res.msg || "删除失败");
      }
    })
    .catch(() => {});
};

// 切换状态
const handleToggleStatus = async (row: DictItem) => {
  // const res = await dictionaryApi.updateDictD({
  //   id: row.id,
  //   isEnabled: row.isEnabled,
  // });
  // if (res.code === 200) {
  //   ElMessage.success("状态已更新");
  // } else {
  //   // 失败时还原状态
  //   row.isEnabled = row.isEnabled === 1 ? 0 : 1;
  //   ElMessage.error(res.msg || "操作失败");
  // }
};

// 字典项保存成功回调
const handleItemSaveSuccess = () => {
  getDictItemData();
};

// 监听groupId变化
watch(
  () => props.groupId,
  () => {
    getDictItemData();
  },
  { immediate: true },
);

// 暴露刷新方法
defineExpose({
  refresh: getDictItemData,
});
</script>

<style lang="scss" scoped>
.dict-item-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .el-form {
    flex-shrink: 0;
  }

  .base-table {
    flex: 1;
  }
}
</style>
