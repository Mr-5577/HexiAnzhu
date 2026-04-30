<!-- 供应商类别 -->
<template>
  <div class="supplier-category-page">供应商类别</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "supplier-category" });

onMounted(() => {});
</script>

<style lang="scss" scoped>
.supplier-category-page {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
