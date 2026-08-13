<!-- 实付登记 列表 -->
<template>
  <div class="payment-register-wrapper">
    <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="105px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width: 220px" />
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

      <el-form-item>
        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 状态tab切换 -->
    <div class="tab-wrapper">
      <el-tabs v-model="queryParams.payStatus" @tab-change="handleTabChange">
        <el-tab-pane label="未支付" name="未支付" />
        <el-tab-pane label="已支付(部分)" name="部分支付" />
        <el-tab-pane label="全部支付" name="全部支付" />
      </el-tabs>
    </div>

    <base-table :columns="columns" :tableData="tableData" :loading="tableLoading" :rowKey="'id'" :pagination="false">
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
        <el-button type="primary" link @click="batchRegister(row)" :disabled="row.isLocked || row.payStatus == '全部支付'">
          批量登记
        </el-button>
        <el-button type="primary" link @click="singleRegister(row)" :disabled="row.isLocked || row.payStatus == '全部支付'">
          单项登记
        </el-button>
        <el-button type="primary" link @click="handleView(row)">
          明细
        </el-button>
        <el-button type="primary" link @click="handleEntry(row)" :disabled="row.isLocked || row.payStatus !== '全部支付'">
          入账
        </el-button>
      </template>
    </base-table>
    <!-- 批量付款登记 弹窗 -->
    <BatchRegisterDialog v-model="batchDialog" :currentRow="currentRow" :queryParams="queryParams"
      @success="handleSearch" />
    <!-- 单项登记 弹窗 -->
    <SingleRegisterDialog v-model="singleDialog" :currentRow="currentRow" :queryParams="queryParams"
      @success="handleSearch" />
    <!-- 查看弹窗 -->
    <ViewDialog v-model="viewDialog" :currentRow="currentRow" :queryParams="queryParams" @success="handleSearch" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
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

defineOptions({ name: "payment-register" });

const router = useRouter();

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
  title: undefined,
});
const projectOptions = ref([]); // 项目列表
const segOptions = ref([]); // 业务板块列表
const tableLoading = ref(false);
const tableData = ref([{ id: 1 }]);
const batchDialog = ref(false);
const singleDialog = ref(false);
const viewDialog = ref(false);
const currentRow = ref(null);

const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "flowTitle", label: "标题", width: 200 },
  { prop: "projName", label: "项目名称", width: 120 },
  { prop: "segName", label: "业务板块", width: 90 },
  { prop: "compName", label: "费用所属公司", width: 180 },
  { prop: "itemName", label: "合同/立项名称", width: 150 },
  { prop: "itemNo", label: "合同/立项单号", width: 180 },
  { prop: "supName", label: "供应商", width: 150 },
  { prop: "reqNo", label: "付款单号", width: 180 },
  { prop: "reqDesc", label: "付款申请说明", width: 200 },
  { prop: "belongMonth", label: "费用归属期间", width: 110 },
  { prop: "finaTypeName", label: "费用类型", width: 120 },
  { prop: "payableAmt", label: "请款金额", width: 90 },
  { prop: "paidAmt", label: "支付金额", width: 90 },
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
    }
  } catch (error) {
    console.error("获取实付登记列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

// tab切换处理
const handleTabChange = (tabName: string) => {
  queryParams.value.payStatus = tabName;
  getDataList();
};

const handleSearch = () => {
  getDataList();
};

const handleReset = () => {
  // 将所有字段重置为 undefined
  Object.keys(queryParams.value).forEach((key) => {
    queryParams.value[key] = undefined;
  });
  queryParams.value.wfStatus = 40; // 0=草稿, 10=审批中, 40=已审批, 80=作废, 99=其他
  // 默认查询未支付
  queryParams.value.payStatus = "未支付";
  getDataList();
};
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
