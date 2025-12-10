<!-- 业绩走势折线图-组件 -->
<template>
  <div class="performanceTrend-page">
    <ChartBox
      title="业绩走势情况"
      v-loading="loading"
      :element-loading-text="'数据加载中...'"
      :element-loading-background="'rgba(0, 0, 0, 0.2)'"
    >
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
  subscription: [], // 认购
  signing: [], // 签约
  payment: [], // 回款
});

// 请求锁
let isRequesting = false;

// 计算Y轴最大值
const calculateYAxisMax = (): number => {
  const { subscription, signing, payment } = chartData.value;
  const allData: any = [...subscription, ...signing, ...payment].filter(
    (v) => v !== null && v !== undefined
  );

  if (allData.length === 0) return 100;

  const maxValue = Math.max(...allData);
  return maxValue > 0 ? maxValue : 100;
};

// 获取基础图表配置
const getBaseChartOption = (): EChartsOption => {
  const yAxisMax = calculateYAxisMax();

  return {
    title: {
      text: "单位：万元",
      left: "left",
      top: 0,
      textStyle: {
        color: "#fff",
        fontSize: 12,
      },
    },
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
      data: ["认购", "签约", "回款"],
      top: "2%",
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
      right: "2%",
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
    yAxis: {
      type: "value",
      min: 0,
      max: yAxisMax,
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
      splitLine: {
        lineStyle: {
          color: "rgba(177, 173, 173, 0.5)",
          width: 1,
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "认购",
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
      },
      {
        name: "签约",
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
      },
      {
        name: "回款",
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
  const endDate = `${data} 00:00:00`;
  const startDate = dateUtil(endDate)
    .subtract(
      chartType.value === "year" ? 1 : 30,
      chartType.value === "year" ? "year" : "day"
    )
    .format("YYYY-MM-DD HH:mm:ss");

  const params = {
    projIds: department,
    type: 0,
    day: endDate,
    beginDate: startDate,
    endDate: endDate,
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
          acc.subscription.push(item.saleMoney || 0);
          acc.signing.push(item.signMoney || 0);
          acc.payment.push(item.collectMoney || 0);
          return acc;
        },
        { dates: [], subscription: [], signing: [], payment: [] }
      );
      console.log("result", result);
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
    nextTick(updateChart); // 确保 DOM 更新后重新渲染图表
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
    // initChart();
    getData();
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
  height: 33%;

  .performanceTrendContent {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .chart-controls {
      flex-shrink: 0;
      display: flex;
      justify-content: flex-end;
      margin-bottom: 12px;

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
          margin-left: 16px;
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
