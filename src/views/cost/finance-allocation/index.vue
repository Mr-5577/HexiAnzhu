<!-- 招标需求 -->
<template>
  <div class="finance-allocation-page">
    <div class="header-top">
      <h2>财务分摊</h2>
    </div>
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
import { largeScreenApi } from "@/api/sales/large-screen-api";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

defineOptions({ name: "finance-allocation" });

const router = useRouter();

// 项目列表
const projectOptions = ref([]);

// 主表列配置
const tableData = ref([{ id: 12 }, { id: 1 }]);
const tableLoading = ref(false);
const mainColumns: TableColumnItem[] = [
  { type: "expand", width: "50", slot: "expand" },
  { type: "index", label: "序号", width: 60 },
  { prop: "tenderNo", label: "报销事项" },
  { prop: "tenderName", label: "支付方式" },
  { prop: "projNames", label: "收款方开户行" },
  { prop: "companyNames", label: "收款方开户名" },
  { prop: "bidStartDate", label: "收款方账号" },
  { prop: "bidEndDate", label: "支付金额" },
  { prop: "dutyMan", label: "计划支付日期" },
];

// 子表格列配置
const detailTable = ref([]);
const detailColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "摘要" },
  { prop: "tenderItemName", label: "所属组织" },
  { prop: "bldNames", label: "科目名称" },
  { prop: "bidBondAmount", label: "金额" },
  {
    label: "操作",
    width: 150,
    slot: "actions",
    fixed: "right",
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
  .header-top {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }
  .header-top h2 {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
  }
}
</style>
