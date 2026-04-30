<template>
  <div class="project-area-page">
    <!-- 城市项目 -->
    <div class="left-content">
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索城市或项目"
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
          ref="treeRef"
          :data="treeData"
          :props="treeProps"
          :filter-node-method="filterNode"
          :current-node-key="currentNodeKey"
          node-key="id"
          :highlight-current="false"
          :default-expand-all="false"
          accordion
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span
              class="tree-node"
              :class="{
                'project-active':
                  currentNodeKey === data.id && data.type === 'village',
              }"
            >
              <el-icon v-if="data.type === 'city'"><OfficeBuilding /></el-icon>
              <el-icon v-else><HomeFilled /></el-icon>
              <span>{{ node.label }}</span>
              <span v-if="data.type === 'city'" class="node-count">
                ({{ data.children?.length || 0 }}个项目)
              </span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>

    <!-- 项目详细信息 -->
    <div class="right-content" v-if="selectedProject">
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
            <version-management />
          </el-tab-pane>
          <el-tab-pane
            label="楼栋指标管理"
            name="building"
            style="height: 100%"
          >
            <building-metrics />
          </el-tab-pane>
          <el-tab-pane label="面积详情" name="area" style="height: 100%">
            <area-detail />
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
import type { ElTree } from "element-plus";
import VersionManagement from "./version-management.vue";
import BuildingMetrics from "./building-metrics.vue";
import AreaDetail from "./area-detail.vue";

defineOptions({ name: "project-area" });

// 类型定义
interface CityNode {
  id: number;
  label: string;
  type: string;
  disabled: boolean;
  isLeaf: boolean;
  children?: VillageNode[];
}

interface VillageNode {
  id: number;
  label: string;
  city_id: number;
  type: string;
  area: number;
  isLeaf: boolean;
  disabled: boolean;
}

interface SelectedProject {
  id: number;
  label: string;
  cityName: string;
  area: number;
  companyName: string;
  totalArea: number;
  saleableArea: number;
  totalUnits: number;
}

// 数据
const treeRef = ref<InstanceType<typeof ElTree>>();
const searchKeyword = ref("");
const treeData = ref<CityNode[]>([]);
const selectedProject = ref<SelectedProject | null>(null);
const activeTab = ref("version");
const currentNodeKey = ref<string | number | null>(null);

// 树配置
const treeProps = {
  children: "children",
  label: "label",
  disabled: "disabled",
  isLeaf: "isLeaf",
};

// 过滤节点
const filterNode = (value: string, data: CityNode | VillageNode) => {
  if (!value) return true;
  return data.label.includes(value);
};

// 搜索
const handleSearch = () => {
  treeRef.value?.filter(searchKeyword.value);
};

// 点击节点
const handleNodeClick = (data: CityNode | VillageNode) => {
  // 只处理项目节点（小区）
  if (data.type === "village") {
    const village = data as VillageNode;
    // 设置当前高亮的节点key
    currentNodeKey.value = village.id;
    // 查找所属城市名称
    const city = treeData.value.find((c) => c.id === village.city_id);
    selectedProject.value = {
      id: village.id,
      label: village.label,
      cityName: city?.label || "",
      area: village.area,
      // 模拟数据，实际从接口获取
      companyName: `${city?.label}公司`,
      totalArea: village.area * 10000,
      saleableArea: village.area * 8500,
      totalUnits: Math.floor(village.area * 80),
    };
  } else {
    // 点击城市节点时，清除高亮
    // currentNodeKey.value = null;
  }
};

// 格式化数字
const formatNumber = (num: number) => {
  if (!num) return "0";
  return num.toLocaleString();
};

// 加载数据
const loadData = () => {
  // 模拟接口返回的数据结构
  treeData.value = [
    {
      id: 16,
      label: "成都",
      type: "city",
      disabled: true,
      isLeaf: false,
      children: [
        {
          id: 59,
          label: "测试小区",
          city_id: 16,
          type: "village",
          area: 425,
          isLeaf: true,
          disabled: false,
        },
        {
          id: 68,
          label: "和喜·翡翠观澜(弃)",
          city_id: 16,
          type: "village",
          area: 428,
          isLeaf: true,
          disabled: false,
        },
        {
          id: 999,
          label: "新系统测试小区",
          city_id: 16,
          type: "village",
          area: 5,
          isLeaf: true,
          disabled: false,
        },
        {
          id: 1001,
          label: "测试小区2",
          city_id: 16,
          type: "village",
          area: 5,
          isLeaf: true,
          disabled: false,
        },
      ],
    },
    {
      id: 17,
      label: "武胜",
      type: "city",
      disabled: true,
      isLeaf: false,
      children: [
        {
          id: 66,
          label: "和喜·御荣府",
          city_id: 17,
          type: "village",
          area: 1001,
          isLeaf: true,
          disabled: false,
        },
        {
          id: 67,
          label: "和喜·公园学府",
          city_id: 17,
          type: "village",
          area: 1001,
          isLeaf: true,
          disabled: false,
        },
        {
          id: 1009,
          label: "和喜·翰林学府",
          city_id: 17,
          type: "village",
          area: 1001,
          isLeaf: true,
          disabled: false,
        },
      ],
    },
    {
      id: 18,
      label: "沅陵",
      type: "city",
      disabled: true,
      isLeaf: false,
      children: [
        {
          id: 1002,
          label: "和喜·翡翠观澜",
          city_id: 18,
          type: "village",
          area: 1002,
          isLeaf: true,
          disabled: false,
        },
        {
          id: 1011,
          label: "和喜·江山墅",
          city_id: 18,
          type: "village",
          area: 1002,
          isLeaf: true,
          disabled: false,
        },
      ],
    },
    {
      id: 19,
      label: "内江",
      type: "city",
      disabled: true,
      isLeaf: false,
      children: [
        {
          id: 62,
          label: "和喜·御景台",
          city_id: 19,
          type: "village",
          area: 1002,
          isLeaf: true,
          disabled: false,
        },
        {
          id: 65,
          label: "和喜·御珑台",
          city_id: 19,
          type: "village",
          area: 1002,
          isLeaf: true,
          disabled: false,
        },
        {
          id: 1003,
          label: "胜利·光耀城",
          city_id: 19,
          type: "village",
          area: 1002,
          isLeaf: true,
          disabled: false,
        },
        {
          id: 1012,
          label: "和喜·紫宸大院",
          city_id: 19,
          type: "village",
          area: 1002,
          isLeaf: true,
          disabled: false,
        },
        {
          id: 1014,
          label: "和喜·十里江湾",
          city_id: 19,
          type: "village",
          area: 1002,
          isLeaf: true,
          disabled: false,
        },
        {
          id: 1016,
          label: "和喜·奥特莱斯广场",
          city_id: 19,
          type: "village",
          area: 1002,
          isLeaf: true,
          disabled: false,
        },
        {
          id: 1018,
          label: "奥莱·华悦",
          city_id: 19,
          type: "village",
          area: 1002,
          isLeaf: true,
          disabled: false,
        },
      ],
    },
  ];
};

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.project-area-page {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 10px;
  padding: 16px;
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
        background-color: #409eff;
        border-color: #409eff;
        .el-icon {
          width: 50px;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
          cursor: pointer;
          border-color: #409eff;
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
          //   overflow-y: auto;
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
