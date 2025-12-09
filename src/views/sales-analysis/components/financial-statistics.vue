<!-- 预计指标统计-组件 -->
<template>
  <div class="statistics-page">
    <ChartBox title="预计指标统计">
      <template #content>
        <div class="statisticsContent">
          <div class="content-item" v-for="item in dataList" :key="item.id">
            <div class="img-type">
              <img class="item-icon" :src="item.img" alt="" />
            </div>
            <div class="item-desc">
              <div class="desc-text">{{ item.text }}</div>
              <div class="desc-num">{{ item.complete }}</div>
            </div>
          </div>
        </div>
      </template>
    </ChartBox>
  </div>
</template>

<script setup lang="ts">
import dingdan from "@/assets/imgs/largeScreenImg/dingdan.png";
import rengou from "@/assets/imgs/largeScreenImg/rengou.png";
import tuifang from "@/assets/imgs/largeScreenImg/tuifang.png";
import yingshou from "@/assets/imgs/largeScreenImg/yingshou.png";
import yuqi from "@/assets/imgs/largeScreenImg/yuqi.png";
import zhouqi from "@/assets/imgs/largeScreenImg/zhouqi.png";
import ChartBox from "@/components/chart-box.vue";
import { ref, onMounted, onUnmounted, nextTick } from "vue";

const dataList = ref([
  {
    id: 1,
    img: zhouqi,
    text: "认转签周期",
    complete: "12天",
  },
  {
    id: 2,
    img: rengou,
    text: "认购未签约",
    complete: "5000万(100套)",
  },
  {
    id: 3,
    img: tuifang,
    text: "退房",
    complete: "500万(18套)",
  },
  {
    id: 4,
    img: dingdan,
    text: "挞定",
    complete: "45万(1套)",
  },
  {
    id: 5,
    img: yingshou,
    text: "累计应收",
    complete: "1500万(300套)",
  },
  {
    id: 6,
    img: yuqi,
    text: "逾期未回款",
    complete: "2000万(55套)",
  },
]);
// 生命周期
onMounted(() => {
  nextTick(() => {});
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
    align-items: anchor-center;
    .content-item {
      width: 46%;
      height: 28%;
      display: flex;
      align-items: center;
      border: 1px solid #405c7f;
      border-radius: 2px 2px;
      position: relative;
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
        margin-left: 20px;
        margin-right: 15px;
        .item-icon {
          width: 30px;
          height: 30px;
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
