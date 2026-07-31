<!-- 发票核验 列表 -->
<template>
  <div class="invoice-verification-wrapper">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      label-width="80px"
    >
      <el-form-item label="业务板块" prop="segId">
        <el-select
          v-model="queryParams.segId"
          placeholder="请选择业务板块"
          style="width: 180px"
          clearable
        >
          <el-option
            v-for="item in segOptions"
            :key="item.id"
            :label="item.segName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="请款单号" prop="payCode">
        <el-input
          v-model="queryParams.payCode"
          placeholder="请输入请款单号"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item label="发票号" prop="invoiceCode">
        <el-input
          v-model="queryParams.invoiceCode"
          placeholder="请输入发票号"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item label="发票类型" prop="invoiceType">
        <el-select
          v-model="queryParams.invoiceType"
          placeholder="请选择发票类型"
          style="width: 180px"
          clearable
        >
          <el-option
            v-for="item in invoiceTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="请款人" prop="applicant">
        <el-input
          v-model="queryParams.applicant"
          placeholder="请输入请款人"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item label="合同名称" prop="conName">
        <el-input
          v-model="queryParams.conName"
          placeholder="请输入合同名称"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item label="查验状态" prop="verifyStatus">
        <el-select
          v-model="queryParams.verifyStatus"
          placeholder="请选择查验状态"
          style="width: 180px"
          clearable
        >
          <el-option
            v-for="item in verifyStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <base-table
      :columns="columns"
      :tableData="tableData"
      :loading="tableLoading"
      :rowKey="'id'"
      :pagination="false"
    >
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleDetail(row)">
          核查详情
        </el-button>
        <el-button type="success" link @click="handleManualPass(row)">
          人工通过
        </el-button>
        <el-button type="danger" link @click="handleManualReject(row)">
          人工驳回
        </el-button>
        <el-button type="primary" link @click="handleInvoiceDetail(row)">
          发票明细
        </el-button>
      </template>
    </base-table>
    <!-- 发票明细 -->
    <InvoiceDetailDialog v-model="dialogVisible" />
    <!-- 核查详情 -->
    <InspectionDetailDialog v-model="inspectionDialog" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { largeScreenApi } from "@/api/sales/large-screen-api";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import InvoiceDetailDialog from "@/components/business/invoice-detail-dialog.vue";
import InspectionDetailDialog from "./inspection-detail-dialog.vue";
import { invoiceManageApi } from "@/api/cost/payment-manage/invoice-manage-api.ts";

defineOptions({ name: "invoice-verification" });

// 状态映射
const statusMap = {
  0: "待查验",
  1: "合格发票",
  2: "待人工审核",
  3: "人工通过",
  4: "人工拒绝",
};

// 查询参数
const queryParams = ref({
  segId: undefined,
  payCode: undefined,
  invoiceCode: undefined,
  invoiceType: undefined,
  applicant: undefined,
  conName: undefined,
  verifyStatus: undefined,
});

const projectOptions = ref([]); // 项目列表
const segOptions = ref([]); // 业务板块列表
const tableLoading = ref(false);
const tableData = ref([]);
const dialogVisible = ref(false);
const inspectionDialog = ref(false);

// 下拉选项
const invoiceTypeOptions = ref([
  { value: "vat_special", label: "增值税专用发票" },
  { value: "vat_common", label: "增值税普通发票" },
  { value: "electronic", label: "电子发票" },
  { value: "other", label: "其他" },
]);

const verifyStatusOptions = ref([
  { value: "pending", label: "待查验" },
  { value: "passed", label: "合格票据" },
  { value: "failed", label: "问题票据" },
  { value: "manual_pass", label: "人工通过" },
  { value: "manual_reject", label: "人工驳回" },
]);

// 表格列配置
const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "invNo", label: "发票号", width: 140 },
  { prop: "invType", label: "发票类型", width: 120 },
  { prop: "bizNo", label: "请款单号", width: 150 },
  { prop: "invAmt", label: "发票金额", width: 120 },
  { prop: "reqAmt", label: "请款金额", width: 120 },
  { prop: "conName", label: "合同名称", width: 200 },
  { prop: "supName", label: "供应商名称", width: 150 },
  { prop: "compName", label: "甲方公司", width: 200 },
  { prop: "reqDate", label: "请款日期", width: 120 },
  {
    prop: "status",
    label: "查验状态",
    width: 120,
    formatter: (row: any) => {
      const status = row.status;
      return statusMap[status as keyof typeof statusMap] || status;
    },
  },
  { prop: "validateMsg", label: "结果描述", width: 200 },
  { label: "操作", width: 340, slot: "actions", fixed: "right" },
];

// 获取列表数据
const getDataList = async () => {
  try {
    tableLoading.value = true;
    tableData.value = [];

    const params = { ...queryParams.value };
    const res = await invoiceManageApi.getInvoiceDetail({});
    if (res.code === 200) {
      tableData.value = res.data || [];
    }

    // 模拟数据
    // await new Promise((resolve) => setTimeout(resolve, 500));
    // tableData.value = [
    //   {
    //     id: 1,
    //     invoiceCode: "INV-2024-001",
    //     invoiceTypeName: "增值税专用发票",
    //     payCode: "PAY-2024-001",
    //     invoiceAmount: 10000.0,
    //     payAmount: 10000.0,
    //     conName: "2024年度信息化建设项目合同",
    //     supplierName: "XX科技有限公司",
    //     partyACompany: "XX集团股份有限公司",
    //     applyDate: "2026-01-15",
    //     verifyStatusName: "查验通过",
    //     resultDesc: "发票信息核对一致，查验通过",
    //   },
    //   {
    //     id: 2,
    //     invoiceCode: "INV-2024-002",
    //     invoiceTypeName: "增值税普通发票",
    //     payCode: "PAY-2024-002",
    //     invoiceAmount: 5000.0,
    //     payAmount: 5000.0,
    //     conName: "2024年度咨询服务合同",
    //     supplierName: "XX咨询有限公司",
    //     partyACompany: "XX集团股份有限公司",
    //     applyDate: "2026-01-16",
    //     verifyStatusName: "待查验",
    //     resultDesc: "",
    //   },
    //   {
    //     id: 3,
    //     invoiceCode: "INV-2024-003",
    //     invoiceTypeName: "电子发票",
    //     payCode: "PAY-2024-003",
    //     invoiceAmount: 2000.0,
    //     payAmount: 2000.0,
    //     conName: "2024年度办公设备采购合同",
    //     supplierName: "XX办公用品有限公司",
    //     partyACompany: "XX集团股份有限公司",
    //     applyDate: "2026-01-17",
    //     verifyStatusName: "查验失败",
    //     resultDesc: "发票号码与税务系统记录不一致，请核实",
    //   },
    // ];
  } catch (error) {
    console.error("获取发票核验列表失败:", error);
    ElMessage.error("获取列表数据失败");
  } finally {
    tableLoading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  getDataList();
};

// 重置
const handleReset = () => {
  // 重置所有查询字段
  Object.keys(queryParams).forEach((key) => {
    queryParams[key] = undefined;
  });
  getDataList();
};

// 核查详情
const handleDetail = (row: any) => {
  console.log("查看核查详情:", row);
  inspectionDialog.value = true;
};

// 人工通过
const handleManualPass = (row: any) => {
  ElMessageBox.confirm(
    `确认对发票 ${row.invoiceCode} 进行人工通过操作吗？`,
    "人工通过确认",
    {
      confirmButtonText: "确认通过",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(async () => {
      try {
        // TODO: 调用人工通过接口
        // await invoiceApi.manualPass({ id: row.id });
        ElMessage.success(`发票 ${row.invoiceCode} 已人工通过`);
        getDataList(); // 刷新列表
      } catch (error) {
        console.error("人工通过失败:", error);
        ElMessage.error("操作失败，请重试");
      }
    })
    .catch(() => {
      // 取消操作
    });
};

// 人工驳回
const handleManualReject = (row: any) => {
  ElMessageBox.prompt(`请输入驳回原因`, `人工驳回 - ${row.invoiceCode}`, {
    confirmButtonText: "确认驳回",
    cancelButtonText: "取消",
    inputType: "textarea",
    inputValidator: (value) => {
      if (!value || value.trim() === "") {
        return "请输入驳回原因";
      }
      return true;
    },
  })
    .then(async ({ value }) => {
      try {
        // TODO: 调用人工驳回接口
        // await invoiceApi.manualReject({ id: row.id, rejectReason: value });
        ElMessage.success(`发票 ${row.invoiceCode} 已驳回`);
        getDataList(); // 刷新列表
      } catch (error) {
        console.error("人工驳回失败:", error);
        ElMessage.error("操作失败，请重试");
      }
    })
    .catch(() => {
      // 取消操作
    });
};

// 发票明细
const handleInvoiceDetail = (row: any) => {
  console.log("查看发票明细:", row);
  dialogVisible.value = true;
};

// 获取项目列表
const getProjectOptions = async () => {
  try {
    const res = await projectAreaApi.getMguProjList();
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};

// 获取业务板块列表
const getSegOptions = async () => {
  try {
    const res = await dictionaryApi.getsegmentList();
    if (res.code === 200) {
      segOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取业务板块列表失败:", error);
  }
};

// 初始化
onMounted(async () => {
  await Promise.all([getProjectOptions(), getSegOptions()]);
  getDataList();
});
</script>

<style lang="scss" scoped>
.invoice-verification-wrapper {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #fff;
  padding: 16px;

  :deep(.el-form) {
    .el-form-item {
      margin-bottom: 16px;
    }
  }

  :deep(.base-table) {
    flex: 1;
    min-height: 0;
  }
}
</style>
