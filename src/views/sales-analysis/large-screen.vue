<template>
  <div class="homePage">
    <el-header class="header-box">
      <div class="header-left">
        <el-select
          v-model="selectValue"
          placeholder="请选择"
          style="width: 120px"
          class="custom-company-select"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-date-picker
          v-model="dataValue"
          type="date"
          size="default"
          placeholder="选择日期"
          style="width: 140px; margin-left: 10px"
          :clearable="false"
          class="custom-data-picker"
        ></el-date-picker>
      </div>
      <div class="header-title">和喜安筑销售监控平台</div>
      <div class="header-right">
        <div class="time">更新时间:</div>
        <div class="time">{{ yearMonthDay }}</div>
        <div class="time">{{ time }}</div>
        <div class="time">{{ week }}</div>
      </div>
      <!-- <img class="screen" src="@/assets/imgs/largeScreenImg/full-screen.png" alt=""> -->
    </el-header>
    <el-main class="main-box">
      <div class="main-left">
        <goal-achieved></goal-achieved>
        <price-indicator-chart></price-indicator-chart>
        <performance-ranking></performance-ranking>
      </div>
      <div class="main-middle">
        <achievement-rate></achievement-rate>
        <performance-trend-chart></performance-trend-chart>
      </div>
      <div class="main-right">
        <conversion-metrics-chart></conversion-metrics-chart>
        <financial-statistics></financial-statistics>
        <structural-statistics-chart></structural-statistics-chart>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { config } from "@/utils/config";
import GoalAchieved from "./components/goal-achieved.vue";
import PriceIndicatorChart from "./components/price-indicator-chart.vue";
import AchievementRate from "./components/achievement-rate.vue";
import PerformanceTrendChart from "./components/performance-trend-chart.vue";
import ConversionMetricsChart from "./components/conversion-metrics-chart.vue";
import FinancialStatistics from "./components/financial-statistics.vue";
import StructuralStatisticsChart from "./components/structural-statistics-chart.vue";
import PerformanceRanking from "./components/performance-ranking.vue";
import { ref, onMounted, onUnmounted } from "vue";
import { formatToDateTime, formatToDate } from "@/utils/date-util";

// 组件name，需要和菜单配置里面的name一致
defineOptions({
  name: 'large-screen'
});

const yearMonthDay = ref("");
const time = ref("");
const week = ref("");
const selectValue = ref("1");
const dataValue = ref("");

let timer: string | number | NodeJS.Timeout | null | undefined = null;
const updateTime = () => {
  const newDate = new Date();
  yearMonthDay.value = formatToDateTime(newDate, "YYYY年MM月DD日");
  time.value = formatToDateTime(newDate, "HH:mm:ss");
  week.value = formatToDateTime(newDate, "dddd");
};

const options = [
  {
    value: "1",
    label: "全集团",
  },
  {
    value: "2",
    label: "子公司1",
  },
  {
    value: "3",
    label: "子公司2",
  },
];

onMounted(() => {
  console.log("项目环境配置config", config);
  dataValue.value = formatToDate(new Date());
  updateTime();
  timer = setInterval(updateTime, 1000);
});
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style lang="scss" scoped>
.homePage {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #021f2d;
  background-image: url("@/assets/imgs/largeScreenImg/bg2.png");
  background-size: cover; /* 确保图片覆盖整个容器 */
  background-position: center; /* 图片居中显示 */
  background-repeat: no-repeat; /* 防止图片重复 */
  .header-box {
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #0d4466;
    background-image: url("@/assets/imgs/largeScreenImg/header-bg.png");
    background-size: 100% 100%; /* 保持图片原始宽度，宽高适应容器 */
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    .header-left {
      width: 33%;
      height: 50px;
      display: flex;
      flex-wrap: nowrap;
      align-items: flex-end;
      justify-content: flex-start;
      padding-left: 3rem;
      box-sizing: border-box;
      .custom-company-select {
        :deep(.el-select__wrapper) {
          background-color: #0f3b56 !important;
          border: 1px solid #0f3b56 !important;
          box-shadow: 0 0 0 1px #1c5e85 inset;
        }
        :deep(.el-select__selected-item) {
          color: #dbe9ef !important;
        }
      }
      :deep(.el-input__wrapper) {
        background-color: #0f3b56 !important;
        border: 1px solid #0f3b56 !important;
        box-shadow: 0 0 0 1px #1c5e85 inset !important;
      }
      // 如果需要修改输入框文字颜色
      :deep(.el-input__inner) {
        color: #dbe9ef !important;
      }
    }
    .header-title {
      width: 33%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 30px;
      color: #0df7fe;
      font-weight: 700;
    }
    .header-right {
      width: 33%;
      height: 36px;
      display: flex;
      flex-wrap: nowrap;
      align-items: flex-end;
      justify-content: flex-end;
      padding-right: 2rem;
      box-sizing: border-box;
      .time {
        font-size: 16px;
        color: #fff;
        font-weight: 600;
        margin-right: 8px;
      }
    }
    .screen {
      position: absolute;
      top: 5px;
      right: 30px;
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }
  .main-box {
    width: 100%;
    flex: 1;
    display: flex;
    flex-wrap: nowrap;
    box-sizing: border-box;
    padding: 10px 10px;
    .main-left,
    .main-right {
      width: 30%;
    }
    .main-middle {
      width: 40%;
      padding: 0 15px;
      box-sizing: border-box;
    }
  }
}
</style>
