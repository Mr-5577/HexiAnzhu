<!-- 可编辑表格，在基础表格组件上二次封装为可编辑表格 -->
<template>
  <base-table
    ref="baseTableRef"
    v-bind="$attrs"
    :columns="enhancedColumns"
    :table-data="editableData"
    :dict-data="dictData"
    :row-key="rowKey"
    :tree-props="treeProps"
    :default-expand-all="defaultExpandAll"
    :lazy="lazy"
    :load="load"
    @cell-event="handleCellEvent"
  >
    <!-- 透传所有插槽 -->
    <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
      <slot :name="name" v-bind="scope" />
    </template>

    <!-- 可编辑单元格插槽 -->
    <template #editable-cell="{ row, column, $index }">
      <!-- 优先使用自定义编辑插槽（命名规则：edit-{prop}） -->
      <slot
        :name="`edit-${column.prop}`"
        :row="row"
        :column="column"
        :index="$index"
        :update="(value: any) => updateCell(row, column, $index, value)"
      >
        <!-- 默认编辑组件 -->
        <div class="inline-editor" @click.stop>
          <!-- 如果是 clickable 类型，使用带弹窗的 input 框 -->
          <div v-if="column.clickable" class="clickable-input-wrapper">
            <el-input
              :model-value="row[column.prop]"
              :placeholder="column.placeholder || '请选择'"
              size="small"
              :disabled="getColumnDisabled(column, row)"
              readonly
              class="clickable-input"
              @click.stop="handleCellClick(row, column, $index)"
            >
            </el-input>
          </div>
          <template v-else>
            <!-- 输入框 -->
            <el-input
              v-if="column.editType === 'input'"
              v-model="row[column.prop]"
              size="small"
              :disabled="getColumnDisabled(column, row)"
              :placeholder="column.placeholder || '请输入'"
              @change="handleSave(row, column, $index)"
            />

            <!-- 选择器 -->
            <el-select
              v-else-if="column.editType === 'select'"
              v-model="row[column.prop]"
              size="small"
              :disabled="getColumnDisabled(column, row)"
              :placeholder="column.placeholder || '请选择'"
              :multiple="column.multiple || false"
              :collapse-tags="column.collapseTags || true"
              :clearable="column.clearable !== false"
              @change="handleSave(row, column, $index)"
            >
              <el-option
                v-for="opt in getColumnOptions(column, row)"
                :key="getOptionValue(column, opt)"
                :label="getOptionLabel(column, opt)"
                :value="getOptionValue(column, opt)"
              />
            </el-select>

            <!-- 级联选择器 -->
            <el-cascader
              v-else-if="column.editType === 'cascader'"
              v-model="row[column.prop]"
              size="small"
              :disabled="getColumnDisabled(column, row)"
              :placeholder="column.placeholder || '请选择'"
              :options="getColumnOptions(column, row)"
              :props="getCascaderProps(column)"
              :clearable="column.clearable !== false"
              :show-all-levels="column.showAllLevels !== false"
              :collapse-tags="column.collapseTags || false"
              :filterable="
                column.filterable !== undefined
                  ? column.filterable
                  : column.cascaderProps?.filterable || false
              "
              :filter-method="
                column.filterMethod || column.cascaderProps?.filterMethod
              "
              @change="handleSave(row, column, $index)"
            />

            <!-- 数字输入 -->
            <el-input-number
              v-else-if="column.editType === 'number'"
              v-model="row[column.prop]"
              size="small"
              :disabled="getColumnDisabled(column, row)"
              controls-position="right"
              :controls="false"
              :precision="getNumberPrecision(column)"
              :min="column.getMin ? column.getMin(row) : (column.min ?? 0)"
              :max="
                column.getMax ? column.getMax(row) : (column.max ?? 999999999)
              "
              :placeholder="column.placeholder || '请输入'"
              :formatter="
                (value: any) =>
                  column.thousandSeparator
                    ? formatThousand(value, column)
                    : value
              "
              :parser="
                (value: string) =>
                  column.thousandSeparator ? parseThousand(value) : value
              "
              @change="handleSave(row, column, $index)"
            >
              <template v-if="column.prefix" #prefix>
                <span class="input-prefix-inner">{{ column.prefix }}</span>
              </template>
            </el-input-number>

            <!-- 文本域 -->
            <el-input
              v-else-if="column.editType === 'textarea'"
              v-model="row[column.prop]"
              type="textarea"
              :rows="2"
              size="small"
              :disabled="getColumnDisabled(column, row)"
              :placeholder="column.placeholder || '请输入'"
              @change="handleSave(row, column, $index)"
            />

            <!-- 日期 -->
            <el-date-picker
              v-else-if="column.editType === 'date'"
              v-model="row[column.prop]"
              type="date"
              size="small"
              :disabled="getColumnDisabled(column, row)"
              :placeholder="column.placeholder || '请选择日期'"
              value-format="YYYY-MM-DD"
              @change="handleSave(row, column, $index)"
            />

            <!-- 日期时间 -->
            <el-date-picker
              v-else-if="column.editType === 'datetime'"
              v-model="row[column.prop]"
              type="datetime"
              size="small"
              :disabled="getColumnDisabled(column, row)"
              :placeholder="column.placeholder || '请选择时间'"
              value-format="YYYY-MM-DD HH:mm:ss"
              @change="handleSave(row, column, $index)"
            />

            <!-- 开关 -->
            <el-switch
              v-else-if="column.editType === 'switch'"
              v-model="row[column.prop]"
              size="small"
              :disabled="getColumnDisabled(column, row)"
              @change="handleSave(row, column, $index)"
            />

            <!-- 单选 -->
            <el-radio-group
              v-else-if="column.editType === 'radio'"
              v-model="row[column.prop]"
              size="small"
              :disabled="getColumnDisabled(column, row)"
              @change="handleSave(row, column, $index)"
            >
              <el-radio
                v-for="opt in getColumnOptions(column, row)"
                :key="getOptionValue(column, opt)"
                :value="getOptionValue(column, opt)"
              >
                {{ getOptionLabel(column, opt) }}
              </el-radio>
            </el-radio-group>

            <!-- 默认输入框 -->
            <el-input
              v-else
              v-model="row[column.prop]"
              size="small"
              :disabled="getColumnDisabled(column, row)"
              :placeholder="column.placeholder || '请输入'"
              @change="handleSave(row, column, $index)"
            />
          </template>
        </div>
      </slot>
    </template>
  </base-table>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  shallowRef,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { ElMessage } from "element-plus";
import BaseTable from "./base-table.vue";
import type { TableColumnItem, DictData } from "./base-table.vue";

/**
 * <!-- 方式一：只用 v-model（推荐） -->
 * <editable-table v-model="tableData" />
 *
 * <!-- 方式二：只用 :table-data + @update -->
 * <editable-table :table-data="tableData" @update:table-data="tableData = $event" />
 *
 * <!-- 方式三：用 v-model:table-data（等价于方式二） -->
 * <editable-table v-model:table-data="tableData" />
 */

// Props - 支持 v-model 和传统方式
interface Props {
  /** 表格数据（v-model 方式） */
  modelValue?: any[];
  /** 表格数据（传统方式，兼容旧代码） */
  tableData?: any[];
  /** 列配置 */
  columns: EditableColumn[];
  /** 行数据的唯一标识字段 */
  rowKey?: string;
  /** 数据字典对象 */
  dictData?: DictData;
  /** 全局选项标签字段名，默认 'label' */
  globalOptionLabelField?: string;
  /** 全局选项值字段名，默认 'value' */
  globalOptionValueField?: string;
  /** 保存回调 */
  onSave?: (data: {
    row: any;
    column: string;
    newValue: any;
    oldValue: any;
    rowIndex: number;
  }) => Promise<void> | void;
  /** 树形配置 */
  treeProps?: {
    children?: string;
    hasChildren?: string;
  };
  /** 是否默认展开所有节点 */
  defaultExpandAll?: boolean;
  /** 是否懒加载 */
  lazy?: boolean;
  /** 懒加载方法 */
  load?: (row: any, treeNode: any, resolve: (data: any[]) => void) => void;
}

// 扩展列配置
export interface EditableColumn extends TableColumnItem {
  /** 是否可编辑 */
  editable?: boolean;
  /** 编辑类型 */
  editType?:
    | "input"
    | "select"
    | "cascader"
    | "number"
    | "textarea"
    | "date"
    | "datetime"
    | "switch"
    | "radio";
  /** 占位符 */
  placeholder?: string;
  /** 选项列表（用于 select/radio/cascader）- 支持静态数组或动态函数 */
  options?: Array<any> | ((row: any) => Array<any>);
  /** 选项的标签字段名，默认 'label' */
  optionLabelField?: string;
  /** 选项的值字段名，默认 'value' */
  optionValueField?: string;
  /** 是否多选（仅 select 类型有效） */
  multiple?: boolean;
  /** 多选时是否折叠标签 */
  collapseTags?: boolean;
  /** 是否可清空 */
  clearable?: boolean;
  /** 数字精度（小数位数），不设置或设置为0表示整数 */
  precision?: number;
  /** 动态获取选项的函数（优先级高于 options） */
  getOptions?: (row: any) => Array<any>;
  /** 子列配置（递归支持多级表头） */
  children?: EditableColumn[];
  /** 禁用状态（支持函数） */
  disabled?: boolean | ((row: any) => boolean);
  /** 点击事件处理（用于可点击列） */
  clickable?: boolean;
  /** 点击回调函数 */
  onClick?: (row: any, column: EditableColumn, index: number) => void;
  /** 级联选择器配置 */
  cascaderProps?: {
    /** 指定选项的子树为选项对象的某个属性值 */
    children?: string;
    /** 指定选项的标签为选项对象的某个属性值 */
    label?: string;
    /** 指定选项的值为选项对象的某个属性值 */
    value?: string;
    /** 是否可多选 */
    multiple?: boolean;
    /** 是否严格遵守 leetcode 模式 */
    strict?: boolean;
    /** 是否可搜索 */
    filterable?: boolean;
    /** 是否允许创建新条目 */
    allowCreate?: boolean;
    /** 是否只返回叶子节点的值 */
    emitPath?: boolean;
    /** 是否仅显示最后一级 */
    showAllLevels?: boolean;
  };
  /** 是否显示所有层级（仅 cascader 类型有效） */
  showAllLevels?: boolean;
  /** 数字输入最小值 */
  min?: number;
  /** 数字输入最大值 */
  max?: number;
  /** 动态获取最小值（优先级高于 min） */
  getMin?: (row: any) => number;
  /** 动态获取最大值（优先级高于 max） */
  getMax?: (row: any) => number;
}

// Emits
interface Emits {
  (e: "update:modelValue", data: any[]): void;
  (e: "update:tableData", data: any[]): void; // 保留兼容
  (
    e: "data-change",
    data: {
      row: any;
      column: string;
      newValue: any;
      oldValue: any;
      rowIndex: number;
    },
  ): void;
  (e: "editable-cell-click", payload: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  tableData: () => [],
  rowKey: "id",
  dictData: () => ({}),
  globalOptionLabelField: "label",
  globalOptionValueField: "value",
  treeProps: () => ({ children: "children" }),
  defaultExpandAll: false,
  lazy: false,
});

const emit = defineEmits<Emits>();

const baseTableRef = ref<InstanceType<typeof BaseTable>>();

// ★★★ 优化1：使用 shallowRef 管理数据，避免深度响应式追踪 ★★★
const editableData = shallowRef<any[]>([]);

// ★★★ 优化2：使用 shallowRef 管理列配置 ★★★
const enhancedColumns = shallowRef<EditableColumn[]>([]);

// ★★★ 优化3：旧值存储使用 Map 提升查找性能 ★★★
const oldValueMap = new Map<string, any>();

// ★★★ 优化4：选项缓存，避免重复计算 ★★★
const optionsCache = new Map<string, any[]>();
const MAX_CACHE_SIZE = 1000; // 缓存最大容量

// ★★★ 优化5：防抖保存，避免频繁触发 ★★★
let saveTimer: ReturnType<typeof setTimeout> | null = null;

// ★★★ 优化6：标记是否正在更新数据，避免循环触发 ★★★
let isUpdating = false;

// ★★★ 优化7：缓存可编辑列配置 ★★★
let cachedEditableColumns: EditableColumn[] = [];
let cachedColumnsHash = "";

/**
 * 获取实际数据源
 */
const getActualData = (): any[] => {
  // 优先使用 modelValue（v-model 方式）
  if (props.modelValue !== undefined && props.modelValue.length >= 0) {
    return props.modelValue;
  }
  // 兼容传统的 tableData
  return props.tableData;
};

/**
 * 清理选项缓存（超过最大容量时清理一半）
 */
const cleanOptionsCache = () => {
  if (optionsCache.size > MAX_CACHE_SIZE) {
    const keys = Array.from(optionsCache.keys());
    const half = Math.floor(keys.length / 2);
    for (let i = 0; i < half; i++) {
      optionsCache.delete(keys[i]);
    }
  }
};

/**
 * 获取选项缓存键
 */
const getOptionsCacheKey = (column: EditableColumn, row?: any): string => {
  const rowId = row?.[props.rowKey] || "default";
  return `${column.prop}_${rowId}`;
};

/**
 * 清除选项缓存
 */
const clearOptionsCache = () => {
  optionsCache.clear();
};

// 千分位格式化
const formatThousand = (value: any, column: EditableColumn): string => {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "";
  const precision = column.precision !== undefined ? column.precision : 2;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: precision > 0 ? precision : 0,
    maximumFractionDigits: precision > 0 ? precision : 0,
  });
};

// 解析千分位
const parseThousand = (value: string): string => {
  if (!value) return "";
  return value.replace(/,/g, "");
};

/**
 * 获取列的 disabled 状态（支持布尔值或函数）
 */
const getColumnDisabled = (column: EditableColumn, row: any): boolean => {
  if (typeof column.disabled === "function") {
    return column.disabled(row);
  }
  return column.disabled || false;
};

/**
 * 生成存储 key
 */
const getValueKey = (row: any, prop: string): string => {
  const rowId = row[props.rowKey];
  return `${rowId}_${prop}`;
};

/**
 * 获取旧值
 */
const getOldValue = (row: any, prop: string): any => {
  return oldValueMap.get(getValueKey(row, prop));
};

/**
 * 设置旧值
 */
const setOldValue = (row: any, prop: string, value: any) => {
  const key = getValueKey(row, prop);
  if (!oldValueMap.has(key)) {
    oldValueMap.set(key, value);
  }
};

/**
 * 清除旧值
 */
const clearOldValue = (row: any, prop: string) => {
  const key = getValueKey(row, prop);
  oldValueMap.delete(key);
};

/**
 * 清除所有旧值
 */
const clearAllOldValues = () => {
  oldValueMap.clear();
};

/**
 * 获取选项的标签字段名
 */
const getOptionLabelField = (column: EditableColumn): string => {
  return column.optionLabelField || props.globalOptionLabelField;
};

/**
 * 获取选项的值字段名
 */
const getOptionValueField = (column: EditableColumn): string => {
  return column.optionValueField || props.globalOptionValueField;
};

/**
 * 获取选项的标签
 */
const getOptionLabel = (column: EditableColumn, option: any): string => {
  const labelField = getOptionLabelField(column);
  return option[labelField];
};

/**
 * 获取选项的值
 */
const getOptionValue = (column: EditableColumn, option: any): any => {
  const valueField = getOptionValueField(column);
  return option[valueField];
};

/**
 * 获取列的所有选项（带缓存）
 */
const getColumnOptions = (column: EditableColumn, row?: any): any[] => {
  const cacheKey = getOptionsCacheKey(column, row);

  // 检查缓存
  if (optionsCache.has(cacheKey)) {
    return optionsCache.get(cacheKey)!;
  }

  let options: any[] = [];
  // 优先使用 getOptions 动态函数
  if (column.getOptions && row) {
    options = column.getOptions(row);
  }
  // 其次使用 options
  else if (typeof column.options === "function") {
    options = column.options(row);
  } else if (Array.isArray(column.options)) {
    options = column.options;
  }

  // 缓存结果
  optionsCache.set(cacheKey, options);
  cleanOptionsCache();

  return options;
};

/**
 * 获取级联选择器的配置（使用缓存）
 */
const cascaderPropsCache = new Map<string, any>();

const getCascaderProps = (column: EditableColumn): any => {
  const defaultProps = {
    children: "children",
    label: "label",
    value: "value",
    emitPath: false,
  };

  if (column.cascaderProps) {
    const key = JSON.stringify(column.cascaderProps);
    if (cascaderPropsCache.has(key)) {
      return cascaderPropsCache.get(key);
    }
    const props = { ...defaultProps, ...column.cascaderProps };
    cascaderPropsCache.set(key, props);
    return props;
  }

  return defaultProps;
};

/**
 * 获取数字输入框的精度
 */
const getNumberPrecision = (column: EditableColumn): number | undefined => {
  if (column.precision !== undefined) {
    return column.precision > 0 ? column.precision : undefined;
  }
  return 2;
};

/**
 * ★★★ 优化8：递归处理列配置，使用浅拷贝减少开销 ★★★
 */
const processColumns = (columns: EditableColumn[]): EditableColumn[] => {
  return columns.map((col) => {
    // 如果有子列，递归处理
    if (col.children && col.children.length > 0) {
      return { ...col, children: processColumns(col.children) };
    }
    // 叶子节点：可编辑且没有自定义插槽时，使用 editable-cell 插槽
    if (col.prop && col.editable !== false && !col.slot) {
      return { ...col, slot: "editable-cell" };
    }
    return col;
  });
};

/**
 * 获取所有可编辑的叶子列（有 prop 且 editable !== false）
 */
const getEditableLeafColumns = (
  columns: EditableColumn[],
): EditableColumn[] => {
  const result: EditableColumn[] = [];
  const traverse = (cols: EditableColumn[]) => {
    for (const col of cols) {
      if (col.children && col.children.length > 0) {
        traverse(col.children);
      } else if (col.prop && col.editable !== false) {
        result.push(col);
      }
    }
  };
  traverse(columns);
  return result;
};

/**
 * ★★★ 优化9：获取缓存的可编辑列 ★★★
 */
const getCachedEditableColumns = (): EditableColumn[] => {
  const hash = props.columns.map((c) => c.prop).join(",");
  if (cachedColumnsHash !== hash) {
    cachedEditableColumns = getEditableLeafColumns(props.columns);
    cachedColumnsHash = hash;
    // 列配置变化时清除选项缓存
    clearOptionsCache();
  }
  return cachedEditableColumns;
};

/**
 * ★★★ 优化10：深拷贝树形数据 - 使用更高效的实现 ★★★
 */
const deepCloneTree = (data: any[]): any[] => {
  if (!data || !data.length) return [];

  // 使用 map 代替 forEach，利用返回值优化
  return data.map((item) => {
    const cloned: any = { ...item };
    if (
      item.children &&
      Array.isArray(item.children) &&
      item.children.length > 0
    ) {
      cloned.children = deepCloneTree(item.children);
    }
    return cloned;
  });
};

/**
 * ★★★ 优化11：增量初始化旧值 - 只初始化新增或变化的行 ★★★
 */
const initOldValuesForRow = (row: any, columns: EditableColumn[]) => {
  columns.forEach((col) => {
    if (col.prop) {
      setOldValue(row, col.prop, row[col.prop]);
    }
  });
  // 递归处理子节点
  if (row.children && Array.isArray(row.children) && row.children.length > 0) {
    row.children.forEach((child: any) => initOldValuesForRow(child, columns));
  }
};

/**
 * 初始化所有旧值
 */
const initOldValues = (data?: any[]) => {
  const targetData = data || editableData.value;
  if (!targetData || targetData.length === 0) return;

  const editableColumns = getCachedEditableColumns();
  if (editableColumns.length === 0) return;

  // 递归遍历树形数据
  const traverse = (items: any[]) => {
    items.forEach((row) => {
      initOldValuesForRow(row, editableColumns);
    });
  };

  traverse(targetData);
};

/**
 * ★★★ 优化12：触发数据更新 - 使用 nextTick 合并更新 ★★★
 */
const emitDataUpdate = () => {
  if (isUpdating) return;
  isUpdating = true;

  nextTick(() => {
    const data = editableData.value;
    // 优先使用 v-model 方式
    if (props.modelValue !== undefined) {
      emit("update:modelValue", data);
    }
    // 同时兼容传统方式
    emit("update:tableData", data);
    isUpdating = false;
  });
};

/**
 * ★★★ 优化13：防抖保存函数 ★★★
 */
const debouncedSave = (
  row: any,
  prop: string,
  rowIndex: number,
  value: any,
) => {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(() => {
    if (props.onSave) {
      const oldValue = getOldValue(row, prop);
      props
        .onSave({
          row,
          column: prop,
          newValue: value,
          oldValue,
          rowIndex,
        })
    }
    saveTimer = null;
  }, 300);
};

/**
 * ★★★ 优化14：更新单元格数据 ★★★
 */
const updateCell = async (
  row: any,
  column: EditableColumn,
  rowIndex: number,
  newValue: any,
) => {
  const prop = column.prop!;
  const oldValue = getOldValue(row, prop);

  // 比较值是否变化
  let isValueChanged = true;
  if (column.editType === "cascader") {
    if (Array.isArray(newValue) && Array.isArray(oldValue)) {
      isValueChanged = JSON.stringify(newValue) !== JSON.stringify(oldValue);
    } else {
      isValueChanged = newValue !== oldValue;
    }
  } else {
    isValueChanged = newValue !== oldValue;
  }

  if (!isValueChanged) {
    clearOldValue(row, prop);
    return;
  }

  // 调用外部保存方法（异步）
  if (props.onSave) {
    try {
      await props.onSave({
        row,
        column: prop,
        newValue,
        oldValue,
        rowIndex,
      });
    } catch (error: any) {
      ElMessage.error(error.message || "保存失败");
      // 保存失败，恢复原值
      row[prop] = oldValue;
      clearOldValue(row, prop);
      return;
    }
  }

  // 触发事件
  emit("data-change", {
    row,
    column: prop,
    newValue,
    oldValue,
    rowIndex,
  });

  // ★★★ 关键优化：只更新数据引用，不深拷贝 ★★★
  const currentData = editableData.value;
  // 如果是树形数据，需要更新整个引用
  if (currentData.length > 0) {
    // 使用浅拷贝替换引用，触发视图更新
    editableData.value = [...currentData];
  }

  // 更新旧值为新值
  setOldValue(row, prop, newValue);

  // 触发数据更新
  emitDataUpdate();
};

/**
 * 保存单元格（内置组件使用）
 */
const handleSave = (row: any, column: EditableColumn, rowIndex: number) => {
  const prop = column.prop!;
  let value = row[prop];

  // 如果是数字类型且值为空，转为 0
  if (column.editType === "number") {
    if (value === null || value === undefined || value === "") {
      value = column.defaultValue ?? 0;
      row[prop] = value;
    }
    if (typeof value !== "number") {
      value = Number(value) || 0;
      row[prop] = value;
    }
  }

  // 使用防抖保存
  debouncedSave(row, prop, rowIndex, value);
  updateCell(row, column, rowIndex, value);
};

// 处理单元格事件（透传给父组件）
const handleCellEvent = (payload: any) => {
  // 转发给父组件
  emit("editable-cell-click", payload);
};

/**
 * 可编辑单元格点击事件触发事件
 */
const handleCellClick = (
  row: any,
  column: EditableColumn,
  rowIndex: number,
) => {
  emit("editable-cell-click", { row, column, rowIndex });
};

// ★★★ 优化15：监听实际数据源 - 使用浅监听 + 手动 diff ★★★
watch(
  () => getActualData(),
  (newData, oldData) => {
    // 如果数据没有变化，不处理
    if (newData === oldData) return;

    if (newData && newData.length) {
      // ★★★ 使用深拷贝保持树形结构 ★★★
      const clonedData = deepCloneTree(newData);
      editableData.value = clonedData;
      // 重新初始化旧值
      initOldValues(clonedData);
    } else {
      editableData.value = [];
      clearAllOldValues();
    }
  },
  { immediate: true }, // 移除 deep: true
);

// ★★★ 优化16：监听列配置变化 ★★★
watch(
  () => props.columns,
  () => {
    // 清空缓存
    cachedColumnsHash = "";
    clearOptionsCache();
    // 重新处理列配置
    enhancedColumns.value = processColumns(props.columns);
    // 重新初始化旧值
    if (editableData.value.length) {
      initOldValues();
    }
  },
  { immediate: true, deep: false }, // 使用浅监听
);

// ★★★ 优化17：组件卸载时清理资源 ★★★
onBeforeUnmount(() => {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  clearAllOldValues();
  clearOptionsCache();
  cascaderPropsCache.clear();
});

// ★★★ 优化18：暴露方法给父组件 ★★★
defineExpose({
  /** 获取当前编辑中的数据 */
  getData: () => editableData.value,
  /** 刷新数据 */
  refresh: () => {
    const actualData = getActualData();
    if (actualData && actualData.length) {
      const clonedData = deepCloneTree(actualData);
      editableData.value = clonedData;
      initOldValues(clonedData);
    }
  },
  /** 获取 BaseTable 实例 */
  getTableRef: () => baseTableRef.value,
  /** 手动更新某个单元格 */
  updateCell,
  /** 清除所有修改记录 */
  clearChanges: () => {
    clearAllOldValues();
    clearOptionsCache();
    if (editableData.value.length) {
      initOldValues();
    }
  },
});
</script>

<style lang="scss" scoped>
.inline-editor {
  width: 100%;
  margin: -2px 0;

  // 统一所有编辑组件的基础样式
  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper),
  :deep(.el-cascader .el-input__wrapper),
  :deep(.el-date-editor .el-input__wrapper),
  :deep(.el-input-number .el-input__wrapper) {
    border-radius: 0;
    padding: 0 8px;
    height: 28px;
  }

  // 输入框基础样式
  :deep(.el-input__inner) {
    height: 28px;
    line-height: 28px;
  }

  // 数字输入框样式
  :deep(.el-input-number) {
    width: 100%;

    .el-input-number__wrapper {
      padding: 0;
      border-radius: 0;
      height: 28px;
    }

    .el-input-number__increase,
    .el-input-number__decrease {
      display: none;
    }
  }

  // 选择器样式
  :deep(.el-select) {
    width: 100%;

    .el-select__wrapper {
      border-radius: 0;
      padding: 0 8px;
      height: 28px;
    }

    .el-select__caret {
      line-height: 28px;
    }
  }

  // 级联选择器样式
  :deep(.el-cascader) {
    width: 100%;

    .el-input__wrapper {
      border-radius: 0;
      padding: 0 8px;
      height: 28px;
    }

    .el-input__suffix {
      display: flex;
      align-items: center;
    }
  }

  // 日期选择器样式
  :deep(.el-date-editor) {
    width: 100%;
    height: 28px;
    .el-date__wrapper,
    .el-input__wrapper {
      width: 100%;
      border-radius: 0;
      padding: 0 8px;
      height: 28px;
    }

    .el-input__prefix {
      margin-right: 4px;
    }

    .el-input__suffix {
      margin-left: 4px;
    }
  }

  // 日期范围选择器样式
  :deep(.el-date-editor--daterange),
  :deep(.el-date-editor--timerange),
  :deep(.el-date-editor--datetimerange) {
    .el-input__wrapper {
      padding: 0 8px;

      .el-input__prefix {
        margin-right: 4px;
      }

      .el-range-input {
        height: 24px;
        font-size: 12px;
      }

      .el-range-separator {
        padding: 0 4px;
        line-height: 24px;
      }

      .el-input__suffix {
        margin-left: 4px;
      }
    }
  }

  // 文本域样式
  :deep(.el-textarea) {
    .el-textarea__inner {
      border-radius: 0;
      padding: 4px 8px;
      font-size: 12px;
      resize: vertical;
    }
  }

  // 开关样式调整
  :deep(.el-switch) {
    display: inline-flex;
    align-items: center;
    height: 28px;
  }

  // 单选组样式
  :deep(.el-radio-group) {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;

    .el-radio {
      margin-right: 0;
      height: auto;

      .el-radio__label {
        font-size: 12px;
      }
    }
  }

  // 可点击输入框样式
  .clickable-input-wrapper {
    :deep(.el-input__wrapper) {
      cursor: pointer;

      &:hover {
        // background-color: var(--el-fill-color);
      }
    }
  }
}
.input-prefix-inner {
  color: var(--el-text-color-regular);
  font-weight: 500;
  font-size: 12px;
}
// 表格单元格样式
:deep(.el-table) {
  .cell {
    padding: 0;
  }
}
</style>
