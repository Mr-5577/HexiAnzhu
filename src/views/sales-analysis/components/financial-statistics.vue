<!-- 业务指标-组件 -->
<template>
  <div class="statistics-page">
    <BaseChart title="业务指标" :loading="loading">
      <template #content>
        <div class="statisticsContent">
          <div
            class="content-item"
            v-for="(item, index) in statisticsItems"
            :key="index"
            @click="handleToPage(item.path)"
          >
            <div class="img-type">
              <img class="item-icon" :src="item.img" alt="" />
            </div>
            <div class="item-desc">
              <div class="desc-text">{{ item.text }}</div>
              <div class="desc-num">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </template>
    </BaseChart>
  </div>
</template>

<script setup lang="ts">
import { largeScreenApi } from "@/api/large-screen-api";
import dingdan from "@/assets/imgs/largeScreenImg/dingdan.png";
import rengou from "@/assets/imgs/largeScreenImg/rengou.png";
import tuifang from "@/assets/imgs/largeScreenImg/tuifang.png";
import yingshou from "@/assets/imgs/largeScreenImg/yingshou.png";
import yuqi from "@/assets/imgs/largeScreenImg/yuqi.png";
import zhouqi from "@/assets/imgs/largeScreenImg/zhouqi.png";
import BaseChart from "@/components/base/base-chart.vue";
import { dateUtil } from "@/utils/date-util";
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
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

// 防止重复请求
let isRequesting = false;
const loading = ref(false);

const dataObj = ref({
  signDays: 0, // 认购转签约周期
  tfNum: 0, // 退房数量
  tfMoney: 0, // 退房金额
  tdNum: 0, // 挞定数量
  tdMoney: 0, // 挞定金额
  noSignNum: 0, // 认购未签数量
  noSignMoney: 0, // 认购未签金额
  collectMoney: 0, // 累计应收金额
  collectNum: 0, // 累计应收套数
  outstdMoney: 0, // 逾期未回款
  outstdNum: 0, // 逾期未回套数
});

const statisticsItems = computed(() => [
  {
    img: zhouqi,
    text: "认转签周期",
    value: `${dataObj.value.signDays}天`,
    path: "/risk-analysis/conversion-stats", // 认转签统计页面路径
  },
  {
    img: rengou,
    text: "认购未签约",
    value: `${formatTwoDecimal(dataObj.value.noSignMoney)}万(${
      dataObj.value.noSignNum
    }套)`,
    path: "/risk-analysis/pending-stats",
  },
  {
    img: dingdan,
    text: "挞定",
    value: `${formatTwoDecimal(dataObj.value.tdMoney)}万(${
      dataObj.value.tdNum
    }套)`,
    path: "/risk-analysis/forfeiture-stats",
  },
  {
    img: yingshou,
    text: "累计应收",
    value: `${formatTwoDecimal(dataObj.value.collectMoney)}万(${
      dataObj.value.collectNum
    }套)`,
    path: "/risk-analysis/receivables",
  },
  {
    img: tuifang,
    text: "退房",
    value: `${formatTwoDecimal(dataObj.value.tfMoney)}万(${
      dataObj.value.tfNum
    }套)`,
    path: "/risk-analysis/forfeiture-stats",
  },
  {
    img: yuqi,
    text: "逾期未回款",
    value: `${formatTwoDecimal(dataObj.value.outstdMoney)}万(${
      dataObj.value.outstdNum
    }套)`,
    path: "/risk-analysis/receivables",
  },
]);

// 保留两位小数
const formatTwoDecimal = (num: any): string => {
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

const getData = async () => {
  // 检查是否已有请求在进行
  if (isRequesting) return;
  const { data, projIds } = props;
  const params = {
    projIds: projIds,
    type: 1, // 0:年  1:月  2:周  3:日
    day: `${props.data} 00:00:00`,
    beginDate:
      dateUtil(data).startOf("month").format("YYYY-MM-DD") + " 00:00:00",
    endDate: dateUtil(data).endOf("month").format("YYYY-MM-DD") + " 23:59:59",
  };
  try {
    isRequesting = true;
    loading.value = true;
    const res = await largeScreenApi.getSaleGeneralInfo(params);
    if (res.code === 200) {
      dataObj.value = {
        signDays: 0,
        tfNum: 0,
        tfMoney: 0,
        tdNum: 0,
        tdMoney: 0,
        noSignNum: 0,
        noSignMoney: 0,
        collectMoney: 0,
        collectNum: 0,
        outstdMoney: 0,
        outstdNum: 0,
        ...res.data,
      };
    }
  } finally {
    isRequesting = false;
    loading.value = false;
  }
};
const handleToPage = (path: string) => {
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
// 生命周期
onMounted(() => {
  nextTick(() => {
    // getData()
  });
});

// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.statistics-page {
  width: 100%;
  height: 33%;
  .statisticsContent {
    width: 100%;
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    .content-item {
      width: 46%;
      height: 28%;
      display: flex;
      align-items: center;
      border: 1px solid #405c7f;
      border-radius: 2px 2px;
      position: relative;
      cursor: pointer;
      .img-type {
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-image: url("@/assets/imgs/largeScreenImg/icon-circle.png");
        background-size: 100% 100%; /* 保持图片原始宽度，宽高适应容器 */
        background-position: center;
        background-repeat: no-repeat;
        margin-left: 15px;
        margin-right: 10px;
        .item-icon {
          width: 28px;
          height: 28px;
        }
      }
      .item-desc {
        .desc-text {
          color: #fff;
          font-size: 14px;
        }
        .desc-num {
          font-size: 14px;
          color: #1ff4cb;
          font-weight: 600;
        }
      }
    }
    .content-item::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 2px solid #18f2ff;
      clip-path: polygon(
        0 0,
        20px 0,
        20px 2px,
        2px 2px,
        2px 20px,
        0 20px,

        calc(100% - 20px) 0,
        100% 0,
        100% 20px,
        calc(100% - 2px) 20px,
        calc(100% - 2px) 2px,
        calc(100% - 20px) 2px,

        0 calc(100% - 20px),
        0 100%,
        20px 100%,
        20px calc(100% - 2px),
        2px calc(100% - 2px),
        2px calc(100% - 20px),
        calc(100% - 20px) 100%,
        100% 100%,
        100% calc(100% - 20px),
        calc(100% - 2px) calc(100% - 20px),
        calc(100% - 2px) calc(100% - 2px),
        calc(100% - 20px) calc(100% - 2px)
      );
    }
  }
}
</style>
