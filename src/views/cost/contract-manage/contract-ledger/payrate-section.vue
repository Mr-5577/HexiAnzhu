<template>
  <div>
    <div class="section-title">支付比例</div>
    <div class="detail-table">
      <div class="header-content">
        <span class="header-title">支付比例明细</span>
        <el-button type="primary" size="small" @click="addRow">
          新增支付明细
        </el-button>
      </div>
      <editable-table
        ref="payrateRef"
        :row-key="'uuid'"
        :height="'160px'"
        v-model="localPayrateTable"
        :columns="payrateColumns"
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
  paymentTypeOptions: any[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: any[]): void;
}>();

const localPayrateTable = computed({
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
    payRateId: null,
    payTypeId: null,
    payRate: 0,
    isCtrl: false,
    payIntvl: 0,
    prodVal: 0,
    payAmt: 0,
    buildPeriod: "",
    prodValPeriod: "",
    payDate: "",
    costProdVal: 0,
    costPayAmt: 0,
  };
  localPayrateTable.value = [...localPayrateTable.value, newRow];
};

// 删除行
const deleteRow = (row: any) => {
  localPayrateTable.value = localPayrateTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};

const payrateColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "payRateId",
    label: "支付比例",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    optionLabelField: "name",
    optionValueField: "id",
    options: [
      { id: 1, name: "节点" },
      { id: 2, name: "比例" },
      { id: 3, name: "材料" },
    ],
    width: 120,
  },
  {
    prop: "payTypeId",
    label: "款项类型",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    optionLabelField: "dicLabel",
    optionValueField: "id",
    options: props.paymentTypeOptions || [],
    width: 120,
  },
  {
    prop: "payRate",
    label: "应付比例(%)",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "isCtrl",
    label: "是否强控",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    clearable: false,
    options: [
      { value: true, label: "是" },
      { value: false, label: "否" },
    ],
    width: 120,
  },
  {
    prop: "payIntvl",
    label: "支付周期(月)",
    showSummary: true,
    editable: true,
    editType: "number",
    precision: 0,
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "prodVal",
    label: "本次申请产值金额",
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
  margin: 10px 0 10px 0;
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
