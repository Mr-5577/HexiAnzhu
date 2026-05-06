<template>
  <base-modal
    v-model="modalVisible"
    title="产品选择"
    width="900px"
    :confirm-loading="confirmLoading"
    @confirm="handleSubmit"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <div class="product-table-wrapper">
      <div class="product-table-item">
        <div class="table-title">总部产品标准</div>
        <base-table
          :columns="columns"
          :tableData="tableData"
          :loading="loading"
          :rowKey="'id'"
          :pagination="false"
          :auto-height="false"
          :height="'450px'"
          :show-toolbar="false"
          @selection-change="handleSelectionChange"
        />
      </div>
      <div class="product-table-item">
        <div class="table-title">项目已选中产品</div>
        <base-table
          :columns="columns2"
          :tableData="selectedData"
          :loading="loading"
          :rowKey="'treeId'"
          :pagination="false"
          :auto-height="false"
          :height="'450px'"
          :show-toolbar="false"
        />
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "@/components/base/base-modal.vue";

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "success"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const confirmLoading = ref(false);
const loading = ref(false);
const tableData = ref([
  { name: "1", id: 1 },
  { name: "1", id: 2, disabled: true },
  { name: "1", id: 3 },
  { name: "1", id: 4 },
  { name: "1", id: 5 },
  { name: "1", id: 6 },
  { name: "1", id: 7 },
]);
const selectedData = ref([{ name: "1" }]);
const columns = [
  {
    type: "selection",
    width: "60",
    disabledField: "disabled",
  },
  {
    prop: "code",
    label: "产品类型",
  },
  {
    prop: "name",
    label: "产品名称",
  },
];
const columns2 = [
  {
    prop: "code",
    label: "产品类型",
  },
  {
    prop: "name",
    label: "产品名称",
  },
];

// 弹窗显示控制
const modalVisible = ref(props.modelValue);
// 取消
const handleCancel = () => {
  modalVisible.value = false;
};
// 关闭
const handleClose = () => {
  modalVisible.value = false;
};
const handleSubmit = () => {};
// 多选
const handleSelectionChange = (selection: any) => {
  console.log("选中的数据:", selection);
};
// 监听弹窗显示状态
watch(
  () => props.modelValue,
  (val) => {
    modalVisible.value = val;
  },
);

watch(modalVisible, (val) => {
  emit("update:modelValue", val);
});

// 暴露方法
defineExpose({});
</script>

<style lang="scss" scoped>
.product-table-wrapper {
  width: 100%;
  display: flex;
  gap: 20px;

  .product-table-item {
    flex: 1;
    width: 0; // 防止 flex 溢出
    display: flex;
    flex-direction: column;

    .table-title {
      margin-bottom: 12px;
      font-weight: 500;
      font-size: 14px;
      color: #333;
      flex-shrink: 0;
    }
  }
}
</style>
