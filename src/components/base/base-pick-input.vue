<!-- ============ PickInput 弹窗选择式输入框 ============ -->
<!-- 统一封装 readonly input + 🔍 append + 点击触发弹窗的模式 -->
<template>
  <el-input
    :model-value="modelValue"
    :placeholder="placeholder"
    :readonly="readonly"
    :disabled="disabled"
    class="pick-input"
    @click="handlePick"
  >
    <template #append>
      <span class="pick-icon" @click.stop="handlePick">🔍</span>
    </template>
  </el-input>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string;
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
}
withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "请选择",
  readonly: true,
  disabled: false,
});
const emit = defineEmits<{
  (e: "update:modelValue", val: string): void;
  (e: "pick"): void;
}>();
const handlePick = () => {
  emit("pick");
};
</script>

<style scoped lang="scss">
.pick-input {
  cursor: pointer;

  :deep(.el-input__wrapper) {
    background: #f5f7fa;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      box-shadow: 0 0 0 1px #c0c4cc inset;
    }
  }

  :deep(.el-input__inner) {
    cursor: pointer;
  }

  :deep(.el-input-group__append) {
    padding: 0;
    background: linear-gradient(135deg, #409eff, #36a3f7);
    border: none;
    min-width: 44px;
    cursor: pointer;
    transition: all 0.25s;

    .pick-icon {
      width: 44px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #fff;
      cursor: pointer;
      line-height: 1;
    }

    &:hover {
      background: linear-gradient(135deg, #66b1ff, #4ba8f8);
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.35);
    }
  }
}
</style>
