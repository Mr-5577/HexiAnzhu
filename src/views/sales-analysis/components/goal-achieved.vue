<!-- 目标达成情况-组件 -->
<template>
  <div class="chart-page">
    <ChartBox title="目标达成情况">
      <template #content>
        <div class="goalContent">
          <el-radio-group
            v-model="radioVal"
            size="small"
            text-color="#626aef"
            fill="rgb(239, 240, 253)"
          >
            <el-radio-button label="年" value="year" />
            <el-radio-button label="月" value="month" />
            <el-radio-button label="周" value="week" />
            <el-radio-button label="日" value="day" />
          </el-radio-group>
          <div class="all-goal">
            <div class="goal-item" v-for="item in dataList" :key="item.id">
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
                  :percentage="item.proportion"
                />
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
import { ref, onMounted, onUnmounted, nextTick } from "vue";
const radioVal = ref("year");
const dataList = ref([
  {
    id: 1,
    img: laifang,
    symbol: 99.99,
    text: "来访(组)来访率",
    complete: 70,
    goal: 100,
    color: "#409eff",
    proportion: 70,
  },
  {
    id: 2,
    img: qianyue,
    symbol: 99.99,
    text: "认购(套)认购率",
    complete: 30,
    goal: 100,
    color: "#1ff4cb",
    proportion: 60,
  },
  {
    id: 3,
    img: qianyue,
    symbol: 99.99,
    text: "签约(套)签约率",
    complete: 30,
    goal: 100,
    color: "#67c23a",
    proportion: 40,
  },
  {
    id: 4,
    img: huikuan,
    symbol: 99.99,
    text: "回款(套)回款率",
    complete: 30,
    goal: 1000,
    color: "#e6a23c",
    proportion: 40,
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
.chart-page {
  width: 100%;
  height: 33%;
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
    height: 100%;
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
          text-align: center;
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
            background-color: transparent; // 进度条背景
        }
      }
    }
  }
}
</style>
