<template>
  <div class="homePage">
    <el-header class="header-box">
      <div class="header-left">
        <!-- <el-cascader
          class="custom-cascader fixed-height-cascader"
          :filterable="true"
          v-model="departmentVal"
          placeholder="请选择"
          :options="options"
          :props="cascaderProps"
          collapse-tags
          collapse-tags-tooltip
          clearable
          :show-all-levels="false"
          :max-collapse-tags="1"
        ></el-cascader> -->
        <project-tree-selector
          class="large-screen-project-tree"
          v-model="departmentVal"
          :project-list="options"
          placeholder="请选择项目"
          width="220px"
        ></project-tree-selector>
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
        <div class="checkbox-folder">
          <el-checkbox
            v-model="isQueryFast"
            label="加速"
            size="large"
            @change="changeQueryFast"
          />
        </div>
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
      <el-tooltip
        :content="isFullScreen ? '退出全屏' : '全屏'"
        placement="bottom"
      >
        <img
          class="full-screen-img"
          :src="isFullScreen ? exitFullScreenIcon : fullScreenIcon"
          :alt="isFullScreen ? '退出全屏' : '全屏'"
          @click="toggleFullScreen"
        />
      </el-tooltip>
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
import {
  ref,
  onMounted,
  onUnmounted,
  computed,
  onDeactivated,
  onActivated,
} from "vue";
import { formatToDateTime, formatToDate } from "@/utils/date-util";
import { largeScreenApi } from "@/api/large-screen-api";
import { ElMessage } from "element-plus";
import fullScreenIcon from "@/assets/imgs/largeScreenImg/full-screen.png";
import exitFullScreenIcon from "@/assets/imgs/largeScreenImg/small-screen.png";
import { useUserStore } from "@/stores/user-store";
const userStore = useUserStore();

// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "large-screen" });

const yearMonthDay = ref("");
const time = ref("");
const week = ref("");
const departmentVal = ref<number[]>([]);
const dataVal = ref("");
const options = ref<any[]>([]);
const isQueryFast = ref(true);

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

// 更新时间
const timer = ref<any>(null);
const updateTime = () => {
  const newDate = new Date();
  yearMonthDay.value = formatToDateTime(newDate, "YYYY年MM月DD日");
  time.value = formatToDateTime(newDate, "HH:mm:ss");
  week.value = formatToDateTime(newDate, "dddd");

  dataVal.value = formatToDate(newDate);
};

// 定时更新时间和请求子组件方法
const updateTimeAndRefresh = () => {
  updateTime();
  refreshAllComponents();
};

const isFullScreen = computed(() => userStore.isFullScreen);
// 切换全屏函数
const toggleFullScreen = async () => {
  try {
    if (!isFullScreen.value) {
      userStore.setFullScreen(true);
      // ElMessage.success("已进入全屏模式");
    } else {
      userStore.setFullScreen(false);
      // ElMessage.success("已退出全屏模式");
    }
  } catch (error) {
    console.error("全屏切换失败:", error);
  }
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

// 调整子组件有echarts图表的大小
const resizeAllCharts = () => {
  // 延迟执行，确保 DOM 完全渲染
  setTimeout(() => {
    const components = [
      goalAchievedRef.value,
      performanceTrendChartRef.value,
      structuralStatisticsChartRef.value,
      conversionMetricsChartRef.value,
    ];

    components.forEach((component) => {
      if (component && typeof component.resizeChart === "function") {
        component.resizeChart();
      }
    });
  }, 100);
};

const changeQueryFast = (value: boolean) => {
  isQueryFast.value = value;
  userStore.setQueryFast(value);
};
// 启动定时器
const startTimer = () => {
  // 先清除已有定时器
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
  // 启动新定时器（15分钟）
  timer.value = setInterval(
    () => {
      updateTime();
      refreshAllComponents();
    },
    15 * 60 * 1000,
  );
};

// 停止定时器
const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};
// 组件挂载（keepalive场景）
onMounted(() => {
  userStore.setQueryFast(isQueryFast.value);
  updateTime();
  getProjList();
  startTimer(); // 启动定时器
});
// 组件卸载（无keepalive场景）
onUnmounted(() => {
  stopTimer();
});
// 页面激活时的处理（keepalive场景）
onActivated(() => {
  startTimer();
  // 页面激活时重新调整图表大小
  resizeAllCharts();
});
// 页面停用时的处理（keepalive场景）
onDeactivated(() => {
  stopTimer();
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
      // padding-left: 2rem;
      box-sizing: border-box;
      // :deep(.custom-cascader) {
      //   height: 32px;
      //   .el-input__wrapper {
      //     padding: 0 11px;
      //   }
      //   .el-cascader__tags {
      //     display: flex;
      //     flex-wrap: nowrap;
      //     .el-tag {
      //       color: #d1e0e7;
      //       background-color: transparent !important;
      //     }
      //     .el-cascader__search-input {
      //       color: #d1e0e7;
      //     }
      //   }
      // }
      :deep(.custom-data-picker) {
        .el-input__wrapper {
          background-color: #0f3b56 !important;
          border: 1px solid #0f3b56 !important;
          box-shadow: 0 0 0 1px #1c5e85 inset !important;
        }
        .el-input__inner {
          color: #dbe9ef !important;
        }
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
      .checkbox-folder {
        height: 36px;
        display: flex;
        align-items: center;
        margin-left: 10px;
        :deep(.el-checkbox__label) {
          color: #fff;
        }
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
    .full-screen-img {
      position: absolute;
      top: 26px;
      right: 20px;
      width: 20px;
      height: 20px;
      cursor: pointer;
      color: #fff;
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
<style lang="scss">
.large-screen-project-tree {
  .selector-wrapper {
    border: none !important;
    background-color: #0f3b56 !important;
    color: #dbe9ef;
    .placeholder {
      color: #dbe9ef;
    }
  }
}
</style>
