<!-- 业绩排名列表-组件 -->
<template>
  <div class="ranking-page">
    <ChartBox title="业绩排名统计" :loading="loading">
      <template #content>
        <div class="rankingContent">
          <div class="chart-controls">
            <el-button
              text
              size="default"
              :class="['chart-btn', { active: chartType === '1' }]"
              @click="switchChartType('1')"
            >
              项目月度业绩排名
            </el-button>
            <el-button
              text
              size="default"
              :class="['chart-btn', { active: chartType === '2' }]"
              @click="switchChartType('2')"
            >
              个人月度业绩排名
            </el-button>
          </div>
          <div class="performance-ranking-table-list">
            <base-table
              :key="chartType"
              :pagination="false"
              :columns="tableColumn"
              :tableData="tableData"
              :total="total"
              :current-page="currentPage"
              :page-size="pageSize"
              :size="'small'"
              @pagination-change="handlePaginationChange"
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
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from "vue";
import { dateUtil } from "@/utils/date-util";
import { largeScreenApi } from "@/api/large-screen-api";

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
  getTableList();
};
// 暴露方法给父组件
defineExpose({
  refreshData,
});

// 防止重复请求
let isRequesting = false;
// 响应式数据
const chartType = ref("1");
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const tableColumn = computed(() => {
  return chartType.value === "1"
    ? [
        {
          prop: "sort",
          label: "排名",
          width: "50",
        },
        {
          prop: "projName",
          label: "项目名称",
        },
        {
          prop: "signNum",
          label: "签约(套)",
          width: "70",
        },
        {
          prop: "orderNum",
          label: "认购(套)",
          width: "70",
        },
        {
          prop: "collectMoney",
          label: "回款(万)",
        },
        {
          prop: "totalRate",
          label: "完成率",
          width: "70",
          // 使用 formatter 格式化
          formatter: (row: any, column: any, index: number) => {
            const value = row.totalRate;
            if (value === null || value === undefined) return "-";
            // 转换为百分数，保留2位小数
            return `${(value * 100).toFixed(2)}%`;
          },
        },
      ]
    : [
        {
          prop: "sort",
          label: "集团排名",
          width: "80",
        },
        {
          prop: "sortProj",
          label: "项目排名",
          width: "80",
        },
        {
          prop: "projName",
          label: "项目名称",
        },
        {
          prop: "salerName",
          label: "置业顾问",
          width: "80",
        },
        {
          prop: "orderNum",
          label: "认购(套)",
          width: "70",
        },
      ];
});

const tableData = ref([]);

// 切换图表类型
const switchChartType = (type: string) => {
  chartType.value = type;
  getTableList();
};

// 分页变化
const handlePaginationChange = (params: any) => {
  currentPage.value = params.currentPage;
  pageSize.value = params.pageSize;
};
const getTableList = async () => {
  // 检查是否已有请求在进行
  if (isRequesting) return;

  const time = dateUtil(props.data).subtract(1, "month").format("YYYY-MM-DD");
  const params = {
    projIds: props.department,
    type: 1, // 0:年  1:月  2:周  3:日
    day: `${time} 00:00:00`,
    beginDate:
      dateUtil(time).startOf("month").format("YYYY-MM-DD") + " 00:00:00",
    endDate: dateUtil(time).endOf("month").format("YYYY-MM-DD") + " 23:59:59",
  };
  try {
    isRequesting = true;
    loading.value = true;
    tableData.value = [];
    const interfaceApi =
      chartType.value === "1"
        ? largeScreenApi.getSaleProjInfo
        : largeScreenApi.getSaleProjSalerInfo;

    const res = await interfaceApi(params);
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } finally {
    isRequesting = false;
    loading.value = false;
  }
};

watch(
  () => [props.data, props.department],
  ([data, department]) => {
    if (data && department) {
      // getTableList();
    }
  },
  { immediate: true }
);

// 生命周期
onMounted(() => {
  // nextTick(() => {
  //   getTableList();
  // });
});

// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.ranking-page {
  width: 100%;
  height: 34%;
  .rankingContent {
    width: 100%;
    flex: 1;
    display: flex;
    flex-wrap: nowrap;
    flex-direction: column;
    .chart-controls {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      .chart-btn {
        color: #fff;
        cursor: pointer;
        transition: all 0.3s;
        font-weight: 400;
        padding: 0;
      }
      .chart-btn:hover {
        background: none;
        color: #7dbbfa;
      }
      .chart-btn.active {
        color: #409eff;
        font-weight: 700;
      }
    }
    .performance-ranking-table-list {
      width: 100%;
      flex: 1;
      // 确保表格容器正确显示滚动条
      :deep(.el-table) {
        // 表格背景色
        background-color: transparent !important;

        // 表头相关元素都设置透明
        .el-table__header-wrapper {
          background-color: transparent !important;
        }
        .el-table__header {
          background-color: transparent !important;
          thead {
            background-color: transparent !important;
            tr {
              background-color: transparent !important;
            }
          }
          th {
            background-color: transparent !important;
            color: #fff;
            font-size: 14px;
          }
        }

        // 表格主体 - 确保滚动条正常显示
        .el-table__body-wrapper {
          overflow-x: hidden;
          overflow-y: auto;
          .el-table__body {
            tr {
              background-color: transparent !important;
              color: #fff;
              font-size: 14px;
              // 斑马纹
              &.el-table__row--striped {
                background-color: #3bf004 !important;
              }

              // 鼠标悬停
              &:hover > td {
                background-color: transparent !important;
              }
            }
            td {
              background-color: inherit !important;
            }
          }
          .el-scrollbar {
            --el-scrollbar-opacity: 0.4;
            --el-scrollbar-bg-color: #f7f8fb;
            --el-scrollbar-hover-bg-color: #f7f8fb;
          }
        }
      }
    }
  }
}
</style>
