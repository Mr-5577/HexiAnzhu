<template>
  <div class="goal-cost-page">
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
            <el-icon @click="handleSearch"><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="tree-wrapper">
        <el-tree
          ref="projectTreeRef"
          :data="treeData"
          :props="treeProps"
          :filter-node-method="filterNode"
          :current-node-key="currentNodeKey"
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
                  currentNodeKey === data.treeId && data.dataType === 1,
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
      <div class="detail-tab">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="目标成本版本" name="version" style="height: 100%">
            <cost-version
              v-if="activeTab === 'version'"
              :project-id="selectedProjectId"
            />
          </el-tab-pane>
          <el-tab-pane label="目标成本明细" name="detail" style="height: 100%">
            <cost-detail
              v-if="activeTab === 'detail'"
              :project-id="selectedProjectId"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <div class="right-content empty" v-else>
      <el-empty description="请从左侧选择项目" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { HomeFilled, Search, OfficeBuilding } from "@element-plus/icons-vue";
import { ElMessage, type ElTree } from "element-plus";
import CostVersion from "./components/cost-version/index.vue";
import CostDetail from "./components/cost-detail/index.vue";
import { projectAreaApi } from "@/api/cost/project-area-api";
import { ProjectTreeNode } from "@/types/cost/project-area-type";

defineOptions({ name: "goal-cost" });

// 数据
const projectTreeRef = ref<InstanceType<typeof ElTree>>();
const searchKeyword = ref("");
const treeData = ref<ProjectTreeNode[]>([]);
const selectedProjectId = ref<Number | null>(null);
const activeTab = ref("version");
const currentNodeKey = ref<string | number | null>(null);

// 树配置 - 根据新接口调整
const treeProps = {
  children: "children",
  label: "orgName",
  disabled: false,
  isLeaf: (data: ProjectTreeNode) => data.dataType === 1, // 项目节点为叶子节点
};

// 过滤节点
const filterNode = (value: string, data: ProjectTreeNode) => {
  if (!value) return true;
  return data.orgName.includes(value);
};

// 搜索
const handleSearch = () => {
  projectTreeRef.value?.filter(searchKeyword.value.trim());
};

// 点击节点
const handleNodeClick = async (data: ProjectTreeNode) => {
  // 只处理项目节点（dataType === 1）
  if (data.dataType === 1) {
    // 设置当前高亮的节点key
    currentNodeKey.value = data.treeId;
    selectedProjectId.value = data.orgId;
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

// 加载项目数据
const loadprojectData = async () => {
  try {
    const res = await projectAreaApi.getMguProjList();
    if (res.code === 200 && res.data) {
      // 处理接口返回的数据
      treeData.value = processTreeData(res.data || []);
    }
  } catch (error) {
    console.error("加载项目数据失败:", error);
  }
};

onMounted(() => {
  loadprojectData();
});
</script>

<style lang="scss" scoped>
.goal-cost-page {
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
      padding: 10px 10px;
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

          // 项目高亮样式
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

        // 当前选中节点背景色
        .el-tree-node.is-current > .el-tree-node__content {
          background-color: #ecf5ff;
          color: #606266;
        }
      }
    }
  }

  .right-content {
    width: 100%;
    height: 100%;
    flex: 1;
    background: #fff;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &.empty {
      justify-content: center;
      align-items: center;
    }

    .detail-tab {
      flex: 1;
      padding: 0 15px 15px;
      box-sizing: border-box;
      overflow: hidden;
      :deep(.el-tabs) {
        height: 100%;
        display: flex;
        flex-direction: column;
        .el-tabs__header {
          margin: 0 0 16px 0;
          .el-tabs__active-bar {
            background-color: #409eff;
          }

          .el-tabs__item {
            font-size: 14px;

            &:hover {
              color: #409eff;
            }

            &.is-active {
              color: #409eff;
            }
          }
        }

        .el-tabs__content {
          flex: 1;
          overflow: hidden;
        }
      }

      .tab-placeholder {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        color: #909399;
        background: #fafafa;
        border-radius: 8px;
        border: 1px dashed #dcdfe6;
      }
    }
  }
}
</style>
