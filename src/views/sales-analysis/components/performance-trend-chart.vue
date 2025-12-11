<!-- 业绩走势折线图-组件 -->
<template>
  <div class="performanceTrend-page">
    <ChartBox title="业绩走势情况" :loading="loading">
      <template #content>
        <div class="performanceTrendContent">
          <div class="chart-controls">
            <el-button
              text
              size="default"
              :class="['chart-btn', { active: chartType === 'year' }]"
              @click="handleChartTypeChange('year')"
            >
              近一年业绩走势
            </el-button>
            <el-button
              text
              size="default"
              :class="['chart-btn', { active: chartType === 'month' }]"
              @click="handleChartTypeChange('month')"
            >
              近三十天来访趋势
            </el-button>
          </div>
          <div ref="chartDom" class="performanceTrend-chart"></div>
        </div>
      </template>
    </ChartBox>
  </div>
</template>

<script setup lang="ts">
import ChartBox from "@/components/chart-box.vue";
import { ref, shallowRef, onMounted, onUnmounted, watch, nextTick } from "vue";
import * as echarts from "echarts";
import { dateUtil } from "@/utils/date-util";
import { largeScreenApi } from "@/api/large-screen-api";
import type { ECharts, EChartsOption } from "echarts";

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
  getData();
};
// 暴露方法给父组件
defineExpose({
  refreshData,
});

// 响应式数据
const loading = ref(false);
const chartType = ref("year");
const chartInstance = shallowRef<ECharts | null>(null);
const chartDom = ref<HTMLDivElement | null>(null);

// 图表数据
const chartData = ref({
  dates: [], // 时间
  subscription: [], // 认购(套)
  signing: [], // 签约(套)
  payment: [], // 回款(万元)
});

// 请求锁
let isRequesting = false;

// 计算Y轴最大值，回款(万元)
const calculatePaymentMax = (): number => {
  const { payment } = chartData.value;
  const validData = payment.filter((v) => v !== null && v !== undefined);
  if (validData.length === 0) return 100;
  const maxValue = Math.max(...validData);
  return maxValue > 0 ? maxValue : 100;
};
// 计算Y轴最大值（套数）
const calculateSetMax = (): number => {
  const { subscription, signing } = chartData.value;
  const allData = [...subscription, ...signing].filter(
    (v) => v !== null && v !== undefined
  );
  if (allData.length === 0) return 100;
  const maxValue = Math.max(...allData);
  return maxValue > 0 ? maxValue : 100;
};

// 获取基础图表配置
const getBaseChartOption = (): EChartsOption => {
  const paymentMax = calculatePaymentMax();
  const setMax = calculateSetMax();

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
    },
    legend: {
      data: ["认购(套)", "签约(套)", "回款(万)"],
      top: "0%",
      textStyle: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
      },
      itemStyle: {
        borderWidth: 1,
        borderColor: "#ccc",
      },
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
      axisTick: {
        show: true,
        length: 5,
        lineStyle: {
          color: "#999",
          width: 1,
        },
      },
    },
    yAxis: [
      {
        // 左侧坐标轴：万元（回款）
        type: "value",
        name: "万元",
        nameTextStyle: {
          color: "#eee",
          fontSize: 12,
        },
        min: 0,
        max: paymentMax,
        axisLabel: {
          color: "#eee",
          fontSize: 12,
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: "#999",
            width: 1,
          },
        },
        // 左侧Y轴轴线（竖线）
        axisLine: {
          show: true,
          lineStyle: {
            color: "#38494a",
            width: 1,
          },
        },
        // 左侧网格线
        splitLine: {
          show: true,
          lineStyle: {
            color: "rgba(177, 173, 173, 0.3)",
            width: 1,
            type: "dashed",
          },
        },
      },
      {
        // 右侧坐标轴：套（认购、签约）
        type: "value",
        name: "套",
        nameTextStyle: {
          color: "#eee",
          fontSize: 12,
        },
        min: 0,
        max: setMax,
        position: "right",
        axisLabel: {
          color: "#eee",
          fontSize: 12,
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: "#999",
            width: 1,
          },
        },
        // 右侧Y轴轴线（竖线）
        axisLine: {
          show: true,
          lineStyle: {
            color: "#38494a",
            width: 1,
          },
        },
        // 右侧网格线
        splitLine: {
          show: true,
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
        lineStyle: {
          width: 3,
        },
        itemStyle: {
          color: "#5470c6",
        },
        symbol: "circle",
        symbolSize: 6,
        yAxisIndex: 1, // 使用右侧坐标轴（套）
      },
      {
        name: "签约(套)",
        type: "line",
        data: chartData.value.signing,
        smooth: true,
        lineStyle: {
          width: 3,
        },
        itemStyle: {
          color: "#91cc75",
        },
        symbol: "circle",
        symbolSize: 6,
        yAxisIndex: 1, // 使用右侧坐标轴（套）
      },
      {
        name: "回款(万)",
        type: "line",
        data: chartData.value.payment,
        smooth: true,
        lineStyle: {
          width: 3,
        },
        itemStyle: {
          color: "#fac858",
        },
        symbol: "circle",
        symbolSize: 6,
        yAxisIndex: 0, // 使用左侧坐标轴（万元）
      },
    ],
  };
};

// 切换图表类型
const handleChartTypeChange = (type: string) => {
  if (chartType.value === type) return;
  chartType.value = type;
  getData();
};

// 初始化图表
const initChart = () => {
  if (!chartDom.value) return;

  try {
    chartInstance.value?.dispose();
    chartInstance.value = echarts.init(chartDom.value);
    updateChart();
  } catch (error) {
    console.error("图表初始化失败:", error);
  }
};

// 更新图表
const updateChart = () => {
  if (!chartInstance.value) return;
  chartInstance.value.setOption(getBaseChartOption(), true);
};

// 处理窗口大小变化
const handleResize = () => {
  if (!chartInstance.value || chartInstance.value.isDisposed()) return;
  chartInstance.value.resize();
};

// 获取数据
const getData = async () => {
  if (isRequesting) return;

  const { data, department } = props;
  const time = `${data} 00:00:00`;
  let endTime;
  if (chartType.value === "year") {
    // 近一年的结束时间是：当前时间的上个月最后一天
    endTime = dateUtil(time)
      .subtract(1, "month")
      .endOf("month")
      .format("YYYY-MM-DD HH:mm:ss");
  } else {
    // 近三十天的结束时间是：当前时间往前推一天
    endTime = dateUtil(time).subtract(1, "day").format("YYYY-MM-DD HH:mm:ss");
  }
  const startDate = dateUtil(endTime)
    .subtract(
      chartType.value === "year" ? 1 : 30,
      chartType.value === "year" ? "year" : "day"
    )
    .format("YYYY-MM-DD HH:mm:ss");

  const params = {
    projIds: department,
    type: 0,
    day: time,
    beginDate: startDate,
    endDate: endTime,
  };

  try {
    isRequesting = true;
    loading.value = true;

    const res = await largeScreenApi.getSaleYearInfo(params);
    if (res.code === 200) {
      const dataList: any[] = res.data || [];
      // 使用 reduce 一次性处理数据
      const result = dataList.reduce(
        (acc, item) => {
          acc.dates.push(item.syearMonth);
          acc.subscription.push(item.orderNum || 0);
          acc.signing.push(item.signNum || 0);
          acc.payment.push(item.collectMoney || 0);
          return acc;
        },
        { dates: [], subscription: [], signing: [], payment: [] }
      );
      chartData.value = result;
      initChart();
    }
  } catch (error) {
    console.error("获取数据失败:", error);
    chartData.value = { dates: [], subscription: [], signing: [], payment: [] };
    initChart();
  } finally {
    isRequesting = false;
    loading.value = false;
  }
};

// 监听依赖变化
watch(
  () => [props.data, props.department],
  ([data, department]) => {
    if (data && department) {
      // getData();
    }
  },
  { immediate: true }
);

// 组件挂载
onMounted(() => {
  nextTick(() => {
    // getData();
  });
  window.addEventListener("resize", handleResize);
});

// 组件卸载
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  chartInstance.value?.dispose();
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
      justify-content: flex-end;

      .chart-btn {
        color: #fff;
        padding: 0 8px;
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
          margin-left: 0px;
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
