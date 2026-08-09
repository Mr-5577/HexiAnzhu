<!-- 合同选择弹窗组件 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="选择合同"
    width="1400px"
    :confirm-loading="confirmLoading"
    :confirm-text="'确定'"
    @confirm="handleConfirm"
    @close="handleClose"
  >
    <div class="contract-select-wrapper">
      <!-- 筛选区域 -->
      <el-form
        :model="queryParams"
        ref="queryRef"
        :inline="true"
        size="default"
      >
      <el-form-item label="所属项目" prop="projName">
        <projectSelector
          v-model="queryParams.projId"
          :show-all-levels="false"
          placeholder="请选择项目"
          style="width: 100%"
          filterable
          :disabled="!onlyProj"
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
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <!-- <el-button @click="handleReset">重置</el-button> -->
        </el-form-item>
      </el-form>

      <base-table
        ref="tableRef"
        :row-key="'id'"
        :columns="tableColumns"
        :table-data="tableData"
        :loading="tableLoading"
        :height="'400px'"
        :highlight-current-row="true"
        :pagination="false"
        :selectionMode="props.selectionMode"
        @selection-change="handleSelectionChange"
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
      </base-table>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch ,computed} from "vue";
import { ElMessage } from "element-plus";
import projectSelector from "@/components/business/project-selector.vue";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import {
  ConPropertyEnum,
  PriceTypeEnum,
  ConStatusEnum,
  getLabel,
} from "@/constants/contract-manage/enums";

// Props
interface Props {
  modelValue: boolean;
  selectionMode?: "single" | "multiple"; // 选择模式，单选或多选
  projId?: number,
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  selectionMode: "single",
  projId: null,
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  select: [row: any[]];
}>();

const onlyProj = computed(
    () => !props.projId,
  );
  
// 弹窗显示状态
const dialogVisible = ref(props.modelValue);
// 确认按钮loading
const confirmLoading = ref(false);
// 表格loading
const tableLoading = ref(false);
// 表格数据
const tableData = ref([]);
// 选中行数据
const selectedRows = ref([]);
// 表格ref
const tableRef = ref();

// 查询参数
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

// 表格列配置
const tableColumns = [
  { type: "selection", width: 50, fixed: "left" },
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
];

// 重置状态
const resetState = () => {
  selectedRows.value = [];
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
  // 清除表格高亮
  setTimeout(() => {
    if (tableRef.value) {
      tableRef.value.clearCurrentRow();
    }
  }, 0);
};

// 查询列表
const getSupplierList = async () => {
  try {
    tableLoading.value = true;
    tableData.value = [];
    const params = {
      ...queryParams.value,
    };
    const res = await contractLedgerApi.getContractLedgerList(params);
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    ElMessage.error("加载列表失败");
  } finally {
    tableLoading.value = false;
  }
};

// 查询
const handleQuery = () => {
  getSupplierList();
};

// 重置
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
  handleQuery();
};

const handleSelectionChange = (row: any[]) => {
  selectedRows.value = row;
};

// 确认选择
const handleConfirm = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage.warning("请先选择一条合同数据");
    return;
  }
  confirmLoading.value = true;
  emit("select", selectedRows.value);
  handleClose();
  confirmLoading.value = false;
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  selectedRows.value = [];
};

// 监听modelValue
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      // 打开弹窗时重置状态并加载数据
      resetState();
      if (props.projId) {
        queryParams.value.projId = props.projId
      }
      handleQuery();
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});

// 暴露方法供父组件调用
defineExpose({
  open: () => {
    dialogVisible.value = true;
  },
  close: () => {
    handleClose();
  },
});
</script>

<style lang="scss" scoped>
.contract-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 500px;

  :deep(.base-table) {
    .el-table__row {
      cursor: pointer;
    }

    .current-row {
      background-color: #ecf5ff;
    }
  }
}
</style>
