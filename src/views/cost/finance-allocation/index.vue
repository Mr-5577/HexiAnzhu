<!-- 招标需求 -->
<template>
  <div class="finance-allocation-page">
    <!-- 支付明细 -->
    <el-card class="base-card" shadow="never">
      <div class="header-top">
        <h2>财务分摊</h2>
      </div>
      <div class="card-header">
        <span>
          <el-icon><List /></el-icon>
          支付明细
        </span>
        <div>
          <el-button plain type="primary" @click="handleAddPay">
            新增
          </el-button>
          <el-button type="primary" @click="handleSubmit"> 确认支付 </el-button>
        </div>
      </div>

      <base-table
        :columns="mainColumns"
        :tableData="tableData"
        :rowKey="'id'"
        :pagination="false"
        :show-toolbar="false"
        :auto-height="false"
        :height="'100%'"
        :border="true"
        :stripe="true"
      >
        <!-- 展开行：显示明细子表格 -->
        <template #expand="{ row }">
          <div class="expand-table-wrapper">
            <div class="expand-title">支付明细</div>
            <editable-table
              ref="dedTableRef"
              :row-key="'uuid'"
              :height="'180px'"
              v-model="detailTable"
              :columns="detailColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
              :editable="true"
              :on-save="handleSave"
            >
              <template #actions="{ row }">
                <el-button type="primary" link> 拆分 </el-button>
                <el-button type="danger" link> 删除 </el-button>
              </template>
            </editable-table>
          </div>
        </template>
      </base-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { List } from "@element-plus/icons-vue";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { largeScreenApi } from "@/api/sales/large-screen-api";
import { useRouter } from "vue-router";

defineOptions({ name: "finance-allocation" });

const router = useRouter();

// 项目列表
const projectOptions = ref([]);

// 主表列配置
const tableData = ref([
  {
    id: 12,
    tenderNo: "T2024-001",
    tenderName: "银行转账",
    projNames: "中国银行",
    companyNames: "XX科技有限公司",
    bidStartDate: "6222 0200 **** 1234",
    bidEndDate: "100,000.00",
    dutyMan: "2026-08-15",
  },
  {
    id: 1,
    tenderNo: "T2024-002",
    tenderName: "支票支付",
    projNames: "建设银行",
    companyNames: "YY工程有限公司",
    bidStartDate: "6222 0300 **** 5678",
    bidEndDate: "50,000.00",
    dutyMan: "2026-08-20",
  },
]);
const tableLoading = ref(false);
const mainColumns: TableColumnItem[] = [
  { type: "expand", width: "50", slot: "expand" },
  { type: "index", label: "序号", width: 60 },
  { prop: "tenderNo", label: "报销事项", minWidth: 120 },
  { prop: "tenderName", label: "支付方式", minWidth: 100 },
  { prop: "projNames", label: "收款方开户行", minWidth: 130 },
  { prop: "companyNames", label: "收款方开户名", minWidth: 130 },
  { prop: "bidStartDate", label: "收款方账号", minWidth: 150 },
  { prop: "bidEndDate", label: "支付金额", minWidth: 100 },
  { prop: "dutyMan", label: "计划支付日期", minWidth: 120 },
];

// 子表格列配置
const detailTable = ref([
  {
    uuid: 1,
    projName: "项目A成本分摊",
    tenderItemName: "财务部",
    bldNames: "管理费用",
    bidBondAmount: 50000,
  },
  {
    uuid: 2,
    projName: "项目B材料采购",
    tenderItemName: "采购部",
    bldNames: "材料成本",
    bidBondAmount: 30000,
  },
]);
const detailColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "摘要", minWidth: 120 },
  { prop: "tenderItemName", label: "所属组织", minWidth: 100 },
  { prop: "bldNames", label: "科目名称", minWidth: 100 },
  { prop: "bidBondAmount", label: "金额", minWidth: 100 },
  {
    label: "操作",
    width: 180,
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

const handleAddPay = () => {
  ElMessage.info("新增");
};

const handleSubmit = () => {
  ElMessage.success("支付确认提交成功！");
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
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px;
  background: #f3f4f6;
  font-size: 14px;
  // 关键：设置高度为视口高度，让整个页面撑满
  height: 100vh;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column; // 改为纵向 flex

  .base-card {
    flex: 1;
    // 移除 margin-bottom，让卡片完全撑满
    margin-bottom: 0;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    // 覆盖 el-card 的 body 样式
    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 20px;
    }
  }

  .header-top {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    flex-shrink: 0; // 防止被压缩

    h2 {
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 15px;
    margin-bottom: 15px;
    flex-shrink: 0; // 防止被压缩

    .el-icon {
      color: #2563eb;
      margin-right: 6px;
    }
  }

  // 新增：表格容器，占满剩余空间
  .table-wrapper {
    flex: 1;
    overflow: hidden;
    min-height: 0; // 防止 flex 溢出

    // 确保 base-table 撑满
    :deep(.base-table) {
      height: 100% !important;
      
      // 如果 base-table 内部有 .el-table 也需要撑满
      .el-table {
        height: 100% !important;
      }
    }
  }

  .expand-table-wrapper {
    padding: 8px 0;
    
    .expand-title {
      font-size: 13px;
      font-weight: 500;
      color: #409eff;
      margin-bottom: 6px;
      padding-left: 8px;
      border-left: 3px solid #409eff;
    }
  }
}
</style>
