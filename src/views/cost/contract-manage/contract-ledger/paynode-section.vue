<template>
  <div>
    <div class="section-title">支付节点</div>
    <div class="detail-table">
      <div class="header-content">
        <span class="header-title">支付节点明细</span>
        <el-button type="primary" size="small" @click="addRow">
          新增支付节点明细
        </el-button>
      </div>
      <editable-table
        ref="paynodeRef"
        :row-key="'uuid'"
        :height="'160px'"
        v-model="localPaynodeTable"
        :columns="paynodeColumns"
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

const localPaynodeTable = computed({
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
    nodeId: null,
    nodeName: "",
    payType: null,
    prodVal: 0,
    payRate: 0,
    payAmt: 0,
    payDate: "",
    costProdVal: 0,
    costPayAmt: 0,
    remark: "",
  };
  localPaynodeTable.value = [...localPaynodeTable.value, newRow];
};

// 删除行
const deleteRow = (row: any) => {
  localPaynodeTable.value = localPaynodeTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};

const paynodeColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "nodeName",
    label: "支付节点",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payType",
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
    prop: "prodVal",
    label: "产值金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payAmt",
    label: "应付金额",
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
    prop: "remark",
    label: "备注",
    editable: true,
    editType: "input",
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
