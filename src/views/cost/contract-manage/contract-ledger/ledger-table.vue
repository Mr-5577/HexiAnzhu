<!-- 合同台账列表 -->
<template>
  <div class="ledger-table-wrapper">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="合同名称" prop="conName">
        <el-input
          v-model="queryParams.conName"
          placeholder="请输入合同名称"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item label="供应商名称" prop="supName">
        <el-input
          v-model="queryParams.supName"
          placeholder="请输入供应商名称"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item label="合同分类" prop="conTypeId">
        <ConTypeSelector 
          v-model="queryParams.conTypeId"
          placeholder="请选择合同分类"
          style="width: 180px"
          clearable
          filterable
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
      <el-form-item label="经办人" prop="agentId">
        <ChooseEmployee
          v-model="queryParams.agentId"
          :show-all-levels="false"
          placeholder="请选择"
          style="width: 180px"
          clearable
          filterable
        />
      </el-form-item>
      <el-form-item label="创建人" prop="createId">
        <ChooseEmployee
          v-model="queryParams.createId"
          :show-all-levels="false"
          placeholder="请选择"
          style="width: 180px"
          clearable
          filterable
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="time">
        <el-date-picker
          v-model="queryParams.time"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 220px"
          clearable
        />
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
        <span>{{getEnumLabel(ConPropertyEnum, row?.conProperty || 0) }}</span>
      </template>
      <template #priceType="{ row }">
        <span>{{getEnumLabel(PriceTypeEnum, row?.priceType) }}</span>
      </template>
      <template #conStatus="{ row }">
        <el-tag
          size="small"
          :type="getEnumType(conBillStatusEnum, row?.conStatus || 0)"
        >
          {{ getEnumLabel(conBillStatusEnum, row?.conStatus || 0) }}
        </el-tag>
      </template>

      <template #actions="{ row }">
      <!-- 外部常驻按钮 -->
      <el-button
        type="primary"
        link
        @click="handleEdit(row)"
        :disabled="row.conStatus !== 0 && row.createId === userStore.userInfo.id"
      >
        编辑
      </el-button>
      <el-button type="primary" link @click="handleDetail(row)">
        合同详情
      </el-button>
      <el-button type="primary" link @click="handleBookDetail(row)">
        台账详情
      </el-button>
      <el-button
        type="danger"
        link
        @click="handleDelete(row)"
        :disabled="row.conStatus !== 0 && row.createId === userStore.userInfo.id"
      >
        删除
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
import { largeScreenApi } from "@/api/sales/large-screen-api";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import {
  ConPropertyEnum,
  PriceTypeEnum,
  ConStatusEnum,
  getLabel,
} from "@/constants/contract-manage/enums";
import { getEnumLabel, getEnumType } from "@/utils/enum";
import { conBillStatusEnum } from "@/constants/contract-manage/enums.ts"
import {
  HConMain,
  HConMainQuery,
} from "@/types/cost/contract-manage/contract-ledger-type";
import { useUserStore } from "@/stores/user-store";
import ConTypeSelector from "@/components/business/con-type-selector.vue";


defineOptions({ name: "contract-ledger-table" });

const props = defineProps<{
  selectedData: any | null;
}>();

const emit = defineEmits<{
  (e: "select-project"): void;
}>();

const router = useRouter();

const tableLoading = ref(false);
const tableData = ref([]);
const userStore = useUserStore();

const queryParams = ref({
  projSegId: undefined,
  projMguId: undefined,
  conStatus: undefined,
  projId: undefined,
  conName: "",
  supName: "",
  conTypeId: undefined,
  agentId: undefined,
  createId: undefined,
  time: [],
});
// 业务板块
const segOptions = ref([]);
// 项目列表
const projectOptions = ref([]);

const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "segName", label: "业务板块", width: 90 },
  { prop: "projName", label: "项目名称", width: 150 },
  { prop: "conTypeName", label: "合同分类", width: 150 },
  { prop: "conSysNo", label: "合同编号", minWidth: 150 },
  { prop: "conName", label: "合同名称", width: 250 },
  { slot: "conProperty", label: "合同类型", width: 90 },
  { prop: "companyName", label: "签约公司", minWidth: 200 },
  { prop: "supName", label: "供应商名称", minWidth: 200 },
  { prop: "signAmt", label: "签约金额(含税)", minWidth: 120 ,formatType:"#,##0.00"},
  { prop: "signExclAmt", label: "签约金额(不含税)", minWidth: 120 ,formatType:"#,##0.00"},
  { prop: "taxAmt", label: "税额", minWidth: 100 ,formatType:"#,##0.00"},
  { prop: "taxRate", label: "税率", minWidth: 90 ,formatType:"d%"},
  { prop: "bldNames", label: "楼栋范围", minWidth: 90 },
  { slot: "priceType", label: "计价方式", minWidth: 100 },
  { prop: "signDate", label: "签订日期", minWidth: 120 },
  { prop: "effectiveDate", label: "生效日期", minWidth: 120 },
  { prop: "expiryDate", label: "到期日期", minWidth: 120 },
  { slot: "conStatus", label: "合同状态", minWidth: 100 },
  { prop: "agentName", label: "经办人", minWidth: 100 },
  { prop: "createName", label: "创建人", minWidth: 100 },
  { prop: "createDate", label: "创建时间", minWidth: 120 },
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
  debugger
  if (!props.selectedData) {
    return;
  }
  const { orgId, dataType } = props.selectedData;
  const params = {
    projSegId: dataType === 4 ? orgId : undefined, // 板块
    projMguId: dataType === 3 ? orgId : undefined, // 公司
    projId: dataType === 1 ? orgId : undefined, // 项目
  };
  try {
    tableLoading.value = true;
    tableData.value = [];
    const [startDate, endDate] = queryParams.value.time || [];
    const query = {
      conName: queryParams.value.conName,
      supName: queryParams.value.supName,
      conStatus: queryParams.value.conStatus,
      createId: queryParams.value.createId,
      agentId: queryParams.value.agentId,
      conTypeId: queryParams.value.conTypeId,
      ...params,
      createDateStart: startDate,
      createDateEnd: endDate,
    };

    const res = await contractLedgerApi.getContractLedgerList(query);
    
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("查询合同信息失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

const handleSearch = () => {
  getDataList();
};

const handleReset = () => {
  queryParams.value = {
    projSegId: undefined,
    projMguId: undefined,
    conStatus: undefined,
    projId: undefined,
    conName: "",
    supName: "",
    conTypeId: undefined,
    agentId: undefined,
    createId: undefined,
    time: [],
  };
  getDataList();
};
// 新增合同台账
const handleAdd = () => {
  router.push({
    path: "/con/contract-ledger/add",
    query: {
      t: Date.now(),
    },
  });
};
// 编辑合同
const handleEdit = (row: HConMain) => {
  router.push({
    path: "/con/contract-ledger/edit",
    query: {
      conId: row.id,
    },
  });
};

// 查看合同
const handleDetail = (row: HConMain) => {
  router.push({
    path: "/con/contract-ledger/edit",
    query: {
      conId: row.id,
      mode: "detail"
    },
  });
};


// 台账详情
const handleBookDetail = (row: HConMain) => {
  router.push({
    path: "/con/contract-ledger/detail",
    query: {
      conId: row.id,
      projId: row.projId,
      conName:row.conName,
      tab: "basic",
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
  () => props.selectedData,
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
