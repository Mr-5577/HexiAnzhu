<!-- 财务分摊 组件 -->
<template>
  <base-modal v-model="dialogVisible" title="财务分摊" width="1400px" :top="'8vh'" :confirm-loading="confirmLoading"
    :confirm-text="'确定'" @confirm="handleConfirm" @close="handleClose">
    <FinanceAllocationDetail ref="financeAllocationRef" :isDialogMode="true" :bizType="props.bizType"
      :bizId="props.bizId" :bizBillId="props.bizBillId"></FinanceAllocationDetail>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import FinanceAllocationDetail from "./index.vue";

interface Props {
  modelValue: boolean;
  bizType?: string;
  dialogMode?: string; // 弹窗模式， view  edit
  bizBillId?: number | undefined; // 业务单据id
  bizId?: number | undefined; // 业务id
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  bizType: "NCON_CST", // 业务类型，NCON_CST:非合同请款  NCON_FEE:非合同费用报销  CON_PAY:合同支付
  dialogMode: "edit", // 弹窗模式
  bizBillId: undefined, // 业务单据id
  bizId: undefined, // 业务id
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  select: [data: any[]];
  updateData: [];
}>();

// 弹窗显示状态
const dialogVisible = ref(props.modelValue);
// 确认按钮loading
const confirmLoading = ref(false);
const financeAllocationRef = ref(null);

const handleConfirm = async () => {
  try {
    confirmLoading.value = true;
    // 提交保存
    await financeAllocationRef.value?.handleSubmit();
    emit("updateData");
    handleClose();
  } catch (error) {
    console.log(error);
  } finally {
    confirmLoading.value = false;
  }
};
const handleClose = () => {
  dialogVisible.value = false;
};
// 监听modelValue
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
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

<style lang="scss" scoped></style>
