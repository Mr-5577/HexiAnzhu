<!-- 转化指标-组件 -->
<template>
  <div class="conversionMetrics-page">
    <ChartBox title="转化指标情况">
      <template #content>
        <div class="conversionMetricsContent">
          <!-- 当月来访转化率 -->
          <div ref="monthChartRef" class="chart-container"></div>
          <!-- 总体来访转化率 -->
          <div ref="overallChartRef" class="chart-container"></div>
        </div>
      </template>
    </ChartBox>
  </div>
</template>

<script setup lang="ts">
import ChartBox from "@/components/chart-box.vue";
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import * as echarts from "echarts";

// 为每个图表创建独立的引用
const monthChartRef = ref<HTMLDivElement | null>(null);
const overallChartRef = ref<HTMLDivElement | null>(null);

// 为每个图表创建独立的实例
const monthChartInstance = ref<echarts.ECharts | null>(null);
const overallChartInstance = ref<echarts.ECharts | null>(null);

// 初始化当月来访转化率图表
const initMonthChart = () => {
  if (!monthChartRef.value) {
    console.error("当月图表容器未找到");
    return;
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
      text: "当月转化率",
      subtext: "35%",
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
          { value: 35, name: "已转化", itemStyle: { color: "#18f2ff" } },
          { value: 65, name: "未转化", itemStyle: { color: "#1890ff" } },
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
      text: "总体转化率",
      subtext: "42%",
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
          { value: 42, name: "已转化", itemStyle: { color: "#52c41a" } },
          { value: 58, name: "未转化", itemStyle: { color: "#faad14" } },
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

// 生命周期
onMounted(() => {
  nextTick(() => {
    initMonthChart();
    initOverallChart();
  });
  window.addEventListener("resize", handleResize);
});

// 清理 - 同时清理两个图表
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  monthChartInstance.value?.dispose();
  overallChartInstance.value?.dispose();
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
    .chart-container {
      width: 50%;
      height: 100%;
    }
  }
}
</style>