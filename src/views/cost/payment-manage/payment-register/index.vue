<!-- 实付登记 列表 -->
<template>
  <div class="payment-register-wrapper">
    <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="105px">
      <el-form-item label="标题" prop="wfTitle">
        <el-input v-model="queryParams.wfTitle" placeholder="请输入标题" clearable style="width: 220px" />
      </el-form-item>
      <el-form-item label="项目" prop="projId">
        <el-cascader v-model="queryParams.projId" :options="projectOptions" :show-all-levels="false" :props="{
          expandTrigger: 'hover',
          emitPath: false,
          checkStrictly: false,
          value: 'orgId',
          label: 'orgName',
          children: 'children',
        }" placeholder="请选择项目" style="width: 220px" clearable filterable />
      </el-form-item>
      <el-form-item label="业务板块" prop="segId">
        <el-select v-model="queryParams.segId" placeholder="请选择业务板块" style="width: 220px" clearable>
          <el-option v-for="item in segOptions" :key="item.id" :label="item.segName" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="合同/立项单号" prop="itemNo">
        <el-input v-model="queryParams.itemNo" placeholder="请输入合同/立项单号" clearable style="width: 220px" />
      </el-form-item>
      <el-form-item label="合同/立项名称" prop="itemName">
        <el-input v-model="queryParams.itemName" placeholder="请输入合同/立项名称" clearable style="width: 220px" />
      </el-form-item>
      <el-form-item label="供应商" prop="supName">
        <el-input v-model="queryParams.supName" placeholder="请输入供应商名称" clearable style="width: 220px" />
      </el-form-item>
      <el-form-item label="付款单号" prop="reqNo">
        <el-input v-model="queryParams.reqNo" placeholder="请输入付款单号" clearable style="width: 220px" />
      </el-form-item>
      <el-form-item label="费用归属期间" prop="belongMonth">
        <el-date-picker v-model="queryParams.belongMonth" type="month" value-format="YYYY-MM" placeholder="费用归属期间"
          style="width: 220px" />
      </el-form-item>
      <el-form-item label="申请日期" prop="applyDate">
        <el-date-picker v-model="queryParams.applyDate" type="daterange" range-separator="至" value-format="YYYY-MM-DD"
          start-placeholder="开始日期" end-placeholder="结束日期" style="width: 220px" />
      </el-form-item>
      <el-form-item label="入账状态" prop="isLocked">
        <el-select v-model="queryParams.isLocked" placeholder="请选择" style="width: 220px" clearable>
          <el-option label="已入账" :value="true" />
          <el-option label="未入账" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否可支付" prop="isPayable">
        <el-select v-model="queryParams.isPayable" placeholder="请选择" style="width: 220px">
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" :loading="exportLoading" @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>

    <!-- 状态tab切换 -->
    <div class="tab-wrapper">
      <el-tabs v-model="queryParams.payStatus" @tab-change="handleTabChange">
        <el-tab-pane label="未支付" name="未支付" />
        <el-tab-pane label="已支付(部分)" name="部分支付" />
        <el-tab-pane label="全部支付" name="全部支付" />
        <el-tab-pane label="所有请款单" name="" />
      </el-tabs>

    </div>

    <base-table :columns="columns" :tableData="paginatedData" :loading="tableLoading" :rowKey="'id'" :total="total"
      :current-page="currentPage" :page-size="pageSize" @pagination-change="handlePaginationChange">
      <!-- 付款单号 -->
      <template #reqNo="{ row }">
        <el-link type="primary" :underline="'hover'" @click="handleViewDetail(row)">
          {{ row.reqNo || "" }}
        </el-link>
      </template>
      <!-- 审批流程 0=草稿，10=审批中，40=已审批，80=作废，99=其他 -->
      <template #flowStatus="{ row }">
        <el-tag size="small" :type="getEnumType(costBillStatusEnum, row?.flowStatus || 0)">
          {{ getEnumLabel(costBillStatusEnum, row?.flowStatus || 0) }}
        </el-tag>
      </template>
      <!-- 是否入账 -->
      <template #isLocked="{ row }">
        <el-tag size="small" :type="row.isLocked ? 'success' : 'info'">
          {{ row.isLocked ? "已入账" : "未入账" }}
        </el-tag>
      </template>

      <!-- 只有已审批并且未锁定才能登记 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="batchRegister(row)" :disabled="disabledRegister(row)">
          批量登记
        </el-button>
        <el-button type="primary" link @click="singleRegister(row)" :disabled="disabledRegister(row)">
          单项登记
        </el-button>
        <el-button type="primary" link @click="handleView(row)"
          v-if="menuStore.hasExactPermission('payment-register:detail')">
          明细
        </el-button>
        <!-- <el-button type="primary" link @click="handleEntry(row)" :disabled="row.isLocked || row.payStatus !== '全部支付'"> -->
        <el-button type="primary" link @click="handleEntry(row)" :disabled="disabledEntry(row)">
          入账
        </el-button>
      </template>
    </base-table>
    <!-- 批量付款登记 弹窗 -->
    <BatchRegisterDialog v-model="batchDialog" :currentRow="currentRow" :queryParams="queryParams"
      @success="getDataList" />
    <!-- 单项登记 弹窗 -->
    <SingleRegisterDialog v-model="singleDialog" :currentRow="currentRow" :queryParams="queryParams"
      @success="getDataList" />
    <!-- 查看弹窗 -->
    <ViewDialog v-model="viewDialog" :currentRow="currentRow" :queryParams="queryParams" @success="getDataList" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import BatchRegisterDialog from "./batch-register-dialog.vue";
import SingleRegisterDialog from "./single-register-dialog.vue";
import ViewDialog from "./view-dialog.vue";
import { payRegisterApi } from "@/api/cost/payment-manage/payment-register-api.ts";
import { getEnumLabel, getEnumType } from "@/utils/enum.ts";
import { costBillStatusEnum } from "@/constants/cost/enums.ts";
import { exportExcel } from '@/utils/export-excel.ts';
import { formatThousandWithPlaces } from "@/utils/decimal.ts";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api.ts";
import { useMenuStore } from "@/stores/menu-store";

defineOptions({ name: "payment-register" });

const router = useRouter();
const menuStore = useMenuStore();

const bizITypeMapping = {
  NCON_CST: "非合同请款支付",
  NCON_FEE: "费用报销支付",
  CON_PAY: "合同支付",
}

const queryParams = ref({
  projId: undefined,
  segId: undefined,
  itemNo: undefined,
  itemName: undefined,
  supName: undefined,
  reqNo: undefined,
  belongMonth: undefined,
  applyDate: [],
  wfStatus: 40, // 0=草稿, 10=审批中, 40=已审批, 80=作废, 99=其他
  payStatus: "未支付", // 未支付  部分支付  全部支付
  isLocked: undefined,
  wfTitle: undefined,
  isPayable: true,
});
const projectOptions = ref([]); // 项目列表
const segOptions = ref([]); // 业务板块列表
const tableLoading = ref(false);
const tableData = ref([{ id: 1 }]);
const batchDialog = ref(false);
const singleDialog = ref(false);
const viewDialog = ref(false);
const currentRow = ref(null);
const currentPage = ref<number>(1);
const pageSize = ref<number>(20);
const total = ref<number>(0);
const exportLoading = ref(false);

const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "flowTitle", label: "标题", width: 200 },
  { prop: "projName", label: "项目名称", width: 120 },
  { prop: "segName", label: "业务板块", width: 90 },
  { prop: "compName", label: "费用所属公司", width: 180 },
  { prop: "itemName", label: "合同/立项名称", width: 150 },
  { prop: "itemNo", label: "合同/立项单号", width: 220 },
  {
    prop: "bizItemName", label: "单据类型", width: 150, formatter: (row) => {
      const name = bizITypeMapping[row.bizType] || row.bizItemName
      return name
    }
  },
  { prop: "supName", label: "供应商", width: 150 },
  { slot: "reqNo", label: "付款单号", width: 220 },
  { prop: "reqDesc", label: "付款申请说明", width: 200 },
  { prop: "belongMonth", label: "费用归属期间", width: 110 },
  { prop: "finaTypeName", label: "费用类型", width: 120 },
  { prop: "payableAmt", label: "请款金额", width: 120, formatter: (row) => formatThousandWithPlaces(row.payableAmt || 0) },
  { prop: "paidAmt", label: "支付金额", width: 120, formatter: (row) => formatThousandWithPlaces(row.paidAmt || 0) },
  { prop: "payStatus", label: "付款状态", width: 100 },
  { prop: "applyUserName", label: "申请人", width: 90 },
  { prop: "applyDate", label: "申请日期", width: 100 },
  { slot: "flowStatus", label: "审批流程", width: 100 },
  { slot: "isLocked", label: "是否入账", width: 90 },
  {
    label: "操作",
    prop: "actions",
    width: 250,
    slot: "actions",
    fixed: "right",
  },
];
const disabledRegister = (row) => {
  const hasPermission = menuStore.hasExactPermission('payment-ledger:register')
  // 无权限 → 禁用
  if (!hasPermission) return true
  // 已锁定 → 禁用
  if (row.isLocked) return true
  // 已全部支付 → 禁用
  if (row.payStatus === '全部支付') return true
  // 启用
  return false
}
const disabledEntry = (row) => {
  const hasPermission = menuStore.hasExactPermission('payment-ledger:entry')
  // 无权限 → 禁用
  if (!hasPermission) return true
  // 已锁定 → 禁用
  if (row.isLocked) return true
  // 没有全部支付 → 禁用
  if (row.payStatus !== '全部支付') return true
  // 启用
  return false
}
// 手动分页
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return tableData.value.slice(start, end)
});
// 获取列表数据
const getDataList = async () => {
  try {
    tableLoading.value = true;
    const { applyDate, ...rest } = queryParams.value;
    const params = {
      ...rest,
      reqDateStart: queryParams.value.applyDate?.[0],
      reqDateEnd: queryParams.value.applyDate?.[1],
    };
    tableData.value = [];
    const mainRes = await payRegisterApi.getPayLedgerMain(params);
    if (mainRes.code === 200) {
      tableData.value = mainRes.data || [];
      total.value = mainRes.data?.length || 0;
    }
  } catch (error) {
    console.error("获取实付登记列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};
const handlePaginationChange = (params: any) => {
  currentPage.value = params.currentPage;
  pageSize.value = params.pageSize;
};
// tab切换处理
const handleTabChange = (tabName: string) => {
  queryParams.value.payStatus = tabName;
  handleSearch();
};

const handleSearch = () => {
  resetPagination();
  getDataList();
};
const resetPagination = () => {
  currentPage.value = 1;
  pageSize.value = 20;
}
const handleReset = () => {
  resetPagination();
  // 将所有字段重置为 undefined
  Object.keys(queryParams.value).forEach((key) => {
    queryParams.value[key] = undefined;
  });
  queryParams.value.wfStatus = 40; // 0=草稿, 10=审批中, 40=已审批, 80=作废, 99=其他
  // 默认查询未支付
  queryParams.value.payStatus = "未支付";
  queryParams.value.isPayable = true;
  getDataList();
};
const handleExport = async () => {
  try {
    exportLoading.value = true;
    const res = await payRegisterApi.getPayLedgerMain({ payStatus: '' });
    if (res.code === 200) {
      let list = res.data || [];
      list.forEach((item: any) => {
        item.isLocked = item.isLocked ? "已入账" : "未入账";
        item.flowStatus = getEnumLabel(costBillStatusEnum, item.flowStatus);
        item.bizItemName = bizITypeMapping[item.bizType] || item.bizItemName;
      });
      const headerMap = {
        flowTitle: "标题",
        projName: "项目名称",
        segName: "业务板块",
        compName: "费用所属公司",
        itemName: "合同/立项名称",
        itemNo: "合同/立项单号",
        bizItemName: "单据类型",
        supName: "供应商",
        reqNo: "付款单号",
        reqDesc: "付款申请说明",
        belongMonth: "费用归属期间",
        finaTypeName: "费用类型",
        payableAmt: "请款金额",
        paidAmt: "支付金额",
        payStatus: "付款状态",
        applyUserName: "申请人",
        applyDate: "申请日期",
        flowStatus: "审批流程",
        isLocked: "是否入账",
      }
      exportExcel({
        data: list,
        headerMap: headerMap,
        fileName: '实付登记列表'
      });
    }
  } catch (error) {

  } finally {
    exportLoading.value = false;
  }
}
// 批量登记
const batchRegister = async (row) => {
  if (row.flowStatus == 40) {
    currentRow.value = row;
    batchDialog.value = true;
  }
};
// 单项登记
const singleRegister = (row) => {
  if (row.flowStatus == 40) {
    currentRow.value = row;
    singleDialog.value = true;
  }
};
// 查看
const handleView = async (row) => {
  currentRow.value = row;
  viewDialog.value = true;
};
// 入账
const handleEntry = async (row) => {
  ElMessageBox.confirm(`确认入账吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const params = {
          bizType: row.bizType,
          bizBillId: row.bizBillId,
          status: 1, // 0:未确认 1:确认
        };
        const res = await payRegisterApi.savePayConfirm(params);
        if (res.code === 200) {
          ElMessage.success("操作成功");
          getDataList();
        }
      } catch (error) {
        console.error("操作失败", error);
      }
    })
    .catch(() => { });
};
// 查看单据详情
const handleViewDetail = async (row) => {
  const { bizType, bizId, projId } = row;
  if (!bizType || !bizId) return;
  switch (bizType) {
    case 'CON_PAY':
      // 合同支付
      router.push({
        path: "/con/payment-application/detail",
        query: {
          paymentId: bizId, // 付款ID
          projId: projId,
        },
      });
      break;
    case 'NCON_FEE':
      // 费用报销
      router.push({
        path: "/ncon/fee-payment/detail",
        query: {
          feePaymentId: bizId, // 费用报销ID
        },
      });
      break;
    case 'NCON_CST':
      // 非合同请款
      router.push({
        path: "/ncon/cst-payment/detail",
        query: {
          cstPaymentId: bizId, // 非合同请款ID
        },
      });
      break;
    default:
      break;
  }
}

// 获取项目列表
const getProjectOptions = async () => {
  try {
    const res = await projectAreaApi.getSegMguProjList(); // 板块-公司-项目树形结构数据
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

onMounted(async () => {
  await Promise.all([getProjectOptions(), getSegOptions()]);
  getDataList(); // 初始化加载数据
});
</script>

<style lang="scss" scoped>
.payment-register-wrapper {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px;
  box-sizing: border-box;
  background: #fff;

  .tab-wrapper {
    margin-bottom: 16px;

    :deep(.el-tabs) {
      .el-tabs__header {
        margin-bottom: 0;
      }
    }
  }
}
</style>
