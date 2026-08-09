<!-- ============ PickInput 弹窗选择式输入框 ============ -->
<!-- 增强点：在选择按钮后新增「清除」按钮，同时清除 id 和 name；只读时不显示 -->
<template>
  <el-input
    ref="inputRef"
    v-model="displayValue"
    :placeholder="placeholder"
    :readonly="readonly"
    :disabled="disabled"
    class="pick-input"
    @click="handlePick"
  >
    <!-- 只读时整个 append 不渲染：选择按钮 + 清除按钮都不显示 -->
    <template #append v-if="!readonly">
      <div class="append-group">
        <!-- 选择按钮 -->
        <span class="pick-icon" @click.stop="handlePick">🔍</span>

        <!-- 清除按钮：只读 / 禁用 / 无值 时不显示 -->
        <span
          v-if="canClear"
          class="clear-icon"
          title="清除"
          @click.stop="handleClear"
        >✕</span>
      </div>
    </template>
  </el-input>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, inject, computed } from "vue";
import { ElForm } from "element-plus";

interface Props {
  /** 名称（显示用），对应 v-model:modelValue */
  modelValue?: string;
  /** id（不显示，仅保存），对应 v-model:modelValueId */
  modelValueId?: string | number;
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  modelValueId: "",
  placeholder: "请选择",
  readonly: false,
  disabled: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", val: string): void;
  (e: "update:modelValueId", val: string | number): void;
  (e: "pick"): void;
  (e: "clear"): void;
}>();

// 注入表单上下文
const elForm = inject<InstanceType<typeof ElForm> | null>("el-form", null);

// 计算表单的只读和禁用状态
const formDisabled = computed(() => elForm?.disabled ?? false);

// ✅ 内部显示值（name）
const displayValue = ref(props.modelValue);
const inputRef = ref();

// ✅ 是否有值（id 或 name 任一存在即视为有值）
const hasValue = computed(() => {
  const hasName = !!displayValue.value;
  const hasId =
    props.modelValueId !== undefined &&
    props.modelValueId !== null &&
    props.modelValueId !== "";
  return hasName || hasId;
});

// ✅ 是否可清除：只读 / 禁用 / 无值 时不可清除
const canClear = computed(() => {
  if (props.readonly || props.disabled || formDisabled.value) return false;
  return hasValue.value;
});

// ✅ 关键：监听父组件传入的 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    displayValue.value = newVal || "";

    // 强制更新 el-input（解决 readonly 模式下的渲染问题）
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.ref?.dispatchEvent(new Event("input"));
      }
    });
  },
  { immediate: true } // 立即执行一次，确保初始化时就有值
);

const handlePick = () => {
  emit("pick");
};

// ✅ 清除：同时清除 id 和 name
const handleClear = () => {
  // 若已禁用则不响应（双保险）
  if (props.disabled || formDisabled.value) return;

  displayValue.value = "";
  emit("update:modelValue", "");
  emit("update:modelValueId", "");
  emit("clear");

  // 同步强制刷新一次 el-input
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.ref?.dispatchEvent(new Event("input"));
    }
  });
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
    cursor: pointer;
    transition: all 0.25s;

    .append-group {
      display: flex;
      align-items: center;
    }

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

    .clear-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      color: #fff;
      cursor: pointer;
      line-height: 1;
      border-left: 1px solid rgba(255, 255, 255, 0.28);
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.18);
      }
    }

    &:hover {
      background: linear-gradient(135deg, #66b1ff, #4ba8f8);
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.35);
    }
  }
}
</style>
