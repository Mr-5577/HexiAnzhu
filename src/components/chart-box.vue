<template>
  <div class="chart-box">
    <div class="top-content">
      <div class="title">{{ title }}</div>
      <img class="img" src="@/assets/imgs/largeScreenImg/title-bg.png" alt="img" />
    </div>
    <!-- 默认插槽，用于放置图表或其他内容 -->
    <slot name="content">
      <!-- 默认内容，当父组件没有提供插槽内容时显示 -->
      <div class="default-content">暂无内容</div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
// defineProps 和 defineEmits 现在是编译器宏，不需要导入
const props = defineProps({
  title: {
    type: String,
    default: "标题",
  },
});
// 定义 emits
const emit = defineEmits(["chart-mounted", "chart-destroyed"]);

// 生命周期
onMounted(() => {
  emit("chart-mounted");
});
// 清理
onUnmounted(() => {
  emit("chart-destroyed");
});
</script>

<style lang="scss" scoped>
.chart-box {
  width: 100%;
  height: 100%;
  min-height: 210px;
  display: flex;
  flex-direction: column;
  .top-content {
    display: flex;
    align-items: flex-end;
    width: 100%;
    height: 30px;
    position: relative;
    .title {
      font-size: 16px;
      color: #fff;
      font-weight: 600;
      position: absolute;
      top: 0px;
      left: 10px;
    }
    .img {
      width: 100%;
      height: 20px;
    }
  }
}
</style>
