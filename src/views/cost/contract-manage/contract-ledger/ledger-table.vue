<!-- 合同台账列表 -->
<template>
  <div class="ledger-table-wrapper">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="业务板块" prop="segId">
        <el-select
          v-model="queryParams.segId"
          placeholder="请选择业务板块"
          clearable
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
      <!-- <el-form-item label="项目" prop="projId">
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
      </el-form-item> -->
      <el-form-item label="合同名称" prop="conName">
        <el-input
          v-model="queryParams.conName"
          placeholder="请输入合同名称"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item label="合同状态" prop="conStatus">
        <el-select
          v-model="queryParams.conStatus"
          placeholder="请选择合同状态"
          clearable
          style="width: 180px"
        >
          <el-option
            v-for="item in ConStatusEnum"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>

    <base-table
      :columns="columns"
      :tableData="tableData"
      :loading="tableLoading"
      :rowKey="'id'"
      :pagination="false"
    >
      <template #conProperty="{ row }">
        {{ getLabel(ConPropertyEnum, row.conProperty) }}
      </template>
      <template #priceType="{ row }">
        {{ getLabel(PriceTypeEnum, row.priceType) }}
      </template>
      <template #conStatus="{ row }">
        {{ getLabel(ConStatusEnum, row.conStatus) }}
      </template>
      <template #actions="{ row }">
        <!-- 草稿状态才可以编辑,0-草稿 5-审批中 10-已审批 20-已结算 30-已作废 -->
        <el-button
          type="primary"
          link
          @click="handleEdit(row)"
          :disabled="row.conStatus !== 0"
        >
          编辑
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          删除
        </el-button>
        <el-button type="primary" link @click="handleDetail(row)">
          台账详情
        </el-button>
      </template>
    </base-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { useRouter } from "vue-router";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { largeScreenApi } from "@/api/large-screen-api";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import {
  ConPropertyEnum,
  PriceTypeEnum,
  ConStatusEnum,
  getLabel,
} from "@/constants/contract-manage/enums";
import {
  HConMain,
  HConMainQuery,
} from "@/types/cost/contract-manage/contract-ledger-type";

defineOptions({ name: "contract-ledger-table" });

const props = defineProps<{
  projectId: number | null;
}>();

const emit = defineEmits<{
  (e: "select-project"): void;
}>();

const router = useRouter();

const tableLoading = ref(false);
const tableData = ref([]);

const queryParams = ref<HConMainQuery>({
  segId: undefined,
  conStatus: undefined,
  projId: undefined,
  conName: "",
});
// 业务板块
const segOptions = ref([]);
// 项目列表
const projectOptions = ref([]);

const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "segName", label: "业务板块", width: 150 },
  { prop: "projName", label: "项目名称", width: 200 },
  { prop: "conTypeId", label: "合同分类", width: 150 },
  { prop: "conSysNo", label: "合同编号", minWidth: 220 },
  { prop: "conName", label: "合同名称", width: 150 },
  { slot: "conProperty", label: "合同类型", width: 150 },
  { prop: "supName", label: "供应商名称", minWidth: 150 },
  { prop: "demandRemark", label: "预结算合同金额", minWidth: 150 },
  { prop: "signAmt", label: "签约金额", minWidth: 150 },
  { prop: "demandRemark", label: "补充合同金额", minWidth: 150 },
  { prop: "demandRemark", label: "变更金额", minWidth: 150 },
  { prop: "settleAmt", label: "结算金额", minWidth: 150 },
  { slot: "priceType", label: "计价方式", minWidth: 150 },
  { prop: "signDate", label: "签订日期", minWidth: 150 },
  { prop: "effectiveDate", label: "生效日期", minWidth: 150 },
  { prop: "expiryDate", label: "到期日期", minWidth: 150 },
  { slot: "conStatus", label: "合同状态", minWidth: 150 },
  {
    label: "操作",
    prop: "actions",
    width: 200,
    slot: "actions",
    fixed: "right",
  },
];
// 获取列表数据
const getDataList = async () => {
  if (!props.projectId) {
    return;
  }
  try {
    tableLoading.value = true;
    tableData.value = [];
    const params = {
      ...queryParams.value,
      projId: props.projectId,
    };
    const res = await contractLedgerApi.getContractLedgerList(params);
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("获取招标需求列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

const handleSearch = () => {
  getDataList();
};

const handleReset = () => {
  queryParams.value = {
    segId: undefined,
    conStatus: undefined,
    projId: undefined,
    conName: "",
  };
  getDataList();
};

const handleAdd = () => {
  router.push({
    path: "/contract/contract-ledger/add",
    query: {
      mode: "add",
    },
  });
};

const handleEdit = (row: HConMain) => {
  router.push({
    path: "/contract/contract-ledger/edit",
    query: {
      mode: "edit",
      conId: row.id,
    },
  });
};

const handleDetail = (row: HConMain) => {
  router.push({
    path: "/contract/contract-ledger-detail",
    query: {
      conId: row.id,
      mode: "detail",
    },
  });
};

const handleDelete = (row: HConMain) => {
  ElMessageBox.confirm(`确定删除“${row.conName}”合同吗？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      const res = await contractLedgerApi.delContractLedger({ id: row.id });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        getDataList();
      }
    })
    .catch(() => {});
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

watch(
  () => props.projectId,
  (val) => {
    if (val) {
      getSegOptions();
      getProjectOptions();
      getDataList();
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.ledger-table-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
