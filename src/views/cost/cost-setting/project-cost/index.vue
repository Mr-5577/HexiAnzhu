<!-- 项目成本业态 -->
<template>
  <div class="project-cost-page">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="项目" prop="projIds">
        <project-tree-selector
          v-model="queryParams.projIds"
          :project-list="projectOptions"
          placeholder="请选择项目"
          width="220px"
        ></project-tree-selector>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search"> 搜索 </el-button>
        <el-button icon="Refresh"> 重置 </el-button>
      </el-form-item>
    </el-form>
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
      <!-- 列表外操作栏 -->
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

    <product-selection-dialog v-model="modalVisible"></product-selection-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { useSalesData } from "@/composables/use-sales";
import ProductSelectionDialog from "./product-selection-dialog.vue";

// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "project-cost" });

// 使用共享的 data hook
const { projectOptions } = useSalesData();

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
  {
    prop: "orgName",
    label: "项目",
    align: "left",
  },
  {
    prop: "orgName1",
    label: "产品类别",
  },
  {
    prop: "orgName1",
    label: "产品名称",
  },
  {
    prop: "orgName1",
    label: "说明",
  },
  {
    label: "操作",
    prop: "actions",
    width: 180,
    slot: "actions",
    // fixed: "right",
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
          id: 328,
          roleId: 1,
          dataType: 4,
          dataId: 0,
          treeId: "root",
          treePid: "",
          orgName: "和喜集团",
          sort: "0",
          orgId: 0,
          orgPid: -1,
          children: [
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
              children: [
                {
                  isDel: false,
                  createId: 1,
                  createDate: "2025-12-31 10:52:11",
                  operId: 11,
                  operDate: "2025-12-31 11:07:41",
                  id: 330,
                  roleId: 1,
                  dataType: 3,
                  dataId: 1,
                  isPower: true,
                  isAutoRefresh: true,
                  treeId: "1-1",
                  treePid: "1",
                  orgName: "集团公司",
                  sort: "1",
                  orgId: 1,
                  orgPid: 0,
                  children: [
                    {
                      isDel: false,
                      createId: 1,
                      createDate: "2025-12-31 10:52:11",
                      operId: 11,
                      operDate: "2025-12-31 11:07:41",
                      id: 331,
                      roleId: 1,
                      dataType: 1,
                      dataId: 1,
                      isPower: true,
                      treeId: "1-1-1",
                      treePid: "1-1",
                      orgName: "和喜·翡翠半岛",
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
                      id: 340,
                      roleId: 1,
                      dataType: 1,
                      dataId: 10,
                      isPower: true,
                      treeId: "1-1-10",
                      treePid: "1-1",
                      orgName: "和喜·龙城壹号院",
                      sort: "10",
                      orgId: 10,
                      orgPid: 0,
                    },
                    {
                      isDel: false,
                      createId: 1,
                      createDate: "2025-12-31 10:52:11",
                      operId: 11,
                      operDate: "2025-12-31 11:07:41",
                      id: 341,
                      roleId: 1,
                      dataType: 1,
                      dataId: 11,
                      isPower: true,
                      treeId: "1-1-11",
                      treePid: "1-1",
                      orgName: "米易·天空之城",
                      sort: "11",
                      orgId: 11,
                      orgPid: 0,
                    },
                  ],
                },
              ],
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
              children: [
                {
                  isDel: false,
                  createId: 1,
                  createDate: "2025-12-31 10:52:11",
                  operId: 11,
                  operDate: "2025-12-31 11:07:41",
                  id: 370,
                  roleId: 1,
                  dataType: 3,
                  dataId: 10,
                  treeId: "2-10",
                  treePid: "2",
                  orgName: "遂宁公司",
                  sort: "10",
                  orgId: 10,
                  orgPid: 0,
                },
                {
                  isDel: false,
                  createId: 1,
                  createDate: "2025-12-31 10:52:11",
                  operId: 11,
                  operDate: "2025-12-31 11:07:41",
                  id: 371,
                  roleId: 1,
                  dataType: 3,
                  dataId: 11,
                  treeId: "2-11",
                  treePid: "2",
                  orgName: "什邡公司",
                  sort: "11",
                  orgId: 11,
                  orgPid: 0,
                },
                {
                  isDel: false,
                  createId: 1,
                  createDate: "2025-12-31 10:52:11",
                  operId: 11,
                  operDate: "2025-12-31 11:07:41",
                  id: 372,
                  roleId: 1,
                  dataType: 3,
                  dataId: 12,
                  treeId: "2-12",
                  treePid: "2",
                  orgName: "潼南公司",
                  sort: "12",
                  orgId: 12,
                  orgPid: 0,
                },
                {
                  isDel: false,
                  createId: 1,
                  createDate: "2025-12-31 10:52:11",
                  operId: 11,
                  operDate: "2025-12-31 11:07:41",
                  id: 362,
                  roleId: 1,
                  dataType: 3,
                  dataId: 2,
                  treeId: "2-2",
                  treePid: "2",
                  orgName: "内江公司",
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
                  id: 363,
                  roleId: 1,
                  dataType: 3,
                  dataId: 3,
                  treeId: "2-3",
                  treePid: "2",
                  orgName: "沅陵公司",
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
                  id: 364,
                  roleId: 1,
                  dataType: 3,
                  dataId: 4,
                  treeId: "2-4",
                  treePid: "2",
                  orgName: "武胜公司",
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
                  id: 365,
                  roleId: 1,
                  dataType: 3,
                  dataId: 5,
                  treeId: "2-5",
                  treePid: "2",
                  orgName: "邻水公司",
                  sort: "5",
                  orgId: 5,
                  orgPid: 0,
                },
                {
                  isDel: false,
                  createId: 1,
                  createDate: "2025-12-31 10:52:11",
                  operId: 11,
                  operDate: "2025-12-31 11:07:41",
                  id: 366,
                  roleId: 1,
                  dataType: 3,
                  dataId: 6,
                  treeId: "2-6",
                  treePid: "2",
                  orgName: "资中公司",
                  sort: "6",
                  orgId: 6,
                  orgPid: 0,
                },
                {
                  isDel: false,
                  createId: 1,
                  createDate: "2025-12-31 10:52:11",
                  operId: 11,
                  operDate: "2025-12-31 11:07:41",
                  id: 367,
                  roleId: 1,
                  dataType: 3,
                  dataId: 7,
                  treeId: "2-7",
                  treePid: "2",
                  orgName: "米易公司",
                  sort: "7",
                  orgId: 7,
                  orgPid: 0,
                },
                {
                  isDel: false,
                  createId: 1,
                  createDate: "2025-12-31 10:52:11",
                  operId: 11,
                  operDate: "2025-12-31 11:07:41",
                  id: 368,
                  roleId: 1,
                  dataType: 3,
                  dataId: 8,
                  treeId: "2-8",
                  treePid: "2",
                  orgName: "泸县公司",
                  sort: "8",
                  orgId: 8,
                  orgPid: 0,
                },
                {
                  isDel: false,
                  createId: 1,
                  createDate: "2025-12-31 10:52:11",
                  operId: 11,
                  operDate: "2025-12-31 11:07:41",
                  id: 369,
                  roleId: 1,
                  dataType: 3,
                  dataId: 9,
                  treeId: "2-9",
                  treePid: "2",
                  orgName: "乐山公司",
                  sort: "9",
                  orgId: 9,
                  orgPid: 0,
                },
              ],
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
              children: [
                {
                  isDel: false,
                  createId: 1,
                  createDate: "2025-12-31 10:52:11",
                  operId: 11,
                  operDate: "2025-12-31 11:07:41",
                  id: 375,
                  roleId: 1,
                  dataType: 3,
                  dataId: 13,
                  treeId: "4-13",
                  treePid: "4",
                  orgName: "物业公司",
                  sort: "13",
                  orgId: 13,
                  orgPid: 0,
                },
              ],
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
              children: [
                {
                  isDel: false,
                  createId: 1,
                  createDate: "2025-12-31 10:52:11",
                  operId: 11,
                  operDate: "2025-12-31 11:07:41",
                  id: 377,
                  roleId: 1,
                  dataType: 4,
                  dataId: 6,
                  treeId: "6",
                  treePid: "5",
                  orgName: "咨询",
                  sort: "6",
                  orgId: 6,
                  orgPid: 5,
                  children: [
                    {
                      isDel: false,
                      createId: 1,
                      createDate: "2025-12-31 10:52:11",
                      operId: 11,
                      operDate: "2025-12-31 11:07:41",
                      id: 378,
                      roleId: 1,
                      dataType: 3,
                      dataId: 14,
                      treeId: "6-14",
                      treePid: "6",
                      orgName: "睿众咨询",
                      sort: "14",
                      orgId: 14,
                      orgPid: 0,
                    },
                  ],
                },
                {
                  isDel: false,
                  createId: 1,
                  createDate: "2025-12-31 10:52:11",
                  operId: 11,
                  operDate: "2025-12-31 11:07:41",
                  id: 379,
                  roleId: 1,
                  dataType: 4,
                  dataId: 7,
                  treeId: "7",
                  treePid: "5",
                  orgName: "建筑",
                  sort: "7",
                  orgId: 7,
                  orgPid: 5,
                  children: [
                    {
                      isDel: false,
                      createId: 1,
                      createDate: "2025-12-31 10:52:11",
                      operId: 11,
                      operDate: "2025-12-31 11:07:41",
                      id: 380,
                      roleId: 1,
                      dataType: 3,
                      dataId: 15,
                      treeId: "7-15",
                      treePid: "7",
                      orgName: "锦熙隆建筑",
                      sort: "15",
                      orgId: 15,
                      orgPid: 0,
                    },
                  ],
                },
              ],
            },
          ],
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

// 生命周期
onMounted(() => {
  getDataList();
});
// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.project-cost-page {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
  .actionBar-buttons {
    height: 24px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>
