<!-- 业绩走势折线图-组件 -->
<template>
  <div class="performanceTrend-page">
    <ChartBox title="业绩走势情况">
      <template #content>
        <div class="performanceTrendContent">
          <div class="chart-controls">
            <el-button
              text
              size="default"
              :class="['chart-btn', { active: chartType === 'year' }]"
              @click="switchChartType('year')"
            >
              近一年业绩走势
            </el-button>
            <el-button
              text
              size="default"
              :class="['chart-btn', { active: chartType === 'month' }]"
              @click="switchChartType('month')"
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
import { ref, shallowRef, onMounted, onUnmounted, nextTick } from "vue";
import * as echarts from "echarts";

// 响应式数据
const chartType = ref("year");
const chartInstance = shallowRef<echarts.ECharts | null>(null);
const chartDom = ref<HTMLDivElement | null>(null);
// 模拟数据
const chartData = ref({
  dates: [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ],
  subscription: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330],
  signing: [220, 182, 191, 234, 290, 330, 310, 321, 305, 387, 420, 450],
  payment: [150, 232, 201, 154, 190, 330, 410, 281, 201, 284, 320, 380],
});

// 切换图表类型
const switchChartType = (type: string) => {
  chartType.value = type;
};

// 初始化图表
const initChart = () => {
  if (!chartDom.value) {
    console.error("图表容器未找到");
    return;
  }

  try {
    // 确保之前的实例被销毁
    if (chartInstance.value) {
      chartInstance.value.dispose();
    }
    chartInstance.value = echarts.init(chartDom.value);
    setTimeout(() => {
      updateChart();
    }, 500);
  } catch (error) {
    console.error("图表初始化失败:", error);
  }
};

// 更新图表
const updateChart = () => {
  if (!chartInstance.value) {
    console.error("图表实例未初始化");
    return;
  }
  const option = {
    // title: {
    //   // 图表标题
    //   text: chartType.value === "year" ? "近一年业绩趋势" : "近三十天走访趋势",
    //   left: "center",
    //   textStyle: {
    //     fontSize: 16,
    //     fontWeight: "bold",
    //   },
    // },
    tooltip: {
      show: true,
      trigger: "axis",
    },
    legend: {
      data: ["认购", "签约", "回款"],
      top: "2%",
      textStyle: {
        // 图例文字样式
        color: "#fff", // 文字颜色
        fontSize: 12, // 字体大小
        fontWeight: "bold", // 字体粗细
        fontFamily: "Arial", // 字体类型
      },
      itemStyle: {
        // 图例标记样式
        borderWidth: 1, // 边框宽度
        borderColor: "#ccc", // 边框颜色
        borderType: "solid", // 边框类型
      },
      itemGap: 15, // 图例每项之间的间隔
      itemWidth: 25, // 图例标记的图形宽度
      itemHeight: 14, // 图例标记的图形高度
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
        // 坐标轴刻度标签样式
        color: "#eee", // 文字颜色
        fontSize: 12, // 字体大小
        fontWeight: "bold", // 字体粗细
        // rotate: 45, // 旋转角度
        margin: 10, // 与坐标轴距离
        // formatter: function (value: string) {
        //   // 格式化文本
        //   return value + "月";
        // },
      },
      axisTick: {
        // 坐标轴刻度样式
        show: true, // 是否显示
        length: 5, // 刻度长度
        lineStyle: {
          color: "#999", // 刻度颜色
          width: 1, // 刻度宽度
          type: "solid", // 刻度类型
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#eee",
        fontSize: 12,
        // formatter: "{value}%", // 例如显示百分比
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: "#999",
          width: 1,
        },
      },
      splitLine: {
        // 网格线样式
        lineStyle: {
          color: "#b1adad", // 网格线颜色
          width: 1,
          type: "dashed", // 虚线
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
      },
    ],
  };

  chartInstance.value.setOption(option);
};
// 监听窗口大小变化
const handleResize = () => {
  if (chartInstance.value && !chartInstance.value.isDisposed()) {
    // 使用 requestAnimationFrame 优化性能
    requestAnimationFrame(() => {
      try {
        chartInstance.value?.resize({
          animation: {
            duration: 300,
          },
        });
      } catch (error) {
        console.error("Resize error:", error);
      }
    });
  }
};

// 生命周期
onMounted(() => {
  nextTick(() => {
    initChart();
  });
  window.addEventListener("resize", handleResize);
});

// 清理
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
      }
      .chart-btn.active {
        color: #409eff;
        font-weight: 700;
      }
    }
    .performanceTrend-chart {
      width: 100%;
      flex: 1;
    }
  }
}
</style>
