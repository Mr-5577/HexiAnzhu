<!-- 票据查验详情 弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="'票据查验详情'"
    width="1000px"
    :showConfirmButton="false"
    :showCancelButton="false"
    @close="handleClose"
  >
    <div style="padding-right: 8px; box-sizing: border-box">
      这里是查验详情数据
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";

interface Props {
  modelValue: boolean;
  editData?: any;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  editData: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
};
// 监听外部传入的显示状态
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
  },
);
</script>

<style lang="scss" scoped></style>
