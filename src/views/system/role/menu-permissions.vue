<template>
  <div class="menu-permissions-page">
    <div
      class="loading-wrapper"
      v-loading="dataLoading"
      :element-loading-text="'数据加载中...'"
      :element-loading-background="'rgba(255, 255, 255, 0.6)'"
    >
      <div class="checkbox-switch">
        <div class="left-btn">
          <el-button
            type="info"
            size="small"
            plain
            :icon="Sort"
            @click="handleExpandChange"
          >
            展开/折叠
          </el-button>
          <el-checkbox v-model="isSelectAll" @change="handleAllChange">
            全选/全不选
          </el-checkbox>
        </div>
        <el-button
          class="save-btn"
          type="primary"
          size="small"
          plain
          :loading="saveLoading"
          @click="handleSave"
          :disabled="!menuStore.hasExactPermission('menu-permissions:edit')"
        >
          保存设置
        </el-button>
      </div>
      <div class="tree-container">
        <!-- 使用 v-if 确保有数据再渲染 -->
        <el-tree
          v-if="treeData && treeData.length"
          ref="treeRef"
          style="max-width: 600px"
          :data="treeData"
          :props="defaultProps"
          show-checkbox
          node-key="id"
          :check-strictly="true"
          :default-expanded-keys="[]"
          :default-checked-keys="initCheckedKeys"
          @check="handleCheck"
        />
        <el-empty description="暂无数据" v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch, shallowRef } from "vue";
import { ElMessage, type ElTree } from "element-plus";
import { roleApi } from "@/api/role-api";
import { useMenuStore } from "@/stores/menu-store";
import { Sort } from "@element-plus/icons-vue";

const menuStore = useMenuStore();

const treeRef = ref<InstanceType<typeof ElTree>>();
const isSelectAll = ref(false);
const expandAll = ref(false);
const dataLoading = ref(false); // 数据加载状态
const saveLoading = ref(false); // 保存加载状态

const defaultProps = {
  children: "children",
  label: "menuTitle",
};

interface Props {
  roleId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  roleId: 0,
});

// 使用 shallowRef 减少深度响应式开销
const treeData = shallowRef<any[]>([]);

// ==================== 性能优化：节点映射表 ====================
// 节点映射表：id -> 节点对象
const nodeMap = ref<Map<number, any>>(new Map());
// 父节点映射表：子节点id -> 父节点id
const parentMap = ref<Map<number, number>>(new Map());
// 子节点映射表：父节点id -> 子节点id数组
const childrenMap = ref<Map<number, number[]>>(new Map());
// 所有后代节点缓存（懒加载）
const descendantsCache = ref<Map<number, number[]>>(new Map());

/**
 * 构建节点映射表，建立快速索引
 * 时间复杂度：O(n)，只在数据加载时执行一次
 */
const buildNodeMaps = (nodes: any[], parentId: number | null = null) => {
  if (!nodes || !Array.isArray(nodes)) return;

  nodes.forEach((node) => {
    if (!node || node.id === undefined) return;

    // 存储节点映射
    nodeMap.value.set(node.id, node);

    // 存储父子关系
    if (parentId !== null) {
      parentMap.value.set(node.id, parentId);
    }

    // 存储子节点列表
    if (
      node.children &&
      Array.isArray(node.children) &&
      node.children.length > 0
    ) {
      const childIds = node.children
        .map((c: any) => c.id)
        .filter((id: number) => id !== undefined);
      childrenMap.value.set(node.id, childIds);
      // 递归处理子节点
      buildNodeMaps(node.children, node.id);
    } else {
      childrenMap.value.set(node.id, []);
    }
  });
};

/**
 * 清空所有缓存映射表
 */
const clearMaps = () => {
  nodeMap.value.clear();
  parentMap.value.clear();
  childrenMap.value.clear();
  descendantsCache.value.clear();
};

/**
 * 获取节点的所有直接子节点ID（O(1)）
 */
const getDirectChildrenIds = (nodeId: number): number[] => {
  return childrenMap.value.get(nodeId) || [];
};

/**
 * 获取节点的所有后代节点ID（包括所有层级）
 * 使用 BFS 算法 + 缓存，首次获取 O(n)，后续 O(1)
 */
const getAllDescendantIds = (nodeId: number): number[] => {
  // 检查缓存
  if (descendantsCache.value.has(nodeId)) {
    return descendantsCache.value.get(nodeId) || [];
  }

  const result: number[] = [];
  const queue = [...getDirectChildrenIds(nodeId)];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    result.push(currentId);
    // 添加当前节点的子节点到队列
    const grandchildren = getDirectChildrenIds(currentId);
    if (grandchildren.length > 0) {
      queue.push(...grandchildren);
    }
  }

  // 缓存结果
  descendantsCache.value.set(nodeId, result);
  return result;
};

/**
 * 获取节点的父节点ID（O(1)）
 */
const getParentId = (nodeId: number): number | null => {
  return parentMap.value.get(nodeId) || null;
};

/**
 * 根据ID查找节点（O(1)）
 */
const findNodeById = (nodeId: number): any => {
  return nodeMap.value.get(nodeId);
};

/**
 * 获取节点路径（从根节点到当前节点）
 */
const getNodePath = (nodeId: number): number[] => {
  const path: number[] = [];
  let currentId: number | null = nodeId;

  while (currentId !== null) {
    path.unshift(currentId);
    currentId = getParentId(currentId);
  }

  return path;
};

// ==================== 节点状态更新方法 ====================

/**
 * 更新单个节点的 isPower（O(1)）
 */
const updateNodePower = (nodeId: number, isPower: boolean): boolean => {
  const node = findNodeById(nodeId);
  if (node) {
    node.isPower = isPower;
    return true;
  }
  return false;
};

/**
 * 批量更新节点的 isPower
 */
const batchUpdateNodesPower = (nodeIds: number[], isPower: boolean) => {
  nodeIds.forEach((nodeId) => {
    const node = findNodeById(nodeId);
    if (node) {
      node.isPower = isPower;
    }
  });
};

/**
 * 更新所有节点的 isPower
 */
const updateAllNodesPower = (isPower: boolean) => {
  nodeMap.value.forEach((node) => {
    node.isPower = isPower;
  });
};

/**
 * 获取所有节点的key（O(n)）
 */
const getAllKeys = (): number[] => {
  return Array.from(nodeMap.value.keys());
};

/**
 * 更新父节点状态（根据子节点选中情况）
 * 使用映射表优化，避免递归遍历
 */
const updateParentNodeState = (childId: number) => {
  const parentId = getParentId(childId);
  if (!parentId) return;

  const parentNode = findNodeById(parentId);
  if (!parentNode || parentNode.menuType === 2) return; // 按钮类型不联动

  // 获取父节点的所有直接子节点
  const directChildrenIds = getDirectChildrenIds(parentId);
  if (directChildrenIds.length === 0) return;

  // 获取当前树中所有选中的节点ID
  const checkedKeys = (treeRef.value?.getCheckedKeys() as number[]) || [];

  // 检查子节点的选中情况
  let anyChildChecked = false;
  let allChildrenChecked = true;

  for (const childId of directChildrenIds) {
    const isChecked = checkedKeys.includes(childId);
    if (isChecked) {
      anyChildChecked = true;
    } else {
      allChildrenChecked = false;
    }
  }

  // 根据规则设置父节点状态
  let shouldCheckParent = false;

  if (allChildrenChecked && directChildrenIds.length > 0) {
    shouldCheckParent = true;
  } else if (anyChildChecked) {
    shouldCheckParent = true;
  } else {
    shouldCheckParent = false;
  }

  const isParentChecked = checkedKeys.includes(parentId);

  // 只在状态需要改变时才更新
  if (shouldCheckParent !== isParentChecked) {
    const newCheckedKeys = shouldCheckParent
      ? [...checkedKeys, parentId]
      : checkedKeys.filter((key) => key !== parentId);

    updateNodePower(parentId, shouldCheckParent);

    nextTick(() => {
      if (treeRef.value) {
        treeRef.value.setCheckedKeys(newCheckedKeys);
      }
    });
  }

  // 继续向上传递
  updateParentNodeState(parentId);
};

// ==================== 生命周期和数据处理 ====================

// 设置树的选中状态
const setTreeCheckedState = async () => {
  await nextTick();
  if (treeRef.value && treeData.value && treeData.value.length) {
    try {
      treeRef.value.setCheckedKeys(initCheckedKeys.value);
      updateAllCheckboxState();
    } catch (error) {
      console.error("设置树选中状态失败:", error);
    }
  }
};

// 获取树形菜单数据
const getTreeData = async () => {
  if (dataLoading.value) return;
  dataLoading.value = true;
  try {
    const res = await roleApi.getRoleMenuPowerList({ roleId: props.roleId });
    if (res.code === 200) {
      const data = res.data || [];

      // 清空缓存并重新构建映射表
      clearMaps();
      buildNodeMaps(data);

      treeData.value = data;

      // 等待数据渲染后设置选中状态
      await setTreeCheckedState();

      // 初始化全选状态
      if (data.length > 0) {
        const allChecked = checkAllNodes(data);
        isSelectAll.value = allChecked;
      } else {
        isSelectAll.value = false;
      }
    } else {
      treeData.value = [];
      isSelectAll.value = false;
      clearMaps();
      if (treeRef.value) {
        treeRef.value.setCheckedKeys([]);
      }
    }
  } catch (error) {
    console.error("获取菜单数据失败:", error);
    treeData.value = [];
    isSelectAll.value = false;
    clearMaps();
    if (treeRef.value) {
      treeRef.value.setCheckedKeys([]);
    }
  } finally {
    dataLoading.value = false;
  }
};

// 判断是否所有节点都选中
const checkAllNodes = (nodes: any[]): boolean => {
  if (!nodes || nodes.length === 0) return false;

  for (const node of nodes) {
    if (node.isPower !== true) return false;
    if (node.children && node.children.length > 0) {
      if (!checkAllNodes(node.children)) return false;
    }
  }
  return true;
};

// 初始化时根据 isPower 设置默认选中的节点（使用映射表优化）
const initCheckedKeys = computed(() => {
  const keys: number[] = [];
  nodeMap.value.forEach((node, id) => {
    if (node.isPower === true) {
      keys.push(id);
    }
  });
  return keys;
});

/**
 * @name 处理勾选事件
 * @param nodeData 当前被点击的节点数据
 * @param checkedStatus 勾选状态对象
 * @description 点击按钮时。只更新按钮的状态，不联动任何节点，点击菜单时，联动子节点，联动父节点
 */
const handleCheck = (nodeData: any, checkedStatus: any) => {
  if (!treeRef.value) return;

  // 获取当前节点的选中状态
  const node = treeRef.value.getNode(nodeData.id);
  const isChecked = node?.checked || false;

  // 更新当前节点的 isPower
  updateNodePower(nodeData.id, isChecked);

  // 判断是否为按钮类型（menuType === 2）
  const isButtonNode = nodeData.menuType === 2;

  if (isButtonNode) {
    // 按钮节点：只更新自身，不联动任何节点
    updateAllCheckboxState();
    return;
  }

  // 菜单节点（menuType: 0 或 1）：联动子节点
  if (nodeData.children && nodeData.children.length > 0) {
    // 使用优化的方法获取所有后代节点ID
    const descendantIds = getAllDescendantIds(nodeData.id);

    if (descendantIds.length > 0) {
      // 批量更新所有子节点的 isPower
      batchUpdateNodesPower(descendantIds, isChecked);

      // 更新树组件的选中状态
      const currentCheckedKeys = treeRef.value.getCheckedKeys() as number[];
      let newCheckedKeys: number[];

      if (isChecked) {
        newCheckedKeys = [
          ...new Set([...currentCheckedKeys, ...descendantIds]),
        ];
      } else {
        const descendantSet = new Set(descendantIds);
        newCheckedKeys = currentCheckedKeys.filter(
          (key) => !descendantSet.has(key),
        );
      }

      // 使用 requestAnimationFrame 优化批量更新
      requestAnimationFrame(() => {
        if (treeRef.value) {
          treeRef.value.setCheckedKeys(newCheckedKeys);
        }
      });
    }
  }

  // 菜单节点：向上联动父节点
  requestAnimationFrame(() => {
    updateParentNodeState(nodeData.id);
    updateAllCheckboxState();
  });
};

// 更新全选复选框状态
const updateAllCheckboxState = () => {
  if (!treeRef.value || !treeData.value || !treeData.value.length) return;

  try {
    const checkedKeys = treeRef.value.getCheckedKeys();
    const totalKeysCount = nodeMap.value.size;

    isSelectAll.value =
      checkedKeys.length === totalKeysCount && totalKeysCount > 0;
  } catch (error) {
    console.error("更新全选状态失败:", error);
  }
};

// 展开/折叠所有节点
const handleExpandChange = () => {
  if (!treeRef.value) return;
  expandAll.value = !expandAll.value;
  try {
    const nodes = treeRef.value.store.nodesMap;
    Object.keys(nodes).forEach((key) => {
      const node = nodes[key];
      if (expandAll.value) {
        node.expand();
      } else {
        node.collapse();
      }
    });
  } catch (error) {
    console.error("展开/折叠节点失败:", error);
  }
};

// 全选/全不选
const handleAllChange = (val: boolean) => {
  if (!treeRef.value || !treeData.value || !treeData.value.length) return;

  try {
    if (val) {
      const allKeys = getAllKeys();
      treeRef.value.setCheckedKeys(allKeys);
      updateAllNodesPower(true);
    } else {
      treeRef.value.setCheckedKeys([]);
      updateAllNodesPower(false);
    }
    updateAllCheckboxState();
  } catch (error) {
    console.error("全选/全不选操作失败:", error);
  }
};

// 保存设置
const handleSave = async () => {
  if (!treeRef.value) return;
  saveLoading.value = true;
  try {
    const params = {
      roleId: props.roleId,
      list: treeData.value,
    };
    const res = await roleApi.editRoleMenuPowerList(params);
    if (res.code === 200) {
      ElMessage.success("保存成功");
      expandAll.value = false;
      getTreeData(); // 重新获取数据，确保与服务器同步
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

// 监听 roleId 变化
watch(
  () => props.roleId,
  (val) => {
    if (val) {
      getTreeData();
    } else {
      // 清空数据和状态
      treeData.value = [];
      isSelectAll.value = false;
      clearMaps();
      if (treeRef.value) {
        treeRef.value.setCheckedKeys([]);
      }
    }
  },
  { immediate: true },
);

onMounted(() => {});
</script>

<style lang="scss" scoped>
.menu-permissions-page {
  width: 100%;
  height: 100%;
  position: relative;

  .loading-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;

    :deep(.el-loading-mask) {
      background-color: rgba(255, 255, 255, 0.6);
    }
  }

  .checkbox-switch {
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    .left-btn {
      display: flex;
      align-items: center;
      .el-button {
        margin-right: 20px;
      }
    }
  }

  .tree-container {
    flex: 1;
    overflow: auto;
    padding: 10px;
    background: #fff;
    border-radius: 4px;
    border: 1px solid #ebeef5;
  }
}
</style>
