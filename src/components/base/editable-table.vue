<!-- 可编辑表格，在基础表格组件上二次封装为可编辑表格 -->
<template>
  <base-table
    ref="baseTableRef"
    v-bind="$attrs"
    :columns="enhancedColumns"
    :table-data="editableData"
    :dict-data="dictData"
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
              :disabled="column.disabled"
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
              :disabled="column.disabled"
              :placeholder="column.placeholder"
              @blur="handleSave(row, column, $index)"
              @keyup.enter="handleSave(row, column, $index)"
            />

            <!-- 选择器 -->
            <el-select
              v-else-if="column.editType === 'select'"
              v-model="row[column.prop]"
              size="small"
              :disabled="column.disabled"
              :placeholder="column.placeholder"
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

            <!-- 数字输入 -->
            <el-input-number
              v-else-if="column.editType === 'number'"
              v-model="row[column.prop]"
              size="small"
              :disabled="column.disabled"
              controls-position="right"
              :controls="false"
              :precision="2"
              :min="0"
              :placeholder="column.placeholder"
              @change="handleSave(row, column, $index)"
            />

            <!-- 文本域 -->
            <el-input
              v-else-if="column.editType === 'textarea'"
              v-model="row[column.prop]"
              type="textarea"
              :rows="2"
              size="small"
              :disabled="column.disabled"
              :placeholder="column.placeholder"
              @blur="handleSave(row, column, $index)"
            />

            <!-- 日期 -->
            <el-date-picker
              v-else-if="column.editType === 'date'"
              v-model="row[column.prop]"
              type="date"
              size="small"
              :disabled="column.disabled"
              :placeholder="column.placeholder"
              value-format="YYYY-MM-DD"
              @change="handleSave(row, column, $index)"
            />

            <!-- 日期时间 -->
            <el-date-picker
              v-else-if="column.editType === 'datetime'"
              v-model="row[column.prop]"
              type="datetime"
              size="small"
              :disabled="column.disabled"
              :placeholder="column.placeholder"
              value-format="YYYY-MM-DD HH:mm:ss"
              @change="handleSave(row, column, $index)"
            />

            <!-- 开关 -->
            <el-switch
              v-else-if="column.editType === 'switch'"
              v-model="row[column.prop]"
              size="small"
              :disabled="column.disabled"
              @change="handleSave(row, column, $index)"
            />

            <!-- 单选 -->
            <el-radio-group
              v-else-if="column.editType === 'radio'"
              v-model="row[column.prop]"
              size="small"
              :disabled="column.disabled"
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
              :disabled="column.disabled"
              :placeholder="column.placeholder"
              @blur="handleSave(row, column, $index)"
              @keyup.enter="handleSave(row, column, $index)"
            />
          </template>
        </div>
      </slot>
    </template>
  </base-table>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import BaseTable from "./base-table.vue";
import type { TableColumnItem, DictData } from "./base-table.vue";

// 扩展列配置
export interface EditableColumn extends TableColumnItem {
  /** 是否可编辑 */
  editable?: boolean;
  /** 编辑类型 */
  editType?:
    | "input"
    | "select"
    | "number"
    | "textarea"
    | "date"
    | "datetime"
    | "switch"
    | "radio";
  /** 占位符 */
  placeholder?: string;
  /** 选项列表（用于 select/radio）- 支持静态数组或动态函数 */
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
  /** 动态获取选项的函数（优先级高于 options） */
  getOptions?: (row: any) => Array<any>;
  /** 子列配置（递归支持多级表头） */
  children?: EditableColumn[];
}

// Props
interface Props {
  /** 表格数据 */
  tableData: any[];
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
}

// Emits
interface Emits {
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
  (e: "update:tableData", data: any[]): void;
  (e: "editable-cell-click", payload: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: "id",
  dictData: () => ({}),
  globalOptionLabelField: "label",
  globalOptionValueField: "value",
});

const emit = defineEmits<Emits>();

const baseTableRef = ref<InstanceType<typeof BaseTable>>();
const editableData = ref<any[]>([]);

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

  return options;
};

/**
 * 递归处理列配置，为所有叶子节点（有 prop 属性的列）设置 editable-cell 插槽
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
 * 初始化所有旧值
 */
const initOldValues = () => {
  // 清空所有旧值
  clearAllOldValues();

  const editableColumns = getCachedEditableColumns();
  if (editableColumns.length === 0) return;

  editableData.value.forEach((row) => {
    editableColumns.forEach((col) => {
      if (col.prop) {
        setOldValue(row, col.prop, row[col.prop]);
      }
    });
  });
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

  // 没有旧值或值未变化，不处理
  // if (oldValue === undefined || newValue === oldValue) {
  //   clearOldValue(row, prop);
  //   return;
  // }
  if (newValue === oldValue) {
    clearOldValue(row, prop);
    return;
  }

  // 调用外部保存方法
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
  emit("update:tableData", editableData.value);

  // 更新旧值为新值，以便下次编辑时比较
  setOldValue(row, prop, newValue);
};

/**
 * 保存单元格（内置组件使用）
 */
const handleSave = (row: any, column: EditableColumn, rowIndex: number) => {
  updateCell(row, column, rowIndex, row[column.prop!]);
};

// 处理单元格事件（透传给父组件）
const handleCellEvent = (payload: any) => {
  // 可以在这里处理自定义事件
  console.log("cell-event:", payload);
};

const handleCellClick = (
  row: any,
  column: EditableColumn,
  rowIndex: number,
) => {
  emit("editable-cell-click", { row, column, rowIndex });
};

// 监听外部数据变化
watch(
  () => props.tableData,
  (newData) => {
    if (newData && newData.length) {
      // 浅拷贝，避免修改原数据
      editableData.value = newData.map((item) => ({ ...item }));
      // 重新初始化旧值
      initOldValues();
    } else {
      editableData.value = [];
      clearAllOldValues();
    }
  },
  { immediate: true },
);

// 监听列配置变化，重新初始化旧值
watch(
  () => props.columns,
  () => {
    // 清空缓存
    cachedColumnsHash = "";
    // 重新初始化旧值
    if (editableData.value.length) {
      initOldValues();
    }
  },
  { deep: false },
);

// 暴露方法给父组件
defineExpose({
  /** 获取当前编辑中的数据 */
  getData: () => editableData.value,
  /** 刷新数据 */
  refresh: () => {
    if (props.tableData) {
      editableData.value = props.tableData.map((item) => ({ ...item }));
      initOldValues();
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
});
</script>

<style lang="scss" scoped>
.inline-editor {
  width: 100%;
  margin: -2px 0;

  :deep(.el-input__wrapper),
  :deep(.el-select .el-input__wrapper) {
    border-radius: 0;
    padding: 0 8px;
    // 强制设置高度与单元格一致
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
  }
  // 选择器特殊样式处理
  :deep(.el-select) {
    width: 100%;

    // 确保 select 的输入包装器样式一致
    .el-select__wrapper {
      border-radius: 0;
      padding: 0 8px;
      height: 28px;
    }

    // 选择器图标位置调整
    .el-select__caret {
      line-height: 28px;
    }
  }
  // 日期选择器样式
  :deep(.el-date-editor) {
    width: 100%;

    .el-date__wrapper {
      border-radius: 0;
      padding: 0 8px;
      height: 28px;
    }
  }
}
:deep(.el-table) {
  .cell {
    padding: 0;
  }
}
</style>
