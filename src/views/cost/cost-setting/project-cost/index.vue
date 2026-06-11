<!-- 项目成本业态 -->
<template>
  <div class="project-cost-page">
    <!-- 城市项目筛选 -->
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

    <div class="right-content">
      <base-table
        :columns="columns"
        :tableData="tableData"
        :loading="loading"
        :total="total"
        :rowKey="'treeId'"
        :current-page="currentPage"
        :page-size="pageSize"
        :pagination="false"
        @pagination-change="handlePaginationChange"
        :isExpandAll="isExpandAll"
      >
        <template #actionBar>
          <div class="actionBar-buttons">
            <el-button type="primary" plain @click="modalVisible = true">
              选择项目产品
            </el-button>
          </div>
        </template>
        <!-- 自定义插槽 ==> scope 包含：row, column, $index 等 -->
        <template #actions="{ row }">
          <el-button type="danger" link> 删除 </el-button>
        </template>
      </base-table>

      <product-selection-dialog
        v-model="modalVisible"
      ></product-selection-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { HomeFilled, Search, OfficeBuilding } from "@element-plus/icons-vue";
import type { ElTree } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import ProductSelectionDialog from "./product-selection-dialog.vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api.ts";
import { ProjectTreeNode } from "@/types/cost/master-data/project-area-type.ts";

// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "project-cost" });

// 左侧树相关
const projectTreeRef = ref<InstanceType<typeof ElTree>>();
const searchKeyword = ref("");
const treeData = ref<ProjectTreeNode[]>([]);
const currentNodeKey = ref<string | number | null>(null);
const selectedProjectId = ref<number | null>(null);

// 右侧表格相关
const queryParams = ref({
  projIds: [],
});
const modalVisible = ref(false);
const isExpandAll = ref(false);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const columns: TableColumnItem[] = [
  { prop: "orgName", label: "项目", align: "left" },
  { prop: "orgName1", label: "产品类别" },
  { prop: "orgName1", label: "产品名称" },
  { prop: "orgName1", label: "说明" },
  { label: "操作", prop: "actions", width: 180, slot: "actions" },
];
const tableData = ref<any[]>([]);

// 树配置
const treeProps = {
  children: "children",
  label: "orgName",
  disabled: false,
  isLeaf: (data: ProjectTreeNode) => data.dataType === 1,
};

// 过滤节点
const filterNode = (value: string, data: ProjectTreeNode) => {
  if (!value) return true;
  return data.orgName.includes(value);
};

// 搜索
const handleSearch = () => {
  projectTreeRef.value?.filter(searchKeyword.value);
};

// 点击树节点
const handleNodeClick = (data: ProjectTreeNode) => {
  if (data.dataType === 1) {
    currentNodeKey.value = data.treeId;
    selectedProjectId.value = data.orgId;
    queryParams.value.projIds = [data.orgId];
    getDataList();
  }
};

// 获取数据列表
const getDataList = async () => {
  try {
    loading.value = true;
    // TODO: 调用实际的API获取数据
    // const res = await yourApi.getList(queryParams.value);
    // tableData.value = res.data;
    // total.value = res.total;
  } finally {
    loading.value = false;
  }
};

// 分页变化
const handlePaginationChange = (params: any) => {
  currentPage.value = params.currentPage;
  pageSize.value = params.pageSize;
  getDataList();
};

// 递归处理后端返回的数据
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
      if (node.dataType === 1) {
        return true;
      }
      if (node.dataType === 3) {
        return node.children && node.children.length > 0;
      }
      return true;
    });
};

// 加载项目数据
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

// 生命周期
onMounted(() => {
  loadProjectData();
});
</script>

<style lang="scss" scoped>
.project-cost-page {
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
    background: #fff;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 15px;
    box-sizing: border-box;

    .actionBar-buttons {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 10px;
    }

    :deep(.base-table) {
      flex: 1;
      overflow: auto;
    }
  }
}
</style>
