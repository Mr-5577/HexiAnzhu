<template>
  <div class="homePage">
    <el-header class="header-box">
      <div class="header-left">
        <el-cascader
          class="custom-cascader"
          v-model="departmentVal"
          placeholder="请选择"
          :options="options"
          :props="cascaderProps"
          collapse-tags
          collapse-tags-tooltip
          clearable
          :show-all-levels="false"
          :max-collapse-tags="1"
        ></el-cascader>
        <el-date-picker
          v-model="dataVal"
          type="date"
          size="default"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 120px; margin-left: 10px"
          :clearable="false"
          class="custom-data-picker"
        ></el-date-picker>
        <el-button
          text
          size="default"
          class="search-btn"
          @click="handleSearch()"
        >
          查询
        </el-button>
      </div>
      <div class="header-title">和喜安筑销售监控平台</div>
      <div class="header-right">
        <!-- <div class="time">更新时间:</div> -->
        <div class="time">{{ yearMonthDay }}</div>
        <div class="time">{{ time }}</div>
        <div class="time">{{ week }}</div>
      </div>
    </el-header>
    <el-main class="main-box">
      <div class="main-left">
        <goal-achieved
          ref="goalAchievedRef"
          :data="dataVal"
          :department="departmentVal"
        ></goal-achieved>
        <performance-ranking
          ref="performanceRankingRef"
          :data="dataVal"
          :department="departmentVal"
        ></performance-ranking>
      </div>
      <div class="main-middle">
        <achievement-rate
          ref="achievementRateRef"
          :data="dataVal"
          :department="departmentVal"
        ></achievement-rate>
        <performance-trend-chart
          ref="performanceTrendChartRef"
          :data="dataVal"
          :department="departmentVal"
        ></performance-trend-chart>
      </div>
      <div class="main-right">
        <conversion-metrics-chart
          ref="conversionMetricsChartRef"
          :data="dataVal"
          :department="departmentVal"
        ></conversion-metrics-chart>
        <financial-statistics
          ref="financialStatisticsRef"
          :data="dataVal"
          :department="departmentVal"
        ></financial-statistics>
        <structural-statistics-chart
          ref="structuralStatisticsChartRef"
          :data="dataVal"
          :department="departmentVal"
        ></structural-statistics-chart>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import GoalAchieved from "./components/goal-achieved.vue";
import AchievementRate from "./components/achievement-rate.vue";
import PerformanceTrendChart from "./components/performance-trend-chart.vue";
import ConversionMetricsChart from "./components/conversion-metrics-chart.vue";
import FinancialStatistics from "./components/financial-statistics.vue";
import StructuralStatisticsChart from "./components/structural-statistics-chart.vue";
import PerformanceRanking from "./components/performance-ranking.vue";
import { ref, onMounted, onUnmounted, computed } from "vue";
import { formatToDateTime, formatToDate } from "@/utils/date-util";
import { largeScreenApi } from "@/api/large-screen-api";

// 组件name，需要和菜单配置里面的name一致
defineOptions({
  name: "large-screen",
});

const yearMonthDay = ref("");
const time = ref("");
const week = ref("");
const departmentVal = ref<number[]>([]);
const dataVal = ref("");
const options = ref<any[]>([]);

// 定义多个 ref
const goalAchievedRef = ref<InstanceType<typeof GoalAchieved>>();
const performanceRankingRef = ref<InstanceType<typeof PerformanceRanking>>();
const achievementRateRef = ref<InstanceType<typeof AchievementRate>>();
const performanceTrendChartRef =
  ref<InstanceType<typeof PerformanceTrendChart>>();
const structuralStatisticsChartRef =
  ref<InstanceType<typeof StructuralStatisticsChart>>();
const conversionMetricsChartRef =
  ref<InstanceType<typeof ConversionMetricsChart>>();
const financialStatisticsRef = ref<InstanceType<typeof FinancialStatistics>>();

let timer: string | number | NodeJS.Timeout | null | undefined = null;
const updateTime = () => {
  const newDate = new Date();
  yearMonthDay.value = formatToDateTime(newDate, "YYYY年MM月DD日");
  time.value = formatToDateTime(newDate, "HH:mm:ss");
  week.value = formatToDateTime(newDate, "dddd");
};

// 获取最后一层ID集合
const getLeafNodeIds = (nodes: any[]): number[] => {
  const result: number[] = [];
  const traverse = (node: any) => {
    if (!node.children || node.children.length === 0) {
      result.push(node.id);
      return;
    }
    node.children.forEach(traverse);
  };
  nodes.forEach(traverse);
  return result;
};

const getProjList = async () => {
  const res = await largeScreenApi.getProjTree();
  if (res.code === 200) {
    const data = res.data || [];
    options.value = data;
    departmentVal.value = getLeafNodeIds(data);
    setTimeout(() => {
      // 手动触发子组件加载数据
      refreshAllComponents();
    }, 100);
  }
};

const cascaderProps = computed(() => ({
  value: "id",
  label: "projName",
  multiple: true,
  emitPath: false,
  checkStrictly: true, // 可选：是否严格选择模式
  expandTrigger: "hover", // 可选：展开方式

  // 关键：根据 projType 设置 disabled
  // disabled: (data: any, node: any) => {
  //   // projType !== 1 的项目禁用
  //   return data.projType !== 1;
  // },
}));

// 统一刷新所有子组件
const refreshAllComponents = () => {
  const components = [
    goalAchievedRef.value,
    performanceRankingRef.value,
    achievementRateRef.value,
    performanceTrendChartRef.value,
    structuralStatisticsChartRef.value,
    conversionMetricsChartRef.value,
    financialStatisticsRef.value,
  ];
  components.forEach((component) => {
    if (component && typeof component.refreshData === "function") {
      component.refreshData();
    }
  });
};

const handleSearch = () => {
  refreshAllComponents();
};

onMounted(() => {
  dataVal.value = formatToDate(new Date());
  updateTime();
  timer = setInterval(updateTime, 1000);
  getProjList();
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
      padding-left: 2rem;
      box-sizing: border-box;
      :deep(.custom-cascader) {
        height: 32px;
        .el-input__wrapper {
          padding: 0 11px;
        }
        .el-cascader__tags {
          display: flex;
          flex-wrap: nowrap;
          .el-tag {
            color: #d1e0e7;
            background-color: transparent !important;
          }
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

      .search-btn {
        color: #fff;
        cursor: pointer;
        transition: all 0.3s;
        font-weight: 500;
        padding: 0;
        margin-left: 10px;
      }
      .search-btn:hover {
        background: none;
        color: #7dbbfa;
      }
      .search-btn.active {
        color: #409eff;
        font-weight: 700;
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
      padding-right: 1.5rem;
      box-sizing: border-box;
      .time {
        font-size: 16px;
        color: #fff;
        font-weight: 600;
        margin-right: 8px;
      }
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
