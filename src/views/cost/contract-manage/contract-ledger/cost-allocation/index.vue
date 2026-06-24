<!-- 成本分摊 -->
<template>
  <div class="cost-allocation-wrapper">
    <div class="form-scroll-area">成本分摊</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

defineOptions({ name: "cost-allocation" });

const props = defineProps<{
  conId: number | null;
}>();

// 监听合同ID变化，自动刷新列表
watch(
  () => props.conId,
  async (val) => {
    console.log("合同ID变化", val);
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.cost-allocation-wrapper {
  width: 100%;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .form-scroll-area {
    flex: 1;
    overflow-y: auto;
  }
}
</style>
