<!-- 可编辑表格，在基础表格组件上二次封装为可编辑表格 -->
<template>
  <base-table
    ref="baseTableRef"
    v-bind="$attrs"
    :columns="enhancedColumns"
    :table-data="editableData"
    :dict-data="dictData"
    @cell-event="handleCellEvent"
    @data-change="handleDataChange"
  >
    <!-- 透传所有插槽 -->
    <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
      <slot :name="name" v-bind="scope"></slot>
    </template>

    <!-- 可编辑单元格插槽 - 直接显示编辑组件 -->
    <template #editable-cell="{ row, column, $index }">
      <div class="inline-editor">
        <!-- 输入框 -->
        <el-input
          v-if="column.editType === 'input'"
          v-model="row[column.prop]"
          size="small"
          :placeholder="column.placeholder"
          @blur="handleCellChange(row, column, $index)"
          @keyup.enter="handleCellChange(row, column, $index)"
        />

        <!-- 选择器 -->
        <el-select
          v-else-if="column.editType === 'select'"
          v-model="row[column.prop]"
          size="small"
          :placeholder="column.placeholder"
          @change="handleCellChange(row, column, $index)"
        >
          <el-option
            v-for="opt in column.options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <!-- 数字输入 -->
        <el-input-number
          v-else-if="column.editType === 'number'"
          v-model="row[column.prop]"
          size="small"
          controls-position="right"
          @change="handleCellChange(row, column, $index)"
        />

        <!-- 文本域 -->
        <el-input
          v-else-if="column.editType === 'textarea'"
          v-model="row[column.prop]"
          type="textarea"
          :rows="3"
          size="small"
          :placeholder="column.placeholder"
          @blur="handleCellChange(row, column, $index)"
        />

        <!-- 日期 -->
        <el-date-picker
          v-else-if="column.editType === 'date'"
          v-model="row[column.prop]"
          type="date"
          size="small"
          :placeholder="column.placeholder"
          value-format="YYYY-MM-DD"
          @change="handleCellChange(row, column, $index)"
        />

        <!-- 日期时间 -->
        <el-date-picker
          v-else-if="column.editType === 'datetime'"
          v-model="row[column.prop]"
          type="datetime"
          size="small"
          :placeholder="column.placeholder"
          value-format="YYYY-MM-DD HH:mm:ss"
          @change="handleCellChange(row, column, $index)"
        />

        <!-- 开关 -->
        <el-switch
          v-else-if="column.editType === 'switch'"
          v-model="row[column.prop]"
          size="small"
          @change="handleCellChange(row, column, $index)"
        />

        <!-- 单选 -->
        <el-radio-group
          v-else-if="column.editType === 'radio'"
          v-model="row[column.prop]"
          size="small"
          @change="handleCellChange(row, column, $index)"
        >
          <el-radio
            v-for="opt in column.options"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </el-radio>
        </el-radio-group>

        <!-- 默认输入框 -->
        <el-input
          v-else
          v-model="row[column.prop]"
          size="small"
          @blur="handleCellChange(row, column, $index)"
          @keyup.enter="handleCellChange(row, column, $index)"
        />
      </div>
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
  /** 选项列表（用于 select/radio） */
  options?: Array<{ label: string; value: any }>;
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
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: "id",
  dictData: () => ({}),
});

const emit = defineEmits<Emits>();

const baseTableRef = ref<InstanceType<typeof BaseTable>>();
const editableData = ref<any[]>([]);

// 记录每次修改前的值，用于保存时传递 oldValue
const previousValues = ref<Map<number, Map<string, any>>>(new Map());

// 增强列配置：为可编辑列添加插槽
const enhancedColumns = computed(() => {
  return props.columns.map((col) => ({
    ...col,
    // 可编辑列使用 editable-cell 插槽
    slot: col.editable !== false ? "editable-cell" : col.slot,
  }));
});

// 保存修改前的值
const storePreviousValue = (rowIndex: number, column: string, value: any) => {
  if (!previousValues.value.has(rowIndex)) {
    previousValues.value.set(rowIndex, new Map());
  }
  const rowMap = previousValues.value.get(rowIndex)!;
  if (!rowMap.has(column)) {
    rowMap.set(column, value);
  }
};

// 获取修改前的值
const getPreviousValue = (rowIndex: number, column: string): any => {
  const rowMap = previousValues.value.get(rowIndex);
  return rowMap?.get(column);
};

// 清除修改前的值
const clearPreviousValue = (rowIndex: number, column: string) => {
  const rowMap = previousValues.value.get(rowIndex);
  if (rowMap) {
    rowMap.delete(column);
    if (rowMap.size === 0) {
      previousValues.value.delete(rowIndex);
    }
  }
};

// 处理单元格变化
const handleCellChange = async (
  row: any,
  column: EditableColumn,
  rowIndex: number,
) => {
  const newValue = row[column.prop!];
  const oldValue = getPreviousValue(rowIndex, column.prop!);

  // 如果没有旧值记录，说明是第一次修改，不保存
  if (oldValue === undefined) return;

  // 值没变，不处理
  if (newValue === oldValue) {
    clearPreviousValue(rowIndex, column.prop!);
    return;
  }

  // 调用外部保存方法
  if (props.onSave) {
    try {
      await props.onSave({
        row,
        column: column.prop!,
        newValue,
        oldValue,
        rowIndex,
      });
    } catch (error: any) {
      ElMessage.error(error.message || "保存失败");
      // 保存失败，恢复原值
      row[column.prop!] = oldValue;
      clearPreviousValue(rowIndex, column.prop!);
      return;
    }
  }

  // 触发事件
  emit("data-change", {
    row,
    column: column.prop!,
    newValue,
    oldValue,
    rowIndex,
  });
  emit("update:tableData", editableData.value);

  // 清除记录
  clearPreviousValue(rowIndex, column.prop!);
};

// 处理单元格事件
const handleCellEvent = (payload: any) => {
  // 可以在这里处理自定义事件
  console.log("cell-event:", payload);
};

// 处理数据变化（从 BaseTable 传递过来的）
const handleDataChange = (data: any) => {
  // 这个方法会在 BaseTable 内部数据变化时触发
  // 可以在这里做额外处理
  console.log("base-table data change:", data);
};

// 监听数据变化，记录初始值
watch(
  () => editableData.value,
  (newData, oldData) => {
    if (!newData) return;

    // 当数据源变化时，重新记录所有值
    if (oldData === undefined || newData.length !== oldData?.length) {
      previousValues.value.clear();
      newData.forEach((row, index) => {
        props.columns.forEach((col) => {
          if (col.editable !== false && col.prop) {
            storePreviousValue(index, col.prop, row[col.prop]);
          }
        });
      });
    }
  },
  { immediate: true, deep: true },
);

// 监听外部数据变化
watch(
  () => props.tableData,
  (newData) => {
    editableData.value = newData ? JSON.parse(JSON.stringify(newData)) : [];
  },
  { immediate: true, deep: true },
);

// 暴露方法
defineExpose({
  getData: () => editableData.value,
  refresh: () => {
    editableData.value = props.tableData
      ? JSON.parse(JSON.stringify(props.tableData))
      : [];
  },
  getTableRef: () => baseTableRef.value,
});
</script>

<style lang="scss" scoped>
.inline-editor {
  width: 100%;

  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-input-number),
  :deep(.el-date-picker) {
    width: 100%;
  }

  :deep(.el-textarea) {
    width: 100%;
  }

  :deep(.el-radio-group) {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  :deep(.el-radio) {
    margin-right: 0;
  }

  :deep(.el-switch) {
    display: flex;
    justify-content: center;
  }
}
</style>
