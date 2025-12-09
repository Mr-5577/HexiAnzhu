<!-- 价格指标-组件 -->
<template>
  <div class="chart-page">
    <ChartBox title="价格指标情况">
      <template #content>
        <div class="priceIndicatorContent">
          <div ref="chartDom" class="chart-container"></div>
          <div class="statistics">
            <div class="statistics-item">
              <img class="img-icon" src="@/assets/imgs/largeScreenImg/junjia.png" alt="" />
              <div class="item-content">
                <div class="item-title">住宅均价</div>
                <div class="item-unit">
                  <span class="num">5226.75</span>
                  <span class="unit">元/m²</span>
                </div>
              </div>
            </div>
            <div class="statistics-item">
              <img class="img-icon" src="@/assets/imgs/largeScreenImg/yijia.png" alt="" />
              <div class="item-content">
                <div class="item-title">整体溢价</div>
                <div class="item-unit">
                  <span class="num">23.89</span>
                  <span class="unit">万</span>
                  <span class="num" style="margin-left: 5px">2.3%</span>
                </div>
              </div>
            </div>
            <div class="statistics-item">
              <img class="img-icon" src="@/assets/imgs/largeScreenImg/yijia2.png" alt="" />
              <div class="item-content">
                <div class="item-title">溢价</div>
                <div class="item-unit">
                  <span class="num">30.89</span>
                  <span class="unit">万</span>
                  <span class="num" style="margin-left: 5px">88套</span>
                </div>
              </div>
            </div>
            <div class="statistics-item">
              <img class="img-icon" src="@/assets/imgs/largeScreenImg/pojia.png" alt="" />
              <div class="item-content">
                <div class="item-title">破价</div>
                <div class="item-unit">
                  <span class="warning">-39.89</span>
                  <span class="unit">万</span>
                  <span class="warning" style="margin-left: 5px">8套</span>
                </div>
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
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import * as echarts from "echarts";

const chartInstance = ref<echarts.ECharts | null>(null);
const chartDom = ref<HTMLDivElement | null>(null);

// 初始化图表
const initChart = () => {
  if (!chartDom.value) {
    console.error("图表容器未找到");
    return;
  }

  try {
    chartInstance.value = echarts.init(chartDom.value, null, {
      renderer: "canvas",
      useDirtyRect: false,
    });
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
    backgroundColor: "transparent", // 设置整个图表的背景色
    title: {
      text: "溢价率",
      subtext: "35%",
      left: "center",
      top: "40%",
      textStyle: {
        // 文字样式
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
      },
      subtextStyle: {
        // 百分比数字样式
        fontSize: 20,
        color: "#fff",
        fontWeight: "bold",
      },
    },
    // tooltip: {
    //   trigger: "item",
    //   formatter: "{b}: {c}%",
    // },
    series: [
      {
        name: "转化率",
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

  chartInstance.value.setOption(option);
};

// 监听窗口大小变化
const handleResize = () => {
  chartInstance.value?.resize();
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
.chart-page {
  width: 100%;
  height: 33%;
}
.priceIndicatorContent {
  width: 100%;
  flex: 1;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  .chart-container {
    width: 50%;
    height: 100%;
  }
  .statistics {
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    .statistics-item {
      width: 90%;
      height: 50px;
      background: linear-gradient(
        to right,
        rgba(6, 60, 93, 0.8),
        /* #063c5d 带透明度 */ rgba(6, 43, 61, 0.8) /* #062b3d 带透明度 */
      );
      border-radius: 25px 0 0 25px;
      padding: 0 15px;
      display: flex;
      justify-content: flex-start;
      flex-wrap: nowrap;
      align-items: center;
      .img-icon {
        width: 30px;
        height: 30px;
        margin-right: 15px;
      }
      .item-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .item-title {
        font-size: 13px;
        color: #fff;
      }
      .item-unit {
        font-size: 13px;
        font-weight: 600;
        .num {
          font-size: 15px;
          color: #06e0b1;
        }
        .unit {
          font-size: 13px;
          color: #fff;
        }
        .warning {
          color: red;
        }
      }
    }
  }
}
</style>
