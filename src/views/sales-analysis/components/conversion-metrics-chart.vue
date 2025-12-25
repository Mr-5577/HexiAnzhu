<!-- 转化指标-组件 -->
<template>
  <div class="conversionMetrics-page">
    <ChartBox title="转化指标情况" :loading="loading">
      <template #content>
        <div class="conversionMetricsContent">
          <!-- 当月来访转化率 -->
          <div class="chart-wrapper">
            <div ref="monthChartRef" class="chart-container"></div>
            <div class="chart-overlay" @click="handleMonthTitleClick">
              <div class="main-title">当月转化率</div>
              <div class="sub-title">
                {{ conversionRates.monthlyRateFormatted }}
              </div>
            </div>
          </div>
          <!-- 总体来访转化率 -->
          <div class="chart-wrapper">
            <div ref="overallChartRef" class="chart-container"></div>
            <div class="chart-overlay" @click="handleOverallTitleClick">
              <div class="main-title">总体转化率</div>
              <div class="sub-title">
                {{ conversionRates.overallRateFormatted }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </ChartBox>
  </div>
</template>

<script setup lang="ts">
import ChartBox from "@/components/chart-box.vue";
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import * as echarts from "echarts";
import { largeScreenApi } from "@/api/large-screen-api";
import { dateUtil } from "@/utils/date-util";
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
  getData();
};
// 暴露方法给父组件
defineExpose({
  refreshData,
});

const loading = ref(false);
// 防止重复请求
let isRequesting = false;
const conversionData = ref({
  dylfComeNum: 0, // 总数量
  dyrgNum: 0, // 当月转化数量
  dylfrgNum: 0, // 总体转化数量
});

// 为每个图表创建独立的引用
const monthChartRef = ref<HTMLDivElement | null>(null);
const overallChartRef = ref<HTMLDivElement | null>(null);

// 为每个图表创建独立的实例
const monthChartInstance = ref<echarts.ECharts | null>(null);
const overallChartInstance = ref<echarts.ECharts | null>(null);

const conversionRates = computed(() => {
  const total = conversionData.value.dylfComeNum;
  const monthly = conversionData.value.dylfrgNum;
  const overall = conversionData.value.dyrgNum;

  // 计算转化率的通用函数
  const calculateRate = (numerator: number): number => {
    if (total === 0) return 0;
    const rate = (numerator / total) * 100;
    // 处理NaN和Infinity
    if (isNaN(rate) || !isFinite(rate)) {
      return 0;
    }
    // 保留两位小数，四舍五入
    return Math.round(rate * 100) / 100;
  };

  // 计算当月转化率
  const monthlyRate = calculateRate(monthly);
  // 计算总体转化率
  const overallRate = calculateRate(overall);

  // 计算未转化率
  const monthlyUnconverted = Math.max(0, 100 - monthlyRate);
  const overallUnconverted = Math.max(0, 100 - overallRate);

  // 格式化函数
  const formatRate = (rate: number): string => {
    return rate.toFixed(2) + "%";
  };

  return {
    // 转化率（数值）
    monthlyRate,
    overallRate,
    monthlyUnconverted,
    overallUnconverted,

    // 格式化后的字符串
    monthlyRateFormatted: formatRate(monthlyRate),
    overallRateFormatted: formatRate(overallRate),
    monthlyUnconvertedFormatted: formatRate(monthlyUnconverted),
    overallUnconvertedFormatted: formatRate(overallUnconverted),

    // 原始数据（方便调试）
    rawData: {
      total,
      monthly,
      overall,
    },
  };
});

// 初始化当月来访转化率图表
const initMonthChart = () => {
  if (!monthChartRef.value) {
    console.error("当月图表容器未找到");
    return;
  }
  // 如果有实例，先销毁
  if (monthChartInstance.value) {
    monthChartInstance.value.dispose();
    monthChartInstance.value = null;
  }
  try {
    monthChartInstance.value = echarts.init(monthChartRef.value, null, {
      renderer: "canvas",
      useDirtyRect: false,
    });
    updateMonthChart();
  } catch (error) {
    console.error("当月图表初始化失败:", error);
  }
};
// 初始化总体来访转化率图表
const initOverallChart = () => {
  if (!overallChartRef.value) {
    console.error("总体图表容器未找到");
    return;
  }
  // 如果有实例，先销毁
  if (overallChartInstance.value) {
    overallChartInstance.value.dispose();
    overallChartInstance.value = null;
  }
  try {
    overallChartInstance.value = echarts.init(overallChartRef.value, null, {
      renderer: "canvas",
      useDirtyRect: false,
    });
    updateOverallChart();
  } catch (error) {
    console.error("总体图表初始化失败:", error);
  }
};
// 更新当月图表
const updateMonthChart = () => {
  if (!monthChartInstance.value) {
    console.error("当月图表实例未初始化");
    return;
  }

  const option = {
    backgroundColor: "transparent",
    title: {
      show: false,
      text: "当月转化率",
      subtext: conversionRates.value.monthlyRateFormatted,
      left: "center",
      top: "40%",
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
      },
      subtextStyle: {
        fontSize: 20,
        color: "#fff",
        fontWeight: "bold",
      },
    },
    series: [
      {
        name: "当月转化率",
        type: "pie",
        radius: ["50%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
        },
        data: [
          {
            value: conversionRates.value.monthlyRate,
            name: "已转化",
            itemStyle: { color: "#18f2ff" },
          },
          {
            value: conversionRates.value.monthlyUnconverted,
            name: "未转化",
            itemStyle: { color: "#1890ff" },
          },
        ],
      },
    ],
  };

  monthChartInstance.value.setOption(option);
};
// 更新总体图表
const updateOverallChart = () => {
  if (!overallChartInstance.value) {
    console.error("总体图表实例未初始化");
    return;
  }

  const option = {
    backgroundColor: "transparent",
    title: {
      show: false,
      text: "总体转化率",
      subtext: conversionRates.value.overallRateFormatted,
      left: "center",
      top: "40%",
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
      },
      subtextStyle: {
        fontSize: 20,
        color: "#fff",
        fontWeight: "bold",
      },
    },
    series: [
      {
        name: "总体转化率",
        type: "pie",
        radius: ["50%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
        },
        data: [
          {
            value: conversionRates.value.overallRate,
            name: "已转化",
            itemStyle: { color: "#52c41a" },
          },
          {
            value: conversionRates.value.overallUnconverted,
            name: "未转化",
            itemStyle: { color: "#faad14" },
          },
        ],
      },
    ],
  };

  overallChartInstance.value.setOption(option);
};
// 监听窗口大小变化 - 同时调整两个图表
const handleResize = () => {
  monthChartInstance.value?.resize();
  overallChartInstance.value?.resize();
};

const getData = async () => {
  // 检查是否已有请求在进行
  if (isRequesting) return;

  const { data, department } = props;
  const params = {
    projIds: department,
    type: 1, // 0:年  1:月  2:周  3:日
    day: `${data} 00:00:00`,
    beginDate:
      dateUtil(data).startOf("month").format("YYYY-MM-DD") + " 00:00:00",
    endDate: dateUtil(data).endOf("month").format("YYYY-MM-DD") + " 23:59:59",
  };
  try {
    isRequesting = true;
    loading.value = true;
    const res = await largeScreenApi.getCustomerComeInfo(params);
    if (res.code === 200) {
      conversionData.value = res.data;
    }
    nextTick(() => {
      initMonthChart();
      initOverallChart();
    });
  } finally {
    isRequesting = false;
    loading.value = false;
  }
};
// 跳转到 转化率统计
const handleMonthTitleClick = () => {
  const timestamp = new Date().getTime();
  router.push({
    path: "/channel-analysis/conversion-rate",
    query: {
      data: JSON.stringify(props),
      _t: timestamp.toString(),
    },
  });
};
// 跳转到 来访统计
const handleOverallTitleClick = () => {
  const timestamp = new Date().getTime();
  router.push({
    path: "/channel-analysis/visiting-statistics",
    query: {
      data: JSON.stringify({...props, type: 'date'}),
      _t: timestamp.toString(),
    },
  });
};
// 生命周期
onMounted(() => {
  nextTick(() => {
    // getData();
    initMonthChart();
    initOverallChart();
  });
  window.addEventListener("resize", handleResize);
});

// 清理 - 同时清理两个图表
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  // 安全销毁图表实例
  if (monthChartInstance.value) {
    monthChartInstance.value.dispose();
    monthChartInstance.value = null;
  }
  if (overallChartInstance.value) {
    overallChartInstance.value.dispose();
    overallChartInstance.value = null;
  }
});
</script>

<style lang="scss" scoped>
.conversionMetrics-page {
  width: 100%;
  height: 33%;
  .conversionMetricsContent {
    width: 100%;
    flex: 1;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    .chart-wrapper {
      width: 50%;
      height: 100%;
      position: relative;

      .chart-container {
        width: 100%;
        height: 100%;
      }

      .chart-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;

        .main-title {
          font-size: 16px;
          font-weight: bold;
          color: #fff;
          pointer-events: auto;
          cursor: pointer;
          text-align: center;
        }

        .sub-title {
          font-size: 20px;
          font-weight: bold;
          color: #fff;
          pointer-events: auto;
          cursor: pointer;
          text-align: center;
        }
      }
    }
  }
}
</style>
