<!-- 城市-项目  树形结构  组件 -->
<template>
  <div class="urban-project-component">
    <div class="search-box">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索项目名称"
        clearable
        size="default"
      >
        <template #append>
          <el-icon @click="handleSearchTree"><Search /></el-icon>
        </template>
      </el-input>
    </div>
    <div class="tree-wrapper">
      <el-tree
        ref="projectTreeRef"
        :data="treeData"
        :props="treeProps"
        :filter-node-method="filterNode"
        :current-node-key="selectedProjectId"
        node-key="treeId"
        :highlight-current="false"
        :default-expand-all="false"
        :accordion="false"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <span
            class="tree-node"
            :class="{
              'project-active':
                selectedProjectId === data.orgId && data.dataType === 1,
            }"
          >
            <el-icon v-if="data.dataType === 3"><OfficeBuilding /></el-icon>
            <el-icon v-else><HomeFilled /></el-icon>
            <span>{{ node.label }}</span>
            <span v-if="data.dataType === 3" class="node-count">
              ({{ data.children?.length || 0 }}个项目)
            </span>
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElTree } from "element-plus";
import type { ProjectTreeNode } from "@/types/cost/project-area-type";
import { projectAreaApi } from "@/api/cost/project-area-api";

defineOptions({ name: "urban-project-tree" });

// 定义事件
const emit = defineEmits<{
  (e: "select", data: ProjectTreeNode): void;
  (e: "update:selectedProjectId", value: number | null): void;
}>();

const treeProps = {
  children: "children",
  label: "orgName",
  isLeaf: (data: ProjectTreeNode) => data.dataType === 1,
};

const projectTreeRef = ref<InstanceType<typeof ElTree>>();
const searchKeyword = ref("");
const treeData = ref<ProjectTreeNode[]>([]);
const selectedProjectId = ref<number | null>(null);

const filterNode = (value: string, data: ProjectTreeNode) => {
  if (!value) return true;
  return data.orgName.includes(value);
};

const handleSearchTree = () => {
  // 先清除选中的节点和项目ID，再进行过滤
  selectedProjectId.value = null;
  // 清空选中时也触发事件
  emit("select", null as any);
  emit("update:selectedProjectId", null);
  projectTreeRef.value?.filter(searchKeyword.value);
};

const handleNodeClick = (data: ProjectTreeNode) => {
  if (data.dataType === 1) {
    selectedProjectId.value = data.orgId;
    // 触发事件，抛出选中的数据
    emit("select", data);
    // 支持 v-model 绑定
    emit("update:selectedProjectId", data.orgId);
  }
};
// 递归处理后端返回的数据，过滤掉没有项目的节点
const processTreeData = (
  nodes: any[],
  parentCompanyName?: string,
): ProjectTreeNode[] => {
  return nodes
    .map((node) => {
      // 确定当前节点的公司名称
      let currentCompanyName = parentCompanyName;
      if (node.dataType === 3) {
        // 公司节点，更新公司名称
        currentCompanyName = node.orgName;
      }

      // 处理子节点，传递当前公司名称
      let processedChildren: ProjectTreeNode[] = [];
      if (node.children && node.children.length > 0) {
        processedChildren = processTreeData(node.children, currentCompanyName);
      }

      // 创建处理后的节点
      const processedNode: ProjectTreeNode = {
        treeId: node.treeId,
        treePid: node.treePid,
        orgName: node.orgName,
        orgId: node.orgId,
        orgPid: node.orgPid,
        sort: node.sort,
        dataTypeName: node.dataTypeName,
        dataType: node.dataType,
        dataId: node.dataId,
        children: processedChildren,
        // 如果是项目节点，直接存储公司名称
        companyName: node.dataType === 1 ? currentCompanyName : undefined,
      };
      return processedNode;
    })
    .filter((node) => {
      // 如果是项目节点（dataType === 1），保留
      if (node.dataType === 1) {
        return true;
      }
      // 如果是公司节点（dataType === 3），只有当它有子项目时才保留
      if (node.dataType === 3) {
        return node.children && node.children.length > 0;
      }
      // 其他类型节点（如果有），保留
      return true;
    });
};

const loadProjectData = async () => {
  try {
    const res = await projectAreaApi.getMguProjList();
    if (res.code === 200 && res.data) {
      treeData.value = processTreeData(res.data || []);
    }
  } catch (error) {
    console.error("加载项目数据失败:", error);
  }
};

onMounted(async () => {
  await loadProjectData();
});

// 暴露方法供父组件调用
defineExpose({
  selectedProjectId,
  clearSelection: () => {
    selectedProjectId.value = null;
    projectTreeRef.value?.setCurrentKey(null);
  },
  getCurrentProject: () => {
    return treeData.value.find(
      (node) => node.orgId === selectedProjectId.value && node.dataType === 1,
    );
  },
});
</script>

<style lang="scss" scoped>
.urban-project-component {
  width: 248px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .search-box {
    padding: 16px 10px;
    box-sizing: border-box;
    border-bottom: 1px solid #e4e7ed;

    :deep(.el-input-group__append) {
      padding: 0;
      background: linear-gradient(
        135deg,
        var(--harmony-primary-dark) 0%,
        var(--harmony-primary-light)
      );
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
  }

  .tree-wrapper {
    flex: 1;
    overflow: auto;
    padding: 10px;
    box-sizing: border-box;

    :deep(.el-tree) {
      .tree-node {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;

        .el-icon {
          color: #909399;
        }

        .node-count {
          margin-left: auto;
          font-size: 12px;
          color: #909399;
        }

        &.project-active {
          color: #409eff;
          font-weight: 500;

          .el-icon {
            color: #409eff;
          }
        }
      }

      .el-tree-node__content {
        height: 40px;

        &:hover {
          background-color: #ecf5ff;
        }
      }

      .el-tree-node.is-current > .el-tree-node__content {
        background-color: #ecf5ff;
        color: #606266;
      }
    }
  }
}
</style>
