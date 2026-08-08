<script lang="ts">
export default {
  name: 'ProjectSelector',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";

// Props定义
interface Props {
  /** 选中值（支持v-model双向绑定） */
  modelValue?: string | number;
  /** 占位提示文本 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否可清空 */
  clearable?: boolean;
  /** 是否可搜索 */
  filterable?: boolean;
  /** 是否显示完整路径 */
  showAllLevels?: boolean;
  /** 组件宽度 */
  width?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  placeholder: "请选择项目",
  disabled: false,
  clearable: true,
  filterable: true,
  showAllLevels: false,
  width: "180px",
});

// Emits定义
const emit = defineEmits<{
  (e: "update:modelValue", value: string | number): void;
  (e: "change", value: string | number): void;
}>();

// 级联选项数据
const options = ref<any[]>([]);
// 加载状态
const loading = ref(false);

/**
 * 级联组件核心配置
 * 👇 这里设置显示的名称字段，必须和接口返回的字段名一致
 */
const cascaderProps = computed(() => ({
  expandTrigger: "hover" as const,
  emitPath: false,       // 只返回最后一级的值，不需要完整路径数组
  checkStrictly: false,  // 只能选最后一级，不允许选父节点
  value: "orgId",           // 值字段（提交用）
  label: "orgName",  // ✅ 显示名称字段（就是你接口里的分类名称字段）
  children: "children",  // 子节点字段
}));

// 加载分类数据
const loadOptions = async () => {
  // 已有数据则不重复请求
  if (options.value.length > 0) return;
  
  loading.value = true;
  try {
    // 直接调用公共函数，接口已返回树形结构数据，无需二次处理
    try {
      const res = await projectAreaApi.getSegMguProjList();
      if (res.code === 200) {
        options.value = res.data || [];
      }
    } catch (error) {
      console.error("获取项目列表失败:", error);
      options.value = [];
    }
  } finally {
    loading.value = false;
  }  
};

// 组件挂载时自动加载数据
onMounted(() => {
  loadOptions();
});

// 宽度样式计算
const wrapperStyle = computed(() => ({
  width: typeof props.width === "number" ? `${props.width}px` : props.width,
}));

// 处理值变化
const handleUpdate = (value: string | number) => {
  emit("update:modelValue", value);
  emit("change", value);
};
</script>

<template>
  <el-cascader
    :model-value="modelValue"
    :options="options"
    :props="cascaderProps"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :show-all-levels="showAllLevels"
    :style="wrapperStyle"
    popper-class="con-type-selector-popper"
    @update:model-value="handleUpdate"
  >
    <!-- 空状态插槽 -->
    <template #empty>
      <span v-if="loading" style="color: #909399;">加载中...</span>
      <span v-else style="color: #909399;">暂无项目，请检查权限</span>
    </template>
  </el-cascader>
</template>

<style lang="scss">
/* 全局样式：确保级联弹窗不被遮挡 */
.con-type-cascader-popper {
  z-index: 9999 !important;
}
</style>