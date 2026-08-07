<!-- 选择科目弹窗组件 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="选择分摊科目"
    width="1000px"
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
            <span class="tree-title">成本科目</span>
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
          <div class="tree-wrapper" v-loading="treeLoading">
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
                  <span class="node-label">{{ data.subName }}</span>
                  <!-- <span class="node-code" v-if="data.subCode">
                    ({{ data.subCode }})
                  </span> -->
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
            <span class="table-title">已选科目</span>
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
              <!-- <template #default="{ row }">
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
              </template> -->
            </base-table>
          </div>
        </div>
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, shallowRef } from "vue";
import { ElMessage } from "element-plus";
import type { ElTree } from "element-plus";
import { costAllocationApi } from "@/api/cost/contract-manage/cost-allocation-api";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";
import { buildTree } from "@/utils/tree";
import { filterReservedCost, filterTreeByIds } from "./helpers";

// Props
interface Props {
  modelValue: boolean;
  projectId?: number;
  selectedSubIds?: number[]; // 外部已选中的科目ID列表
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  projectId: undefined,
  selectedSubIds: () => [],
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  select: [data: any[], detailList: any[]];
}>();

// 树节点接口（用于el-tree展示）
interface TreeNode {
  id: number;
  pid: number;
  subCode: string;
  subName: string;
  subLevel: number;
  idPath: string;
  ctrlMode: number;
  isEnabled: boolean;
  busiSegId: number;
  allocRule: string;
  busiSegName?: string;
  segName?: string;
  allocRuleName?: string;
  remark?: string;
  children?: TreeNode[];
  // 扩展字段
  parentId?: number; // 父节点ID，用于快速查找
}

// 表格树节点
interface TableTreeNode extends TreeNode {
  isSelected: boolean;
  isPartialSelected: boolean;
  hasChildren: boolean;
  children?: TableTreeNode[];
}

// ---------- 响应式数据 ----------
const goalCostDetailList = ref([]);
const treeData = ref<TreeNode[]>([]);
const treeLoading = ref(false);
const dialogVisible = ref(props.modelValue);
const confirmLoading = ref(false);
const tableLoading = ref(false);

// Tree ref
const treeRef = ref<InstanceType<typeof ElTree>>();

// 默认展开的节点
const defaultExpandedKeys = ref<number[]>([]);
const defaultExpandedTableKeys = ref<number[]>([]);

// Tree 配置
const treeProps = {
  children: "children",
  label: "subName",
};

// 存储选中的节点ID集合
const selectedNodeIds = ref<Set<number>>(new Set());
// 存储所有被选中的叶子节点ID（用于统计）
const selectedLeafIds = ref<Set<number>>(new Set());

// 节点映射（id -> TreeNode）
const nodeMap = ref<Map<number, TreeNode>>(new Map());
// 后代缓存（id -> 所有后代id列表）
const descendantsCache = ref<Map<number, number[]>>(new Map());

// ---------- 表格列配置 ----------
const tableColumns = [
  { type: "index", label: "序号", width: 60, fixed: "left", align: "center" },
  { prop: "subName", label: "科目名称", minWidth: 200, align: "left" },
  { prop: "subCode", label: "科目编码", width: 150, align: "left" },
  { prop: "subLevel", label: "层级", width: 80, align: "center" },
  // {
  //   label: "操作",
  //   width: 100,
  //   fixed: "right",
  //   align: "center",
  //   slot: "default",
  // },
];

// 右侧树形表格数据
const selectedTreeTableData = shallowRef<TableTreeNode[]>([]);

// 构建缓存
let buildCache = new Map<string, TableTreeNode[]>();

// ---------- 核心方法：从原始数据构建节点映射 ----------
const buildNodeMapFromData = (nodes: TreeNode[], parentId?: number) => {
  for (const node of nodes) {
    // 设置父节点ID
    if (parentId !== undefined) {
      node.parentId = parentId;
    }

    // 存入映射
    nodeMap.value.set(node.id, node);

    // 收集所有后代节点ID
    const collectDescendants = (n: TreeNode): number[] => {
      let ids = [n.id];
      if (n.children && n.children.length > 0) {
        for (const child of n.children) {
          ids = ids.concat(collectDescendants(child));
        }
      }
      return ids;
    };
    descendantsCache.value.set(node.id, collectDescendants(node));

    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      buildNodeMapFromData(node.children, node.id);
    }
  }
};

// 清空映射
const clearNodeMap = () => {
  nodeMap.value.clear();
  descendantsCache.value.clear();
  buildCache.clear();
};

// ---------- 辅助方法 ----------
const getAllDescendantIds = (node: TreeNode): number[] => {
  return descendantsCache.value.get(node.id) || [node.id];
};

const isLeafNode = (node: TreeNode): boolean => {
  return !node.children || node.children.length === 0;
};

// 计算选中的叶子节点数量
const selectedLeafCount = computed(() => {
  return selectedLeafIds.value.size;
});

// ---------- 核心：构建右侧树形表格数据 ----------
const buildTableTree = (nodes: TreeNode[]): TableTreeNode[] => {
  if (selectedNodeIds.value.size === 0) {
    return [];
  }

  const cacheKey = Array.from(selectedNodeIds.value).sort().join(",");
  if (buildCache.has(cacheKey)) {
    return buildCache.get(cacheKey)!;
  }

  // 收集所有需要显示的节点ID（选中的节点 + 它们的父节点 + 它们的子节点）
  const displayNodeIds = new Set<number>();

  for (const id of selectedNodeIds.value) {
    const node = nodeMap.value.get(id);
    if (!node) continue;

    // 添加节点自身
    displayNodeIds.add(id);

    // 添加所有后代节点
    const descendants = getAllDescendantIds(node);
    for (const descId of descendants) {
      displayNodeIds.add(descId);
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

  // 递归构建树
  const buildTreeInternal = (nodesList: TreeNode[]): TableTreeNode[] => {
    const result: TableTreeNode[] = [];

    for (const node of nodesList) {
      if (!displayNodeIds.has(node.id)) {
        continue;
      }

      const isSelected = selectedNodeIds.value.has(node.id);
      const children = node.children ? buildTreeInternal(node.children) : [];

      // 判断是否部分选中（有子节点被选中但自身未被选中）
      let isPartialSelected = false;
      if (node.children && node.children.length > 0) {
        const descendants = getAllDescendantIds(node);
        const hasSelectedChild = descendants.some(
          (id) => selectedNodeIds.value.has(id) && id !== node.id,
        );
        if (hasSelectedChild && !isSelected) {
          isPartialSelected = true;
        }
      }

      const hasChildren = children.length > 0;

      const tableNode: TableTreeNode = {
        ...node,
        isSelected,
        isPartialSelected,
        hasChildren,
        children: hasChildren ? children : undefined,
      };

      // 如果没有被选中、没有部分选中、也没有子节点被保留，则跳过
      if (!isSelected && !isPartialSelected && children.length === 0) {
        continue;
      }

      result.push(tableNode);
    }

    return result;
  };

  const result = buildTreeInternal(nodes);

  // 缓存限制，防止内存溢出
  if (buildCache.size > 50) {
    const firstKey = buildCache.keys().next().value;
    buildCache.delete(firstKey);
  }
  buildCache.set(cacheKey, result);

  return result;
};

// ---------- Tree 事件处理 ----------
let isBatchUpdating = false;

const handleTreeCheck = () => {
  if (isBatchUpdating) return;

  const checkedNodes = treeRef.value?.getCheckedNodes() || [];

  // 更新选中的节点ID集合
  selectedNodeIds.value = new Set(
    checkedNodes.map((node: TreeNode) => node.id),
  );

  // 更新选中的叶子节点ID集合（用于统计）
  selectedLeafIds.value = new Set(
    checkedNodes
      .filter((node: TreeNode) => isLeafNode(node))
      .map((node: TreeNode) => node.id),
  );

  // 重新构建右侧表格数据
  selectedTreeTableData.value = buildTableTree(treeData.value);

  // 设置表格默认展开的节点（选中的父节点）
  nextTick(() => {
    const parentIds = new Set<number>();
    for (const id of selectedNodeIds.value) {
      const node = nodeMap.value.get(id);
      if (node?.parentId) {
        parentIds.add(node.parentId);
      }
    }
    defaultExpandedTableKeys.value = Array.from(parentIds);
  });
};

// 批量更新选择状态
const batchUpdateSelection = (fn: () => void) => {
  isBatchUpdating = true;
  fn();
  isBatchUpdating = false;
  nextTick(() => {
    handleTreeCheck();
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
  batchUpdateSelection(() => {
    treeRef.value?.setChecked(row.id, false, true);
  });
};

// 获取生效的目标成本版本
const getEffectiveCostVersion = async (projId: number) => {
  try {
    const res = await costAllocationApi.getProjectCostMEnabled({ projId });
    if (res.code === 200) {
      return res.data;
    }
    return null;
  } catch (error) {
    console.error("获取目标成本版本失败：", error);
    return null;
  }
};

// 获取目标成本明细列表
const getGoalCostDetailList = async (projId: number) => {
  if (!projId) {
    // ElMessage.warning("项目ID不能为空");
    return [];
  }
  treeLoading.value = true;
  try {
    // 先获取当前可用的目标成本版本
    const data: any = await getEffectiveCostVersion(projId);
    if (!data) {
      ElMessage.warning("未找到生效的目标成本版本");
      return [];
    }

    // 获取目标成本明细列表
    const params = {
      projId: data.projId,
      costMid: data.id,
      isHasAlloc: true, // true表示查询动态成本总额
    };
    const res = await goalCostApi.getProjectCostDList(params);
    if (res.code === 200) {
      // console.log("目标成本明细列表：", res.data);
      /**
       * 目标成本明细列表示例：
       *  costAmt; // 目标成本总额(含税)
       *  costExclAmt; // 目标成本总额(不含税)
       *  costDynAmt; // 动态成本总额(含税)
       * costDynExclAmt; // 动态成本总额(不含税)
       */
      const listData = (res.data || []).map((item: any) => {
        return {
          ...item,
          costDynAmt: item.costDynAmt || 0,
          costDynExclAmt: item.costDynExclAmt || 0,
        };
      });
      // 保存目标成本明细列表
      goalCostDetailList.value = listData;
      // 提取所有 subId
      const subIds: any = new Set(listData.map((item: any) => item.subId));

      // 获取基础成本科目列表
      const costSubjectsRes = await costCategoryApi.getCostSubjectBase({
        isWithParent: true,
      });
      if (costSubjectsRes.code === 200) {
        // 构建树形数据
        const rawTreeData = costSubjectsRes.data || [];
        const subTreeData: any = buildTree(rawTreeData);
        // console.log("完整树形结构：", subTreeData);

        // 使用 filterTreeByIds 过滤出包含目标 ID 的树
        const filteredTreeData = filterTreeByIds(
          subTreeData,
          Array.from(subIds),
        );
        console.log("过滤后的树形结构：", filteredTreeData);

        // 过滤掉 土地成本和费用类 以及建安类下的预留费用 得到树形数据
        treeData.value = filterReservedCost(filteredTreeData);

        // 构建节点映射
        clearNodeMap();
        buildNodeMapFromData(treeData.value);

        // 默认展开第一级节点
        defaultExpandedKeys.value = treeData.value.map((node) => node.id);

        return listData;
      }
    }
    return [];
  } catch (error) {
    console.error("获取目标成本明细失败：", error);
    return [];
  } finally {
    treeLoading.value = false;
  }
};
// ---------- 弹窗确认/关闭 ----------
const handleConfirm = () => {
  if (selectedLeafIds.value.size === 0) {
    ElMessage.warning("请先选择成本科目");
    return;
  }
  confirmLoading.value = true;
  console.log("选择的列表数据", selectedTreeTableData.value);
  // 获取选中的叶子节点数据
  // const selectedSubjects = Array.from(selectedLeafIds.value)
  //   .map((id) => nodeMap.value.get(id))
  //   .filter(Boolean)
  //   .map((node) => ({
  //     id: node!.id,
  //     subName: node!.subName,
  //     subCode: node!.subCode,
  //     subLevel: node!.subLevel,
  //     idPath: node!.idPath,
  //     busiSegId: node!.busiSegId,
  //     allocRule: node!.allocRule,
  //   }));
  // emit("select", selectedSubjects);

  emit("select", selectedTreeTableData.value, goalCostDetailList.value);
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
  selectedTreeTableData.value = [];
  buildCache.clear();
  treeRef.value?.setCheckedKeys([]);
  defaultExpandedTableKeys.value = [];
};

// 新增方法：查找叶子节点ID
const findLeafIds = (subIds: number[]): number[] => {
  const leafIds: number[] = [];
  const subIdSet = new Set(subIds);

  function traverse(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (isLeafNode(node) && subIdSet.has(node.id)) {
        leafIds.push(node.id);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }

  traverse(treeData.value);
  return leafIds;
};

// 初始化页面
const initPage = async () => {
  resetState();
  if (!props.projectId) {
    // ElMessage.warning("项目ID不能为空");
    return;
  }
  await getGoalCostDetailList(props.projectId);

  // 回显外部已选中的数据
  if (props.selectedSubIds && props.selectedSubIds.length > 0) {
    await nextTick();
    const leafIds = findLeafIds(props.selectedSubIds);
    if (leafIds.length > 0) {
      // 先展开包含选中节点的父节点
      const parentIds = new Set<number>();
      for (const id of leafIds) {
        const node = nodeMap.value.get(id);
        if (node?.parentId) {
          parentIds.add(node.parentId);
        }
      }
      defaultExpandedKeys.value = Array.from(parentIds);

      // 设置选中
      batchUpdateSelection(() => {
        treeRef.value?.setCheckedKeys(leafIds);
      });
    }
  }
};

// ---------- 监听 ----------
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      initPage();
    } else {
      resetState();
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
  close: handleClose,
  reset: resetState,
  batchUpdate: batchUpdateSelection,
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
            gap: 8px;
            font-size: 13px;
            width: 100%;

            .node-label {
              color: #303133;
            }

            .node-code {
              color: #909399;
              font-size: 12px;
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
