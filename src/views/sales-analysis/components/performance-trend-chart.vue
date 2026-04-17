<template>
  <div class="performanceTrend-page">
    <BaseChart title="业绩走势情况" :loading="loading">
      <template #content>
        <div class="performanceTrendContent">
          <div class="chart-controls">
            <div>
              <el-button
                v-for="item in CHART_TYPES"
                :key="item.value"
                text
                size="default"
                :class="['chart-btn', { active: chartType === item.value }]"
                @click="handleChartTypeChange(item.value)"
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
          <div ref="chartDom" class="performanceTrend-chart"></div>
        </div>
      </template>
    </BaseChart>
  </div>
</template>

<script setup lang="ts">
import BaseChart from "@/components/base/base-chart.vue";
import {
  ref,
  shallowRef,
  onMounted,
  onUnmounted,
  computed,
  nextTick,
  onActivated,
} from "vue";
import * as echarts from "echarts";
import { dateUtil } from "@/utils/date-util";
import { largeScreenApi } from "@/api/large-screen-api";
import type { ECharts, EChartsOption } from "echarts";
import { useRouter } from "vue-router";

const router = useRouter();

interface Props {
  data: string;
  department: number[];
}

interface YearData {
  syearMonth: string;
  orderNum: number;
  signNum: number;
  collectMoney: number;
}

interface DayData {
  comeDate: string;
  comeNum: number;
}

const props = withDefaults(defineProps<Props>(), {
  data: "",
  department: () => [],
});

// 常量定义
const CHART_TYPES = [
  { value: "year", label: "近一年业绩走势" },
  { value: "month", label: "近三十天来访趋势" },
] as const;

// 响应式数据
const loading = ref(false);
// 请求锁
let isRequesting = false;
const chartType = ref("year");
const chartInstance = shallowRef<ECharts | null>(null);
const chartDom = ref<HTMLDivElement | null>(null);

// 图表数据
const chartData = ref({
  dates: [] as string[],
  subscription: [] as number[],
  signing: [] as number[],
  payment: [] as number[],
});

const chartDayData = ref({
  xData: [] as string[],
  yData: [] as number[],
});

// 计算属性
const paymentMax = computed(() => {
  const validData = chartData.value.payment.filter((v) => v != null);
  return validData.length ? Math.max(...validData, 100) : 100;
});

const setMax = computed(() => {
  const allData = [
    ...chartData.value.subscription,
    ...chartData.value.signing,
  ].filter((v) => v != null);
  return allData.length ? Math.max(...allData, 100) : 100;
});
const numMax = computed(() => {
  const allData = [...chartDayData.value.yData].filter((v) => v != null);
  return allData.length ? Math.max(...allData) : 30;
});

// 图表配置
const chartOption = computed<EChartsOption>(() => {
  if (chartType.value === "year") {
    return {
      tooltip: { trigger: "axis" },
      legend: {
        data: ["认购(套)", "签约(套)", "回款(万)"],
        top: "0%",
        textStyle: { color: "#fff", fontSize: 12, fontWeight: "bold" },
        itemGap: 15,
        itemWidth: 25,
        itemHeight: 14,
      },
      grid: {
        left: "3%",
        right: "3%",
        bottom: "3%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: chartData.value.dates,
        axisLabel: {
          color: "#eee",
          fontSize: 12,
          fontWeight: "bold",
          margin: 10,
        },
      },
      yAxis: [
        {
          type: "value",
          name: "万元",
          min: 0,
          max: paymentMax.value,
          axisLabel: { color: "#eee", fontSize: 12 },
          nameTextStyle: {
            color: "#eee",
            fontSize: 12,
          },
          splitLine: {
            lineStyle: {
              color: "rgba(177, 173, 173, 0.3)",
              width: 1,
              type: "dashed",
            },
          },
        },
        {
          type: "value",
          name: "套",
          min: 0,
          max: setMax.value,
          position: "right",
          axisLabel: { color: "#eee", fontSize: 12 },
          nameTextStyle: {
            color: "#eee",
            fontSize: 12,
          },
          splitLine: {
            lineStyle: {
              color: "rgba(177, 173, 173, 0.3)",
              width: 1,
              type: "dashed",
            },
          },
        },
      ],
      series: [
        {
          name: "认购(套)",
          type: "line",
          data: chartData.value.subscription,
          smooth: true,
          lineStyle: { width: 3 },
          itemStyle: { color: "#5470c6" },
          yAxisIndex: 1,
        },
        {
          name: "签约(套)",
          type: "line",
          data: chartData.value.signing,
          smooth: true,
          lineStyle: { width: 3 },
          itemStyle: { color: "#91cc75" },
          yAxisIndex: 1,
        },
        {
          name: "回款(万)",
          type: "line",
          data: chartData.value.payment,
          smooth: true,
          lineStyle: { width: 3 },
          itemStyle: { color: "#fac858" },
          yAxisIndex: 0,
        },
      ],
    };
  }

  return {
    tooltip: { trigger: "axis" },
    legend: {
      data: ["人数"],
      top: "0%",
      textStyle: { color: "#fff", fontSize: 12, fontWeight: "bold" },
      itemGap: 15,
      itemWidth: 25,
      itemHeight: 14,
    },
    grid: {
      left: "3%",
      right: "3%",
      bottom: "3%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: chartDayData.value.xData,
      axisLabel: {
        color: "#eee",
        fontSize: 12,
        fontWeight: "bold",
        margin: 10,
        // 自定义标签显示格式
        formatter: (value: string) => {
          // 示例1：只显示月份和日期（去掉年份）
          if (value.includes("-")) {
            return value.split("-").slice(1).join("-"); // 显示 MM-DD
          }
          return value;
        },
      },
    },
    yAxis: [
      {
        type: "value",
        name: "组",
        min: 0,
        max: numMax.value,
        axisLabel: { color: "#eee", fontSize: 12 },
        nameTextStyle: {
          color: "#eee",
          fontSize: 12,
        },
        splitLine: {
          lineStyle: {
            color: "rgba(177, 173, 173, 0.3)",
            width: 1,
            type: "dashed",
          },
        },
      },
    ],
    series: [
      {
        name: "人数",
        type: "line",
        data: chartDayData.value.yData,
        smooth: true,
        lineStyle: { width: 3 },
        itemStyle: { color: "#5470c6" },
      },
    ],
  };
});

// 暴露方法
defineExpose({
  refreshData: () => fetchData(),
  resizeChart: () => handleResize(),
});

// 图表操作
const initChart = () => {
  if (!chartDom.value) return;

  disposeChart();
  chartInstance.value = echarts.init(chartDom.value);
  updateChart();
};

const updateChart = () => {
  if (!chartInstance.value) return;
  chartInstance.value.setOption(chartOption.value, true);
};

const disposeChart = () => {
  if (chartInstance.value && !chartInstance.value.isDisposed()) {
    chartInstance.value.dispose();
  }
};

const handleResize = () => {
  if (chartInstance.value && !chartInstance.value.isDisposed()) {
    chartInstance.value.resize();
  }
};

// 数据处理
const handleChartTypeChange = (type: string) => {
  if (chartType.value === type) return;
  chartType.value = type;
  fetchData();
};

const fetchData = async () => {
  // 检查是否已有请求在进行
  if (isRequesting) return;

  loading.value = true;
  isRequesting = true;
  try {
    const params = getRequestParams();
    if (chartType.value === "year") {
      const res = await largeScreenApi.getSaleYearInfo(params);
      if (res.code === 200) {
        processYearData(res.data || []);
      }
    } else {
      const res = await largeScreenApi.getCustomerCome30Day(params);
      if (res.code === 200) {
        processDayData(res.data || []);
      }
    }
    initChart();
  } catch (error) {
    console.error("获取数据失败:", error);
    resetData();
    initChart();
  } finally {
    loading.value = false;
    isRequesting = false;
  }
};

const getRequestParams = () => {
  const isYear = chartType.value === "year";
  const endTime = dateUtil(props.data)
    .subtract(isYear ? 1 : 1, isYear ? "month" : "day")
    .endOf(isYear ? "month" : "day")
    .format("YYYY-MM-DD");

  const startDate = dateUtil(endTime)
    .subtract(isYear ? 1 : 30, isYear ? "year" : "day")
    .format("YYYY-MM-DD");

  return {
    projIds: props.department,
    type: 0, // 0:年  1:月  2:周  3:日
    day: `${props.data} 00:00:00`,
    beginDate: `${startDate} 00:00:00`,
    endDate: `${endTime} 23:59:59`,
  };
};

const processYearData = (dataList: YearData[]) => {
  const result = {
    dates: [] as string[],
    subscription: [] as number[],
    signing: [] as number[],
    payment: [] as number[],
  };
  dataList.forEach((item) => {
    result.dates.push(item.syearMonth);
    result.subscription.push(item.orderNum || 0);
    result.signing.push(item.signNum || 0);
    result.payment.push(item.collectMoney || 0);
  });
  chartData.value = result;
};

const processDayData = (listData: DayData[]) => {
  const xData: string[] = [];
  const yData: number[] = [];
  listData.forEach((item) => {
    xData.push(dateUtil(item.comeDate).format("YYYY-MM-DD"));
    yData.push(item.comeNum || 0);
  });
  chartDayData.value = { xData, yData };
};

const resetData = () => {
  chartData.value = { dates: [], subscription: [], signing: [], payment: [] };
  chartDayData.value = { xData: [], yData: [] };
};

const handleToPage = () => {
  const path =
    chartType.value === "year"
      ? "/performance-analysis/annual-report"
      : "/channel-analysis/visiting-statistics";
  const timestamp = new Date().getTime();
  let params: any = {
    data: props.data,
    projIds: props.department,
  };
  if (chartType.value === "month") {
    params.type = "date";
  }
  router.push({
    path: path,
    query: {
      data: JSON.stringify(params),
      _t: timestamp.toString(),
    },
  });
};

// 生命周期
onMounted(() => {
  window.addEventListener("resize", handleResize);
  nextTick(() => {
    initChart();
    // fetchData();
  });
});
onActivated(() => {
  // 延迟执行确保 DOM 已渲染
  setTimeout(() => {
    handleResize();
  }, 100);
});
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  disposeChart();
});
</script>

<style lang="scss" scoped>
.performanceTrend-page {
  width: 100%;
  height: 34%;

  .performanceTrendContent {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .chart-controls {
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;

      .chart-btn {
        color: #fff;
        padding: 0 8px !important;
        font-weight: 400;
        transition: color 0.3s;
        &:hover {
          color: #7dbbfa;
          background: none;
        }

        &.active {
          color: #409eff;
          font-weight: 700;
        }

        & + .chart-btn {
          margin-left: 0;
        }
      }
    }

    .performanceTrend-chart {
      flex: 1;
      min-height: 0;
    }
  }
}
</style>
