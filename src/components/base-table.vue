<template>
  <div class="pro-table-container">
    <!-- 操作栏 -->
    <div class="action-bar" v-if="$slots.actionBar || showActionBar">
      <slot name="actionBar"></slot>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar" v-if="$slots.toolbar || showToolbar">
      <div class="left">
        <slot name="toolbar-left">
          <!-- 批量操作 -->
          <div class="batch-actions" v-if="selectedRows.length > 0">
            <span class="selected-count">
              已选择 {{ selectedRows.length }} 项
            </span>
            <el-button link type="primary" @click="handleClearSelection">
              清空
            </el-button>
          </div>
        </slot>
      </div>
      <div class="right">
        <slot name="toolbar-right">
          <!-- 列设置 -->
          <el-tooltip content="列设置">
            <el-button size="small" @click="handleColumnSetting">
              <el-icon><Setting /></el-icon>
            </el-button>
          </el-tooltip>

          <!-- 刷新 -->
          <el-tooltip content="刷新">
            <el-button size="small" @click="handleRefresh" :loading="loading">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
        </slot>
      </div>
    </div>

    <!-- 表格部分 -->
    <div class="table-wrapper" :style="tableWrapperStyle">
      <el-table
        ref="tableRef"
        :row-key="rowKey"
        v-bind="getTableProps"
        :data="tableData"
        v-loading="loading"
        :show-summary="showSummary"
        :summary-method="props.summaryMethod || defaultSummaryMethod"
        :default-expand-all="isExpandAll"
        element-loading-text="数据加载中..."
        element-loading-background="rgba(255, 255, 255, 0.8)"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <!-- 递归渲染多级表头 -->
        <template v-for="item in visibleColumns" :key="item.prop || item.type">
          <component
            :is="TableColumn"
            :column="item"
            :slots="$slots"
            :dict-data="dictData"
          />
        </template>

        <!-- 空状态 -->
        <template #empty>
          <div class="empty-container">
            <slot name="empty">
              <el-empty description="暂无数据" />
            </slot>
          </div>
        </template>
      </el-table>
    </div>

    <!-- 分页部分 -->
    <div class="pagination" v-if="pagination">
      <el-pagination
        :size="'small'"
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        :background="paginationBackground"
        @size-change="handlePageSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  useAttrs,
  watch,
  onMounted,
  onUnmounted,
  h,
  resolveComponent,
  useSlots,
  type VNode,
  type Slots,
} from "vue";
import type { TableInstance, Sort } from "element-plus";

// 定义列接口
export interface TableColumnItem {
  prop?: string;
  label?: string;
  type?: "selection" | "index" | "expand";
  width?: string | number;
  minWidth?: string | number;
  align?: "left" | "center" | "right";
  sortable?: boolean | "custom";
  fixed?: boolean | "left" | "right";
  showOverflowTooltip?: boolean;
  slot?: string;
  dict?: string;
  visible?: boolean;
  children?: TableColumnItem[];
  formatter?: (row: any, column: any, index: number) => any;
  [key: string]: any;
}

// 定义字典数据类型
interface DictItem {
  label: string;
  value: string | number;
  [key: string]: any;
}

interface DictData {
  [key: string]: DictItem[];
}

// 定义组件属性
interface Props {
  // 数据列
  columns: TableColumnItem[];
  // 表格数据
  tableData: any[];
  // 行数据的 Key
  rowKey?: string;
  // 是否带有纵向边框
  border?: boolean;
  // 是否为斑马纹 table
  stripe?: boolean;
  // Table 的尺寸
  size?: "large" | "default" | "small";
  height?: string | number;
  maxHeight?: string | number;
  // 是否自动高度
  autoHeight?: boolean;
  // 加载状态
  loading?: boolean;
  // 分页相关
  pagination?: boolean;
  total?: number;
  pageSize?: number;
  currentPage?: number;
  pageSizes?: number[];
  paginationLayout?: string;
  paginationBackground?: boolean;
  // 是否显示工具栏
  showToolbar?: boolean;
  // 是否显示操作栏
  showActionBar?: boolean;
  // 字典数据
  dictData?: DictData;
  // 是否默认展开所有行，当 Table 包含展开行存在或者为树形表格时有效
  isExpandAll?: boolean;
  // 是否显示合计列
  showSummary?: boolean;
  summaryMethod?: (params: { columns: any[]; data: any[] }) => string[];
}

// 定义组件事件
interface Emits {
  (event: "selection-change", value: any[]): void;
  (event: "sort-change", value: Sort): void;
  (event: "update:pageSize", value: number): void;
  (event: "update:currentPage", value: number): void;
  (
    event: "pagination-change",
    value: { pageSize: number; currentPage: number }
  ): void;
  (event: "refresh"): void;
}

// 递归列组件的 Props
interface TableColumnProps {
  column: TableColumnItem;
  slots: Slots;
  dictData: DictData;
}

// 使用 Vue 3 提供的 Slots 类型
type ComponentSlots = {
  [key: string]: (...args: any[]) => VNode[];
};

// 递归列组件
const TableColumn = {
  name: "TableColumn",
  props: {
    column: {
      type: Object as () => TableColumnItem,
      required: true,
    },
    slots: {
      type: Object,
      default: () => ({}),
    },
    dictData: {
      type: Object as () => DictData,
      default: () => ({}),
    },
  },
  setup(props: TableColumnProps & { slots: any }) {
    const getDictLabel = (dictKey: string, value: any): string => {
      const dict = props.dictData[dictKey];
      if (!dict) return String(value);
      const item = dict.find((item: DictItem) => item.value === value);
      return item ? item.label : String(value);
    };

    const renderColumn = (column: TableColumnItem): VNode => {
      // 选择列
      if (column.type === "selection") {
        return h(resolveComponent("el-table-column"), {
          type: "selection",
          width: "55",
          align: column.align || "center",
        });
      }

      // 序号列
      if (column.type === "index") {
        return h(resolveComponent("el-table-column"), {
          type: "index",
          align: column.align || "center",
          width: column.width || "80",
          label: column.label || "序号",
        });
      }

      // 可展开列
      if (column.type === "expand") {
        const expandSlot = props.slots[column.slot || "expand"];
        return h(
          resolveComponent("el-table-column"),
          {
            type: "expand",
            width: column.width,
          },
          {
            default: (scope: any) =>
              expandSlot
                ? expandSlot(scope)
                : h(
                    "span",
                    `Expand content for ${scope.row.id || scope.$index}`
                  ),
          }
        );
      }

      // 普通列或多级表头
      const columnProps: any = {
        prop: column.prop,
        label: column.label,
        width: column.width,
        minWidth: column.minWidth,
        align: column.align || "center",
        sortable: column.sortable || false,
        fixed: column.fixed,
        showOverflowTooltip: true, // 鼠标移入显示全部内容
      };

      // 如果有子列，递归渲染
      if (column.children && column.children.length > 0) {
        return h(resolveComponent("el-table-column"), columnProps, () =>
          column.children!.map((child) => renderColumn(child))
        );
      }

      // 普通列
      return h(resolveComponent("el-table-column"), columnProps, {
        default: (scope: any) => {
          // 自定义列内容
          if (column.slot) {
            const slotFunc = props.slots[column.slot];
            if (slotFunc) {
              return slotFunc(scope);
            }
          }

          // 格式化显示
          if (column.formatter) {
            return column.formatter(scope.row, scope.column, scope.$index);
          }

          // 字典值转换
          if (column.dict) {
            return getDictLabel(column.dict, scope.row[column.prop!]);
          }

          // 默认显示
          return scope.row[column.prop!];
        },
      });
    };

    return () => renderColumn(props.column);
  },
};

const $attrs = useAttrs();
const $slots = useSlots();

const props = withDefaults(defineProps<Props>(), {
  rowKey: "id",
  border: true,
  stripe: false,
  size: "default",
  autoHeight: true,
  loading: false,
  pagination: true,
  total: 0,
  pageSize: 10,
  currentPage: 1,
  pageSizes: () => [10, 20, 30, 50, 100],
  paginationLayout: "total, sizes, prev, pager, next, jumper",
  paginationBackground: true,
  showToolbar: false,
  showActionBar: false,
  dictData: () => ({}),
  isExpandAll: false,
  showSummary: false,
});

const emit = defineEmits<Emits>();

const tableRef = ref<TableInstance>();
const selectedRows = ref<any[]>([]);

const columnSettings = computed(() => {
  return props.columns.map((col) => ({
    ...col,
    visible: col.visible !== false,
  }));
});

// 计算表格高度
const tableHeight = ref<number | string | null>(null);
let resizeObserver: ResizeObserver | null = null;

const calculateTableHeight = (): number | null => {
  if (!props.autoHeight) return props.height as number | null;

  const container = document.querySelector(".pro-table-container");
  if (!container) return null;

  const containerRect = container.getBoundingClientRect();
  let height = containerRect.height;

  // 减去操作栏高度
  const searchBar = container.querySelector(".action-bar");
  if (
    searchBar &&
    searchBar instanceof HTMLElement &&
    searchBar.offsetHeight > 0
  ) {
    const searchBarStyles = window.getComputedStyle(searchBar);
    height -=
      searchBar.offsetHeight + parseFloat(searchBarStyles.marginBottom || "0");
  }

  // 减去工具栏高度
  const toolbar = container.querySelector(".toolbar");
  if (toolbar && toolbar instanceof HTMLElement && toolbar.offsetHeight > 0) {
    const toolbarStyles = window.getComputedStyle(toolbar);
    height -=
      toolbar.offsetHeight + parseFloat(toolbarStyles.marginBottom || "0");
  }

  // 减去分页高度
  const pagination = container.querySelector(".pagination");
  if (
    pagination &&
    props.pagination &&
    pagination instanceof HTMLElement &&
    pagination.offsetHeight > 0
  ) {
    const paginationStyles = window.getComputedStyle(pagination);
    height -=
      pagination.offsetHeight + parseFloat(paginationStyles.marginTop || "0");
  }

  // 减去表格容器的内边距
  const tableWrapper = container.querySelector(".table-wrapper");
  if (tableWrapper) {
    const styles = window.getComputedStyle(tableWrapper);
    height -= parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
  }

  // 额外减去一些边距，确保有滚动空间
  height -= 12;

  return Math.max(height, 200); // 最小高度 200px
};

// 计算表格容器样式
const tableWrapperStyle = computed<Record<string, any>>(() => {
  if (!props.autoHeight) return {};

  return {
    height: `${tableHeight.value}px`,
    overflow: "hidden", // 确保容器本身不产生滚动
  };
});

// 计算属性
const visibleColumns = computed(() =>
  columnSettings.value.filter((col) => col.visible)
);

const getTableProps = computed(() => {
  const baseProps: Record<string, any> = {
    border: props.border,
    stripe: props.stripe,
    size: props.size,
    height: props.autoHeight ? tableHeight.value : props.height,
    maxHeight: props.maxHeight,
    ...$attrs,
  };

  // 如果设置了固定高度或最大高度，优先使用
  if (props.height || props.maxHeight) {
    baseProps.height = props.height;
  }

  return baseProps;
});

// 更新表格高度
const updateTableHeight = (): void => {
  if (props.autoHeight) {
    setTimeout(() => {
      tableHeight.value = calculateTableHeight();
    }, 100); // 稍微延迟确保 DOM 已更新
  }
};

// 实现默认的合计方法
const defaultSummaryMethod = ({
  columns,
  data,
}: {
  columns: any[];
  data: any[];
}) => {
  const sums: string[] = [];
  columns.forEach((column, index) => {
    // 第一列显示"合计"
    if (index === 0) {
      sums[index] = "合计";
      return;
    }
    // 跳过特殊列
    if (
      column.type === "selection" ||
      column.type === "index" ||
      column.type === "expand"
    ) {
      sums[index] = "--";
      return;
    }
    // 只对数值列求和
    const values = data.map((item) => Number(item[column.property]));
    const hasNumbers = values.some((v) => !isNaN(v));
    if (hasNumbers) {
      const sum = values.reduce(
        (total, val) => total + (isNaN(val) ? 0 : val),
        0
      );
      // 使用 Number.isInteger() 判断是否整数,如果有小数则保留两位小数
      sums[index] = Number.isInteger(sum) ? sum.toString() : sum.toFixed(2);
    } else {
      sums[index] = "--";
    }
  });
  return sums;
};

// 监听相关变化
watch(
  () => [props.autoHeight, props.tableData, props.pagination, props.loading],
  () => {
    updateTableHeight();
  },
  { immediate: true }
);

// 监听窗口大小变化
const handleWindowResize = (): void => {
  updateTableHeight();
};

// 监听父容器大小变化
const observeResize = (): void => {
  if (!props.autoHeight) return;

  const container = document.querySelector(".pro-table-container");
  if (!container) return;

  resizeObserver = new ResizeObserver(() => {
    updateTableHeight();
  });

  resizeObserver.observe(container);
};

onMounted(() => {
  // 初始化高度计算
  updateTableHeight();

  // 监听窗口大小变化
  window.addEventListener("resize", handleWindowResize);

  // 监听容器大小变化
  observeResize();
});

onUnmounted(() => {
  // 清理事件监听
  window.removeEventListener("resize", handleWindowResize);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

// 多选方法
const handleSelectionChange = (val: any[]): void => {
  selectedRows.value = val;
  emit("selection-change", val);
};

// 清除多选
const handleClearSelection = (): void => {
  tableRef.value?.clearSelection();
  selectedRows.value = [];
};

// 排序事件触发
const handleSortChange = (val: Sort): void => {
  emit("sort-change", val);
};

const handlePageSizeChange = (val: number): void => {
  emit("update:pageSize", val);
  emit("pagination-change", { pageSize: val, currentPage: props.currentPage });
};

const handleCurrentChange = (val: number): void => {
  emit("update:currentPage", val);
  emit("pagination-change", { pageSize: props.pageSize, currentPage: val });
};

// 表格刷新
const handleRefresh = (): void => {
  emit("refresh");
};

// 表格列设置
const handleColumnSetting = (): void => {
  // 这里可以实现列设置的弹窗
  console.log("打开列设置");
};

// 暴露方法给父组件
defineExpose({
  clearSelection: handleClearSelection,
  getTableRef: () => tableRef.value,
  updateTableHeight,
});
</script>

<style lang="scss" scoped>
/* 样式部分保持不变 */
.pro-table-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.action-bar {
  margin-bottom: 8px;
  flex-shrink: 0;
}
.toolbar {
  height: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
}
.toolbar .left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.toolbar .right {
  display: flex;
  align-items: center;
}
.batch-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background-color: #f0f9ff;
  border-radius: 4px;
}
.selected-count {
  font-size: 14px;
  color: #409eff;
}
.table-wrapper {
  flex: 1;
  min-height: 200px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  flex-shrink: 0;
  :deep(.el-pager) {
    .is-active {
      background: linear-gradient(135deg, #032c46 0%, #05456e 100%);
    }
  }
}
.empty-container {
  padding: 40px 0;
}
/* 调整合计行高度 */
.pro-table-container {
  :deep(.el-table) {
    .el-table__footer-wrapper {
      // 调整整个合计行区域的高度
      .el-table__cell {
        padding: 8px 0; // 调整内边距来控制高度
        .cell {
          line-height: 1.5; // 调整行高
          min-height: 32px; // 最小高度
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }
      }
    }
  }
}
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .toolbar .left,
  .toolbar .right {
    justify-content: space-between;
  }
}
</style>
