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
    :expand-row-keys="computedExpandRowKeys"
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
import { ref, computed, watch, nextTick } from "vue";
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
  /** 默认值 */
  defaultValue?: any;
  /** 千分位格式化 */
  thousandSeparator?: boolean;
  /** 前缀 */
  prefix?: string;
}

// Props
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
  /** 展开的行 keys（外部控制） */
  expandRowKeys?: string[];
  /** 是否懒加载 */
  lazy?: boolean;
  /** 懒加载方法 */
  load?: (row: any, treeNode: any, resolve: (data: any[]) => void) => void;
  /** 默认展开的层级（0: 不展开, 1: 仅第一层, 2: 第一层和第二层） */
  defaultExpandLevel?: number;
}

// Emits
interface Emits {
  (e: "update:modelValue", data: any[]): void;
  (e: "update:tableData", data: any[]): void;
  (e: "update:expandRowKeys", keys: string[]): void;
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
  expandRowKeys: () => [],
  lazy: false,
  defaultExpandLevel: 0,
});

const emit = defineEmits<Emits>();

const baseTableRef = ref<InstanceType<typeof BaseTable>>();
const editableData = ref<any[]>([]);

// ★★★ 核心：获取实际数据源 ★★★
const actualData = computed(() => {
  if (props.modelValue !== undefined && props.modelValue.length >= 0) {
    return props.modelValue;
  }
  return props.tableData;
});

// 内部展开行 keys
const internalExpandRowKeys = ref<string[]>([]);

// 计算最终的展开行 keys（合并外部传入和内部计算）
const computedExpandRowKeys = computed(() => {
  const externalKeys = props.expandRowKeys || [];
  const internalKeys = internalExpandRowKeys.value || [];

  // 如果外部传入了 expandRowKeys，优先使用外部
  if (externalKeys.length > 0) {
    return externalKeys;
  }

  // 否则使用内部计算的
  return internalKeys;
});

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

// 使用普通对象存储旧值，key 格式: "rowId_prop"
const oldValueMap: Record<string, any> = {};

// 生成存储 key
const getValueKey = (row: any, prop: string): string => {
  const rowId = row[props.rowKey];
  return `${rowId}_${prop}`;
};

// 获取旧值
const getOldValue = (row: any, prop: string): any => {
  return oldValueMap[getValueKey(row, prop)];
};

// 设置旧值
const setOldValue = (row: any, prop: string, value: any) => {
  const key = getValueKey(row, prop);
  if (!(key in oldValueMap)) {
    oldValueMap[key] = value;
  }
};

// 清除旧值
const clearOldValue = (row: any, prop: string) => {
  const key = getValueKey(row, prop);
  delete oldValueMap[key];
};

// 清除所有旧值
const clearAllOldValues = () => {
  Object.keys(oldValueMap).forEach((key) => delete oldValueMap[key]);
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
 * 获取列的所有选项
 */
const getColumnOptions = (column: EditableColumn, row?: any): any[] => {
  let options: any[] = [];
  if (column.getOptions && row) {
    options = column.getOptions(row);
  } else if (typeof column.options === "function") {
    options = column.options(row);
  } else if (Array.isArray(column.options)) {
    options = column.options;
  }
  return options;
};

/**
 * 获取级联选择器的配置
 */
const getCascaderProps = (column: EditableColumn): any => {
  const defaultProps = {
    children: "children",
    label: "label",
    value: "value",
    emitPath: false,
  };

  if (column.cascaderProps) {
    return { ...defaultProps, ...column.cascaderProps };
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
 * 递归处理列配置，为所有叶子节点（有 prop 属性的列）设置 editable-cell 插槽
 */
const processColumns = (columns: EditableColumn[]): EditableColumn[] => {
  return columns.map((col) => {
    if (col.children && col.children.length > 0) {
      return { ...col, children: processColumns(col.children) };
    }
    if (col.prop && col.editable !== false && !col.slot) {
      return { ...col, slot: "editable-cell" };
    }
    return col;
  });
};

// 增强列配置
const enhancedColumns = computed(() => processColumns(props.columns));

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

// 缓存可编辑列，避免重复计算
let cachedEditableColumns: EditableColumn[] = [];
let cachedColumnsHash = "";

const getCachedEditableColumns = (): EditableColumn[] => {
  const hash = JSON.stringify(props.columns.map((c) => c.prop));
  if (cachedColumnsHash !== hash) {
    cachedEditableColumns = getEditableLeafColumns(props.columns);
    cachedColumnsHash = hash;
  }
  return cachedEditableColumns;
};

/**
 * 深拷贝树形数据
 */
const deepCloneTree = (data: any[]): any[] => {
  if (!data || !data.length) return [];

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
 * 初始化所有旧值（递归处理树形数据）
 */
const initOldValues = () => {
  clearAllOldValues();

  const editableColumns = getCachedEditableColumns();
  if (editableColumns.length === 0) return;

  const traverse = (data: any[]) => {
    data.forEach((row) => {
      editableColumns.forEach((col) => {
        if (col.prop) {
          setOldValue(row, col.prop, row[col.prop]);
        }
      });
      if (
        row.children &&
        Array.isArray(row.children) &&
        row.children.length > 0
      ) {
        traverse(row.children);
      }
    });
  };

  traverse(editableData.value);
};

/**
 * ★★★ 核心：触发数据更新 ★★★
 */
const emitDataUpdate = () => {
  if (props.modelValue !== undefined) {
    emit("update:modelValue", editableData.value);
  }
  emit("update:tableData", editableData.value);
};

/**
 * 更新单元格数据（供自定义插槽和内置组件调用）
 */
const updateCell = async (
  row: any,
  column: EditableColumn,
  rowIndex: number,
  newValue: any,
) => {
  const prop = column.prop!;
  const oldValue = getOldValue(row, prop);

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
      row[prop] = oldValue;
      clearOldValue(row, prop);
      return;
    }
  }

  emit("data-change", {
    row,
    column: prop,
    newValue,
    oldValue,
    rowIndex,
  });

  emitDataUpdate();
  setOldValue(row, prop, newValue);
};

/**
 * 保存单元格（内置组件使用）
 */
const handleSave = (row: any, column: EditableColumn, rowIndex: number) => {
  const prop = column.prop!;
  let value = row[prop];

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

  updateCell(row, column, rowIndex, value);
};

// 处理单元格事件（透传给父组件）
const handleCellEvent = (payload: any) => {
  // 透传事件
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

/**
 * ★★★ 新增：获取树形数据中指定层级的所有节点ID ★★★
 */
const getExpandKeysByLevel = (
  treeData: any[],
  maxLevel: number = 2,
  childrenKey: string = "children",
): string[] => {
  const keys: string[] = [];

  const traverse = (nodes: any[], level: number = 1) => {
    if (level > maxLevel || !nodes?.length) return;

    for (const node of nodes) {
      const hasChildren = node[childrenKey] && node[childrenKey].length > 0;

      // 只有非叶子节点（有子节点）才需要展开
      if (hasChildren) {
        const id = node[props.rowKey] || node.id;
        if (id !== undefined && id !== null) {
          keys.push(String(id));
        }
        // 继续遍历下一层
        if (level < maxLevel) {
          traverse(node[childrenKey], level + 1);
        }
      }
    }
  };

  traverse(treeData);
  return keys;
};

/**
 * ★★★ 新增：初始化展开状态（根据 defaultExpandLevel） ★★★
 */
const initExpandState = () => {
  // ★★★ 关键：如果已经初始化过，直接返回 ★★★
  if (isExpandInitialized.value) {
    return;
  }

  const level = props.defaultExpandLevel || 0;
  if (level > 0 && editableData.value?.length) {
    const childrenKey = props.treeProps?.children || "children";
    const keys = getExpandKeysByLevel(editableData.value, level, childrenKey);
    internalExpandRowKeys.value = keys;

    // 如果外部需要同步，发出事件
    emit("update:expandRowKeys", keys);

    // 标记为已初始化
    isExpandInitialized.value = true;
  }
};
const isExpandInitialized = ref(false);
// ★★★ 监听实际数据源 ★★★
watch(
  () => actualData.value,
  (newData) => {
    if (newData && newData.length) {
      editableData.value = deepCloneTree(newData);
      initOldValues();
      // 数据加载完成后初始化展开状态
      nextTick(() => {
        initExpandState();
      });
    } else {
      editableData.value = [];
      clearAllOldValues();
      internalExpandRowKeys.value = [];
    }
  },
  { immediate: true, deep: true },
);

// 监听列配置变化，重新初始化旧值
watch(
  () => props.columns,
  () => {
    cachedColumnsHash = "";
    if (editableData.value.length) {
      initOldValues();
    }
  },
  { deep: false },
);

// 监听 defaultExpandLevel 变化
watch(
  () => props.defaultExpandLevel,
  () => {
    if (props.defaultExpandLevel > 0) {
      nextTick(() => {
        // initExpandState();
        if (props.defaultExpandLevel > 0 && !isExpandInitialized.value) {
          nextTick(() => {
            initExpandState();
          });
        }
      });
    }
  },
);

// 暴露方法给父组件
defineExpose({
  /** 获取当前编辑中的数据 */
  getData: () => editableData.value,
  /** 刷新数据 */
  refresh: () => {
    if (actualData.value) {
      editableData.value = deepCloneTree(actualData.value);
      initOldValues();
      nextTick(() => {
        initExpandState();
      });
    }
  },
  /** 获取 BaseTable 实例 */
  getTableRef: () => baseTableRef.value,
  /** 手动更新某个单元格 */
  updateCell,
  /** 清除所有修改记录 */
  clearChanges: () => {
    clearAllOldValues();
    initOldValues();
  },
  /** ★★★ 新增：展开指定层级的节点 ★★★ */
  expandToLevel: (level: number) => {
    if (editableData.value?.length) {
      const childrenKey = props.treeProps?.children || "children";
      const keys = getExpandKeysByLevel(editableData.value, level, childrenKey);
      internalExpandRowKeys.value = keys;
      emit("update:expandRowKeys", keys);
    }
  },
  /** ★★★ 新增：获取当前展开的 keys ★★★ */
  getExpandKeys: () => computedExpandRowKeys.value,
  /** ★★★ 新增：设置展开的 keys ★★★ */
  setExpandKeys: (keys: string[]) => {
    internalExpandRowKeys.value = keys;
    emit("update:expandRowKeys", keys);
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

  :deep(.el-input__inner) {
    height: 28px;
    line-height: 28px;
  }

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

  :deep(.el-textarea) {
    .el-textarea__inner {
      border-radius: 0;
      padding: 4px 8px;
      font-size: 12px;
      resize: vertical;
    }
  }

  :deep(.el-switch) {
    display: inline-flex;
    align-items: center;
    height: 28px;
  }

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

  .clickable-input-wrapper {
    :deep(.el-input__wrapper) {
      cursor: pointer;
    }
  }
}

.input-prefix-inner {
  color: var(--el-text-color-regular);
  font-weight: 500;
  font-size: 12px;
}

:deep(.el-table) {
  .cell {
    padding: 0;
  }
}
</style>
