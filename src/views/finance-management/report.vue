<template>
  <div class="page-content">
    财务报表
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted } from 'vue';

// 生命周期
onMounted(() => {
  nextTick(() => {});
});

// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.page-content {
  width: 100%;
  height: 100%;
}
</style>
