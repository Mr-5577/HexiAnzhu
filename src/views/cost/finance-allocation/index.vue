<!-- 招标需求 -->
<template>
  <div class="finance-allocation-page">
    <base-table
      :columns="mainColumns"
      :tableData="tableData"
      :rowKey="'id'"
      :pagination="false"
      :show-toolbar="false"
      :auto-height="false"
      :height="'100%'"
    >
      <!-- 展开行：显示明细子表格 -->
      <template #expand="{ row }">
        <div class="expand-table-wrapper">
          <!-- <div class="expand-title">明细</div> -->
          <editable-table
            ref="dedTableRef"
            :row-key="'uuid'"
            :height="'150px'"
            v-model="detailTable"
            :columns="detailColumns"
            :pagination="false"
            :highlight-current-row="false"
            :show-summary="true"
            :compactEmpty="true"
            :editable="true"
            :on-save="handleSave"
          >
            <template #actions="{ row }">
              <el-button type="primary" link> 编辑 </el-button>
              <el-button type="danger" link> 删除 </el-button>
              <el-button type="primary" link> 详情 </el-button>
            </template>
          </editable-table>
        </div>
      </template>
    </base-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { biddingManageApi } from "@/api/cost/bidding/bidding-management-api";
import { largeScreenApi } from "@/api/sales/large-screen-api";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { BidTenderPlanBill } from "@/types/cost/bidding/bidding-management-type";

defineOptions({ name: "finance-allocation" });

const router = useRouter();

// 项目列表
const projectOptions = ref([]);

// 主表列配置
const mainColumns: TableColumnItem[] = [
  { type: "expand", width: "50", slot: "expand" },
  { type: "index", label: "序号", width: 60 },
  { prop: "tenderNo", label: "招标编号", width: 220 },
  { prop: "tenderName", label: "招标名称", minWidth: 150 },
  { prop: "projNames", label: "项目", minWidth: 200 },
  { prop: "companyNames", label: "公司", width: 120 },
  { prop: "bidStartDate", label: "投标开始", width: 110, align: "center" },
  { prop: "bidEndDate", label: "投标结束", width: 110, align: "center" },
  { prop: "dutyMan", label: "负责人", width: 100, align: "center" },
  {
    label: "操作",
    width: 150,
    slot: "actions",
    fixed: "right",
  },
];

// 子表格列配置
const detailTable = ref([]);
const detailColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "项目", minWidth: 200 },
  { prop: "tenderItemName", label: "招标明细", minWidth: 200 },
  { prop: "bldNames", label: "楼栋", width: 200 },
  {
    prop: "bidBondAmount",
    label: "投标保证金",
    width: 200,
    align: "center",
  },
  {
    prop: "perfBondAmount",
    label: "履约保证金",
    width: 200,
    align: "center",
  },
];

const updateDedRow = (rowIndex: number, data: any) => {
  const newData = [...detailTable.value];
  newData[rowIndex] = { ...detailTable.value[rowIndex], ...data };
  detailTable.value = newData;
};

const handleSave = async ({ row, column, newValue, oldValue, rowIndex }) => {
  if (column === "dedTypeId") {
    updateDedRow(rowIndex, { dedTypeId: newValue, dedAmt: 0 });
    return;
  }
  updateDedRow(rowIndex, { [column]: newValue });
};
const tableData = ref([{id:12}]);
const tableLoading = ref(false);

// 获取项目列表
const getProjectOptions = async () => {
  try {
    const res = await largeScreenApi.getProjList();
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};
onMounted(() => {});
</script>

<style scoped lang="scss">
.finance-allocation-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;

  .expand-table-wrapper {
    height: 150px;
    .expand-title {
      font-size: 14px;
      font-weight: 500;
      color: #409eff;
      margin-bottom: 12px;
      padding-left: 8px;
      border-left: 3px solid #409eff;
    }
  }
}
</style>
