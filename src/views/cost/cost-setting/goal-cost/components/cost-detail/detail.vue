<!-- 目标成本明细列表 -->
<template>
  <div class="cost-detail-page">
    <div class="toolbar">
      <!-- ========== 合计行区域（文字靠左，与按钮同一行） ========== -->
      <div class="total-summary-bar">
        <span class="summary-item">目标成本总计（含税）：<span class="amount-text">{{ totalCostTax }}</span></span>
        <span class="summary-item">目标成本总计（不含税）：<span class="amount-text">{{ totalCostNoTax }}</span></span>

        <el-select
          v-model="busiSegFilter"
          placeholder="业务归属"
          clearable
          class="busi-seg-filter"
        >
          <el-option
            v-for="opt in busiSegFilterOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>

      <div class="toolbar-buttons" v-if="!isDetail">
        <el-button type="primary" plain :loading="exportTemplateLoading" @click="handleExportTemplate">导出模板</el-button>
        <el-button type="primary" plain :loading="exportLoading" @click="handleExport">导出</el-button>
        <el-button type="primary" plain :loading="importLoading" @click="handleImport">导入</el-button>
        <el-button type="primary" :loading="saveLoading" @click="handleBatchSave">批量保存</el-button>
        <!-- 隐藏的文件选择器，用于导入 -->
        <input
          ref="importFileInputRef"
          type="file"
          accept=".xlsx,.xls"
          style="display: none"
          @change="onImportFileChange"
        />
      </div>
    </div>

    <div class="virtual-table-outer">
      <div class="virtual-table">
        <div class="vt-header" :style="{
          gridTemplateColumns: gridTemplateColumns,
          gridTemplateRows: `repeat(${headerDepth}, 32px)`,
        }">
          <!-- 多级表头水平分割线：贯穿整个表头宽度，不受单元格跨行合并影响 -->
          <div v-for="line in headerDepth - 1" :key="'divider-' + line" class="header-divider"
            :style="{ top: `${line * 32}px` }"></div>
          <div v-for="cell in headerCells" :key="cell.key" class="vt-header-cell"
            :class="[cell.sticky ? 'sticky-left' : '', cell.sticky ? cell.stickyCls : '']" :style="{
              gridColumn: `${cell.colStart} / ${cell.colEnd}`,
              gridRow: `${cell.rowStart} / ${cell.rowEnd}`,
              justifyContent: cell.align || 'center',
              textAlign: cell.align || 'center',
            }">
            {{ cell.label }}
          </div>
        </div>

        <DynamicScroller :items="flatRows" :min-item-size="rowHeight" class="vt-scroller" key-field="uuid">
          <template #default="{ item, index }">
            <div class="vt-row" :style="{ gridTemplateColumns: gridTemplateColumns }">
              <div class="vt-cell index-col">{{ getDisplayIndex(item, index) }}</div>
              <div class="vt-cell name-col">
                <div class="cell-inner-wrap">
                  <span class="expand-icon" v-if="item.hasChildren" @click.stop="toggleExpand(item.uuid)">
                    {{ item.expanded ? '▾' : '▸' }}
                  </span>
                  <span :style="{ paddingLeft: item.level * 16 + 'px' }">{{ item._raw ? item._raw.subName : item.subName
                  }}</span>
                </div>
              </div>

              <template v-for="col in headerLeafColumns" :key="col.prop">
                <div class="vt-cell" :style="{ width: col.width ? col.width + 'px' : 'auto' }">
                  <template v-if="col.prop && (col.prop.startsWith('costAmt_') || col.prop.startsWith('costExclAmt_'))">
                    <el-input-number v-if="(item._raw ? item._raw.isLeaf : item.isLeaf) && !isDetail"
                      :model-value="(item._raw ? item._raw[col.prop] : item[col.prop])" :controls="false" :step="0.01"
                      :precision="2" @change="(val) => onCellEdit(item, col.prop, val, index)" size="small" />
                    <span v-else class="readonly-cell">{{ formatThousandWithPlaces(item.hasChildren && item.visibleTotal ? item.visibleTotal[col.prop] : (item._raw ? item._raw[col.prop] : item[col.prop]))
                    }}</span>
                  </template>

                  <template v-else-if="col.prop === 'busiSegId'">
                    <el-select v-if="(item._raw ? item._raw.isLeaf : item.isLeaf) && !isDetail"
                      :model-value="(item._raw ? item._raw.busiSegId : item.busiSegId)" placeholder="" size="small"
                      @change="(val) => onCellEdit(item, 'busiSegId', val, index)">
                      <el-option v-for="opt in busiSegOptions" :key="opt.id" :label="opt.segName" :value="opt.id" />
                    </el-select>
                    <span v-else class="readonly-cell">{{ item._raw ? item._raw.segName : item.segName }}</span>
                  </template>

                  <template v-else-if="col.prop === 'allocRule'">
                    <el-select v-if="(item._raw ? item._raw.isLeaf : item.isLeaf) && !isDetail"
                      :model-value="(item._raw ? item._raw.allocRule : item.allocRule)" placeholder="" size="small"
                      @change="(val) => onCellEdit(item, 'allocRule', val, index)">
                      <el-option v-for="opt in allocRuleEnum" :key="opt.value" :label="opt.label" :value="opt.value" />
                    </el-select>
                    <span v-else class="readonly-cell">{{ item._raw ? item._raw.allocRuleName : item.allocRuleName
                    }}</span>
                  </template>

                  <template v-else>
                    <span class="readonly-cell">{{ formatThousandWithPlaces(item.hasChildren && item.visibleTotal ? (item.visibleTotal[col.prop] ?? (item._raw ? item._raw[col.prop] : item[col.prop])) : (item._raw ? item._raw[col.prop] : item[col.prop])) }}</span>
                  </template>
                </div>
              </template>
            </div>
          </template>
        </DynamicScroller>
      </div>
    </div>

    <!-- 附件上传 -->
    <div class="item-card">
      <div class="section-title">相关附件</div>

      <el-form ref="formRef" label-width="120px" :inline="true">
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <el-form-item label="上传附件" label-width="90px">
              <base-upload v-model:file-list="annexFileList" :limit="9" :multiple="false" :showIcon="true"
                :showTip="true" :maxSize="20" :unrestricted="true" :accept="''" button-text="选择文件" size="default"
                :disabled="isDetail" @success="handleAnnexSuccess"></base-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  computed,
  onMounted,
  onBeforeUnmount,
  shallowRef,
  nextTick,
} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { DynamicScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api.ts";
import { productTypeApi } from "@/api/cost/master-data/product-type-api.ts";
import { useRoute } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import {  buildSubjectTree, buildTree, convertToTree } from "@/utils/tree";
import { allocRuleEnum } from "@/constants/master-data/enums";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { toDecimal, formatDecimal, decimalAddNum, decimalSumNum, roundToTwo, formatThousandWithPlaces } from '@/utils/decimal';

defineOptions({ name: "cost-detail-list" });

interface Props {
  mode: "add" | "edit" | "detail";
  costMid?: undefined | number;
  projId?: undefined | number;
  areaVerMid?: undefined | number;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  costMid: undefined,
  projId: undefined,
  areaVerMid: undefined,
});

const route = useRoute();

const mode = ref<"add" | "edit" | "detail">(props.mode);

const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");

const saveLoading = ref(false);
const exportLoading = ref(false);
const exportTemplateLoading = ref(false);
const importLoading = ref(false);
const importFileInputRef = ref<HTMLInputElement | null>(null);
// 表格相关
const tableLoading = ref(false);
const tableData = shallowRef<any[]>([]);
const annexFileList = ref([]);
const detailTableList = ref([]); // 目标成本明细列表

const flowBaseData = ref(null); // 流程基础信息

// 使用 shallowRef 减少响应式深度
const subjectOptions = shallowRef([]);
const productOptions = shallowRef([]);
const busiSegOptions = shallowRef([]);

// 缓存动态列，避免重复计算
let cachedColumns: EditableColumn[] = [];
let lastProductOptionsHash = "";

// 缓存叶子节点列表
const leafNodesCache = ref([]);
let leafNodesVersion = 0;

// 生成动态表头（支持编辑）
const generateColumns = (): EditableColumn[] => {
  // 基础列
  const baseColumns: EditableColumn[] = [
    { type: "index", label: "序号", width: 60, editable: false, fixed: "left" },
    {
      prop: "subName",
      label: "成本科目",
      align: "center",
      width: 180,
      editable: false,
      showOverflowTooltip: true,
      fixed: "left",
    },
    {
      prop: "busiSegId",
      label: "业务归属",
      width: 120,
      align: "center",
      editable: true,
      editType: "select",
      optionLabelField: "segName",
      optionValueField: "id",
      options: busiSegOptions.value,
      showOverflowTooltip: false,
      disabled: (row: any) => row._cellDisabled,
      placeholder: " ",
    },
    {
      prop: "allocRule",
      label: "分摊规则",
      width: 160,
      align: "center",
      editable: true,
      editType: "select",
      optionLabelField: "label",
      optionValueField: "value",
      showOverflowTooltip: false,
      disabled: (row: any) => row._cellDisabled,
      placeholder: " ",
      options: allocRuleEnum as any,
    },
    // 成本小计列：调整为 3 层结构，让「含税小计/不含税小计」文字落在第 3 行，
    // 与业态列的「金额(含税)/金额(不含税)」文字纵向对齐
    //   成本小计(row1) -> 空占位(row2) -> 含税小计/不含税小计 + 数值(row3)
    {
      label: "成本小计",
      children: [
        {
          // row2 空 group 占位，保留纵向 cell 撑住第 2 行
          label: "",
          children: [
            {
              label: "含税小计",
              prop: "totalCostAmt",
              width: 120,
              editable: false,
              showOverflowTooltip: false,
            },
            {
              label: "不含税小计",
              prop: "totalCostExclAmt",
              width: 120,
              editable: false,
              showOverflowTooltip: false,
            },
          ],
        },
      ],
    },
  ];

  // 生成业态多级表头
  const productColumns: EditableColumn[] = productOptions.value.map(
    (product) => ({
      prop: `prod_${product.id}`,
      label: product.prodName,
      children: [
        {
          prop: `costAmt_${product.id}`,
          label: "金额(含税)",
          width: 120,
          editable: isDetail.value ? false : true,
          editType: "number",
          showOverflowTooltip: false,
          // 只有叶子节点可编辑
          disabled: (row: any) => row._cellDisabled,
          placeholder: " ",
        },
        {
          prop: `costExclAmt_${product.id}`,
          label: "金额(不含税)",
          width: 120,
          editable: isDetail.value ? false : true,
          editType: "number",
          showOverflowTooltip: false,
          disabled: (row: any) => row._cellDisabled,
          placeholder: " ",
        },
      ],
    }),
  );

  // 如果业态数据存在，添加业态列
  if (productColumns.length > 0) {
    baseColumns.push({
      label: "业态",
      align: "center",
      children: productColumns,
    });
  }

  return baseColumns;
};

// 动态列使用缓存
const dynamicColumns = computed(() => {
  const hash = JSON.stringify(productOptions.value.map((p: any) => p.id));
  if (lastProductOptionsHash !== hash) {
    cachedColumns = generateColumns();
    lastProductOptionsHash = hash;
  }
  return cachedColumns;
});

// ---- Virtual scroll / tree flattening helpers ----
const rowHeight = 32;

// expanded keys set (mutate in-place to avoid recreating Set)
const expandedKeys = ref(new Set<string>());

// 板块筛选：空字符串 = 全部
const busiSegFilter = ref<string | number>("");

// 板块筛选选项：从全量叶子节点的 busiSegId 去重派生（基于原始数据，不随筛选变化）
const busiSegFilterOptions = computed(() => {
  const leaves = getAllLeafNodes(tableData.value || []);
  const map = new Map<string | number, string>();
  leaves.forEach((n: any) => {
    const val = n.busiSegId;
    const name = n.segName;
    // 排除 busiSegId 或 segName 为空/null/空白的无效项
    if (val != null && String(val).trim() !== "" && name && String(name).trim() !== "") {
      map.set(val, name);
    }
  });
  return [
    { value: "", label: "全部" },
    ...[...map.entries()].map(([v, l]) => ({ value: v, label: l })),
  ];
});

// 叶子节点是否匹配当前板块筛选
const isLeafVisibleByFilter = (node: any): boolean => {
  if (!busiSegFilter.value) return true;
  return node.busiSegId === busiSegFilter.value;
};

// 子树中是否存在可见叶子（用于判断父级是否整体隐藏）
const hasVisibleLeafInSubtree = (node: any): boolean => {
  if (node.isLeaf) return isLeafVisibleByFilter(node);
  if (!node.children || node.children.length === 0) return false;
  return node.children.some((c: any) => hasVisibleLeafInSubtree(c));
};

const expandedKeysHas = (uuid: string) => {
  return expandedKeys.value.has(uuid);
};

const toggleExpand = (uuid: string) => {
  if (expandedKeys.value.has(uuid)) expandedKeys.value.delete(uuid);
  else expandedKeys.value.add(uuid);
  // mutate in place — do not reassign a new Set (avoids full recompute)
};

// 累加筛选后可见叶子得到的汇总（供父级小计/合计实时展示）
const emptyVisibleTotals = () => {
  const t: any = { totalCostAmt: 0, totalCostExclAmt: 0 };
  productOptions.value.forEach((p: any) => {
    t[`costAmt_${p.id}`] = 0;
    t[`costExclAmt_${p.id}`] = 0;
  });
  return t;
};

// 递归计算某节点子树内「筛选可见叶子」的汇总值；无可见叶子返回 null
const aggregateVisible = (node: any): any => {
  if (node.isLeaf) {
    if (!isLeafVisibleByFilter(node)) return null;
    const t = emptyVisibleTotals();
    productOptions.value.forEach((p: any) => {
      const ca = roundToTwo(node[`costAmt_${p.id}`] || 0);
      const ce = roundToTwo(node[`costExclAmt_${p.id}`] || 0);
      t[`costAmt_${p.id}`] = ca;
      t[`costExclAmt_${p.id}`] = ce;
      t.totalCostAmt = roundToTwo(t.totalCostAmt + ca);
      t.totalCostExclAmt = roundToTwo(t.totalCostExclAmt + ce);
    });
    return t;
  }
  if (!node.children || node.children.length === 0) return null;
  const merged = emptyVisibleTotals();
  let anyVisible = false;
  node.children.forEach((c: any) => {
    const sub = aggregateVisible(c);
    if (sub) {
      anyVisible = true;
      productOptions.value.forEach((p: any) => {
        merged[`costAmt_${p.id}`] = roundToTwo(merged[`costAmt_${p.id}`] + sub[`costAmt_${p.id}`]);
        merged[`costExclAmt_${p.id}`] = roundToTwo(merged[`costExclAmt_${p.id}`] + sub[`costExclAmt_${p.id}`]);
      });
      merged.totalCostAmt = roundToTwo(merged.totalCostAmt + sub.totalCostAmt);
      merged.totalCostExclAmt = roundToTwo(merged.totalCostExclAmt + sub.totalCostExclAmt);
    }
  });
  return anyVisible ? merged : null;
};

// flatten tree to visible rows based on expandedKeys + busiSegFilter
const getVisibleFlatRows = (nodes: any[], expanded: Set<string>) => {
  const res: any[] = [];
  const walk = (items: any[], level = 0, parentExpanded = true) => {
    if (!items || items.length === 0) return;
    for (const node of items) {
      const hasChildren = node.children && node.children.length > 0;
      const uuid = node.uuid;
      const visible = parentExpanded;
      if (!visible) continue;

      if (!hasChildren) {
        // 叶子节点：仅当匹配当前板块筛选时显示
        if (isLeafVisibleByFilter(node)) {
          res.push({ _raw: node, level, hasChildren: false, uuid, expanded: expanded.has(uuid), visibleTotal: aggregateVisible(node) });
        }
        continue;
      }

      // 父级节点：仅当其子树中存在可见叶子时才显示（否则整体隐藏）
      if (hasVisibleLeafInSubtree(node)) {
        res.push({ _raw: node, level, hasChildren: true, uuid, expanded: expanded.has(uuid), visibleTotal: aggregateVisible(node) });
        if (expanded.has(uuid)) {
          walk(node.children, level + 1, true);
        }
      }
      // 否则：父级及其子树整体隐藏
    }
  };
  walk(nodes, 0, true);
  return res;
};

const flatRows = computed(() => {
  // 先获取所有数据
  const rows = getVisibleFlatRows(tableData.value || [], expandedKeys.value);
  // 详情模式下，过滤掉数据为0的节点
  if (isDetail.value) {
    return rows.filter((item) => {
      const node = item._raw;
      // 如果是父节点，保留（因为父节点可能在折叠状态下作为容器）
      // if (!node.isLeaf) return true;
      // 叶子节点：检查 totalCostAmt 和 totalCostExclAmt
      const totalAmt = Number(node.totalCostAmt || 0);
      const totalExclAmt = Number(node.totalCostExclAmt || 0);
      return totalAmt !== 0 || totalExclAmt !== 0;
    });
  } else {
    return rows;
  }
});

/**
 * 全局汇总：所有叶子节点含税总额、不含税总额
 */
// 顶部合计：仅累加筛选后可见的叶子
const totalCostTax = computed(() => {
  const leaves = getAllLeafNodes(tableData.value);
  const values: number[] = [];
  productOptions.value.forEach((product) => {
    const propKey = `costAmt_${product.id}`;
    leaves.forEach((node) => {
      if (isLeafVisibleByFilter(node)) {
        const val = Number(node[propKey] || 0);
        if (!isNaN(val)) values.push(val);
      }
    });
  });
  return formatThousandWithPlaces(decimalSumNum(values));
});

const totalCostNoTax = computed(() => {
  const leaves = getAllLeafNodes(tableData.value);
  const values: number[] = [];
  productOptions.value.forEach((product) => {
    const propKey = `costExclAmt_${product.id}`;
    leaves.forEach((node) => {
      if (isLeafVisibleByFilter(node)) {
        const val = Number(node[propKey] || 0);
        if (!isNaN(val)) values.push(val);
      }
    });
  });
  return formatThousandWithPlaces(decimalSumNum(values));
});

// initialize expandedKeys to top-level nodes when tableData first loads
// initialize top-level expanded keys when needed (call after tableData is populated)
const initExpandTopLevel = () => {
  if (!tableData.value || tableData.value.length === 0) return;
  if (expandedKeys.value.size > 0) return;
  tableData.value.forEach((node: any) => expandedKeys.value.add(node.uuid));
};

// 产生表头叶子列：仅保留实际数据列（不含 index/subName，这两列在模板里手动渲染），以便 gridTemplateColumns 和 行 内单元格个数一致
const headerLeafColumns = computed(() => {
  const leaves: any[] = [];
  const walk = (cols: any[]) => {
    cols.forEach((c) => {
      // 跳过 index/subName（模板里手动渲染为序号、成本科目）
      if (c.type === "index" || c.prop === "subName") return;
      if (c.children && c.children.length > 0) {
        walk(c.children);
      } else {
        leaves.push(c);
      }
    });
  };
  walk(dynamicColumns.value || []);
  return leaves;
});

const gridTemplateColumns = computed(() => {
  const parts: string[] = [];
  // index and name fixed
  parts.push('60px');
  parts.push('180px');
  headerLeafColumns.value.forEach((c: any) => {
    if (c.width) parts.push(c.width + 'px');
    else parts.push('minmax(120px, 1fr)');
  });
  return parts.join(' ');
});

// ---- Multi-level header (grouped: 成本小计 / 业态) ----
// 递归获取表头最大层级深度（根节点为第 1 层）
const headerDepth = computed(() => {
  const getMaxLevel = (cols: any[], level = 1): number => {
    let maxL = level;
    cols.forEach((c) => {
      if (c.children?.length) {
        maxL = Math.max(maxL, getMaxLevel(c.children, level + 1));
      }
    });
    return maxL;
  };
  return getMaxLevel(dynamicColumns.value || []);
});

// Build header cells with explicit CSS grid placement (colStart/colEnd, rowStart/rowEnd)
// 核心策略：所有单元格（含分组）只占当前一行，纵向层级由递归 currentLevel 推进，
// 不再让分组单元格纵向跨多行（旧逻辑 rowEnd: rowStart + depth 会与单行叶子冲突，
// 触发 CSS Grid 生成额外隐式轨道，视觉上多出一行空白）
const headerCells = computed(() => {
  const cells: any[] = [];
  const baseCols: any[] = dynamicColumns.value || [];
  const maxLevel = headerDepth.value;

  // 前两固定列：序号、成本科目，贯穿全部表头行
  cells.push({
    key: 'idx',
    label: '序号',
    align: 'center',
    colStart: 1,
    colEnd: 2,
    rowStart: 1,
    rowEnd: maxLevel + 1,
  });
  cells.push({
    key: 'name',
    label: '成本科目',
    align: 'left',
    colStart: 2,
    colEnd: 3,
    rowStart: 1,
    rowEnd: maxLevel + 1,
  });

  // 已占用前 2 列
  let colPos = 2;

  // 递归构建多级表头单元格
  // 采用"先递归子列推进 colPos，再据最终 colPos 反算分组 colEnd"的方案，
  // 避免分组单元格与子列在 forEach 多分组场景下重叠/空隙（旧逻辑 colPos 双重推进导致列错位）
  const buildHeaders = (cols: any[], currentLevel: number) => {
    cols.forEach((col) => {
      const isLeaf = !col.children || !col.children.length;
      if (isLeaf) {
        // 叶子单元格：只占当前一行，一列
        colPos += 1;
        cells.push({
          key: `h_${col.prop}`,
          label: col.label ?? "",
          align: col.align || "center",
          colStart: colPos,
          colEnd: colPos + 1,
          // 顶层叶子列（业务归属、分摊规则）纵向贯穿全部表头行，与成本科目、分组列对齐
          rowStart: currentLevel,
          rowEnd: currentLevel === 1 ? maxLevel + 1 : currentLevel + 1,
        });
        return;
      }
      // 分组列：记录起始列，先递归子列推进 colPos，再据最终 colPos 算分组横向跨度
      const groupStart = colPos + 1;
      buildHeaders(col.children, currentLevel + 1);
      const groupEnd = colPos + 1;
      cells.push({
        key: `g_${col.label}_${groupStart}_${currentLevel}`,
        label: col.label ?? "",
        align: col.align || "center",
        colStart: groupStart,
        colEnd: groupEnd,
        rowStart: currentLevel,
        rowEnd: currentLevel + 1,
      });
    });
  };

  // 跳过 index、subName 固定列，遍历剩余表头
  baseCols.forEach((c) => {
    if (c.type === "index" || c.prop === "subName") return;
    buildHeaders([c], 1);
  });

  return cells;
});


const onCellEdit = (row: any, prop: string, val: any, index?: number) => {
  let rowIndex = typeof index === "number" && !isNaN(index) ? index : flatRows.value.findIndex((r: any) => r.uuid === row.uuid);
  if (rowIndex === -1) rowIndex = undefined;
  handleSave({ row, column: prop, newValue: val, rowIndex });
};

// Safe index display for rows — fall back to finding item position when slot index is missing
const getDisplayIndex = (item: any, idx: any) => {
  // 如果 idx 是有效数字，直接使用
  if (typeof idx === "number" && !isNaN(idx) && idx >= 0) {
    return idx + 1;
  }
  // 否则通过 uuid 查找
  const pos = flatRows.value.findIndex((r: any) => r.uuid === item.uuid);
  return pos >= 0 ? pos + 1 : "";
};

// 附件上传成功
const handleAnnexSuccess = (file: any) => {
  // console.log("相关附件上传成功", file);
  annexFileList.value.push(file);
  console.log("附件列表", annexFileList.value);
};
/**
 * 递归计算节点的所有汇总值（包括各业态汇总和总汇总）
 * 父级节点的业态金额 = 所有子节点该业态金额之和
 */
const calculateNodeTotal = (node: any): any => {
  // 初始化各业态汇总值
  const productTotals = {};
  productOptions.value.forEach((product) => {
    productTotals[`costAmt_${product.id}`] = 0;
    productTotals[`costExclAmt_${product.id}`] = 0;
  });

  let totalCostAmt = 0;
  let totalCostExclAmt = 0;

  // 如果是叶子节点，计算自身金额
  if (node.isLeaf) {
    productOptions.value.forEach((product) => {
      const costAmt = node[`costAmt_${product.id}`];
      const costExclAmt = node[`costExclAmt_${product.id}`];

      if (
        costAmt !== null &&
        costAmt !== undefined &&
        !isNaN(Number(costAmt))
      ) {
        const numValue = Number(costAmt);
        productTotals[`costAmt_${product.id}`] = numValue;
        totalCostAmt += numValue;
      }
      if (
        costExclAmt !== null &&
        costExclAmt !== undefined &&
        !isNaN(Number(costExclAmt))
      ) {
        const numValue = Number(costExclAmt);
        productTotals[`costExclAmt_${product.id}`] = numValue;
        totalCostExclAmt += numValue;
      }
    });
  } else {
    // 【关键】如果是父节点，从子节点汇总各业态金额
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        // 累加各业态金额（子节点的业态金额已经在递归计算时更新）
        productOptions.value.forEach((product) => {
          const childCostAmt = child[`costAmt_${product.id}`] || 0;
          const childCostExclAmt = child[`costExclAmt_${product.id}`] || 0;

          productTotals[`costAmt_${product.id}`] += childCostAmt;
          productTotals[`costExclAmt_${product.id}`] += childCostExclAmt;
        });

        // 累加总汇总
        totalCostAmt += child.totalCostAmt || 0;
        totalCostExclAmt += child.totalCostExclAmt || 0;
      });
    }
  }

  // 使用 decimal.js 四舍五入 保留两位小数
  const roundedProductTotals = {};
  productOptions.value.forEach((product) => {
    roundedProductTotals[`costAmt_${product.id}`] =
      roundToTwo(productTotals[`costAmt_${product.id}`]);
    roundedProductTotals[`costExclAmt_${product.id}`] =
      roundToTwo(productTotals[`costExclAmt_${product.id}`]);
  });

  return {
    ...node,
    ...roundedProductTotals, // 【关键】各业态汇总值也写入节点
    totalCostAmt: Math.round(totalCostAmt * 100) / 100,
    totalCostExclAmt: Math.round(totalCostExclAmt * 100) / 100,
  };
};

/**
 * 递归计算所有节点的小计（后序遍历：先子后父）
 */
const calculateAllTotals = (nodes: any) => {
  return nodes.map((node) => {
    // 先递归处理子节点
    let processedNode = node;
    if (node.children && node.children.length > 0) {
      processedNode = {
        ...node,
        children: calculateAllTotals(node.children),
      };
    }
    // 再计算当前节点（此时子节点已更新）
    return calculateNodeTotal(processedNode);
  });
};

/**
 * 递归更新树形数据中的节点
 */
const updateTreeNode = (
  nodes: any[],
  targetUuid: string,
  updater: (node: any) => any,
): any[] => {
  return nodes.map((node) => {
    // 找到目标节点
    if (node.uuid === targetUuid) {
      return updater(node);
    }
    // 递归查找子节点
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: updateTreeNode(node.children, targetUuid, updater),
      };
    }
    return node;
  });
};

/**
 * 不可变更新叶子节点金额并沿路径向上重算父级汇总。
 * 整条路径上的节点都生成全新对象（不原地 mutate），最后返回全新顶层数组，
 * 由调用方赋值给 tableData.value 以触发 flatRows computed 重新计算与视图刷新。
 */
const updateLeafAndRecalcUpward = (
  nodes: any[],
  targetUuid: string,
  column: string,
  newValue: any,
): any[] => {
  return nodes.map((node) => {
    // 找到目标叶子节点：直接写入新值
    if (node.uuid === targetUuid) {
      // 更新后调用 calculateNodeTotal 重新计算汇总
      const updated = { ...node, [column]: newValue };
      return calculateNodeTotal(updated);
    }
    // 有子节点：递归更新子树，再根据新子节点重算本节点汇总（全新对象）
    if (node.children && node.children.length > 0) {
      const newChildren = updateLeafAndRecalcUpward(
        node.children,
        targetUuid,
        column,
        newValue,
      );
      return calculateNodeTotal({ ...node, children: newChildren });
    }
    return node;
  });
};

/**
 * 递归获取所有叶子节点
 */
const getAllLeafNodes = (nodes: any[]): any[] => {
  const leaves: any[] = [];

  const traverse = (items: any[]) => {
    items.forEach((node) => {
      if (node.isLeaf) {
        leaves.push(node);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };

  traverse(nodes);
  return leaves;
};

/**
 * 获取缓存的叶子节点
 */
const getCachedLeafNodes = (nodes: any[]): any[] => {
  // 使用布尔版本号：每次数据变更（编辑/回填）时置 0 失效，下次访问重建缓存
  if (leafNodesVersion === 0) {
    leafNodesCache.value = getAllLeafNodes(nodes);
    leafNodesVersion = 1;
  }
  return leafNodesCache.value;
};

/**
 * 获取目标成本科目列表
 */
const getSubjectProjList = async () => {
  try {
    const res = await costCategoryApi.getCostSubjectProjList({
      projId: props.projId,
      withDetail: true,
      buildTree: true,
    });
    if (res.code === 200) {
      subjectOptions.value = buildSubjectTree(res.data || []);
    } else {
      ElMessage.error(res.msg || "获取数据失败");
    }
  } catch (error) {
    console.error("获取数据失败:", error);
  }
};

// 获取项目产品类型
const getProductList = async () => {
  try {
    const res = await productTypeApi.getProductProjList({
      projId: props.projId,
      withDetail: true,
    });
    if (res.code === 200) {
      productOptions.value = res.data || [];
    }
  } catch (error) {
    throw error;
  }
};

// 获取业务归属
const getBusiSegList = async () => {
  try {
    const res = await dictionaryApi.getsegmentList();
    if (res.code === 200) {
      busiSegOptions.value = res.data || [];
    }
  } catch (error) {
    throw error;
  }
};

// 为每个科目节点添加业态数据,提取 buildTreeWithProducts 为独立函数
const buildTreeWithProducts = (nodes: any[]): any[] => {
  return nodes.map((node) => {
    const isLeaf = !node.children || node.children.length === 0;

    const rowData: any = {
      uuid: uuidv4(),
      _meta: Object.freeze({
        subId: node.id,
        subName: node.subName,
        subCode: node.subCode,
        subLevel: node.subLevel || 0,
      }),
      subId: node.id,
      subName: node.subName,
      subCode: node.subCode,
      subLevel: node.subLevel || 0,
      isLeaf: isLeaf,
      _cellDisabled: !isLeaf,
      busiSegId: isLeaf ? node.busiSegId : null,
      segName: isLeaf ? node.segName : "",
      allocRule: isLeaf ? node.allocRule : null,
      allocRuleName: isLeaf ? node.allocRuleName : "",
      totalCostAmt: 0,
      totalCostExclAmt: 0,
      costMid: props.costMid,
      children: node.children ? buildTreeWithProducts(node.children) : [],
    };

    productOptions.value.forEach((product) => {
      rowData[`costAmt_${product.id}`] = isLeaf ? null : 0;
      rowData[`costExclAmt_${product.id}`] = isLeaf ? null : 0;
      rowData[`detailId_${product.id}`] = undefined;
    });

    return rowData;
  });
};

/**
 * 生成所有科目列表
 * 为所有节点（包括父级）初始化业态金额字段
 */
const generateCombinations = async () => {
  // 为每个科目节点添加基础业态数据
  const treeData = buildTreeWithProducts(subjectOptions.value);
  console.log("treeData", treeData);
  tableData.value = calculateAllTotals(treeData);
  console.log("tableData.value", tableData.value);
  // 重置叶子节点缓存版本
  leafNodesVersion = 0;
  // 初始化展开一级节点（仅在生成组合后自动展开）
  initExpandTopLevel();
};

/**
 * 处理保存事件 - 确保父级汇总正确更新
 */
const handleSave = async (data: any) => {
  const { row, column, newValue, oldValue, rowIndex } = data;
  const actualRow = row && row._raw ? row._raw : row;

  // 判断是否是动态业态列
  if (column && typeof column === "string") {
    // 处理业态金额列
    if (column.startsWith("costAmt_") || column.startsWith("costExclAmt_")) {
      // 只允许编辑叶子节点
      if (!actualRow.isLeaf) {
        return;
      }

      // 不可变更新：替换叶子节点金额，并沿路径向上重新计算父级汇总，
      // 全程生成全新节点对象，最后整体替换 tableData 引用，确保 flatRows/视图刷新
      tableData.value = updateLeafAndRecalcUpward(
        tableData.value,
        actualRow.uuid,
        column,
        newValue,
      );
      // 重置叶子节点缓存版本
      leafNodesVersion = 0;
      return;
    }
  }

  // 选择业务归属
  if (column === "busiSegId") {
    if (newValue) {
      const targetData = busiSegOptions.value.find(
        (item) => item.id == newValue,
      );
      if (targetData) {
        tableData.value = updateTreeNode(tableData.value, actualRow.uuid, (node) => ({
          ...node,
          busiSegId: newValue,
          segName: targetData.segName,
        }));
      }
    } else {
      tableData.value = updateTreeNode(tableData.value, actualRow.uuid, (node) => ({
        ...node,
        busiSegId: null,
        segName: "",
      }));
    }
    // 重置叶子节点缓存版本
    leafNodesVersion = 0;
    return;
  }

  // 选择分摊规则
  if (column === "allocRule") {
    if (newValue) {
      const targetData = allocRuleEnum.find((item) => item.value == newValue);
      if (targetData) {
        tableData.value = updateTreeNode(tableData.value, actualRow.uuid, (node) => ({
          ...node,
          allocRule: newValue,
          allocRuleName: targetData.label,
        }));
      }
    } else {
      tableData.value = updateTreeNode(tableData.value, actualRow.uuid, (node) => ({
        ...node,
        allocRule: null,
        allocRuleName: "",
      }));
    }
    // 重置叶子节点缓存版本
    leafNodesVersion = 0;
    return;
  }
};

// 校验列表
const validateTable = () => {
  if (tableData.value.length === 0) {
    ElMessage.error("暂无保存的数据");
    return false;
  }

  // 使用缓存的叶子节点
  const leafNodes = getCachedLeafNodes(tableData.value);

  if (leafNodes.length === 0) {
    ElMessage.error("没有可保存的科目数据");
    return false;
  }

  // for (let i = 0; i < leafNodes.length; i++) {
  //   const item = leafNodes[i];
  //   let hasValidAmount = false;

  // 检查业务归属是否已选择
  // if (!item.busiSegId) {
  //   ElMessage.error(`科目 "${item.subName}"：请选择业务归属`);
  //   return false;
  // }

  // // 检查分摊规则是否已选择
  // if (!item.allocRule) {
  //   ElMessage.error(`科目 "${item.subName}"：请选择分摊规则`);
  //   return false;
  // }

  // 检查所有业态的金额
  // productOptions.value.forEach((product) => {
  //   const costAmt = item[`costAmt_${product.id}`];
  //   const costExclAmt = item[`costExclAmt_${product.id}`];

  //   if (costAmt && costAmt > 0 && costExclAmt && costExclAmt > 0) {
  //     hasValidAmount = true;
  //   }
  // });

  // if (!hasValidAmount) {
  //   ElMessage.error(`科目 "${item.subName}"：至少需要填写一个业态的金额`);
  //   return false;
  // }
  // }
  return true;
};

// 转换数据格式用于保存 - 每个叶子节点 × 每个业态 = 一条记录
const transformDataForSave = () => {
  const saveData = [];

  // 使用缓存的叶子节点
  const leafNodes = getCachedLeafNodes(tableData.value);

  leafNodes.forEach((row) => {
    // 遍历每个业态
    productOptions.value.forEach((product) => {
      const costAmt = row[`costAmt_${product.id}`];
      const costExclAmt = row[`costExclAmt_${product.id}`];
      const detailId = row[`detailId_${product.id}`];
      // 只保存有金额的行
      // if (costAmt && costAmt > 0 && costExclAmt && costExclAmt > 0) {
      saveData.push({
        id: detailId,
        costMid: row.costMid || props.costMid,
        subId: row.subId,
        subName: row.subName,
        prodId: product.id,
        prodName: product.prodName,
        busiSegId: row.busiSegId,
        segName: row.segName,
        costAmt: costAmt || 0,
        costExclAmt: costExclAmt || 0,
        allocRule: row.allocRule,
        allocRuleName: row.allocRuleName,
      });
      // }
    });
  });

  return saveData;
};

const handleBatchSave = async () => {
  // 转换数据格式
  const saveData = transformDataForSave();
  console.log("保存数据", saveData);
  // 校验列表
  if (!validateTable()) return;

  try {
    saveLoading.value = true;
    const params = {
      costM: { id: props.costMid },
      costDList: saveData || [],
      annexList: annexFileList.value || [],
    };
    const res = await goalCostApi.saveProjectCostD(params);
    if (res.code === 200) {
      ElMessage.success("保存成功");
    } else {
      ElMessage.error(res.msg || "保存失败");
    }
  } catch (error) {
    console.error("保存失败", error);
  } finally {
    saveLoading.value = false;
  }
};
/**
 * 导出目标成本明细 Excel（真实数据）
 */
const handleExport = async () => {
  if (!props.costMid) {
    ElMessage.warning("缺少目标成本版本ID");
    return;
  }
  try {
    exportLoading.value = true;
    await goalCostApi.exportProjectCostD(props.costMid);
    ElMessage.success("导出成功");
  } catch (error) {
    console.error("导出失败", error);
    ElMessage.error("导出失败");
  } finally {
    exportLoading.value = false;
  }
};

/**
 * 导出目标成本明细空模板（带科目/业态，金额全 0）
 */
const handleExportTemplate = async () => {
  if (!props.costMid) {
    ElMessage.warning("缺少目标成本版本ID");
    return;
  }
  try {
    exportTemplateLoading.value = true;
    await goalCostApi.exportProjectCostDTemplate(props.costMid);
    ElMessage.success("模板导出成功");
  } catch (error) {
    console.error("模板导出失败", error);
    ElMessage.error("模板导出失败");
  } finally {
    exportTemplateLoading.value = false;
  }
};

/**
 * 触发文件选择
 */
const handleImport = () => {
  if (!props.costMid) {
    ElMessage.warning("缺少目标成本版本ID");
    return;
  }
  // 通过 ref 触发隐藏的 file input
  importFileInputRef.value?.click();
};

/**
 * 选择文件后的处理（导入 Excel）
 */
const onImportFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  // 清空 value，允许重复选择同一文件
  target.value = "";
  if (!file) return;
  if (!props.costMid) {
    ElMessage.warning("缺少目标成本版本ID");
    return;
  }
  try {
    importLoading.value = true;
    const res = await goalCostApi.importProjectCostD(props.costMid, file);
    if (res.code === 200) {
      const { imported, discarded } = res.data || { imported: 0, discarded: 0 };
      ElMessage.success(
        `导入完成：成功 ${imported} 条，舍弃 ${discarded} 条`,
      );
      // 导入成功后重新拉取详情，刷新表格
      await getDetailData();
      if (detailTableList.value && detailTableList.value.length > 0) {
        fillDetailDataToTable(detailTableList.value);
      }
    } else {
      ElMessage.error(res.msg || "导入失败");
    }
  } catch (error) {
    console.error("导入失败", error);
    ElMessage.error("导入失败");
  } finally {
    importLoading.value = false;
  }
};
// 获取详情数据
const getDetailData = async () => {
  try {
    detailTableList.value = [];
    const res = await goalCostApi.getProjectCostM({
      id: props.costMid,
    });
    console.log("详情res", res);
    if (res.code === 200 && res.data) {
      const { costDList, annexList } = res.data || {};
      // 如果详情信息里面有明细数据表示之前已经保存过，直接回显，否则查询上一版面积明细
      if (costDList && costDList.length > 0) {
        detailTableList.value = costDList || [];
      } else {
        // 查询上一版面积明细
        await getPrevVersionDetail();
      }

      annexFileList.value = (annexList || [])?.map((item) => {
        return {
          ...item,
          url: item.annexPath,
          name: item.annexName,
        };
      });
    }
  } catch (error) { }
};

// 获取上一版面积版本明细
const getPrevVersionDetail = async () => {
  if (!props.areaVerMid) return;
  try {
    const res = await goalCostApi.getCostPrevList({
      costMid: props.costMid,
    });
    if (res.code === 200 && res.data) {
      // console.log("上一版面积版本明细:", res.data);
      // 回显上一版本明细数据到表格
      detailTableList.value = res.data || [];
    }
  } catch (error) {
    ElMessage.error("加载数据失败");
  }
};

// 1. 新增：回显详情数据到表格（在表格数据生成后调用）
const fillDetailDataToTable = (detailData: any[]) => {
  if (!detailData?.length) return;

  // 构建 Map：key = "subId_prodId"（统一转为字符串）
  const detailMap = new Map(
    detailData.map((item) => [`${item.subId}_${item.prodId}`, item]),
  );

  // console.log('detailMap keys:', Array.from(detailMap.keys())); // 调试用

  const fillTree = (nodes: any[]): any[] => {
    return nodes.map((node) => {
      const newNode: any = { ...node };

      if (newNode.isLeaf) {
        let hasData = false;
        // 遍历所有业态，查找对应的详情
        productOptions.value.forEach((prod) => {
          // 确保 prod.id 转为字符串匹配
          const key = `${newNode.subId}_${prod.id}`;
          const detail = detailMap.get(key);
          
          // console.log(`查找: ${key}, 找到: ${!!detail}`); // 调试用
          
          if (detail) {
            hasData = true;
            // 金额处理：确保是数字
            newNode[`costAmt_${prod.id}`] = roundToTwo(detail.costAmt);
            newNode[`costExclAmt_${prod.id}`] = roundToTwo(detail.costExclAmt);
            newNode[`detailId_${prod.id}`] = detail.id;
            newNode.costMid = detail.costMid || props.costMid;
          }
        });
        
        // 如果有数据，设置公共字段
        if (hasData) {
          // 找到该科目的第一条详情数据
          const firstDetail = detailData.find((d) => d.subId === newNode.subId);
          if (firstDetail) {
            newNode.busiSegId = firstDetail.busiSegId;
            newNode.segName = firstDetail.busiSegName || firstDetail.segName || "";
            newNode.allocRule = firstDetail.allocRule;
            const rule = allocRuleEnum.find(
              (r) => r.value === firstDetail.allocRule,
            );
            newNode.allocRuleName = rule?.label || "";
          }
        }
      }
      
      if (newNode.children?.length) {
        newNode.children = fillTree(newNode.children);
      }
      return newNode;
    });
  };

  // 应用数据并重新计算汇总
  tableData.value = fillTree(tableData.value);
  tableData.value = calculateAllTotals(tableData.value);
  leafNodesVersion = 0;
};

// 获取下拉数据
const initOptions = async () => {
  await Promise.all([
    getBusiSegList(), // 业务归属
    getSubjectProjList(), // 项目下的科目
    getProductList(), // 项目下的业态
  ]);
};

// 初始化处理
const syncRouteState = async () => {
  try {
    tableLoading.value = true;
    // 获取下拉数据
    await initOptions();

    // 先把基础科目和业态组合成基础列表数据
    await generateCombinations(); // 生成组合列表数据并回填基础数据

    // 获取详情数据
    await getDetailData();

    // 如果有明细数据，回显到表格
    if (detailTableList.value && detailTableList.value.length > 0) {
      fillDetailDataToTable(detailTableList.value);
    }
    // console.log("组合列表数据", detailTableList.value);
  } catch (error) {
    console.error("初始化数据失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

// watch(
//   () => [props.mode, props.costMid, props.projId],
//   () => {
//     syncRouteState();
//   },
//   { deep: true, immediate: true },
// );

onMounted(() => {
  syncRouteState();
});

/**
 * 清理资源
 */
onBeforeUnmount(() => {
  // 清理大数组引用，释放内存
  tableData.value = [];
  subjectOptions.value = [];
  productOptions.value = [];
  busiSegOptions.value = [];
  leafNodesCache.value = [];
  cachedColumns = [];

  // 重置缓存
  lastProductOptionsHash = "";
  leafNodesVersion = 0;
});
</script>

<style lang="scss" scoped>
/* 统一表格视觉规范（对齐系统标准表格） */
$table-header-bg: #f5f7fa;
$table-border-color: #e5e6eb;
$table-font-size: 13px;
$table-row-height: 32px;
$table-row-hover-bg: #f2f3f5;
$table-header-color: #1d2129;
$table-readonly-color: rgba(0, 0, 0, 0.65);

.cost-detail-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  min-height: 0;
  box-sizing: border-box;

  .toolbar {
    flex-shrink: 0;
    margin-bottom: 12px;
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
  }

  .toolbar-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .total-summary-bar {
    border: 1px solid $table-border-color;
    border-radius: 4px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    font-size: 14px;
    background: $table-header-bg;
    color: $table-header-color;

    .summary-item {
      font-weight: 500;
      margin-right: 32px;
    }

    .busi-seg-filter {
      /* 固定宽度避免被合计文字挤压 */
      width: 140px;
      margin-left: 4px;
      flex-shrink: 0;
    }

    .amount-text {
      color: #f5222d;
      font-weight: 600;
      margin-left: 4px;
    }
  }

  .virtual-table-outer {
    /* 自动填满剩余高度，与 .tab-content 无缝贴合，底部不留白 */
    flex: 1;
    width: 100%;
    min-height: 320px;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .item-card {
    flex-shrink: 0;
    margin-top: 8px;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  padding: 0 0 8px 12px;
  position: relative;

  &::before {
    content: "";
    width: 4px;
    height: 18px;
    background: linear-gradient(180deg, #409eff, #66b1ff);
    border-radius: 2px;
    position: absolute;
    left: 0;
    top: 4px;
  }
}

/* Virtual table styles - 外层统一包围边框，消除单元格边框重叠产生的灰色虚影 */
.virtual-table {
  width: max-content;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid $table-border-color;
}

.vt-header {
  /* 关键：绝对定位横线的参照物 */
  position: relative;
  flex-shrink: 0;
  display: grid;
  height: auto;
  align-items: stretch;
  background: $table-header-bg;
  border-bottom: 1px solid $table-border-color;
  font-weight: 500;
  font-size: $table-font-size;
  color: $table-header-color;

  /* 多级表头横向分割线：贯穿整个表头宽度，不受单元格跨行合并影响 */
  .header-divider {
    position: absolute;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: $table-border-color;
    z-index: 1;
  }
}

.vt-header-cell {
  padding: 0 8px;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: safe center;
  /* 只保留右边框，第一列不写左边框，依靠外层 .virtual-table 边框 */
  border-right: 1px solid $table-border-color;
  line-height: 32px;
  background-clip: padding-box;
  /* 让文字/单元格内容盖在横线之上 */
  z-index: 2;
}

/* 最后一列表头单元格移除右侧边框，避免和外层边框叠加变灰 */
.vt-header-cell:last-child {
  border-right: none;
}

.vt-scroller {
  flex: 1;
  min-height: 0;
  overflow-y: auto !important;
  overflow-x: visible;
}

.vt-row {
  display: grid;
  height: 32px;
  border-bottom: 1px solid $table-border-color;
  font-size: $table-font-size;

  &:hover {
    background-color: $table-row-hover-bg;
  }
}

.vt-cell {
  padding: 0 8px;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-right: 1px solid $table-border-color;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-clip: padding-box;
}

/* 每行最后一列取消右边框 */
.vt-cell:last-child {
  border-right: none;
}

.vt-header,
.vt-row {
  width: max-content;
}

/* ========== 重点修复：select、input-number 单元格居中样式 ========== */
.vt-cell .el-select {
  width: 96% !important;
  margin: 0 auto !important;
}

.vt-cell .el-input-number {
  width: 96% !important;
  margin: 0 auto !important;
}

.vt-cell .el-input-number__input,
.vt-cell .el-select .el-input__inner,
.vt-cell .el-input__inner {
  height: 28px;
  padding: 2px 6px;
  box-sizing: border-box;
  font-size: 13px;
}

.vt-cell .el-input-number__decrease,
.vt-cell .el-input-number__increase {
  display: none;
}

.readonly-cell {
  color: $table-readonly-color;
}

.index-col {
  width: 60px;
  /* 序号依旧居中 */
  justify-content: center;
}

.name-col {
  width: 180px;
  /* 成本科目列左对齐，保留树形层级缩进 */
  justify-content: flex-start;
  padding-left: 8px;

  .cell-inner-wrap {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
  }
}

.expand-icon {
  cursor: pointer;
  margin-right: 6px;
  padding: 2px 6px;
  color: #409eff;
  /* 放大展开/收起图标，增强可点区域与可读性 */
  font-size: 18px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
}
</style>
