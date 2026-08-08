<!-- 财务分摊 组件 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="财务分摊"
    width="1400px"
    :top="'8vh'"
    :confirm-loading="confirmLoading"
    :confirm-text="'确定'"
    :showConfirmButton="props.dialogMode == 'edit'"
    :showCancelButton="props.dialogMode == 'edit'"
    @confirm="handleConfirm"
    @close="handleClose"
  >
    <FinanceAllocationDetail
      ref="financeAllocationRef"
      :projId="props.projId"
      :segId="props.segId"
      :dialogMode="props.dialogMode"
      :isDialogMode="true"
      :payWayTable="payWayTable"
    ></FinanceAllocationDetail>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import FinanceAllocationDetail from "./index.vue";

interface Props {
  modelValue: boolean;
  projId?: number | undefined;
  segId?: number | undefined;
  payWayTable?: any[];
  dialogMode?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  projId: undefined,
  segId: undefined,
  payWayTable: () => [],
  dialogMode: "edit", // edit:编辑模式，view:查看模式
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  select: [data: any[]];
}>();

// 弹窗显示状态
const dialogVisible = ref(props.modelValue);
// 确认按钮loading
const confirmLoading = ref(false);
const financeAllocationRef = ref(null);

const handleConfirm = async () => {
  // 校验列表数据
  const reslut = financeAllocationRef.value?.validateData();
  if (reslut) {
    const data = financeAllocationRef.value?.getData();
    console.log("校验通过", data);
    if (data && data.length > 0) {
      // const detailListArray = data.flatMap((item) => {
      //   // 判断 detailList 是否存在且为数组
      //   if (Array.isArray(item.detailList) && item.detailList.length > 0) {
      //     return item.detailList;
      //   }
      //   return []; // 如果没有数据，返回空数组
      // });
      emit("select", data);
      handleClose();
    } else {
      emit("select", []);
      handleClose();
    }
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
