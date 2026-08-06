<!-- 发票台账 列表 -->
<template>
  <div class="invoice-ledger-wrapper">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      label-width="80px"
    >
      <el-form-item label="项目" prop="projId">
        <el-cascader
          v-model="queryParams.projId"
          :options="projectOptions"
          :show-all-levels="false"
          :props="{
            expandTrigger: 'hover',
            emitPath: false,
            checkStrictly: false,
            value: 'orgId',
            label: 'orgName',
            children: 'children',
          }"
          placeholder="请选择项目"
          style="width: 180px"
          clearable
        />
      </el-form-item>
      <el-form-item label="业务板块" prop="segId">
        <el-select
          v-model="queryParams.segId"
          placeholder="请选择业务板块"
          style="width: 180px"
        >
          <el-option
            v-for="item in segOptions"
            :key="item.id"
            :label="item.segName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="合同编号" prop="conCode">
        <el-input
          v-model="queryParams.conCode"
          placeholder="请输入合同编号"
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
      <el-form-item label="供应商" prop="supName">
        <el-input
          v-model="queryParams.supName"
          placeholder="请输入供应商名称"
          clearable
          style="width: 180px"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
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
        <el-button type="primary" link @click="handleView(row)">
          查看发票
        </el-button>
      </template>
    </base-table>
    <!-- 合同发票详情弹窗 -->
    <ContractInvoiceDialog v-model="dialogVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { largeScreenApi } from "@/api/sales/large-screen-api";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import ContractInvoiceDialog from "./contract-invoice-dialog.vue";
import { invoiceManageApi } from "@/api/cost/payment-manage/invoice-manage-api.ts";

defineOptions({ name: "invoice-ledger" });

const router = useRouter();

const queryParams = ref({
  projId: undefined,
  segId: undefined,
  status: undefined,
  conCode: undefined,
  conName: undefined,
  supName: undefined,
  payCode: undefined,
  feePeriod: undefined,
  applyDate: undefined,
});
const projectOptions = ref([]); // 项目列表
const segOptions = ref([]); // 业务板块列表
const tableLoading = ref(false);
const tableData = ref([{ id: 1 }]);
const dialogVisible = ref(false);
const currentData = ref(null);
const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "项目名称", width: 150 },
  { prop: "segName", label: "业务板块", width: 150 },
  { prop: "conName", label: "合同名称", width: 150 },
  { prop: "conSysNo", label: "合同编号", width: 150 },
  { prop: "supName", label: "供应商名称", width: 120 },
  { prop: "signAmt", label: "合同金额", width: 120 },
  { prop: "settleStatus", label: "结算状态", width: 120 },
  { prop: "sumPayAmt", label: "累计请款", width: 120 },
  { prop: "sumInvoiceAmt", label: "发票金额", width: 120 },
  {
    prop: "sumOwedInvoiceAmt",
    label: "欠费金额",
    width: 120,
    // 方式一：使用配置方式增加表头提示，提示：近6个月的平均值
    headerTip: {
      icon: "QuestionFilled",
      content: "欠票金额=累计请款-发票金额",
      placement: "top",
    },
  },
  { prop: "sumInvoiceCount", label: "发票数", width: 120 },
  {
    label: "操作",
    width: 150,
    slot: "actions",
    fixed: "right",
  },
];
const handleView = (row) => {
  currentData.value = row;
  dialogVisible.value = true;
};
// 获取列表数据
const getDataList = async () => {
  try {
    tableLoading.value = true;
    tableData.value = [];
    const params = {
      projId: queryParams.value.projId,
    };
    const res = await invoiceManageApi.getInvoiceLedger(params);
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("获取列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

const handleSearch = () => {
  console.log(queryParams.value);
  getDataList();
};

const handleReset = () => {
  // 将所有字段重置为 undefined
  Object.keys(queryParams.value).forEach((key) => {
    queryParams.value[key] = undefined;
  });
  getDataList();
};

// 获取项目列表
const getProjectOptions = async () => {
  try {
    // const res = await largeScreenApi.getProjList(); // 扁平结构数据
    const res = await projectAreaApi.getMguProjList(); // 公司-项目树形结构数据
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
  getDataList();
});
</script>

<style lang="scss" scoped>
.invoice-ledger-wrapper {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #fff;
}
</style>
