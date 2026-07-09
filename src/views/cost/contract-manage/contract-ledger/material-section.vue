<template>
  <div>
    <div class="section-title">材料合同产值</div>
    <div class="detail-table">
      <div class="header-content">
        <span class="header-title">材料合同产值明细</span>
        <el-button type="primary" size="small" @click="addRow">
          新增合同产值明细
        </el-button>
      </div>
      <editable-table
        ref="materialRef"
        :row-key="'uuid'"
        :height="'160px'"
        v-model="localMaterialTable"
        :columns="materialColumns"
        :pagination="false"
        :highlight-current-row="false"
        :show-summary="false"
        :compactEmpty="true"
        :editable="true"
      >
        <template #actions="{ row }">
          <el-button link type="danger" @click="deleteRow(row)">
            删除
          </el-button>
        </template>
      </editable-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";

const props = defineProps<{
  modelValue: any[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: any[]): void;
}>();

const localMaterialTable = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit("update:modelValue", val);
  },
});

// 新增行
const addRow = () => {
  const newRow = {
    uuid: uuidv4(),
    id: null,
    conBillId: null,
    mtId: null,
    mtName: "",
    mtModel: "",
    mtBrand: "",
    recvNum: 0,
    mtUnit: "",
    recvBillNo: "",
    recvPrice: 0,
    fineAmt: 0,
    prodVal: 0,
    payRate: 0,
    payAmt: 0,
    buildPeriod: "",
    prodValPeriod: "",
    payDate: "",
    costProdVal: 0,
    costPayAmt: 0,
  };
  localMaterialTable.value = [...localMaterialTable.value, newRow];
};

// 删除行
const deleteRow = (row: any) => {
  localMaterialTable.value = localMaterialTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};

const materialColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "mtName",
    label: "材料名称",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "mtModel",
    label: "材料规格",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "mtBrand",
    label: "品牌",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "recvNum",
    label: "接收数量",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    precision: 0,
    width: 120,
  },
  {
    prop: "mtUnit",
    label: "计量单位",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "recvBillNo",
    label: "接收单号",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "recvPrice",
    label: "接收价格",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "fineAmt",
    label: "罚款",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "prodVal",
    label: "产值总金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payRate",
    label: "应付比例",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payAmt",
    label: "本次申报应付金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "buildPeriod",
    label: "施工期间",
    editable: true,
    editType: "date",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "prodValPeriod",
    label: "产值期间",
    editable: true,
    editType: "date",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payDate",
    label: "计划付款日期",
    editable: true,
    editType: "date",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "costProdVal",
    label: "成本复核产值金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);
</script>

<style scoped lang="scss">
.detail-table {
  .header-content {
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .header-title {
      font-size: 15px;
      color: #5d5d5f;
      font-weight: 600;
    }
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
  padding-left: 10px;
  position: relative;
  &::before {
    content: "";
    width: 4px;
    height: 16px;
    background: #409eff;
    border-radius: 2px;
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
