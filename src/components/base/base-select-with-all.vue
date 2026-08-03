<script lang="ts">
// 关闭属性自动继承，改为手动把 $attrs 绑定到 ElSelect，避免重复绑定 model
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots, ref, watch, onMounted } from "vue";
import { ElSelect, ElOption } from "element-plus";

interface Opt {
  value: any;
  label: any;
}

/**
 * BaseSelectWithAll —— 在 el-select 基础上增加"全选"能力的封装组件。
 * 与原生 el-select 用法完全一致：v-model / multiple / @change / <el-option> 子节点等照旧。
 *
 * 设计要点（为什么稳定）：
 *  - "全选"用【前置的一个 el-option】实现，而非 #header 插槽，避免不同 EP 版本对 header 插槽的支持差异；
 *    组件本质就是原生 el-select + 多一个选项，弹层定位与原生完全一致。
 *  - modelValue 只走「:model-value + @update:model-value」这一条受控通道（modelValue 已声明为 prop，
 *    不会经 $attrs 二次透传），杜绝"双重绑定"导致的弹层重渲染 / 失焦清空。
 *
 * 额外能力：
 *  - select-all 属性：必须显式传才显示全选项（默认不显示）。
 *  - 多选时，将选中的 id、name 分别用分隔符串联，并写入指定字段：
 *      v-model:valueText="formData.xxx"  → 选中的 id 串联字符串
 *      v-model:labelText="formData.yyy"  → 选中的 name 串联字符串
 *  - 暴露 focus / blur，模板 ref 调用与原生 el-select 一致
 */
const props = withDefaults(
  defineProps<{
    modelValue?: any[];
    /** 所有可选值（仅用于"全选"）：优先用 allValues，否则扫描插槽 */
    allValues?: any[];
    /** 选项列表 {value,label}：传入后用于"全选"和"名称串联"，比扫描插槽更可靠（尤其异步加载） */
    options?: Opt[];
    /** 是否启用"全选"：必须显式传 select-all 才显示（默认不显示） */
    selectAll?: boolean;
    /** 全选项的特殊值，默认 __ALL__，避免与真实 value 冲突 */
    allValue?: any;
    /** id / name 串联的分隔符，默认英文逗号 */
    separator?: string;
    /** 选中的 id 串联字符串（v-model:valueText 写入目标） */
    valueText?: string;
    /** 选中的 name 串联字符串（v-model:labelText 写入目标） */
    labelText?: string;
  }>(),
  {
    // 默认空数组，避免 modelValue 为 undefined 时 el-select 内部状态异常
    modelValue: () => [],
    allValue: "__ALL__",
    separator: ",",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", val: any[]): void;
  (e: "change", val: any[]): void;
  /** 选中的 id 用分隔符串联后的字符串 */
  (e: "update:valueText", val: string): void;
  /** 选中的 name 用分隔符串联后的字符串 */
  (e: "update:labelText", val: string): void;
}>();

const attrs = useAttrs();
const slots = useSlots();

// 内部 el-select 实例，用于转发 focus / blur
const selectRef = ref<InstanceType<typeof ElSelect>>();

// 关键：把父级 v-model 的 modelValue / onUpdate:modelValue 从 $attrs 中剔除，
// 只由本组件统一经 :model-value + @update:model-value 这一条通道控制，
// 否则会出现双重绑定，导致内部 ElSelect 重复更新、Popper 弹层丢参照（左上角）。
const selectAttrs = computed(() => {
  // 过滤掉 model / change 相关，避免双重绑定 + change 双触发导致选中被覆盖
  const {
    modelValue: _m,
    "onUpdate:modelValue": _u,
    onChange: _c,
    ...rest
  } = attrs as Record<string, any>;
  return rest;
});

const isMultiple = computed(
  () => attrs.multiple !== undefined && attrs.multiple !== false,
);

// 选项来源：优先 options 属性，否则从插槽 <el-option> 扫描
const allOptions = computed<Opt[]>(() => {
  if (props.options && props.options.length) return props.options;
  return extractOptions();
});

const allValues = computed<any[]>(() => {
  if (props.allValues && props.allValues.length) return props.allValues;
  return allOptions.value.map((o) => o.value);
});

const optionMap = computed(() => {
  const m = new Map<any, any>();
  for (const o of allOptions.value) m.set(o.value, o.label);
  return m;
});

function extractOptions(): Opt[] {
  const defaultSlot = slots.default;
  if (!defaultSlot) return [];
  const list: Opt[] = [];
  const walk = (nodes: any) => {
    if (!nodes) return;
    const arr = Array.isArray(nodes) ? nodes : [nodes];
    for (const vn of arr) {
      if (!vn) continue;
      const t = vn.type;
      const isOption =
        t === ElOption ||
        (t && (t.name === "ElOption" || t.__name === "ElOption"));
      if (isOption && vn.props && vn.props.value !== undefined) {
        list.push({ value: vn.props.value, label: vn.props.label });
      }
      if (Array.isArray(vn.children)) {
        walk(vn.children);
      } else if (typeof vn.children === "function") {
        walk(vn.children());
      }
    }
  };
  walk(defaultSlot());
  return list;
}

// 是否展示"全选"选项：多选 + 有选项 + 显式开启 + 用户未自定义 header 插槽
const showSelectAllOption = computed(
  () =>
    isMultiple.value &&
    allValues.value.length > 0 &&
    props.selectAll === true &&
    !slots.header,
);

// 选中的 id / name 分别串联（依赖 modelValue 与选项，选项异步加载后会自动重算）
const texts = computed(() => {
  const sep = props.separator;
  const raw = Array.isArray(props.modelValue) ? props.modelValue : [];
  const vals = raw.filter((v) => v !== props.allValue);
  const valueText = vals.map((v) => String(v)).join(sep);
  const labelText = vals
    .map((v) => {
      const lbl = optionMap.value.get(v);
      return lbl === undefined || lbl === null ? String(v) : String(lbl);
    })
    .join(sep);
  return { valueText, labelText };
});

function emitTexts() {
  emit("update:valueText", texts.value.valueText);
  emit("update:labelText", texts.value.labelText);
}

// 选项或选中变化后，同步串联字符串到父级指定字段
watch(texts, emitTexts);
// 初始（mounted 时父级 v-model 监听已就绪，避免 setup 期 emit 被漏接）
onMounted(emitTexts);

// 唯一出口：只走这一条通道把新值回传给父级
function onUpdate(val: any[]) {
  const next = Array.isArray(val) ? val : [];
  const ALL = props.allValue;

  // 全选选项被点击：根据"真实项是否已全选"决定 → 全选或清空
  if (next.includes(ALL)) {
    const realVals = allValues.value;
    const realSelected = next.filter((v) => v !== ALL);
    const result =
      realSelected.length === realVals.length ? [] : [...realVals];
    emit("update:modelValue", result);
    emit("change", result);
    return;
  }

  // 普通选项：原样透传，不做任何拦截
  emit("update:modelValue", next);
  emit("change", next);
}

// 暴露 el-select 的 focus / blur，使 ref 调用与原生完全一致
defineExpose({
  focus: (...args: any[]) => (selectRef.value as any)?.focus(...args),
  blur: (...args: any[]) => (selectRef.value as any)?.blur(...args),
});
</script>

<template>
  <ElSelect
    ref="selectRef"
    v-bind="selectAttrs"
    :model-value="modelValue"
    @update:model-value="onUpdate"
  >
    <!-- “全选”作为前置的一个普通选项，兼容性最好，不依赖 #header 插槽 -->
    <ElOption v-if="showSelectAllOption" label="全选" :value="allValue" />

    <!-- 原有选项（el-option 子节点）原样透传 -->
    <slot />

    <!-- 其余具名插槽透传，保证原功能不受影响 -->
    <template v-if="$slots.prefix" #prefix><slot name="prefix" /></template>
    <template v-if="$slots.empty" #empty><slot name="empty" /></template>
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
    <template v-if="$slots.tag" #tag="scope">
      <slot name="tag" v-bind="scope" />
    </template>
    <template v-if="$slots.loading" #loading>
      <slot name="loading" />
    </template>
  </ElSelect>
</template>
