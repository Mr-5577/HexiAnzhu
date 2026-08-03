<!-- 选择科目弹窗组件 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="选择分摊科目"
    width="1400px"
    :confirm-loading="confirmLoading"
    :confirm-text="'确定'"
    @confirm="handleConfirm"
    @close="handleClose"
  >
    <div class="subject-select-wrapper">
      <div class="content-area">
        <!-- 左侧：树形结构 -->
        <div class="tree-area">
          <div class="tree-header">
            <span class="tree-title">成本科目树</span>
            <div class="tree-actions">
              <el-button
                size="small"
                type="primary"
                link
                @click="handleExpandAll"
              >
                展开全部
              </el-button>
              <el-button
                size="small"
                type="primary"
                link
                @click="handleCollapseAll"
              >
                收起全部
              </el-button>
            </div>
          </div>
          <div class="tree-wrapper">
            <el-tree
              ref="treeRef"
              :data="treeData"
              :props="treeProps"
              node-key="id"
              show-checkbox
              :default-expanded-keys="defaultExpandedKeys"
              @check="handleTreeCheck"
            >
              <template #default="{ data }">
                <span class="tree-node">
                  <span class="node-label">{{ data.label }}</span>
                </span>
              </template>
            </el-tree>
          </div>
          <div class="tree-footer">
            <span>已选：{{ selectedLeafCount }} 个科目</span>
          </div>
        </div>

        <!-- 右侧：树形表格展示已选科目 -->
        <div class="table-area">
          <div class="table-header">
            <span class="table-title">已选科目列表</span>
          </div>
          <div class="table-wrapper">
            <base-table
              ref="tableRef"
              :row-key="'id'"
              :columns="tableColumns"
              :table-data="selectedTreeTableData"
              :loading="tableLoading"
              :height="'450px'"
              :pagination="false"
              :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
              :default-expand-all="false"
              :default-expanded-keys="defaultExpandedTableKeys"
            >
              <template #default="{ row }">
                <el-button
                  v-if="row.isSelected"
                  size="small"
                  type="danger"
                  text
                  @click="handleRemoveRow(row)"
                >
                  移除
                </el-button>
                <span v-else style="color: #c0c4cc; font-size: 12px">-</span>
              </template>
            </base-table>
          </div>
        </div>
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from "vue";
import { ElMessage } from "element-plus";
import type { ElTree } from "element-plus";

// Props
interface Props {
  modelValue: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  select: [data: any[]];
}>();

// ---------- 静态树数据 ----------
interface TreeNode {
  id: string;
  label: string;
  code: string;
  level?: string;
  children?: TreeNode[];
  parentId?: string;
}

const treeData: TreeNode[] = [
  {
    id: "1",
    label: "房屋建筑工程",
    code: "A01",
    level: "一级",
    children: [
      {
        id: "1-1",
        label: "地基与基础工程",
        code: "A01-01",
        level: "二级",
        children: [
          { id: "1-1-1", label: "土方工程", code: "A01-01-001", level: "三级" },
          { id: "1-1-2", label: "桩基工程", code: "A01-01-002", level: "三级" },
          { id: "1-1-3", label: "地基处理", code: "A01-01-003", level: "三级" },
        ],
      },
      {
        id: "1-2",
        label: "主体结构工程",
        code: "A01-02",
        level: "二级",
        children: [
          {
            id: "1-2-1",
            label: "混凝土工程",
            code: "A01-02-001",
            level: "三级",
          },
          { id: "1-2-2", label: "钢筋工程", code: "A01-02-002", level: "三级" },
          { id: "1-2-3", label: "模板工程", code: "A01-02-003", level: "三级" },
          { id: "1-2-4", label: "砌体工程", code: "A01-02-004", level: "三级" },
        ],
      },
      {
        id: "1-3",
        label: "建筑装饰装修工程",
        code: "A01-03",
        level: "二级",
        children: [
          { id: "1-3-1", label: "抹灰工程", code: "A01-03-001", level: "三级" },
          { id: "1-3-2", label: "门窗工程", code: "A01-03-002", level: "三级" },
          { id: "1-3-3", label: "吊顶工程", code: "A01-03-003", level: "三级" },
        ],
      },
    ],
  },
  {
    id: "2",
    label: "市政基础设施工程",
    code: "A02",
    level: "一级",
    children: [
      {
        id: "2-1",
        label: "道路工程",
        code: "A02-01",
        level: "二级",
        children: [
          { id: "2-1-1", label: "路基工程", code: "A02-01-001", level: "三级" },
          { id: "2-1-2", label: "路面工程", code: "A02-01-002", level: "三级" },
        ],
      },
      {
        id: "2-2",
        label: "桥梁工程",
        code: "A02-02",
        level: "二级",
        children: [
          { id: "2-2-1", label: "基础工程", code: "A02-02-001", level: "三级" },
          { id: "2-2-2", label: "上部结构", code: "A02-02-002", level: "三级" },
        ],
      },
    ],
  },
  {
    id: "3",
    label: "机电安装工程",
    code: "A03",
    level: "一级",
    children: [
      {
        id: "3-1",
        label: "电气工程",
        code: "A03-01",
        level: "二级",
        children: [
          {
            id: "3-1-1",
            label: "配电箱安装",
            code: "A03-01-001",
            level: "三级",
          },
          { id: "3-1-2", label: "电缆敷设", code: "A03-01-002", level: "三级" },
        ],
      },
      {
        id: "3-2",
        label: "给排水工程",
        code: "A03-02",
        level: "二级",
        children: [
          { id: "3-2-1", label: "管道安装", code: "A03-02-001", level: "三级" },
          { id: "3-2-2", label: "阀门安装", code: "A03-02-002", level: "三级" },
        ],
      },
    ],
  },
];

// 为每个节点添加 parentId
const addParentId = (nodes: TreeNode[], parentId?: string) => {
  for (const node of nodes) {
    node.parentId = parentId;
    if (node.children) {
      addParentId(node.children, node.id);
    }
  }
};
addParentId(treeData);

// ---------- 表格列配置 ----------
const tableColumns = [
  { type: "index", label: "序号", width: 60, fixed: "left", align: "center" },
  { prop: "label", label: "科目名称", minWidth: 200, align: "left" },
  { prop: "code", label: "科目编码", width: 180 },
  {
    prop: "level",
    label: "层级",
    width: 100,
    align: "center",
    formatter: (row: any) => {
      return row.level || "-";
    },
  },
  {
    label: "操作",
    width: 100,
    fixed: "right",
    align: "center",
    slot: "default",
  },
];

// ---------- 响应式数据 ----------
const dialogVisible = ref(props.modelValue);
const confirmLoading = ref(false);
const tableLoading = ref(false);

// Tree ref
const treeRef = ref<InstanceType<typeof ElTree>>();
const tableRef = ref();

// 默认展开的节点
const defaultExpandedKeys = ref(["1", "2", "3"]);
const defaultExpandedTableKeys = ref<string[]>([]);

// Tree 配置
const treeProps = {
  children: "children",
  label: "label",
};

// 存储选中的节点ID集合
const selectedNodeIds = ref<Set<string>>(new Set());
// 存储所有被选中的叶子节点ID（用于统计）
const selectedLeafIds = ref<Set<string>>(new Set());

// 节点映射
const nodeMap = ref<Map<string, TreeNode>>(new Map());
// ====== 优化1：后代缓存 ======
const descendantsCache = ref<Map<string, string[]>>(new Map());

// 递归构建映射 + 缓存后代
const buildNodeMap = (nodes: TreeNode[]) => {
  for (const node of nodes) {
    nodeMap.value.set(node.id, node);

    // 缓存所有后代ID（包含自己）
    const collectDescendants = (n: TreeNode): string[] => {
      let ids = [n.id];
      if (n.children) {
        for (const child of n.children) {
          ids = ids.concat(collectDescendants(child));
        }
      }
      return ids;
    };
    descendantsCache.value.set(node.id, collectDescendants(node));

    if (node.children) {
      buildNodeMap(node.children);
    }
  }
};
buildNodeMap(treeData);

// ---------- 辅助方法 ----------
// ====== 优化2：从缓存获取后代 ======
const getAllDescendantIds = (node: TreeNode): string[] => {
  return descendantsCache.value.get(node.id) || [node.id];
};

// 判断节点是否为叶子节点
const isLeafNode = (node: TreeNode): boolean => {
  return !node.children || node.children.length === 0;
};

// 获取节点的完整路径
const getNodeFullPath = (node: TreeNode): string => {
  const path: string[] = [];
  let current: TreeNode | undefined = node;
  while (current) {
    path.unshift(current.label);
    if (current.parentId) {
      current = nodeMap.value.get(current.parentId);
    } else {
      break;
    }
  }
  return path.join(" / ");
};

// 计算选中的叶子节点数量
const selectedLeafCount = computed(() => {
  return selectedLeafIds.value.size;
});

// ---------- 核心：构建右侧树形表格数据 ----------
interface TableTreeNode extends TreeNode {
  isSelected: boolean;
  isPartialSelected: boolean;
  hasChildren: boolean;
  children?: TableTreeNode[];
}

const selectedTreeTableData = computed(() => {
  // 如果没有任何选中，返回空数组
  if (selectedNodeIds.value.size === 0) {
    return [];
  }

  // 获取所有被选中的节点（包括父节点和子节点）
  const allSelectedNodes: TreeNode[] = [];
  for (const id of selectedNodeIds.value) {
    const node = nodeMap.value.get(id);
    if (node) {
      allSelectedNodes.push(node);
    }
  }

  // 获取所有需要展示的节点ID（包括被选中的父节点和子节点）
  const displayNodeIds = new Set<string>();

  for (const node of allSelectedNodes) {
    // 添加节点自身
    displayNodeIds.add(node.id);

    // ====== 优化3：使用缓存获取后代 ======
    if (node.children) {
      const descendants = getAllDescendantIds(node);
      for (const id of descendants) {
        displayNodeIds.add(id);
      }
    }

    // 添加所有祖先节点
    let current = node.parentId ? nodeMap.value.get(node.parentId) : undefined;
    while (current) {
      displayNodeIds.add(current.id);
      current = current.parentId
        ? nodeMap.value.get(current.parentId)
        : undefined;
    }
  }

  // 构建树形数据
  const buildTableTree = (nodes: TreeNode[]): TableTreeNode[] => {
    const result: TableTreeNode[] = [];

    for (const node of nodes) {
      // 检查当前节点是否在展示列表中
      if (!displayNodeIds.has(node.id)) {
        continue;
      }

      const isSelected = selectedNodeIds.value.has(node.id);
      const children = node.children ? buildTableTree(node.children) : [];

      // 判断是否有子节点被选中（半选状态）
      let isPartialSelected = false;
      if (node.children) {
        // ====== 优化4：使用缓存判断 ======
        const descendants = getAllDescendantIds(node);
        const hasSelectedChild = descendants.some(
          (id) => selectedNodeIds.value.has(id) && id !== node.id,
        );
        if (hasSelectedChild && !isSelected) {
          isPartialSelected = true;
        }
      }

      // 判断是否有子节点需要展示
      const hasChildren = children.length > 0;

      const tableNode: TableTreeNode = {
        ...node,
        isSelected,
        isPartialSelected,
        hasChildren,
        children: hasChildren ? children : undefined,
      };

      // 如果节点没有任何子节点被选中，且自身也没有被选中，则不展示
      if (!isSelected && !isPartialSelected && children.length === 0) {
        continue;
      }

      result.push(tableNode);
    }

    return result;
  };

  return buildTableTree(treeData);
});

// ---------- Tree 事件处理 ----------
// ====== 优化5：简化逻辑，减少循环 ======
const handleTreeCheck = () => {
  // 获取所有选中的节点
  const checkedNodes = treeRef.value?.getCheckedNodes() || [];

  // 直接使用 Set 构造，减少循环
  selectedNodeIds.value = new Set(checkedNodes.map((node: any) => node.id));

  // 筛选叶子节点
  selectedLeafIds.value = new Set(
    checkedNodes
      .filter((node: any) => isLeafNode(node))
      .map((node: any) => node.id),
  );

  // 自动展开右侧表格的父节点
  nextTick(() => {
    const parentIds = new Set<string>();
    for (const id of selectedNodeIds.value) {
      const node = nodeMap.value.get(id);
      if (node?.parentId) {
        parentIds.add(node.parentId);
      }
    }
    defaultExpandedTableKeys.value = Array.from(parentIds);
  });
};

// ---------- 树展开/收起 ----------
const handleExpandAll = () => {
  const nodes = treeRef.value?.store?.nodesMap;
  if (nodes) {
    Object.values(nodes).forEach((node: any) => {
      if (node.childNodes && node.childNodes.length > 0) {
        node.expanded = true;
      }
    });
  }
};

const handleCollapseAll = () => {
  const nodes = treeRef.value?.store?.nodesMap;
  if (nodes) {
    Object.values(nodes).forEach((node: any) => {
      if (node.childNodes && node.childNodes.length > 0) {
        node.expanded = false;
      }
    });
  }
};

// ---------- 表格操作 ----------
const handleRemoveRow = (row: TableTreeNode) => {
  // 取消树的选中状态
  treeRef.value?.setChecked(row.id, false, true);
  // 重新计算选中状态
  handleTreeCheck();
};

// ---------- 弹窗确认/关闭 ----------
const handleConfirm = () => {
  if (selectedLeafIds.value.size === 0) {
    ElMessage.warning("请先选择成本科目");
    return;
  }
  confirmLoading.value = true;
  console.log("selectedTreeTableData", selectedTreeTableData.value);
  // 构造返回数据：只返回叶子节点（参与分摊的末级科目）
  // const resultData: any[] = [];
  // for (const id of selectedLeafIds.value) {
  //   const node = nodeMap.value.get(id);
  //   if (node) {
  //     resultData.push({
  //       id: node.id,
  //       label: node.label,
  //       code: node.code,
  //       level: node.level,
  //       fullPath: getNodeFullPath(node),
  //       parentId: node.parentId,
  //     });
  //   }
  // }

  emit("select", selectedTreeTableData.value);
  handleClose();
  confirmLoading.value = false;
};

const handleClose = () => {
  dialogVisible.value = false;
};

// 重置状态
const resetState = () => {
  selectedNodeIds.value = new Set();
  selectedLeafIds.value = new Set();
  treeRef.value?.setCheckedKeys([]);
  defaultExpandedTableKeys.value = [];
};

// ---------- 监听 ----------
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      resetState();
      nextTick(() => {
        const nodes = treeRef.value?.store?.nodesMap;
        if (nodes) {
          Object.values(nodes).forEach((node: any) => {
            if (node.data && node.level === 1) {
              node.expanded = true;
            }
          });
        }
      });
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});

// ---------- 暴露方法 ----------
defineExpose({
  open: () => {
    dialogVisible.value = true;
  },
  close: () => {
    handleClose();
  },
  reset: resetState,
});
</script>

<style lang="scss" scoped>
.subject-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 500px;

  .content-area {
    display: flex;
    gap: 20px;
    height: 500px;

    // 左侧树区域
    .tree-area {
      flex: 0 0 380px;
      display: flex;
      flex-direction: column;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      overflow: hidden;

      .tree-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #f5f7fa;
        border-bottom: 1px solid #e4e7ed;

        .tree-title {
          font-weight: 600;
          font-size: 14px;
          color: #303133;
        }

        .tree-actions {
          display: flex;
          gap: 8px;
        }
      }

      .tree-wrapper {
        flex: 1;
        padding: 12px 8px;
        overflow-y: auto;

        :deep(.el-tree) {
          .el-tree-node__content {
            height: 32px;
            padding-right: 8px;

            &:hover {
              background: #f0f2f5;
            }
          }

          .el-checkbox {
            .el-checkbox__input {
              .el-checkbox__inner {
                width: 14px;
                height: 14px;
              }
            }
          }

          .tree-node {
            display: flex;
            align-items: center;
            font-size: 13px;
            width: 100%;

            .node-label {
              color: #303133;
            }
          }
        }
      }

      .tree-footer {
        padding: 8px 16px;
        background: #f5f7fa;
        border-top: 1px solid #e4e7ed;
        font-size: 13px;
        color: #606266;

        span {
          font-weight: 600;
          color: #409eff;
        }
      }
    }

    // 右侧表格区域
    .table-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      overflow: hidden;
      position: relative;

      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #f5f7fa;
        border-bottom: 1px solid #e4e7ed;

        .table-title {
          font-weight: 600;
          font-size: 14px;
          color: #303133;
        }
      }

      .table-wrapper {
        flex: 1;
        overflow: hidden;

        :deep(.base-table) {
          height: 100%;

          .el-table {
            height: 100%;
          }
        }
      }
    }
  }
}
</style>
