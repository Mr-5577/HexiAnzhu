<!-- 数据字典 -->
<template>
  <div class="dictionary-list-container">
    <!-- 数据字典组 -->
    <div
      class="left-content"
      v-loading="groupLoading"
      :element-loading-text="'数据加载中...'"
      :element-loading-background="'rgba(255, 255, 255, 0.6)'"
    >
      <div class="search-box">
        <el-input
          v-model="groupForm.groupName"
          placeholder="搜索字典组名称"
          clearable
          size="default"
        >
          <template #append>
            <el-icon @click="searchGroupName()"><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" class="add-group-btn" @click="handleAddGroup">
          新增分组
        </el-button>
      </div>

      <div class="tree-wrapper">
        <el-tree
          ref="treeRef"
          :data="groupData"
          :props="groupProps"
          :current-node-key="selectedGroupId"
          node-key="id"
          :highlight-current="false"
          :default-expand-all="false"
          @node-click="handleNodeClick"
          empty-text="暂无数据字典组数据"
        >
          <template #default="{ node, data }">
            <div
              class="tree-node"
              :class="{ 'project-active': selectedGroupId === data.id }"
            >
              <div class="node-label">
                <el-icon><Folder /></el-icon>
                <span>{{ node.label }}</span>
                <el-tag
                  size="small"
                  :type="data.isEnabled ? 'success' : 'danger'"
                >
                  {{ data.isEnabled ? "启用" : "禁用" }}
                </el-tag>
              </div>
              <el-popover placement="left" :teleported="false">
                <template #reference>
                  <div class="operation-button">
                    <el-icon><MoreFilled /></el-icon>
                  </div>
                </template>
                <template #default>
                  <div class="poper-dropdown">
                    <div
                      class="dropdown-item"
                      @click.stop="handleAddSubGroup(data)"
                    >
                      <el-icon><FolderAdd /></el-icon>
                      <span>新增子分组</span>
                    </div>
                    <div
                      class="dropdown-item"
                      @click.stop="handleEditGroup(data)"
                    >
                      <el-icon><EditPen /></el-icon>
                      <span>编辑</span>
                    </div>
                    <div
                      class="dropdown-item danger"
                      @click.stop="handleDelGroup(data)"
                    >
                      <el-icon><Delete /></el-icon>
                      <span>删除</span>
                    </div>
                    <div
                      class="dropdown-item"
                      @click.stop="handleToggleGroupStatus(data)"
                    >
                      <el-icon><SwitchButton /></el-icon>
                      <span>{{ data.isEnabled ? "禁用" : "启用" }}</span>
                    </div>
                  </div>
                </template>
              </el-popover>
            </div>
          </template>
        </el-tree>
      </div>
    </div>

    <!-- 字典项列表 -->
    <div class="right-content">
      <dict-item-table
        ref="dictItemTableRef"
        :group-id="selectedGroupId"
        :group-data="groupData"
      />
    </div>

    <!-- 新增/编辑 字典组弹窗 -->
    <add-edit-group-dialog
      v-model="groupDialogVisible"
      :edit-data="currentGroupData"
      :current-group-id="currentParentGroupId"
      :group-tree-data="groupData"
      @success="handleGroupSaveSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api.ts";
import DictItemTable from "./dict-item-table.vue";
import AddEditGroupDialog from "./add-edit-group-dialog.vue";
import type { DictGroup, DictGroupTreeNode } from "@/types/cost/master-data/dict-type.ts";

defineOptions({ name: "dictionary" });

// ref
const groupForm = ref({ groupName: "" });
const groupLoading = ref(false);
const groupData = ref<DictGroupTreeNode[]>([]);
const selectedGroupId = ref<number | null>(null);

const groupDialogVisible = ref(false);
const currentGroupData = ref<DictGroup | null>(null);
const currentParentGroupId = ref<number | null>(null);

const groupProps = {
  children: "children",
  label: "groupName",
};

// 扁平数据转化为树形结构数据
const buildDictTree = (list: DictGroup[]): DictGroupTreeNode[] => {
  // 转换成 map 数据结构方便查找
  const map = new Map<number, DictGroupTreeNode>();
  list.forEach((item) => {
    map.set(item.id, { ...item, children: [] }); // 浅拷贝，避免污染原数据
  });
  const tree: DictGroupTreeNode[] = [];
  // 遍历建立父子关系
  list.forEach((item) => {
    const current = map.get(item.id)!;
    if (item.pid === 0) {
      // 顶层节点
      tree.push(current);
    } else {
      // 子节点：找到父级，加入 children
      const parent = map.get(item.pid);
      if (parent) {
        parent.children!.push(current);
      }
    }
  });

  return tree;
};

// 搜索分组
const searchGroupName = () => {
  getDictGroupData();
};

// 点击分组节点
const handleNodeClick = (data: DictGroupTreeNode) => {
  if (!data.children || data.children.length === 0) {
    // console.log("点击了叶子节点", data);
    selectedGroupId.value = data.id;
  }
};

// 获取分组数据
const getDictGroupData = async () => {
  try {
    groupLoading.value = true;
    const res = await dictionaryApi.getDicMList(groupForm.value);
    if (res.code === 200) {
      const list = (res.data || []) as DictGroup[];
      groupData.value = buildDictTree(list);
    }
  } catch (error) {
  } finally {
    groupLoading.value = false;
  }
};

// 新增顶级分组
const handleAddGroup = () => {
  currentGroupData.value = null;
  currentParentGroupId.value = null;
  groupDialogVisible.value = true;
};

// 新增子分组
const handleAddSubGroup = (data: DictGroupTreeNode) => {
  currentGroupData.value = null;
  currentParentGroupId.value = data.id;
  groupDialogVisible.value = true;
};

// 编辑分组
const handleEditGroup = (data: DictGroupTreeNode) => {
  currentGroupData.value = data;
  currentParentGroupId.value = data.pid;
  groupDialogVisible.value = true;
};

// 删除分组
const handleDelGroup = async (data: DictGroupTreeNode) => {
  if (data.children?.length > 0) {
    ElMessage.warning("请先删除子分组");
    return;
  }
  try {
    ElMessageBox.confirm(`确定删除分组"${data.groupName}"吗？`, "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(async () => {
        const res = await dictionaryApi.delDictM({ id: data.id });
        if (res.code === 200) {
          ElMessage.success("删除成功");
          getDictGroupData();
          // 如果删除的是当前选中的字典组则清除选中状态
          if (selectedGroupId.value === data.id) {
            selectedGroupId.value = null;
          }
        } else {
          ElMessage.error(res.msg || "删除失败");
        }
      })
      .catch(() => {});
  } catch (error) {
    console.error("删除失败:", error);
  }
};

// 切换分组状态
const handleToggleGroupStatus = async (data: DictGroupTreeNode) => {
  const newStatus = data.isEnabled ? false : true;
  const params = {
    id: data.id,
    pid: data.pid,
    groupName: data.groupName,
    groupCode: data.groupCode,
    groupDesc: data.groupDesc,
    isEnabled: newStatus,
  };
  const res = await dictionaryApi.editDictM(params);
  if (res.code === 200) {
    ElMessage.success(newStatus ? "已启用" : "已禁用");
    getDictGroupData();
  } else {
    ElMessage.error(res.msg || "操作失败");
  }
};

// 分组保存成功
const handleGroupSaveSuccess = () => {
  getDictGroupData();
};

// 初始化
onMounted(() => {
  getDictGroupData();
});
</script>

<style lang="scss" scoped>
.dictionary-list-container {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  background: #f0f2f6;

  .left-content {
    width: 320px;
    flex-shrink: 0;
    background: #fff;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .search-box {
      display: flex;
      gap: 10px;
      padding: 16px 12px;
      border-bottom: 1px solid #e4e7ed;
      :deep(.el-input-group__append) {
        padding: 0;
        background: linear-gradient(135deg, var(--harmony-primary-dark) 0%, var(--harmony-primary-light));
        border-color: var(--harmony-primary-light);
        .el-icon {
          width: 50px;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
          cursor: pointer;
          font-size: 16px;
        }
      }
      .el-input {
        flex: 1;
      }

      .add-group-btn {
        flex-shrink: 0;
      }
    }

    .tree-wrapper {
      flex: 1;
      overflow: auto;
      padding: 8px;

      .tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;

        .node-label {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;

          .el-icon {
            color: #909399;
          }

          span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .operation-button {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #909399;
          transition: all 0.3s;

          &:hover {
            background-color: #f0f2f6;
            color: #409eff;
          }
        }

        &.project-active {
          color: #409eff;
          font-weight: 500;

          .node-label .el-icon {
            color: #409eff;
          }
        }
      }

      :deep(.el-tree-node__content) {
        height: 40px;
        padding-right: 8px;
        color: #606266;
        &:hover {
          background-color: #ecf5ff;
        }
      }
    }
  }

  .right-content {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  // 下拉菜单样式
  .poper-dropdown {
    min-width: 120px;
    padding: 4px 0;

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 14px;
      color: #606266;
      transition: all 0.3s;

      .el-icon {
        font-size: 16px;
        color: #909399;
      }

      &:hover {
        background-color: #ecf5ff;
        color: #409eff;

        .el-icon {
          color: #409eff;
        }
      }

      &.danger {
        color: #f56c6c;

        .el-icon {
          color: #f56c6c;
        }

        &:hover {
          background-color: #fef0f0;
        }
      }
    }
  }

  :deep(.el-popover) {
    min-width: auto;
    padding: 0;
  }
}
</style>
