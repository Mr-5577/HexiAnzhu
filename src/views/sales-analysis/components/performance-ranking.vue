<!-- 业绩排名列表-组件 -->
<template>
  <div class="ranking-page">
    <ChartBox title="业绩排名统计" :loading="loading">
      <template #content>
        <div class="rankingContent">
          <div class="chart-controls">
            <div>
              <el-button
                v-for="item in chartTypeOptions"
                :key="item.value"
                text
                size="default"
                :class="['chart-btn', { active: chartType === item.value }]"
                @click="switchChartType(item.value)"
              >
                {{ item.label }}
              </el-button>
            </div>
            <el-button
              class="chart-btn"
              size="default"
              text
              style="color: #409eff"
              @click="handleToPage"
            >
              更多>>
            </el-button>
          </div>
          <div class="performance-ranking-table-list">
            <base-table
              :key="chartType"
              :pagination="false"
              :columns="tableColumn"
              :tableData="tableData"
              :autoHeight="false"
              :height="tableHeight"
              :size="'small'"
              :highlightCurrentRow="false"
            >
              <template #empty>
                <div>暂无数据</div>
              </template>
            </base-table>
          </div>
        </div>
      </template>
    </ChartBox>
  </div>
</template>

<script setup lang="ts">
import ChartBox from "@/components/chart-box.vue";
import BaseTable from "@/components/base-table.vue";
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from "vue";
import { dateUtil } from "@/utils/date-util";
import { largeScreenApi } from "@/api/large-screen-api";
import { useRouter } from "vue-router";

const router = useRouter();

interface Props {
  data: string;
  department: number[];
}
const props = withDefaults(defineProps<Props>(), {
  data: "",
  department: () => [],
});

// 定义一个需要暴露的方法
const refreshData = () => {
  tableCache.value = { "1": [], "2": [] };
  getTableList();
};

// 暴露方法给父组件
defineExpose({
  refreshData,
});

// 图表类型配置
const chartTypeOptions = [
  {
    value: "1",
    label: "项目月度业绩排名",
    apiMethod: largeScreenApi.getSaleProjInfo,
  },
  {
    value: "2",
    label: "个人月度业绩排名",
    apiMethod: largeScreenApi.getSaleProjSalerInfo,
  },
];

// 防止重复请求
let isRequesting = false;

// 响应式数据
const chartType = ref("1");
const loading = ref(false);
const tableCache = ref({
  "1": [], // 项目月度业绩排名
  "2": [], // 个人月度业绩排名
});

// 计算表格高度
const tableHeight = ref("100%");

// 添加防抖函数（简单实现）
let resizeTimer: NodeJS.Timeout | null = null;

const updateTableHeight = () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    nextTick(() => {
      const tableContainer = document.querySelector(
        ".performance-ranking-table-list"
      );

      if (tableContainer) {
        // 直接使用容器高度，避免复杂计算
        const containerHeight = tableContainer.clientHeight;
        // 简单减去固定的控制栏高度（约40px）
        tableHeight.value = `${Math.max(containerHeight - 4, 100)}px`;
      }
    });
  }, 100); // 100ms 防抖延迟
};

const tableColumn = computed(() => {
  return chartType.value === "1"
    ? [
        { prop: "sort", label: "排名", width: "50" },
        { prop: "projName", label: "项目名称" },
        { prop: "signNum", label: "签约(套)", width: "70" },
        { prop: "orderNum", label: "认购(套)", width: "70" },
        { prop: "collectMoney", label: "回款(万)" },
        {
          prop: "totalRate",
          label: "完成率",
          width: "70",
          formatter: (row: any) => {
            const value = row.totalRate;
            return value !== null && value !== undefined
              ? `${(value * 100).toFixed(2)}%`
              : "-";
          },
        },
      ]
    : [
        { prop: "sort", label: "集团排名", width: "80" },
        { prop: "sortProj", label: "项目排名", width: "80" },
        { prop: "projName", label: "项目名称" },
        { prop: "salerName", label: "置业顾问", width: "80" },
        { prop: "orderNum", label: "认购(套)", width: "70" },
      ];
});

const currentApiMethod = computed(() => {
  return chartTypeOptions.find((item) => item.value === chartType.value)
    ?.apiMethod;
});

const tableData = computed(() => {
  return tableCache.value[chartType.value] || [];
});

// 切换图表类型
const switchChartType = (type: string) => {
  chartType.value = type;
  getTableList();
  updateTableHeight(); // 切换时更新高度
};

const getTableList = async () => {
  // 检查是否已有请求在进行
  if (isRequesting) return;
  const dataList = tableCache.value[chartType.value] || [];
  if (dataList && dataList.length) return;

  const time = dateUtil(props.data).subtract(1, "month").format("YYYY-MM-DD");
  const params = {
    projIds: props.department,
    type: 1,
    day: `${time} 00:00:00`,
    beginDate:
      dateUtil(time).startOf("month").format("YYYY-MM-DD") + " 00:00:00",
    endDate: dateUtil(time).endOf("month").format("YYYY-MM-DD") + " 23:59:59",
  };

  try {
    isRequesting = true;
    loading.value = true;
    const apiMethod = currentApiMethod.value;
    if (!apiMethod) return;

    const res = await apiMethod(params);
    if (res.code === 200) {
      tableCache.value[chartType.value] = res.data || [];
    }
  } finally {
    isRequesting = false;
    loading.value = false;
    updateTableHeight(); // 数据加载完成后更新高度
  }
};

const handleToPage = () => {
  const path =
    chartType.value === "1"
      ? "/performance-analysis/daily-report"
      : "/performance-analysis/agent-ranking";
  const timestamp = new Date().getTime();
  router.push({
    path: path,
    query: {
      data: JSON.stringify(props),
      _t: timestamp.toString(),
    },
  });
};

watch(
  () => [props.data, props.department],
  ([data, department]) => {
    if (data && department) {
      updateTableHeight();
    }
  },
  { immediate: true }
);
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  updateTableHeight();
  // 监听表格容器大小变化
  const tableContainer = document.querySelector(
    ".performance-ranking-table-list"
  );
  if (tableContainer) {
    resizeObserver = new ResizeObserver(updateTableHeight);
    resizeObserver.observe(tableContainer);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
});
</script>
<style lang="scss" scoped>
.ranking-page {
  width: 100%;
  height: 34%;
  .rankingContent {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .chart-controls {
      height: 32px; // 固定高度
      display: flex;
      justify-content: space-between;
      flex-shrink: 0;
      .chart-btn {
        color: #fff;
        cursor: pointer;
        transition: all 0.3s;
        font-weight: 400;
        padding: 0 !important;
        border: none !important;
        &:hover {
          background: none;
          color: #7dbbfa;
        }
        &.active {
          color: #409eff;
          font-weight: 700;
        }
        & + .chart-btn {
          margin-left: 16px;
        }
      }
    }
    .performance-ranking-table-list {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 0; // 关键：允许容器收缩
      // 关键：确保表格容器背景透明
      :deep(.pro-table-container) {
        background-color: transparent;
        .table-wrapper {
          flex: 1;
          overflow: hidden;
          .el-table {
            background-color: transparent !important;
            height: 100%;
            // 表头部分
            .el-table__header-wrapper {
              background-color: transparent !important;
              .el-table__header {
                background-color: transparent !important;
                thead {
                  background-color: transparent !important;
                  tr {
                    background-color: transparent !important;
                    th {
                      background-color: transparent !important;
                      color: #fff !important;
                      font-size: 14px;
                      border-bottom: 1px solid rgba(255, 255, 255, 0.6);
                      .cell {
                        color: #fff !important;
                      }
                    }
                  }
                }
              }
            }

            // 表格主体部分
            .el-table__body-wrapper {
              height: calc(100% - 39px) !important;
              overflow-y: auto !important;
              .el-table__body {
                background-color: transparent !important;
                tr {
                  background-color: transparent !important;
                  color: #fff;
                  font-size: 14px;
                  td {
                    background-color: transparent !important;
                    color: #fff;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.6);
                    .cell {
                      color: #fff;
                    }
                  }
                  // 斑马纹
                  &.el-table__row--striped {
                    td {
                      background-color: rgba(59, 240, 4, 0.05) !important;
                    }
                  }
                  // 鼠标悬停
                  &:hover {
                    td {
                      background-color: rgba(255, 255, 255, 0.05) !important;
                    }
                  }
                }
              }
            }
            // 滚动条样式
            .el-scrollbar {
              --el-scrollbar-opacity: 0.4;
              .el-scrollbar__thumb {
                background-color: rgba(255, 255, 255, 0.4);
                &:hover {
                  background-color: rgba(255, 255, 255, 0.6);
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
