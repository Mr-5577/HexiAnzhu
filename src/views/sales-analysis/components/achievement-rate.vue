<!-- 达成率/库存数据组件 -->
<template>
  <div class="rate-page">
    <div class="inventory-content">
      <div class="inventory-item">
        <img class="item-img" src="@/assets/imgs/largeScreenImg/kucun.png" alt="" />
        <div class="desc">
          <div class="title">库存住宅</div>
          <div class="num">500套/3.2亿</div>
        </div>
      </div>
      <div class="inventory-item">
        <img class="item-img" src="@/assets/imgs/largeScreenImg/quhua.png" alt="" />
        <div class="desc">
          <div class="title">月均去化</div>
          <div class="num2">200套/1.2亿</div>
        </div>
      </div>
      <div class="inventory-item">
        <img class="item-img" src="@/assets/imgs/largeScreenImg/proportion.png" alt="" />
        <div class="desc">
          <div class="title">存销比</div>
          <div class="num3">2.5</div>
        </div>
      </div>
    </div>
    <div class="achieve-rate">
      <!-- 动画部分 -->
      <canvas class="rain"></canvas>
      <canvas class="dashed"></canvas>
      <!-- 中心球体 -->
      <div class="sphere">
        <div class="sphere-bg"></div>
        <div class="sum">
          <span>综合达成率</span>
          <p>99.99%</p>
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
        <span>99%</span>
        <p>认购达成率</p>
      </div>
      <div class="cicle9">
        <span>88%</span>
        <p>签约达成率</p>
      </div>
      <div class="cicle10">
        <span>77%</span>
        <p>回款达成率</p>
      </div>
      <div class="cicle11">
        <span>66%</span>
        <p>溢价率</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";

// 生命周期
onMounted(() => {
  nextTick(() => {});
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
      width: 150px;
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
      .item-img {
        width: 30px;
        height: 30px;
        margin-right: 10px;
        margin-left: 10px;
      }
      .desc {
        .title {
          font-size: 15px;
          color: #fff;
          font-weight: 600;
        }
        .num {
          font-size: 16px;
          color: #fa6704;
          font-weight: 600;
        }
        .num2 {
          font-size: 16px;
          color: #69f803;
          font-weight: 600;
        }
        .num3 {
          font-size: 16px;
          color: #02b9fc;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
