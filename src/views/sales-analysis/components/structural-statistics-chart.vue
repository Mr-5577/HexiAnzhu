<template>
  <div class="structuralStatistics-page">
    <ChartBox title="产权管理" :loading="loading">
      <template #content>
        <div class="structuralStatisticsContent">
          <!-- 图表类型切换 -->
          <div class="chart-controls">
            <el-button
              v-for="item in SWITCH_TYPE_LIST"
              :key="item.value"
              text
              size="default"
              :class="['chart-btn', { active: chartType === item.value }]"
              @click="handleChartTypeChange(item.value)"
            >
              {{ item.label }}
            </el-button>
          </div>

          <!-- 库存结构子类型 -->
          <div v-show="chartType === '1'" class="sub-type-controls">
            <el-radio-group
              v-model="inventoryType"
              size="small"
              text-color="#626aef"
              fill="rgb(239, 240, 253)"
              @change="handleInventoryTypeChange"
            >
              <el-radio-button
                v-for="subType in INVENTORY_SUB_TYPES"
                :key="subType.value"
                :label="subType.label"
                :value="subType.value"
              />
            </el-radio-group>
          </div>

          <!-- 图表容器 -->
          <div ref="chartDomRef" class="structuralStatistics-chart"></div>
        </div>
      </template>
    </ChartBox>
  </div>
</template>

<script setup lang="ts">
import ChartBox from "@/components/chart-box.vue";
import { ref, shallowRef, onMounted, onUnmounted, computed } from "vue";
import * as echarts from "echarts";
import { largeScreenApi } from "@/api/large-screen-api";
import type { ECharts, EChartsOption, PieSeriesOption } from "echarts";

interface Props {
  data: string;
  department: number[];
}

interface ApiDataItem {
  groupName: string;
  roomCount?: number;
  sort?: number;
}

interface PieDataItem {
  value: number;
  name: string;
}

const props = withDefaults(defineProps<Props>(), {
  data: "",
  department: () => [],
});

// 常量定义
const SWITCH_TYPE_LIST = [
  { value: "1", label: "库存结构" },
  { value: "2", label: "应收账龄" },
  { value: "3", label: "渠道占比" },
] as const;

const INVENTORY_SUB_TYPES = [
  { value: "time", label: "时间" },
  { value: "area", label: "面积" },
  { value: "allPrice", label: "总价" },
  { value: "format", label: "业态" },
] as const;

// API数据索引映射 - 对应接口返回的6个数组
const API_DATA_INDEX_MAP = {
  time: 0, // 库存结构-时间维度
  area: 1, // 库存结构-面积维度
  allPrice: 2, // 库存结构-总价维度
  format: 3, // 库存结构-业态维度
  receivable: 4, // 应收账龄
  channel: 5, // 渠道占比
} as const;

// 响应式数据
const loading = ref(false);
const chartType = ref("1");
const inventoryType = ref("time");
const chartInstance = shallowRef<ECharts | null>(null);
const chartDomRef = ref<HTMLDivElement | null>(null);

// API返回的原始数据 - 包含6个维度
const apiRawData = ref<ApiDataItem[][]>([[], [], [], [], [], []]);

// 请求锁
let isRequesting = false;

// 当前图表数据（计算属性）
const currentChartData = computed<PieDataItem[]>(() => {
  let dataIndex: number;

  // 根据当前选择的图表类型和子类型确定数据索引
  if (chartType.value === "1") {
    // 库存结构，根据子类型选择
    dataIndex =
      API_DATA_INDEX_MAP[
        inventoryType.value as keyof typeof API_DATA_INDEX_MAP
      ];
  } else if (chartType.value === "2") {
    // 应收账龄
    dataIndex = API_DATA_INDEX_MAP.receivable;
  } else if (chartType.value === "3") {
    // 渠道占比
    dataIndex = API_DATA_INDEX_MAP.channel;
  } else {
    return [];
  }
  // 获取对应维度的数据
  const apiData = apiRawData.value[dataIndex] || [];
  // 转换为饼图数据格式
  return apiData
    .filter((item) => item && item.groupName)
    .map((item) => ({
      value: item.roomCount || 0,
      name: item.groupName || "未知数据",
    }));
});

// 获取图表名称
const getChartName = (): string => {
  if (chartType.value === "1") {
    // 库存结构，根据子类型显示
    const subType = INVENTORY_SUB_TYPES.find(
      (item) => item.value === inventoryType.value
    );
    return `库存结构 - ${subType?.label || "统计"}`;
  } else if (chartType.value === "2") {
    return "应收账龄统计";
  } else if (chartType.value === "3") {
    return "渠道占比统计";
  }
  return "数据统计";
};

// 暴露方法给父组件
defineExpose({
  refreshData: () => fetchData(),
});

// 切换图表类型
const handleChartTypeChange = (type: string) => {
  if (chartType.value === type) return;
  chartType.value = type;
  updateChart();
};

// 切换库存结构子类型
const handleInventoryTypeChange = () => {
  updateChart();
};

// 初始化图表
const initChart = () => {
  if (!chartDomRef.value) return;

  try {
    disposeChart();
    chartInstance.value = echarts.init(chartDomRef.value);
    updateChart();
  } catch (error) {
    console.error("图表初始化失败:", error);
  }
};

// 销毁图表实例
const disposeChart = () => {
  if (chartInstance.value && !chartInstance.value.isDisposed()) {
    chartInstance.value.dispose();
  }
};

// 获取基础图表配置
const getBaseChartOption = (): EChartsOption => {
  const chartData = currentChartData.value;
  const chartName = getChartName();
  // 如果没有数据，显示空状态
  if (chartData.length === 0) {
    return {
      title: {
        text: "暂无数据",
        left: "center",
        top: "center",
        textStyle: {
          color: "#999",
          fontSize: 14,
          fontWeight: "normal",
        },
      },
    };
  }
  return {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    grid: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      containLabel: true,
    },
    series: [
      {
        name: chartName,
        type: "pie",
        radius: ["50%", "70%"],
        center: ["50%", "55%"],
        animationType: "scale",
        animationEasing: "elasticOut",
        animationDelay: () => Math.random() * 200,
        label: {
          show: true,
          formatter: "{b}\n{c}({d}%)",
          color: "#fff",
          fontSize: 12,
          fontWeight: "bold",
        },
        data: chartData,
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
};

// 更新图表
const updateChart = () => {
  if (!chartInstance.value) return;
  const option = getBaseChartOption();
  chartInstance.value.setOption(option, true);
};

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance.value && !chartInstance.value.isDisposed()) {
    chartInstance.value.resize();
  }
};

// 获取数据
const fetchData = async () => {
  if (isRequesting) return;

  const { data, department } = props;
  if (!data || department.length === 0) {
    // 如果没有必要参数，清空数据
    apiRawData.value = [[], [], [], [], [], []];
    updateChart();
    return;
  }

  const endDate = `${data} 00:00:00`;
  const params = {
    projIds: department,
    type: 0,
    day: endDate,
  };

  try {
    isRequesting = true;
    loading.value = true;

    const res = await largeScreenApi.getRoomStockGroupInfo(params);
    if (res.code === 200) {
      // 存储API原始数据 - 确保是6个数组
      const data = Array.isArray(res.data) ? res.data : [];
      apiRawData.value = [
        data[0] || [], // 时间
        data[1] || [], // 面积
        data[2] || [], // 总价
        data[3] || [], // 业态
        data[4] || [], // 应收账龄
        data[5] || [], // 渠道占比
      ];

      // 确保图表已初始化
      if (!chartInstance.value) {
        initChart();
      } else {
        updateChart();
      }
    }
  } catch (error) {
    console.error("获取数据失败:", error);
    apiRawData.value = [[], [], [], [], [], []];
    updateChart();
  } finally {
    isRequesting = false;
    loading.value = false;
  }
};

// 生命周期
onMounted(() => {
  initChart();
  window.addEventListener("resize", handleResize);

  // 如果初始有数据，获取数据
  // if (props.data && props.department.length > 0) {
  //   fetchData();
  // }
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  disposeChart();
});
</script>

<style lang="scss" scoped>
.structuralStatistics-page {
  width: 100%;
  height: 33%;
  .structuralStatisticsContent {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .chart-controls {
      flex-shrink: 0;
      display: flex;
      justify-content: flex-end;
      .chart-btn {
        color: #fff;
        padding: 0;
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
    .sub-type-controls {
      flex-shrink: 0;
      display: flex;
      justify-content: flex-end;
      margin-bottom: 8px;
    }
    .structuralStatistics-chart {
      flex: 1;
      min-height: 0;
    }
  }
}
</style>
