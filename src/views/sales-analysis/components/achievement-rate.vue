<!-- 达成率/库存数据组件 -->
<template>
  <div class="rate-page">
    <div class="inventory-content">
      <div
        class="inventory-item"
        @click="handelToListPage('/asset-management/inventory-statistics')"
      >
        <img
          class="item-img"
          src="@/assets/imgs/largeScreenImg/kucun.png"
          alt=""
        />
        <div class="desc">
          <div class="title">库存住宅</div>
          <div class="num">
            {{ formatTwoDecimalSafe(inventoryData.roomNum) }}套/{{
              formatTwoDecimalSafe(inventoryData.roomMoney)
            }}亿
          </div>
        </div>
      </div>
      <div
        class="inventory-item"
        @click="handelToListPage('/asset-management/inventory-statistics')"
      >
        <img
          class="item-img"
          src="@/assets/imgs/largeScreenImg/quhua.png"
          alt=""
        />
        <div class="desc">
          <div class="title">月均去化</div>
          <div class="num2">
            {{ formatTwoDecimalSafe(inventoryData.costNum) }}套/{{
              formatTwoDecimalSafe(inventoryData.costMoney)
            }}亿
          </div>
        </div>
      </div>
      <div
        class="inventory-item"
        @click="handelToListPage('/asset-management/inventory-statistics')"
      >
        <img
          class="item-img"
          src="@/assets/imgs/largeScreenImg/proportion.png"
          alt=""
        />
        <div class="desc">
          <div class="title">存销比</div>
          <div class="num3">
            {{ formatTwoDecimalSafe(inventoryData.stockCostPercent) }}
          </div>
        </div>
      </div>
    </div>
    <div
      class="achieve-rate"
      v-loading="loading"
      :element-loading-text="'数据加载中...'"
      :element-loading-background="'rgba(0, 0, 0, 0.2)'"
    >
      <div class="data-switch">
        <el-radio-group
          v-model="typeVal"
          size="small"
          text-color="#626aef"
          fill="rgb(239, 240, 253)"
          @change="handleChange()"
        >
          <el-radio-button label="年" :value="0" />
          <el-radio-button label="月" :value="1" />
          <!-- <el-radio-button label="周" :value="2" />
          <el-radio-button label="日" :value="3" /> -->
        </el-radio-group>
      </div>
      <!-- 动画部分 -->
      <canvas class="rain"></canvas>
      <canvas class="dashed"></canvas>
      <!-- 中心球体 -->
      <div class="sphere">
        <div class="sphere-bg"></div>
        <div class="sum">
          <span>综合达成率</span>
          <p @click="handleToPage">{{ formatPercent(saleData.totalRate) }}%</p>
        </div>
      </div>
      <!-- 旋转圆圈 -->
      <div class="cicle3"></div>
      <div class="cicle4"></div>
      <div class="cicle5"></div>
      <div class="cicle6"></div>
      <div class="cicle7"></div>
      <!-- 数据指标圆圈 -->
      <div class="cicle8">
        <span>{{ formatPercent(saleData.orderRate) }}%</span>
        <p>认购达成率</p>
      </div>
      <div class="cicle9">
        <span>{{ formatPercent(saleData.signRate) }}%</span>
        <p>签约达成率</p>
      </div>
      <div class="cicle10">
        <span>{{ formatPercent(saleData.collectRate) }}%</span>
        <p>回款达成率</p>
      </div>
      <div class="cicle11">
        <span>{{ formatPercent(saleData.premiumRate) }}%</span>
        <p>溢价率</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { largeScreenApi } from "@/api/large-screen-api";
import { dateUtil } from "@/utils/date-util";
import { useRouter } from "vue-router";

const router = useRouter();

interface Props {
  data: string;
  projIds: number[];
}
const props = withDefaults(defineProps<Props>(), {
  data: "",
  projIds: () => [],
});
// 定义一个需要暴露的方法
const refreshData = () => {
  getData();
};
// 暴露方法给父组件
defineExpose({
  refreshData,
});

const typeVal = ref(1);
const loading = ref(false);
const inventoryData = ref({
  roomNum: 0, // 房间库存数量
  roomMoney: 0, // 房间库存金额
  costNum: 0, // 房间月均去化数量
  costMoney: 0, // 房间月均去化金额
  stockCostPercent: 0, // 存销比率
});
const saleData = ref({
  orderRate: 0, // 认购达成率
  signRate: 0, // 签约达成率
  collectRate: 0, // 回款达成率
  totalRate: 0, // 综合达成率
  premiumRate: 0, // 总溢价率
});
// 防止重复请求
let isRequesting = false;

// 保留两位小数
const formatTwoDecimalSafe = (num: any): string => {
  const number = Number(num);
  // 是否是有效数字
  if (isNaN(number)) {
    return "0";
  }
  // 使用正则判断小数位数
  const str = number.toString();
  const match = str.match(/\.(\d+)$/);
  if (match && match[1].length > 2) {
    return number.toFixed(2);
  }
  return str;
};

// 格式化百分比函数
const formatPercent = (value: any) => {
  if (value === undefined || value === null) return "-";
  return (value * 100).toFixed(0);
};

const getData = async () => {
  // 检查是否已有请求在进行
  if (isRequesting) return;

  try {
    isRequesting = true;
    loading.value = true;
    const seleckData = props.data;
    const params = {
      projIds: props.projIds,
      type: typeVal.value,
      day: `${seleckData} 00:00:00`,
    };
    const endTime = dateUtil(seleckData)
      .subtract(1, "month")
      .endOf("month")
      .format("YYYY-MM-DD");
    const inventoryParams = {
      projIds: props.projIds,
      type: 0, // 0:年  1:月  2:周  3:日
      day: `${seleckData} 00:00:00`,
      beginDate:
        dateUtil(endTime).subtract(6, "month").format("YYYY-MM-DD") +
        " 00:00:00",
      endDate: `${endTime} 23:59:59`,
    };
    // 获取库存数据
    const response = await largeScreenApi.getRoomStockInfo(inventoryParams);
    if (response.code === 200) {
      inventoryData.value = { ...inventoryData.value, ...response.data };
    }
    // 获取销售数据
    const res = await largeScreenApi.getSaleInfo(params);
    if (res.code === 200) {
      saleData.value = res.data;
    }
    // 获取溢价数据
    const res2 = await largeScreenApi.getPremiumInfo(params);
    if (res2.code === 200) {
      saleData.value.premiumRate = res2.data?.premiumRate;
    }
  } finally {
    isRequesting = false;
    loading.value = false;
  }
};
const handleChange = () => {
  nextTick(() => {
    getData();
  });
};
const handelToListPage = (path: string) => {
  const timestamp = new Date().getTime();
  const params = {
    data: props.data,
    projIds: props.projIds,
  };
  router.push({
    path: path,
    query: {
      data: JSON.stringify(params),
      _t: timestamp.toString(),
    },
  });
};
const handleToPage = () => {
  const path =
    typeVal.value == 0
      ? "/performance-analysis/annual-report"
      : "/performance-analysis/daily-report";
  const timestamp = new Date().getTime();
  const params = {
    data: props.data,
    projIds: props.projIds,
  };
  router.push({
    path: path,
    query: {
      data: JSON.stringify(params),
      _t: timestamp.toString(),
    },
  });
};
watch(
  () => [props.data, props.projIds],
  ([data, projIds]) => {
    if (data && projIds) {
      // nextTick(() => {
      //   getData();
      // });
    }
  },
  { immediate: true },
);
// 生命周期
onMounted(() => {
  // nextTick(() => {
  //   getData();
  // });
});

// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
@use "./achievementRate.scss";
.rate-page {
  width: 100%;
  height: 66%;
  display: flex;
  flex-direction: column;
  flex: 1;
  .inventory-content {
    width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    justify-content: space-around;
    .inventory-item {
      display: flex;
      align-items: center;
      height: 60px;
      background: linear-gradient(
        to right,
        rgba(6, 60, 93, 0.8),
        rgba(6, 43, 61, 0.8)
      );
      border-radius: 4px 4px;
      border: 1px solid #59c3dc;
      min-width: 140px;
      padding: 0 10px;
      box-sizing: border-box;
      cursor: pointer;
      .item-img {
        width: 30px;
        height: 30px;
        margin-right: 10px;
      }
      .desc {
        .title {
          font-size: 14px;
          color: #fff;
          font-weight: 600;
        }
        .num {
          font-size: 15px;
          color: #fa6704;
          font-weight: 600;
        }
        .num2 {
          font-size: 15px;
          color: #69f803;
          font-weight: 600;
        }
        .num3 {
          font-size: 15px;
          color: #02b9fc;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
