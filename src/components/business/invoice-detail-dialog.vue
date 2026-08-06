<!-- 发票明细 弹窗组件 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="'发票明细'"
    width="1000px"
    :showConfirmButton="false"
    :showCancelButton="false"
    @confirm="handleConfirm"
    @close="handleClose"
  >
      <base-table
        :columns="tableColumns"
        :tableData="tableData"
        :loading="false"
        :rowKey="'uuid'"
        :height="'500px'"
        :pagination="false"
      >
      </base-table>
      <!-- <editable-table
        :row-key="'uuid'"
        :height="'260px'"
        v-model="tableData"
        :columns="dynamicColumns"
        :pagination="false"
        :highlight-current-row="false"
        :show-summary="false"
        :compactEmpty="true"
      >
      </editable-table> -->
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { TableColumnItem } from "@/components/base/base-table.vue";
import { HConBillInvoiceD } from "@/types/cost/contract-manage/payment-application-type";

const props = defineProps<{
  modelValue: boolean;
  detailList?: HConBillInvoiceD[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [data: any[]];
}>();

const dialogVisible = ref(props.modelValue);
const tableData = ref([]);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "itemName", label: "项目名称" },
  { prop: "size", label: "规格" },
  { prop: "unit", label: "单位" },
  { prop: "num", label: "数量" },
  { prop: "price", label: "单价" },
  { prop: "totalAmt", label: "金额" },
  { prop: "taxRate", label: "税率" },
  { prop: "taxAmt", label: "税额" },
];

const dynamicColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "itemName",
    label: "项目名称",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    prop: "size",
    label: "规格",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    prop: "unit",
    label: "单位",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    prop: "num",
    label: "数量",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "price",
    label: "单价",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "totalAmt",
    label: "金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "taxRate",
    label: "税率",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "taxAmt",
    label: "税额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
]);

const handleConfirm = () => {
  emit("success", tableData.value);
  handleClose();
};
const handleClose = () => {
  dialogVisible.value = false;
};

watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      tableData.value = props.detailList?.map((item) => {
        return {
          ...item,
          uuid: uuidv4(),
        };
      });
    }
  },
);

watch(dialogVisible, (val) => emit("update:modelValue", val));
</script>
<style lang="scss" scoped></style>
