<!-- 认购达成统计 -->
<template>
  <div class="subscription-statistics-page">认购达成统计</div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted } from "vue";

// 组件name，需要和菜单配置里面的name一致
defineOptions({
  name: "subscription-statistics",
});

// 生命周期
onMounted(() => {
  nextTick(() => {});
});

// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.subscription-statistics-page {
  width: 100%;
  height: 100%;
}
</style>
