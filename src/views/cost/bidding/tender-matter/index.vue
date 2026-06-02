<!-- 招标管理 -->
<template>
  <div class="bidding-management-page">
    <!-- 城市项目 -->
    <div class="left-content">
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

    <div class="right-content" v-if="selectedProjectId">
      <tender-table :project-id="selectedProjectId" />
    </div>

    <div class="right-content empty" v-else>
      <el-empty description="请从左侧选择项目" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElTree } from "element-plus";
import TenderTable from "./tender-table.vue";
import type { ProjectTreeNode } from "@/types/cost/project-area-type";
import { projectAreaApi } from "@/api/cost/project-area-api";

defineOptions({ name: "bidding-management" });

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
  projectTreeRef.value?.filter(searchKeyword.value);
};

const handleNodeClick = (data: ProjectTreeNode) => {
  if (data.dataType === 1) {
    selectedProjectId.value = data.orgId;
  }
};

const processTreeData = (
  nodes: any[],
  parentCompanyName?: string,
): ProjectTreeNode[] => {
  return nodes
    .map((node) => {
      let currentCompanyName = parentCompanyName;
      if (node.dataType === 3) {
        currentCompanyName = node.orgName;
      }

      let processedChildren: ProjectTreeNode[] = [];
      if (node.children && node.children.length > 0) {
        processedChildren = processTreeData(node.children, currentCompanyName);
      }

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
        companyName: node.dataType === 1 ? currentCompanyName : undefined,
      };
      return processedNode;
    })
    .filter((node) => {
      if (node.dataType === 1) return true;
      if (node.dataType === 3) return node.children && node.children.length > 0;
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
</script>

<style lang="scss" scoped>
.bidding-management-page {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  background: #f0f2f6;

  .left-content {
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

  .right-content {
    flex: 1;
    padding: 15px;
    box-sizing: border-box;
    background: #fff;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &.empty {
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
