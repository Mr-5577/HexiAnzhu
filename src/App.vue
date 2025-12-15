<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { getEnvironmentName } from "@/utils/config";
// 应用根组件
console.log(getEnvironmentName(), import.meta.env.VITE_APP_TITLE);
</script>

<style lang="scss">
#app {
  width: 100%;
  min-height: 100vh;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    Arial, sans-serif;
}
</style>
