<!-- 产权管理-组件 -->
<template>
  <div class="structuralStatistics-page">
    <ChartBox title="产权管理">
      <template #content>
        <div class="structuralStatisticsContent">
          <div class="chart-controls">
            <el-button
              v-for="item in switchTypeList"
              :key="item.value"
              text
              size="default"
              :class="['chart-btn', { active: chartType === item.value }]"
              @click="switchChartType(item.value)"
            >
              {{ item.label }}
            </el-button>
          </div>
          <div ref="chartDomRef" class="structuralStatistics-chart"></div>
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
const chartType = ref("1");
const chartInstance = shallowRef<echarts.ECharts | null>(null);
const chartDomRef = ref<HTMLDivElement | null>(null);

const switchTypeList = ref([
  { value: "1", label: "库存结构" },
  { value: "2", label: "库龄" },
  { value: "3", label: "应收账龄" },
  { value: "4", label: "渠道占比" },
]);
// 切换图表类型
const switchChartType = (type: string) => {
  chartType.value = type;
};

// 初始化图表
const initChart = () => {
  if (!chartDomRef.value) {
    console.error("图表容器未找到");
    return;
  }

  try {
    // 确保之前的实例被销毁
    if (chartInstance.value) {
      chartInstance.value.dispose();
    }
    chartInstance.value = echarts.init(chartDomRef.value);
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
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    grid: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      containLabel: true, // 确保标签在容器内
    },
    series: [
      {
        name: "数据来源",
        type: "pie",
        radius: ["50%", "70%"], // 扩大内外半径
        center: ["50%", "55%"], // 调整中心位置，为标签留出空间
        animationType: "scale",
        animationEasing: "elasticOut",
        animationDelay: function () {
          return Math.random() * 200;
        },
        label: {
          show: true,
          formatter: "{b}\n{d}%",
          color: "#fff", // 文字颜色
          fontSize: 12, // 字体大小
          fontWeight: "bold", // 字体粗细
        },
        // labelLine: {
        //   length: 15, // 引导线长度
        //   length2: 10, // 第二段引导线长度
        //   smooth: 0.2, // 引导线平滑度
        // },
        data: [
          { value: 1048, name: "车位" },
          { value: 735, name: "住宅" },
          { value: 580, name: "商业" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
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
.structuralStatistics-page {
  width: 100%;
  height: 33%;
  .structuralStatisticsContent {
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
    .structuralStatistics-chart {
      width: 100%;
      flex: 1;
    }
  }
}
</style>
