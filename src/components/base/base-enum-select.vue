<!-- ============ EnumSelect 枚举下拉 ============ -->
<!-- 统一封装基于枚举数组的 el-select，支持单选/多选 -->
<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :multiple="multiple"
    :clearable="clearable"
    :collapse-tags="multiple"
    :collapse-tags-tooltip="multiple"
    style="width: 100%"
    @update:model-value="handleChange"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script setup lang="ts">
interface Option {
  value: any;
  label: string;
}
interface Props {
  modelValue?: any;
  options: readonly Option[];
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  clearable?: boolean;
}
withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  options: () => [],
  placeholder: "请选择",
  disabled: false,
  multiple: false,
  clearable: false,
});
const emit = defineEmits<{
  (e: "update:modelValue", val: any): void;
  (e: "change", val: any): void;
}>();
const handleChange = (val: any) => {
  emit("update:modelValue", val);
  emit("change", val);
};
</script>
