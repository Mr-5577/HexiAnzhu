<!-- 应收统计表 -->
<template>
  <div class="receivables-page">应收统计表</div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted } from "vue";

// 组件name，需要和菜单配置里面的name一致
defineOptions({
  name: "receivables",
});

// 生命周期
onMounted(() => {
  nextTick(() => {});
});

// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.receivables-page {
  width: 100%;
  height: 100%;
}
</style>
