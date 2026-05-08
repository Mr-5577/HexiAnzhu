<!-- 招标管理 -->
<template>
  <div class="bidding-management-page">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="项目" prop="projIds">
        <project-tree-selector
          v-model="queryParams.projIds"
          :project-list="projectOptions"
          placeholder="请选择项目"
          width="220px"
        ></project-tree-selector>
      </el-form-item>
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
        <el-button type="primary" link> 编辑 </el-button>
        <el-button type="primary" link> 提交审核 </el-button>
        <el-button type="primary" link> 详情 </el-button>
        <el-button type="danger" link> 删除 </el-button>
      </template>
    </base-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { useSalesData } from "@/composables/use-sales";

// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "bidding-management" });

// 使用共享的 data hook
const { projectOptions } = useSalesData();

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
    width: 220,
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

onMounted(() => {
  getDataList();
});
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.bidding-management-page {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
