<!-- 成本分摊 组件 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="成本分摊"
    width="1400px"
    :top="'8vh'"
    :confirm-loading="confirmLoading"
    :confirm-text="'确定'"
    @confirm="handleConfirm"
    @close="handleClose"
  >
    <CostAllocationDetail
      ref="costAllocationRef"
      :projId="props.projId"
      :bizBillId="props.bizBillId"
      :bizType="props.bizType"
      :allocAmt="props.allocAmt"
      :isDialogMode="true"
    ></CostAllocationDetail>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import CostAllocationDetail from "./index.vue";

interface Props {
  modelValue: boolean;
  projId?: number;
  bizType?: string | number;
  bizBillId?: number;
  allocAmt?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  projId: undefined,
  bizType: undefined,
  bizBillId: undefined,
  allocAmt: 0,
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  select: [data: any[]];
}>();
const costAllocationRef = ref(null);
// 弹窗显示状态
const dialogVisible = ref(props.modelValue);
// 确认按钮loading
const confirmLoading = ref(false);

const handleConfirm =async () => {
  // 校验列表数据
  const reslut = costAllocationRef.value?.validateTable();
  if (!reslut) return;
  // 获取列转行数据
  const submitData = await costAllocationRef.value?.getSubmitData();
  console.log("分摊明细数据，列转行后的数据：", submitData);
  // 拿到数据抛给父组件进行成本数据保存
  emit("select", submitData);
  handleClose();
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
