<template>
  <base-modal
    v-model="dialogVisible"
    :title="'发票明细'"
    width="1000px"
    :showConfirmButton="false"
    :showCancelButton="false"
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
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import { TableColumnItem } from "@/components/base/base-table.vue";
import { HConBillInvoiceD } from "@/types/cost/contract-manage/payment-application-type";

const props = defineProps<{
  modelValue: boolean;
  detailList: HConBillInvoiceD[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);

const tableData = computed(() => {
  if (!props.detailList) return [];
  return props.detailList.map((item) => {
    return {
      ...item,
      uuid: uuidv4(),
    };
  });
});

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

const handleClose = () => {
  dialogVisible.value = false;
};

watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
  },
);

watch(dialogVisible, (val) => emit("update:modelValue", val));
</script>
<style lang="scss" scoped></style>
