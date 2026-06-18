<!-- 基础表格组件 -->
<template>
  <div class="pro-table-container" ref="containerRef">
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
        :row-class-name="getRowClassName"
        element-loading-text="数据加载中..."
        element-loading-background="rgba(255, 255, 255, 0.8)"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      >
        <!-- 递归渲染多级表头 -->
        <template
          v-for="(item, index) in visibleColumns"
          :key="item.prop ?? item.type ?? index"
        >
          <component
            :is="TableColumn"
            :column="item"
            :slots="$slots"
            :dict-data="dictData"
            @cell-click="handleTableCellClick"
            @cell-event="handleTableCellEvent"
          />
        </template>

        <!-- 空状态 -->
        <template #empty>
          <div
            :class="
              compactEmpty ? 'empty-container compact' : 'empty-container'
            "
          >
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
  nextTick,
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
import { Setting, Refresh } from "@element-plus/icons-vue";
import type { TableInstance, Sort } from "element-plus";
import { formatNumber, formatNumberDisplay } from "@/utils/common";

// 定义列接口
export interface TableColumnItem {
  /** 字段属性名，对应数据中的键 */
  prop?: string;
  /** 表头显示的文本内容 */
  label?: string;
  /** 列类型：selection（多选列）、index（序号列）、expand（可展开列） */
  type?: "selection" | "index" | "expand";
  /** 列宽度，支持像素(px)或百分比(%) */
  width?: string | number;
  /** 列最小宽度，支持像素(px)或百分比(%) */
  minWidth?: string | number;
  /** 列对齐方式：left（左对齐）、center（居中）、right（右对齐） */
  align?: "left" | "center" | "right";
  /** 是否可排序，true为开启排序，'custom'为自定义排序 */
  sortable?: boolean | "custom";
  /** 是否固定列：true、'left'（固定在左侧）、'right'（固定在右侧） */
  fixed?: boolean | "left" | "right";
  /** 是否在内容溢出时显示 tooltip 提示 */
  showOverflowTooltip?: boolean;
  /** 单元格插槽名称，用于自定义单元格内容渲染 */
  slot?: string;
  /** 表头插槽名称，用于自定义表头内容渲染 */
  headerSlot?: string;
  /** 数据字典键名，用于从 dictData 中获取选项映射 */
  dict?: string;
  /** 是否显示该列，false 时隐藏 */
  visible?: boolean;
  /** 单元格是否可点击，开启后会添加点击样式和事件 */
  clickable?: boolean;
  /** 单元格点击事件处理函数 */
  clickHandler?: (row: any, column: TableColumnItem, index: number) => void;
  /** 子列配置，用于多级表头 */
  children?: TableColumnItem[];
  /** 单元格内容格式化函数 */
  formatter?: (row: any, column: any, index: number) => any;
  /** 表头提示配置 */
  headerTip?: {
    /** 提示图标组件名，默认使用 QuestionFilled */
    icon?: string;
    /** 提示文本内容 */
    content?: string;
    /** 提示框显示位置：top/top-start/top-end/bottom/bottom-start/bottom-end/left/left-start/left-end/right/right-start/right-end */
    placement?: string;
    /** 提示框宽度，支持像素(px)或百分比(%) */
    width?: string;
  };
  /** 是否显示合计行 */
  showSummary?: boolean;
  /** 选择列专用：判断该行是否可选，优先级高于 disabledField */
  selectable?: (row: any, index: number) => boolean;
  /** 选择列专用：根据行数据的字段名判断是否可选，值为 true 表示不可选 */
  disabledField?: string;
  /** 其他自定义属性 */
  [key: string]: any;
}

// 定义字典数据类型
interface DictItem {
  label: string;
  value: string | number;
  [key: string]: any;
}

export interface DictData {
  [key: string]: DictItem[];
}

// 定义组件属性
interface Props {
  /** 列配置数组，定义表格的列结构、表头、属性和行为 */
  columns: TableColumnItem[];
  /** 表格数据数组，每行数据对应一个对象 */
  tableData: any[];
  /** 行数据的唯一标识字段，用于行选择和展开状态跟踪，默认为 'id' */
  rowKey?: string;
  /** 是否显示表格纵向边框 */
  border?: boolean;
  /** 是否为斑马纹表格，交替显示不同背景色 */
  stripe?: boolean;
  /** 表格尺寸：large（大）、default（默认）、small（小） */
  size?: "large" | "default" | "small";
  /** 表格固定高度，支持数字（像素）或字符串（如 '100%'、'200px'） */
  height?: string | number;
  /** 表格最大高度，超出将出现滚动条 */
  maxHeight?: string | number;
  /** 是否自动计算高度，开启后会根据容器剩余空间自适应高度 */
  autoHeight?: boolean;
  /** 是否显示加载状态，true 时显示加载动画 */
  loading?: boolean;
  /** 是否显示分页组件 */
  pagination?: boolean;
  /** 数据总条数 */
  total?: number;
  /** 每页显示条数 */
  pageSize?: number;
  /** 当前页码 */
  currentPage?: number;
  /** 每页显示条数选项数组 */
  pageSizes?: number[];
  /** 分页组件布局，组件间用逗号分隔，可选值：total, sizes, prev, pager, next, jumper */
  paginationLayout?: string;
  /** 分页按钮是否显示背景色 */
  paginationBackground?: boolean;
  /** 是否显示工具栏区域（包含刷新、列设置等按钮） */
  showToolbar?: boolean;
  /** 是否显示操作栏区域（通常用于放置搜索表单、新增按钮等） */
  showActionBar?: boolean;
  /** 数据字典对象，用于选项值到显示文本的映射 */
  dictData?: DictData;
  /** 是否默认展开所有行，适用于可展开行或树形表格 */
  isExpandAll?: boolean;
  /** 是否在表格底部显示合计行 */
  showSummary?: boolean;
  /** 自定义合计计算方法，接收列信息和数据，返回每列的合计值数组 */
  summaryMethod?: (params: { columns: any[]; data: any[] }) => string[];
  /** 是否开启行点击高亮效果，点击行时背景色变化 */
  highlightCurrentRow?: boolean;
  /** 选择模式：single 单选、multiple 多选 */
  selectionMode?: "single" | "multiple";
  /** 树形表格配置，直接传递给 el-table 的 tree-props 属性 */
  treeProps?: {
    hasChildren?: string;
    children?: string;
    checkStrictly?: boolean;
  };
  /** 是否启用紧凑型空状态样式，适用于小高度容器（如弹窗内的表格） */
  compactEmpty?: boolean;
}

// 定义组件事件
interface Emits {
  /** 当选择项发生变化时触发，返回当前选中的行数据数组 */
  (event: "selection-change", value: any[]): void;
  /** 当表格排序条件发生变化时触发，返回排序配置对象 */
  (event: "sort-change", value: Sort): void;
  /** 更新每页显示条数的 v-model 事件 */
  (event: "update:pageSize", value: number): void;
  /** 更新当前页码的 v-model 事件 */
  (event: "update:currentPage", value: number): void;
  /** 分页参数变化时触发，包含页大小和当前页码信息 */
  (
    event: "pagination-change",
    value: { pageSize: number; currentPage: number },
  ): void;
  /** 点击刷新按钮时触发 */
  (event: "refresh"): void;
  /** 点击列设置按钮时触发 */
  (event: "column-setting"): void;
  /** 点击表格行时触发，返回点击的行数据和原生事件对象 */
  (event: "row-click", value: { row: any; event: Event }): void;
  /** 点击表格单元格时触发，返回点击的行数据、列配置和原生事件对象 */
  (
    event: "cell-click",
    value: { row: any; column: TableColumnItem; event: Event },
  ): void;
  /** 自定义单元格事件，可用于处理单元格内按钮点击等自定义交互 */
  (
    event: "cell-event",
    value: {
      /** 事件名称，用于区分不同类型的单元格事件 */
      eventName: string;
      /** 行数据对象 */
      row: any;
      /** 列配置对象 */
      column: TableColumnItem;
      /** 行索引位置 */
      index: number;
    },
  ): void;
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
  emits: ["cell-click", "cell-event"],
  setup(props: TableColumnProps, { emit }) {
    const getDictLabel = (dictKey: string, value: any): string => {
      const dict = props.dictData[dictKey];
      if (!dict) return String(value);
      const item = dict.find((item: DictItem) => item.value === value);
      return item ? item.label : String(value);
    };

    // 处理单元格点击
    const handleColumnCellClick = (
      row: any,
      column: TableColumnItem,
      index: number,
      event: Event,
    ) => {
      // 如果有 clickEvent，则触发特定事件
      if (column.clickable && column.clickEvent) {
        event.stopPropagation();
        emit("cell-event", {
          eventName: column.clickEvent,
          row,
          column,
          index,
        });
        return;
      }
      // 默认单元格点击事件
      emit("cell-click", { row, column, event });
    };

    const renderColumn = (column: TableColumnItem): VNode => {
      // 选择列
      if (column.type === "selection") {
        const selectionColumnProps: any = {
          type: "selection",
          width: "55",
          align: column.align || "center",
        };
        // 添加 fixed 属性支持
        if (column.fixed) {
          selectionColumnProps.fixed = column.fixed;
        }
        // 支持两种方式：优先使用 selectable 回调，其次使用 disabledField 字段
        if (column.selectable) {
          selectionColumnProps.selectable = column.selectable;
        } else if (column.disabledField) {
          selectionColumnProps.selectable = (row: any) => {
            return !row[column.disabledField!]; // 字段值为 true 时不可选
          };
        }

        return h(resolveComponent("el-table-column"), selectionColumnProps);
      }

      // 序号列
      if (column.type === "index") {
        const indexColumnProps: any = {
          type: "index",
          align: column.align || "center",
          width: column.width || "80",
          label: column.label || "序号",
        };
        // 添加 fixed 属性支持
        if (column.fixed) {
          indexColumnProps.fixed = column.fixed;
        }
        return h(resolveComponent("el-table-column"), indexColumnProps);
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
                    `Expand content for ${scope.row.id || scope.$index}`,
                  ),
          },
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
        // 空值合并运算符，value ?? defaultValue，当 value 为 null 或 undefined 时，返回 defaultValue，否则返回 value 本身
        showOverflowTooltip: column.showOverflowTooltip ?? true, // 鼠标移入显示全部内容
      };

      // 如果有子列，递归渲染
      if (column.children && column.children.length > 0) {
        return h(resolveComponent("el-table-column"), columnProps, () =>
          column.children!.map((child) => renderColumn(child)),
        );
      }

      // 普通列
      return h(resolveComponent("el-table-column"), columnProps, {
        // 自定义表头
        header: (scope: any) => {
          // 如果有表头插槽
          if (column.headerSlot) {
            const headerSlotFunc = props.slots[column.headerSlot];
            if (headerSlotFunc) {
              return headerSlotFunc(scope);
            }
          }
          // 如果有表头提示配置
          if (column.headerTip) {
            return h("div", { class: "header-with-tip" }, [
              h("span", { class: "header-label" }, column.label || ""),
              h(
                resolveComponent("el-tooltip"),
                {
                  content: column.headerTip.content || "",
                  placement: column.headerTip.placement || "top",
                  width: column.headerTip.width || "200px",
                },
                {
                  default: () => {
                    // 获取图标组件，默认icon QuestionFilled
                    const iconName = column.headerTip?.icon || "QuestionFilled";
                    const Icon = resolveComponent(iconName);
                    // 返回 el-icon 包裹的图标
                    return h(
                      resolveComponent("el-icon"),
                      { class: "header-tip-icon" },
                      // 确保返回一个渲染函数
                      () => h(Icon),
                    );
                  },
                },
              ),
            ]);
          }
          // 默认表头
          return h("span", column.label || "");
        },
        // 单元格内容
        default: (scope: any) => {
          // 自定义列内容
          if (column.slot) {
            const slotFunc = props.slots[column.slot];
            if (slotFunc) {
              return slotFunc({
                row: scope.row,
                column: column,
                $index: scope.$index,
              });
              // return slotFunc(scope);
            }
          }

          // 创建内容元素
          let contentValue: any;

          // 格式化显示
          if (column.formatter) {
            contentValue = column.formatter(
              scope.row,
              scope.column,
              scope.$index,
            );
          } else if (column.dict) {
            contentValue = getDictLabel(column.dict, scope.row[column.prop!]);
          } else {
            contentValue = scope.row[column.prop!];
          }

          const content = h(
            "span",
            {
              class: {
                "clickable-cell": column.clickable,
              },
              style: {
                cursor: column.clickable ? "pointer" : "default",
                color: column.clickable ? "#1890ff" : "inherit",
              },
              onClick: (event: Event) =>
                handleColumnCellClick(scope.row, column, scope.$index, event),
            },
            [contentValue],
          );

          return content;
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
  highlightCurrentRow: true,
  selectionMode: "multiple",
  // treeProps 默认值
  treeProps: () => ({
    hasChildren: "hasChildren",
    children: "children",
    checkStrictly: false,
  }),
  compactEmpty: false,
});

const emit = defineEmits<Emits>();

const tableRef = ref<TableInstance>();
const containerRef = ref<HTMLElement | null>(null);
const selectedRows = ref<any[]>([]);
const currentRowKey = ref<string | number>(""); // 当前选中行的key
const isProgrammaticSelection = ref(false);

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

  const container = containerRef.value;
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

  return Math.max(height, 180); // 最小高度 180px
};

// 计算表格容器样式
const tableWrapperStyle = computed<Record<string, any>>(() => {
  // 如果设置了 maxHeight，不设置 wrapper 高度，让表格自己管理滚动
  if (props.maxHeight) {
    return {};
  }
  if (!props.autoHeight) return {};
  if (tableHeight.value === null) return {};
  return {
    height: `${tableHeight.value}px`,
    overflow: "hidden", // 确保容器本身不产生滚动
  };
});

// 计算属性
const visibleColumns = computed(() =>
  columnSettings.value.filter((col) => col.visible),
);

const getTableProps = computed(() => {
  const baseProps: Record<string, any> = {
    border: props.border,
    stripe: props.stripe,
    size: props.size,
    height: props.autoHeight ? tableHeight.value : props.height,
    maxHeight: props.maxHeight,
    highlightCurrentRow: props.highlightCurrentRow,
    ...$attrs,
  };

  // 如果设置了固定高度或最大高度，优先使用
  if (props.height || props.maxHeight) {
    baseProps.height = props.height;
  }
  // 传递 tree-props 属性（使用默认值）
  baseProps["tree-props"] = props.treeProps;

  return baseProps;
});

// 获取行类名
const getRowClassName = ({ row }: { row: any }): string => {
  if (!props.highlightCurrentRow) return "";

  const rowKeyValue = row[props.rowKey];
  if (rowKeyValue === currentRowKey.value) {
    return "current-row";
  }
  return "";
};

// 更新表格高度
const updateTableHeight = async (): Promise<void> => {
  if (!props.autoHeight) return;
  await nextTick();
  requestAnimationFrame(() => {
    tableHeight.value = calculateTableHeight();
  });
};

// 添加一个递归查找函数
const findColumnConfig = (
  columns: TableColumnItem[],
  property: string,
): TableColumnItem | null => {
  for (const col of columns) {
    // 如果是当前列
    if (col.prop === property) {
      return col;
    }
    // 如果有子列，递归查找
    if (col.children && col.children.length > 0) {
      const found = findColumnConfig(col.children, property);
      if (found) return found;
    }
  }
  return null;
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

    // 检查是否有属性名（跳过没有property的列）
    const property = column.property;

    if (!property) {
      sums[index] = "--";
      return;
    }

    // 从列配置中查找是否设置了 showSummary
    // 1. 先找到对应的列配置,使用递归查找函数
    const colConfig = findColumnConfig(props.columns, property);

    // 2. 判断是否需要合计
    if (!colConfig || colConfig.showSummary !== true) {
      sums[index] = "--";
      return;
    }

    // 计算合计（使用 formatMoney 处理每个值）
    let sum = 0;
    data.forEach((item) => {
      const value = item[property];
      // 使用 formatMoney 获取处理后的数值
      const numValue = formatNumber(value, 2);
      sum += numValue;
    });
    // 格式化显示（使用 formatMoneyDisplay）
    sums[index] = formatNumberDisplay(sum, 2);
  });
  return sums;
};

// 监听相关变化
watch(
  () => [props.autoHeight, props.tableData, props.pagination, props.loading],
  () => {
    updateTableHeight();
  },
  {
    immediate: true,
    flush: "post", // flush: 'post' 确保 DOM 更新后再执行
  },
);

// 监听窗口大小变化
const handleWindowResize = (): void => {
  updateTableHeight();
};

// 监听父容器大小变化
const observeResize = (): void => {
  if (!props.autoHeight) return;

  const container = containerRef.value;
  if (!container) return;

  resizeObserver = new ResizeObserver(() => {
    updateTableHeight();
  });

  resizeObserver.observe(container);
};

// 默认单元格点击事件
const handleTableCellClick = ({
  row,
  column,
  event,
}: {
  row: any;
  column: TableColumnItem;
  event: Event;
}) => {
  // console.log("默认单元格点击事件");
  emit("cell-click", { row, column, event });
};
// 单元格特定事件name方法回调
const handleTableCellEvent = (payload: {
  eventName: string;
  row: any;
  column: TableColumnItem;
  index: number;
}) => {
  // 将事件冒泡给父组件
  emit("cell-event", payload);
};

// 多选/单选方法
const handleSelectionChange = (val: any[]): void => {
  if (isProgrammaticSelection.value) {
    selectedRows.value = val;
    return;
  }
  if (props.selectionMode === "single" && val.length > 1) {
    const last = val[val.length - 1];
    selectedRows.value = [last];
    isProgrammaticSelection.value = true;
    tableRef.value?.clearSelection();
    tableRef.value?.toggleRowSelection(last, true);
    nextTick(() => {
      isProgrammaticSelection.value = false;
    });
    emit("selection-change", selectedRows.value);
    return;
  }
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

// 行点击事件
const handleRowClick = (row: any, column: any, event: Event): void => {
  if (!props.highlightCurrentRow) return;

  // 获取当前行的key值
  const rowKeyValue = row[props.rowKey];

  // 如果点击的是同一行，则清除选中状态
  if (currentRowKey.value === rowKeyValue) {
    currentRowKey.value = "";
  } else {
    currentRowKey.value = rowKeyValue;
  }
  // console.log("行点击事件");
  emit("row-click", { row, event });
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
  emit("column-setting");
};

// 清除当前选中行
const clearCurrentRow = (): void => {
  currentRowKey.value = "";
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

// 暴露方法给父组件
defineExpose({
  clearSelection: handleClearSelection,
  clearCurrentRow,
  getTableRef: () => tableRef.value,
  updateTableHeight,
});
</script>

<style lang="scss" scoped>
.pro-table-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 5px;
  box-sizing: border-box;
}
.action-bar {
  margin-bottom: 10px;
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
  min-height: 180px;
  :deep(.el-table) {
    .el-table__header-wrapper {
      background-color: #f8f8f9 !important;
      .el-table__header {
        background-color: #f8f8f9 !important;
        .el-table__cell {
          padding: 0; // 调整内边距来控制高度
          // 固定内容区高度，确保行高一致
          .cell {
            height: 28px;
            line-height: 28px;
          }
        }
        thead {
          background-color: #f8f8f9 !important;
          tr {
            background-color: #f8f8f9 !important;
            th {
              background-color: #f8f8f9 !important;
              color: #515a6e !important;
              .cell {
                color: #515a6e !important;
              }
            }
          }
        }
      }
    }
    .el-table__body {
      .el-table__cell {
        padding: 0; // 调整内边距来控制高度
        // 固定内容区高度，确保行高一致
        .cell {
          height: 28px;
          line-height: 28px;
        }
        // 可点击单元格样式
        .clickable-cell {
          cursor: pointer;
          color: #1890ff;
          &:hover {
            text-decoration: underline;
          }
        }
      }

      // 添加点击行高亮样式
      .current-row {
        & > .el-table__cell {
          background-color: #e0ecfc !important;
        }
      }

      // 鼠标悬停效果
      .el-table__row {
        &:hover {
          & > .el-table__cell {
            background-color: #f0f5ff !important;
          }
        }
      }
    }
  }
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  flex-shrink: 0;
  :deep(.el-pager) {
    .is-active {
      background: linear-gradient(135deg, #05456e 0%, #4096cc 100%);
    }
  }
}
.empty-container {
  padding: 40px 0;
  // 紧凑型空状态样式，适用于小高度容器（如弹窗内的表格）
  &.compact {
    padding: 8px 0;
    :deep(.el-empty) {
      // padding: 8px 0;
      .el-empty__image {
        width: 60px;
        height: 60px;
        margin-bottom: 4px;
      }
      .el-empty__description {
        margin-top: 4px;
        p {
          font-size: 12px;
          line-height: 1.2;
        }
      }
    }
  }
}
/* 调整合计行高度 */
.pro-table-container {
  :deep(.el-table) {
    .el-table__footer-wrapper {
      // 调整整个合计行区域的高度
      .el-table__cell {
        padding: 0; // 调整内边距来控制高度
        .cell {
          line-height: 1.5; // 调整行高
          min-height: 32px; // 最小高度
          display: flex;
          align-items: center;
          justify-content: center;
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
