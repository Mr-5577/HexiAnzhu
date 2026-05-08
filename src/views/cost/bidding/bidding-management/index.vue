<!-- 招标管理 -->
<template>
  <div class="bidding-management-page">
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
              <el-icon v-else><House /></el-icon>
              <span>{{ node.label }}</span>
              <span v-if="data.type === 'city'" class="node-count">
                ({{ data.children?.length || 0 }}个项目)
              </span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>

    <div class="right-content" v-if="selectedProject">
      <el-form :model="queryParams" ref="queryRef" :inline="true">
        <!-- <el-form-item label="项目" prop="projIds">
          <project-tree-selector
            v-model="queryParams.projIds"
            :project-list="projectOptions"
            placeholder="请选择项目"
            width="220px"
          ></project-tree-selector>
        </el-form-item> -->
        <el-form-item label="业务板块" prop="sss">
          <el-select
            v-model="queryParams.sss"
            placeholder="请选择业务板块"
            :clearable="false"
            style="width: 200px"
          >
            <el-option label="1" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="合同分类" prop="sss">
          <el-select
            v-model="queryParams.sss"
            placeholder="请选择合同分类"
            :clearable="false"
            style="width: 200px"
          >
            <el-option label="2" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键信息" prop="sss">
          <el-input
            v-model="queryParams.sss"
            placeholder="请输入关键信息"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search"> 搜索 </el-button>
          <el-button icon="Refresh"> 重置 </el-button>
          <el-button type="primary"> 新增事项 </el-button>
        </el-form-item>
      </el-form>
      <base-table
        v-if="refreshTable"
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
        <!-- 自定义插槽 ==> scope 包含：row, column, $index 等 -->
        <template #actions="{ row }">
          <el-button type="primary" link> 审核 </el-button>
          <!-- <el-button type="primary" link> 招标 </el-button> -->
          <!-- <el-button type="primary" link> 退回 </el-button>
          <el-button type="primary" link> 定标 </el-button>
          <el-button type="primary" link> 签约 </el-button> -->
          <el-button type="primary" link> 编辑 </el-button>
          <el-button type="primary" link @click="handleDetail(row)">
            详情
          </el-button>
          <el-button type="danger" link> 删除 </el-button>
        </template>
      </base-table>
    </div>

    <div class="right-content empty" v-else>
      <el-empty description="请从左侧选择项目" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { useSalesData } from "@/composables/use-sales";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "bidding-management" });

// 使用共享的 data hook
const { projectOptions } = useSalesData();

const treeRef = ref(null);
const searchKeyword = ref("");
const treeData = ref([]);
const selectedProject = ref(null);
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
const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.label.includes(value);
};

// 搜索
const handleSearch = () => {
  treeRef.value?.filter(searchKeyword.value);
};

// 点击节点
const handleNodeClick = (data: any) => {
  // 只处理项目节点（小区）
  if (data.type === "village") {
    const village = data;
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

const queryParams = ref({
  projIds: [],
  sss: "",
});
const modalVisible = ref(false);
const refreshTable = ref(true);
const isExpandAll = ref(false);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "orgName", label: "业务板块", width: 100 },
  { prop: "orgName", label: "项目", width: 200 },
  { prop: "orgName", label: "合同分类", width: 100 },
  { prop: "orgName", label: "采购事项", width: 150 },
  { prop: "orgName", label: "采购方式", width: 100 },
  { prop: "orgName", label: "招标方式", width: 100 },
  { prop: "orgName", label: "计划金额", width: 100 },
  { prop: "orgName", label: "清单模式", width: 100 },
  { prop: "orgName", label: "需求时间", width: 150 },
  { prop: "operDate", label: "招采开始日期", width: 160 },
  { prop: "operDate", label: "招采结束日期", width: 160 },
  { prop: "orgName", label: "招采负责人", width: 120 },
  { prop: "orgName", label: "采购状态", width: 100 },
  {
    label: "操作",
    prop: "actions",
    width: 200,
    slot: "actions",
    fixed: "right",
  },
];
const tableData = ref<any[]>([]);
// 获取数据列表
const getDataList = async () => {
  try {
    loading.value = true;
    const res = {
      code: 200,
      message: "success",
      data: [
        {
          isDel: false,
          createId: 1,
          createDate: "2025-12-31 10:52:11",
          operId: 11,
          operDate: "2025-12-31 11:07:41",
          id: 329,
          roleId: 1,
          dataType: 4,
          dataId: 1,
          treeId: "1",
          treePid: "root",
          orgName: "总部",
          sort: "1",
          orgId: 1,
          orgPid: 0,
        },
        {
          isDel: false,
          createId: 1,
          createDate: "2025-12-31 10:52:11",
          operId: 11,
          operDate: "2025-12-31 11:07:41",
          id: 361,
          roleId: 1,
          dataType: 4,
          dataId: 2,
          treeId: "2",
          treePid: "root",
          orgName: "地产",
          sort: "2",
          orgId: 2,
          orgPid: 0,
        },
        {
          isDel: false,
          createId: 1,
          createDate: "2025-12-31 10:52:11",
          operId: 11,
          operDate: "2025-12-31 11:07:41",
          id: 373,
          roleId: 1,
          dataType: 4,
          dataId: 3,
          treeId: "3",
          treePid: "root",
          orgName: "商业",
          sort: "3",
          orgId: 3,
          orgPid: 0,
        },
        {
          isDel: false,
          createId: 1,
          createDate: "2025-12-31 10:52:11",
          operId: 11,
          operDate: "2025-12-31 11:07:41",
          id: 374,
          roleId: 1,
          dataType: 4,
          dataId: 4,
          treeId: "4",
          treePid: "root",
          orgName: "物业",
          sort: "4",
          orgId: 4,
          orgPid: 0,
        },
        {
          isDel: false,
          createId: 1,
          createDate: "2025-12-31 10:52:11",
          operId: 11,
          operDate: "2025-12-31 11:07:41",
          id: 376,
          roleId: 1,
          dataType: 4,
          dataId: 5,
          treeId: "5",
          treePid: "root",
          orgName: "合作伙伴",
          sort: "5",
          orgId: 5,
          orgPid: 0,
        },
      ],
    };
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } finally {
    loading.value = false;
  }
};
// 分页变化
const handlePaginationChange = (params: any) => {
  currentPage.value = params.currentPage;
  pageSize.value = params.pageSize;
};

const handleDetail = (row: any) => {
  // 这里可以根据 row 的数据进行路由跳转或显示详情弹窗
  console.log("查看详情，数据行：", row);
  router.push({
    path: "/cost/bidding-detail",
  });
};
onMounted(() => {
  loadData();
  getDataList();
});
onUnmounted(() => {});
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
    padding: 15px 15px;
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
