<!-- 实付登记 列表 -->
<template>
  <div class="payment-register-wrapper">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      label-width="100px"
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
          style="width: 200px"
          clearable
        />
      </el-form-item>
      <el-form-item label="业务板块" prop="segId">
        <el-select
          v-model="queryParams.segId"
          placeholder="请选择业务板块"
          style="width: 200px"
        >
          <el-option
            v-for="item in segOptions"
            :key="item.id"
            :label="item.segName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="付款状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择付款状态"
          style="width: 200px"
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
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="合同名称" prop="conName">
        <el-input
          v-model="queryParams.conName"
          placeholder="请输入合同名称"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="供应商" prop="supName">
        <el-input
          v-model="queryParams.supName"
          placeholder="请输入供应商名称"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="付款单号" prop="payCode">
        <el-input
          v-model="queryParams.payCode"
          placeholder="请输入付款单号"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="费用归属期间" prop="feePeriod">
        <el-date-picker
          v-model="queryParams.feePeriod"
          type="month"
          value-format="YYYY-MM-DD"
          placeholder="费用归属期间"
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="申请日期" prop="applyDate">
        <el-date-picker
          v-model="queryParams.applyDate"
          type="daterange"
          range-separator="至"
          value-format="YYYY-MM-DD"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 220px"
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
        <el-button type="primary" link @click="batchRegister">
          批量登记
        </el-button>
        <el-button type="primary" link @click="singleRegister">
          单项登记
        </el-button>
        <el-button type="primary" link> 查看 </el-button>
        <el-button type="primary" link> 锁定 </el-button>
      </template>
    </base-table>
    <!-- 批量付款登记 弹窗 -->
    <BatchRegisterDialog v-model="batchDialog" />
    <!-- 单项登记 弹窗 -->
     <SingleRegisterDialog v-model="singleDialog" />
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
import BatchRegisterDialog from "./batch-register-dialog.vue";
import SingleRegisterDialog from "./single-register-dialog.vue";

defineOptions({ name: "payment-register" });

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
const batchDialog = ref(false);
const singleDialog = ref(false);

const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "ww", label: "标题", width: 200 },
  { prop: "projId", label: "项目名称", width: 150 },
  { prop: "segId", label: "业务板块", width: 150 },
  { prop: "ww", label: "费用所属公司", width: 150 },
  { prop: "ww", label: "合同名称", width: 150 },
  { prop: "ww", label: "合同编号", width: 150 },
  { prop: "ww", label: "供应商", width: 120 },
  { prop: "ww", label: "付款单号", width: 120 },
  { prop: "ww", label: "付款申请说明", width: 200 },
  { prop: "ww", label: "费用归属期间", width: 120 },
  { prop: "ww", label: "费用类型", width: 120 },
  { prop: "ww", label: "请款金额", width: 120 },
  { prop: "ww", label: "支付金额", width: 120 },
  { prop: "ww", label: "付款状态", width: 120 },
  { prop: "ww", label: "申请人", width: 120 },
  { prop: "ww", label: "申请日期", width: 120 },
  { prop: "ww", label: "审批流程", width: 200 },
  {
    label: "操作",
    prop: "actions",
    width: 260,
    slot: "actions",
    fixed: "right",
  },
];
// 获取列表数据
const getDataList = async () => {
  try {
    // tableLoading.value = true;
    // tableData.value = [];
  } catch (error) {
    console.error("获取非合同建安立项列表失败:", error);
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

const batchRegister = () => {
  batchDialog.value = true;
};
const singleRegister = () => {
  singleDialog.value = true;
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
  await Promise.all([getProjectOptions()]);
  getDataList();
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
}
</style>
