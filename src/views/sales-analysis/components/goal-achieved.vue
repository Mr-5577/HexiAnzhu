<!-- 目标达成情况-组件 -->
<template>
  <div class="chart-page">
    <ChartBox title="目标达成情况" :loading="loading">
      <template #content>
        <div class="goalContent">
          <el-radio-group
            v-model="typeVal"
            size="small"
            text-color="#626aef"
            fill="rgb(239, 240, 253)"
            @change="handleChange()"
          >
            <el-radio-button label="年" :value="0" />
            <el-radio-button label="月" :value="1" />
            <el-radio-button label="周" :value="2" />
            <el-radio-button label="日" :value="3" />
          </el-radio-group>
          <div class="all-goal">
            <div
              class="goal-item"
              v-for="item in dataList"
              :key="item.id"
              @click="handleLookDetail(item)"
            >
              <div class="item-left">
                <img class="img-icon" :src="item.img" alt="" />
                <div class="goal-desc">
                  <div class="proportion">
                    {{ item.symbol }} <span class="symbol">%</span>
                  </div>
                  <div class="title">{{ item.text }}</div>
                </div>
              </div>
              <div class="item-right">
                <div class="goal-text">
                  <div class="desc-text">{{ item.complete }}(完成)</div>
                  <div class="desc-text">{{ item.goal }}(目标)</div>
                </div>
                <el-progress
                  :text-inside="true"
                  :stroke-width="14"
                  :color="item.color"
                  :show-text="false"
                  :percentage="item.proportion"
                />
              </div>
            </div>
          </div>
          <div class="priceIndicatorContent">
            <!-- 饼状图 -->
            <div ref="chartDom" class="chart-container"></div>
            <div class="statistics">
              <div class="statistics-item">
                <img
                  class="img-icon"
                  src="@/assets/imgs/largeScreenImg/junjia.png"
                  alt=""
                />
                <div class="item-content">
                  <div class="item-title">住宅均价</div>
                  <div class="item-unit">
                    <span class="num">{{ premiumData.zzSalePrice }}</span>
                    <span class="unit">元/m²</span>
                  </div>
                </div>
              </div>
              <div class="statistics-item">
                <img
                  class="img-icon"
                  src="@/assets/imgs/largeScreenImg/yijia.png"
                  alt=""
                />
                <div class="item-content">
                  <div class="item-title">整体溢价</div>
                  <div class="item-unit">
                    <span class="num">{{ premiumData.premiumMoney }}</span>
                    <span class="unit">万</span>
                    <span class="num" style="margin-left: 5px">
                      {{ formatPercent(premiumData.premiumRate) }}%
                    </span>
                  </div>
                </div>
              </div>
              <div class="statistics-item">
                <img
                  class="img-icon"
                  src="@/assets/imgs/largeScreenImg/yijia2.png"
                  alt=""
                />
                <div class="item-content">
                  <div class="item-title">溢价</div>
                  <div class="item-unit">
                    <span class="num">{{ premiumData.yjMoney }}</span>
                    <span class="unit">万</span>
                    <span class="num" style="margin-left: 5px">
                      {{ premiumData.yjNum }}套
                    </span>
                  </div>
                </div>
              </div>
              <div class="statistics-item">
                <img
                  class="img-icon"
                  src="@/assets/imgs/largeScreenImg/pojia.png"
                  alt=""
                />
                <div class="item-content">
                  <div class="item-title">破价</div>
                  <div class="item-unit">
                    <span class="warning">{{ premiumData.pjMoney }}</span>
                    <span class="unit">万</span>
                    <span class="warning" style="margin-left: 5px">
                      {{ premiumData.pjNum }}套
                    </span>
                  </div>
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
import laifang from "@/assets/imgs/largeScreenImg/laifang.png";
import huikuan from "@/assets/imgs/largeScreenImg/huikuan.png";
import qianyue from "@/assets/imgs/largeScreenImg/qianyue.png";
import ChartBox from "@/components/chart-box.vue";
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from "vue";
import * as echarts from "echarts";
import { largeScreenApi } from "@/api/large-screen-api";
import {
  PremiumDataInterface,
  SaleDataInterface,
} from "@/types/large-screen-type";
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

// 防止重复请求
let isRequesting = false;
const loading = ref(false);
const saleData = ref<SaleDataInterface>({
  orderNum: 0, // 订单数量
  signNum: 0, // 签约数量
  collectMoney: 0, // 付款金额
  orderTask: 0, // 认购目标套数
  signTask: 0, //  签约目标套数
  collectTask: 0, // 回款目标金额

  orderRate: 0, // 认购达成率
  signRate: 0, // 签约达成率
  collectRate: 0, // 回款达成率
  totalRate: 0, // 综合达成率
});
const premiumData = ref<PremiumDataInterface>({
  allNum: 0, // 总记录数

  premiumMoney: 0, // 总溢价金额
  premiumRate: 0, // 总溢价率

  yjNum: 0, // 溢价记录数
  yjMoney: 0, // 溢价总金额

  pjNum: 0, // 破价记录数
  pjMoney: 0, // 破价总金额

  allSalePrice: 0, // 整体均价
  zzSalePrice: 0, // 住宅均价
  floorMoney: 0, // 底价金额
  saleMoney: 0, // 住宅销售金额
  saleArea: 0, // 住宅销售面积
});

const typeVal = ref(0);
const dataList = ref([
  {
    id: 1,
    img: laifang,
    symbol: 0,
    text: "来访(组)",
    complete: 0,
    goal: 0,
    color: "#409eff",
    proportion: 0,
    path: "/channel-analysis/visiting-statistics",
  },
  {
    id: 2,
    img: qianyue,
    symbol: 0,
    text: "认购(套)",
    complete: 0,
    goal: 0,
    color: "#1ff4cb",
    proportion: 0,
    path: "/performance-analysis/daily-report",
  },
  {
    id: 3,
    img: qianyue,
    symbol: 0,
    text: "签约(套)",
    complete: 0,
    goal: 0,
    color: "#67c23a",
    proportion: 0,
    path: "/performance-analysis/daily-report",
  },
  {
    id: 4,
    img: huikuan,
    symbol: 0,
    text: "回款(万)",
    complete: 0,
    goal: 0,
    color: "#e6a23c",
    proportion: 0,
    path: "/performance-analysis/daily-report",
  },
]);

const chartInstance = ref<echarts.ECharts | null>(null);
const chartDom = ref<HTMLDivElement | null>(null);

// 初始化图表
const initChart = () => {
  if (!chartDom.value) {
    console.error("图表容器未找到");
    return;
  }

  try {
    // 如果图表已经初始化，先销毁
    if (chartInstance.value) {
      chartInstance.value.dispose();
      chartInstance.value = null;
    }
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
  const subtext = formatPercent(premiumData.value.premiumRate) + "%";
  const option = {
    backgroundColor: "transparent", // 设置整个图表的背景色
    title: {
      show: false, // 不显示title标题
      text: "溢价率",
      subtext: subtext,
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
    // 使用graphic自定义标题
    graphic: [
      {
        // 主标题
        type: "text",
        left: "center",
        top: "38%",
        style: {
          text: "溢价率",
          fontSize: 16,
          fontWeight: "bold",
          fill: "#fff",
        },
        cursor: "pointer",
        onclick: () => {
          handleTitleClick();
        },
      },
      {
        // 副标题
        type: "text",
        left: "center",
        top: "50%",
        style: {
          text: subtext,
          fontSize: 20,
          fontWeight: "bold",
          fill: "#fff",
        },
        cursor: "pointer",
        onclick: () => {
          handleTitleClick();
        },
      },
    ],
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

// 跳转到项目溢价统计表页面
const handleTitleClick = () => {
  const data = { path: "/risk-analysis/premium-stats" };
  handleLookDetail(data);
};

// 监听窗口大小变化
const handleResize = () => {
  chartInstance.value?.resize();
};

// 获取销售业绩数据
const getData = async () => {
  // 检查是否已有请求在进行
  if (isRequesting) return;

  const params = {
    projIds: props.department,
    type: typeVal.value,
    day: `${props.data} 00:00:00`,
  };
  try {
    isRequesting = true;
    loading.value = true;
    const res = await largeScreenApi.getSaleInfo(params);
    if (res.code === 200) {
      saleData.value = res.data;
    }
    const res2 = await largeScreenApi.getPremiumInfo(params);
    if (res2.code === 200) {
      premiumData.value = res2.data;
    }
    processCombinedData();
    nextTick(() => {
      initChart();
    });
  } finally {
    isRequesting = false;
    loading.value = false;
  }
};
// 格式化百分比函数
const formatPercent = (value: any, goal?: any) => {
  if (value === undefined || value === null) return "-";
  if (goal !== undefined && goal !== null && goal === 0) {
    return "-";
  }
  return (value * 100).toFixed(0);
};
const processCombinedData = () => {
  // 计算进度百分比函数
  const calculateProgress = (complete: any, goal: any) => {
    if (!goal || goal === 0) return 0;
    const percentage = Math.round((complete / goal) * 100);
    return percentage >= 100 ? 100 : percentage;
  };

  // 使用映射配置
  const mappings: any = [
    {
      id: 1,
      data: saleData.value,
      fields: {
        complete: "comeNum",
        goal: "comeTask",
        rate: "comeRate",
      },
    },
    {
      id: 2,
      data: saleData.value,
      fields: {
        complete: "orderNum",
        goal: "orderTask",
        rate: "orderRate",
      },
    },
    {
      id: 3,
      data: saleData.value,
      fields: {
        complete: "signNum",
        goal: "signTask",
        rate: "signRate",
      },
    },
    {
      id: 4,
      data: saleData.value,
      fields: {
        complete: "collectMoney",
        goal: "collectTask",
        rate: "collectRate",
      },
    },
  ];

  // 更新 dataList
  dataList.value = dataList.value.map((item) => {
    const mapping = mappings.find((m: any) => m.id === item.id);
    if (mapping && mapping.data) {
      const { complete, goal, rate } = mapping.fields;
      const newItem: any = { ...item };

      if (mapping.data[complete] !== undefined) {
        newItem.complete = mapping.data[complete];
      }
      if (mapping.data[goal] !== undefined) {
        newItem.goal = mapping.data[goal];
      }
      if (mapping.data[rate] !== undefined) {
        newItem.symbol = formatPercent(mapping.data[rate], mapping.data[goal]);
      }
      // 动态计算进度条
      if (newItem.complete !== undefined && newItem.goal !== undefined) {
        newItem.proportion = calculateProgress(newItem.complete, newItem.goal);
      }

      return newItem;
    }
    return item;
  });
  console.log("更新后的数据:", dataList.value);
};

const handleChange = () => {
  nextTick(() => {
    getData();
  });
};
const handleLookDetail = (item: any) => {
  const timestamp = new Date().getTime();
  router.push({
    path: item.path,
    query: {
      data: JSON.stringify(props),
      _t: timestamp.toString(),
    },
  });
};
watch(
  () => [props.data, props.department],
  ([data, department]) => {
    if (data && department) {
      // nextTick(() => {
      //   getData();
      // });
    }
  },
  { immediate: true }
);

// 生命周期
onMounted(() => {
  window.addEventListener("resize", handleResize);
  // 如果数据还没有加载，先显示默认图表
  nextTick(() => {
    if (chartDom.value && !chartInstance.value) {
      initChart();
    }
    // getData();
  });
});

// 清理
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  chartInstance.value?.dispose();
  chartInstance.value = null;
});
</script>

<style lang="scss" scoped>
.chart-page {
  width: 100%;
  height: 66%;
}
.goalContent {
  width: 100%;
  flex: 1;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  .el-radio-group {
    display: flex;
    justify-content: flex-end;
  }
  .all-goal {
    width: 100%;
    height: 50%;
    display: flex;
    flex-direction: column;
    .goal-item {
      width: 100%;
      height: 25%;
      display: flex;
      .item-left {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        margin-right: 20px;
        width: 115px;
        cursor: pointer;
        .img-icon {
          width: 45px;
          height: 45px;
          margin-right: 5px;
        }
        .proportion {
          font-weight: 600;
          font-size: 18px;
          color: #06fff0;
          text-align: left;
          font-style: normal;
          text-transform: none;
          .symbol {
            font-size: 12px;
            color: #fff;
          }
        }
        .title {
          font-weight: 400;
          font-size: 14px;
          color: #ffffff;
          line-height: 22px;
          text-align: left;
          font-style: normal;
          text-transform: none;
        }
      }
      .item-right {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        .goal-text {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .desc-text {
            font-size: 14px;
            color: #ffffff;
            line-height: 24px;
            text-align: right;
            font-style: normal;
            text-transform: none;
          }
        }
        :deep(.el-progress-bar__outer) {
          cursor: pointer;
          background-color: transparent; // 进度条背景
        }
      }
    }
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
        width: 100%;
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
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          .num {
            font-size: 14px;
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
}
</style>
