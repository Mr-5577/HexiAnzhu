<template>
  <div class="project-area-page">
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

    <!-- 项目详细信息 -->
    <div
      class="right-content"
      v-loading="dataLoading"
      :element-loading-text="'数据加载中...'"
      :element-loading-background="'rgba(255, 255, 255, 0.6)'"
      v-if="selectedProject"
    >
      <div class="project-overview">
        <div class="overview-card">
          <div class="card-left">
            <div class="project-name">{{ selectedProject.label }}</div>
            <div class="company-name">
              {{ selectedProject.companyName || "待填写" }}
            </div>
          </div>
          <div class="card-right">
            <div class="stat-item">
              <div class="stat-value">
                {{ formatNumber(selectedProject.totalArea) }}
              </div>
              <div class="stat-label">总建筑面积(m²)</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">
                {{ formatNumber(selectedProject.saleableArea) }}
              </div>
              <div class="stat-label">总可销售面积(m²)</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">
                {{ formatNumber(selectedProject.totalUnits) }}
              </div>
              <div class="stat-label">总户数(户)</div>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-tab">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="版本管理" name="version" style="height: 100%">
            <version-management
              v-if="activeTab === 'version'"
              :project-id="selectedProject?.id"
            />
          </el-tab-pane>
          <el-tab-pane
            label="楼栋指标管理"
            name="building"
            style="height: 100%"
          >
            <building-metrics
              v-if="activeTab === 'building'"
              :project-id="selectedProject?.id"
            />
          </el-tab-pane>
          <el-tab-pane label="面积详情" name="area" style="height: 100%">
            <area-detail
              v-if="activeTab === 'area'"
              :project-id="selectedProject?.id"
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
import VersionManagement from "./components/version-management/index.vue";
import BuildingMetrics from "./components/building-metrics/index.vue";
import AreaDetail from "./components/area-detail/index.vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api.ts";
import { ProjectTreeNode } from "@/types/cost/master-data/project-area-type.ts";

defineOptions({ name: "project-area" });

interface SelectedProject {
  id: number; // 项目ID
  label: string; // 项目名称
  companyName: string; // 所属公司名称
  companyId: number; // 所属公司ID
  totalArea: number; // 总建筑面积
  saleableArea: number; // 总可销售面积
  totalUnits: number; // 总户数
}

// 数据
const projectTreeRef = ref<InstanceType<typeof ElTree>>();
const searchKeyword = ref("");
const treeData = ref<ProjectTreeNode[]>([]);
const selectedProject = ref<SelectedProject | null>(null);
const activeTab = ref("version");
const currentNodeKey = ref<string | number | null>(null);
const dataLoading = ref(false);

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

    selectedProject.value = {
      id: data.orgId,
      label: data.orgName,
      companyName: data.companyName || "",
      companyId: data.orgPid,
      totalArea: 0,
      saleableArea: 0,
      totalUnits: 0,
    };
    // 获取项目下的版本列表，查询当前生效版本
    getCurrentVersionId(data.orgId);
  }
};
// 查询版本列表
const getCurrentVersionId = async (projId: number) => {
  try {
    const res = await projectAreaApi.getAreaVerMList({
      projId: projId,
    });
    if (res.code === 200) {
      const list = res.data || [];
      // 获取当前生效版本的版本
      const currentVersion = list.find((item) => item.isEnabled);
      if (currentVersion) {
        const verMid = currentVersion.id;
        getDetailByProjectId(verMid); // 获取详情列表
      } else {
        ElMessage.warning("当前项目没有生效的版本");
      }
    }
  } catch (error) {
    return null;
  }
};

// 选中节点后获取当前项目下的详情数据，计算总面积、户数
const getDetailByProjectId = async (verMid: number) => {
  try {
    dataLoading.value = true;
    const res = await projectAreaApi.getAreaVerDList({ verMid: verMid });
    if (res.code === 200 && res.data) {
      const dataList = res.data || [];

      // 累加各项指标
      let totalArea = 0; // 总建筑面积 = 地上 + 地下
      let saleableArea = 0; // 总可售面积 = 地上 + 地下
      let totalUnits = 0; // 总户数

      dataList.forEach((item: any) => {
        // 累加建筑面积（地上 + 地下）
        const agBuildArea = Number(item.agBuildArea) || 0;
        const ugBuildArea = Number(item.ugBuildArea) || 0;
        totalArea += agBuildArea + ugBuildArea;

        // 累加可售面积（地上 + 地下）
        const agSaleArea = Number(item.agSaleArea) || 0;
        const ugSaleArea = Number(item.ugSaleArea) || 0;
        saleableArea += agSaleArea + ugSaleArea;

        // 累加户数
        const houseNum = Number(item.houseNum) || 0;
        totalUnits += houseNum;
      });

      // 更新选中的项目数据
      if (selectedProject.value) {
        selectedProject.value.totalArea = totalArea;
        selectedProject.value.saleableArea = saleableArea;
        selectedProject.value.totalUnits = totalUnits;
      }
    }
  } catch (error) {
    console.error("获取项目详情失败:", error);
  } finally {
    dataLoading.value = false;
  }
};

// 格式化数字
const formatNumber = (num: number) => {
  if (!num) return "0";
  return num.toLocaleString();
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
.project-area-page {
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

    .project-overview {
      padding: 15px;
      box-sizing: border-box;
      .overview-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, #f5f9ff 0%, #e8f2ff 100%);
        border-radius: 12px;
        padding: 24px 32px;
        border: 1px solid #d9ecff;

        .card-left {
          flex-shrink: 0;

          .project-name {
            font-size: 18px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 8px;
          }

          .company-name {
            font-size: 14px;
            color: #606266;
          }
        }

        .card-right {
          display: flex;
          gap: 30px;

          .stat-item {
            text-align: center;
            min-width: 100px;

            .stat-value {
              font-size: 24px;
              font-weight: 600;
              color: #409eff;
              margin-bottom: 6px;
              line-height: 1.2;
            }

            .stat-label {
              font-size: 12px;
              color: #606266;
              white-space: nowrap;
            }
          }
        }
      }
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
