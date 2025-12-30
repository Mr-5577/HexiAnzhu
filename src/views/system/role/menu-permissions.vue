<template>
  <div class="menu-permissions-page">
    <div class="checkbox-switch">
      <div class="left-btn">
        <el-button
          type="info"
          size="small"
          plain
          :icon="Sort"
          @click="handleExpandChange"
        >
          <!-- {{ expandAll ? "折叠" : "展开" }} -->
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
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { ElMessage, type ElTree } from "element-plus";
import { roleApi } from "@/api/role-api";
import { useMenuStore } from "@/stores/menu-store";
import { Sort } from "@element-plus/icons-vue";
const menuStore = useMenuStore();

const treeRef = ref<InstanceType<typeof ElTree>>();
const isSelectAll = ref(false);
const expandAll = ref(false);

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

const saveLoading = ref(false);
const treeData = ref<any[]>([]);

// 获取树形菜单数据
const getTreeData = async () => {
  try {
    const res = await roleApi.getRoleMenuPowerList({ roleId: props.roleId });
    // console.log("菜单数据", res);
    if (res.code === 200) {
      const data = res.data || [];
      treeData.value = data;

      // 初始化全选状态
      if (data.length > 0) {
        const allChecked = treeData.value.every((item) =>
          checkAllNodes([item])
        );
        isSelectAll.value = allChecked;
      } else {
        isSelectAll.value = false;
      }
    } else {
      treeData.value = [];
      isSelectAll.value = false;
    }
  } catch (error) {
    console.error("获取菜单数据失败:", error);
    treeData.value = [];
    isSelectAll.value = false;
  }
};

// 判断isPower是否选中
const checkAllNodes = (nodes: any[]): boolean => {
  return nodes.every((node) => {
    const currentChecked = node.isPower === true;
    const childrenChecked = node.children ? checkAllNodes(node.children) : true;
    return currentChecked && childrenChecked;
  });
};

// 初始化时根据 isPower 设置默认选中的节点
const initCheckedKeys = computed(() => {
  const data = treeData.value;
  // 确保 treeData.value 存在且是数组
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  const keys: number[] = [];
  const findCheckedNodes = (nodes: any[]) => {
    nodes.forEach((node) => {
      if (node.isPower) {
        keys.push(node.id);
      }
      const children = node.children;
      if (Array.isArray(children) && children.length > 0) {
        findCheckedNodes(children);
      }
    });
  };

  findCheckedNodes(data);
  return keys;
});

// 获取所有节点的key
const getAllKeys = (data: any[]): number[] => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  let keys: number[] = [];
  data.forEach((item) => {
    if (item && item.id !== undefined) {
      keys.push(item.id);
    }
    const children = item?.children;
    if (Array.isArray(children) && children.length > 0) {
      keys = keys.concat(getAllKeys(children));
    }
  });
  return keys;
};

// 更新所有节点的 isPower
const updateAllNodesPower = (nodes: any[], isPower: boolean) => {
  if (!nodes || !Array.isArray(nodes)) return;

  nodes.forEach((node) => {
    if (node) {
      node.isPower = isPower;
      const children = node?.children;
      if (Array.isArray(children) && children.length > 0) {
        updateAllNodesPower(node.children, isPower);
      }
    }
  });
};

// 更新单个节点的 isPower
const updateNodePower = (
  nodeId: number,
  isPower: boolean,
  nodes = treeData.value
): boolean => {
  if (!Array.isArray(nodes)) return false;

  for (const node of nodes) {
    if (!node) continue;
    if (node.id === nodeId) {
      node.isPower = isPower;
      return true;
    }
    if (Array.isArray(node.children)) {
      const found = updateNodePower(nodeId, isPower, node.children);
      if (found) return true;
    }
  }
  return false;
};

/**
 * @name 处理勾选事件-更新isPower字段
 * @param nodeData 当前被点击的节点数据
 * @param checkedStatus 勾选状态对象，包含 checkedKeys(当前已选中的key数组)、halfCheckedKeys(半选状态的key数组)等信息
 * @description 只更新当前节点
 */
// const handleCheck = (nodeData: any, checkedStatus: any) => {
//   // 确保树数据存在且是数组
//   if (!Array.isArray(treeData.value)) return;
//   // 获取当前勾选的节点
//   const { checkedKeys } = checkedStatus;
//   // 之前选中的节点ID数组
//   const previousKeys = initCheckedKeys.value;
//   // 使用 Set 提高查找性能
//   const checkedSet = new Set(checkedKeys);
//   const previousSet = new Set(previousKeys);
//   // 单次遍历完成更新
//   const allKeys = new Set([...checkedKeys, ...previousKeys]);
//   allKeys.forEach((key) => {
//     const shouldBeChecked = checkedSet.has(key);
//     const wasChecked = previousSet.has(key);
//     if (shouldBeChecked !== wasChecked) {
//       updateNodePower(key, shouldBeChecked);
//     }
//   });
//   // 更新全选状态
//   updateAllCheckboxState();
// };
/**
 * @name 处理勾选事件-更新isPower字段
 * @param nodeData 当前被点击的节点数据
 * @param checkedStatus 勾选状态对象，包含 checkedKeys(当前已选中的key数组)、halfCheckedKeys(半选状态的key数组)等信息
 * @description 选中父节点，子节点也选中，取消父节点，子节点也全部取消,没有子节点则只更新当前节点
 */
const handleCheck = (nodeData: any, checkedStatus: any) => {
  if (!treeRef.value || !Array.isArray(treeData.value)) return;
  // 获取当前节点的选中状态
  const node = treeRef.value.getNode(nodeData.id);
  const isChecked = node?.checked || false;
  // 更新当前节点的 isPower
  updateNodePower(nodeData.id, isChecked);

  // 无论选中还是取消选中，都联动子节点
  if (nodeData.children && nodeData.children.length > 0) {
    // 获取所有后代节点的ID（使用迭代避免递归爆栈）
    const getAllDescendantIds = (children: any[]): number[] => {
      let ids: number[] = [];
      const stack = [...children];
      while (stack.length > 0) {
        const child = stack.pop();
        if (!child) continue;
        ids.push(child.id);
        // 将子节点加入栈
        if (child.children && child.children.length > 0) {
          stack.push(...child.children);
        }
      }
      return ids;
    };
    const descendantIds = getAllDescendantIds(nodeData.children);
    // 批量更新所有子节点的 isPower（与父节点状态一致）
    descendantIds.forEach((descendantId) => {
      updateNodePower(descendantId, isChecked);
    });
    // 更新树组件的选中状态
    const currentCheckedKeys = treeRef.value.getCheckedKeys() as number[];
    let newCheckedKeys: number[];
    if (isChecked) {
      // 选中：添加所有子节点
      newCheckedKeys = [...new Set([...currentCheckedKeys, ...descendantIds])];
    } else {
      // 取消选中：移除所有子节点
      const descendantSet = new Set(descendantIds);
      newCheckedKeys = currentCheckedKeys.filter(
        (key) => !descendantSet.has(key)
      );
    }
    nextTick(() => {
      treeRef.value?.setCheckedKeys(newCheckedKeys);
    });
  }
  // 更新全选状态
  updateAllCheckboxState();
};

// 更新全选复选框状态
const updateAllCheckboxState = () => {
  if (!treeRef.value || !treeData.value || !treeData.value.length) return;

  try {
    const checkedKeys = treeRef.value.getCheckedKeys();
    const totalKeys = getAllKeys(treeData.value);

    // 如果所有节点都被选中，则勾选全选
    isSelectAll.value =
      checkedKeys.length === totalKeys.length && totalKeys.length > 0;
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
      // 获取所有节点的key
      const allKeys = getAllKeys(treeData.value);
      treeRef.value.setCheckedKeys(allKeys);
      // 更新所有节点的 isPower
      updateAllNodesPower(treeData.value, true);
    } else {
      treeRef.value.setCheckedKeys([]);
      // 更新所有节点的 isPower
      updateAllNodesPower(treeData.value, false);
    }
  } catch (error) {
    console.error("全选/全不选操作失败:", error);
  }
};

// 保存设置
const handleSave = async () => {
  if (!treeRef.value) return;
  saveLoading.value = true;
  try {
    // const checkedKeys = treeRef.value.getCheckedKeys();
    // console.log("保存的权限ID:", checkedKeys);
    // console.log("完整权限数据:", treeData.value);
    const params = {
      roleId: props.roleId,
      list: treeData.value,
    };
    const res = await roleApi.editRoleMenuPowerList(params);
    if (res.code === 200) {
      ElMessage.success("保存成功");
      expandAll.value = false;
      getTreeData();
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
      getTreeData();
    } else {
      // 如果 roleId 为 0，清空数据
      treeData.value = [];
      isSelectAll.value = false;
    }
  },
  { immediate: true }
);

onMounted(() => {
  nextTick(() => {
    if (treeRef.value && treeData.value && treeData.value.length) {
      try {
        // 设置初始选中状态
        treeRef.value.setCheckedKeys(initCheckedKeys.value);
        updateAllCheckboxState();
      } catch (error) {
        console.error("初始化选中状态失败:", error);
      }
    }
  });
});
</script>

<style lang="scss" scoped>
.menu-permissions-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;

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
    min-height: 400px;

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 400px;
      color: #909399;
      font-size: 14px;
    }
  }
}
</style>
