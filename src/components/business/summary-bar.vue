<!-- ============ SummaryBar 价款汇总条 ============ -->
<!-- 纯展示组件，4 格 grid 展示含税/不含税/税额/税率 -->
<template>
  <div class="summary-bar">
    <div v-for="item in items" :key="item.label" class="summary-item">
      <span class="summary-label">{{ item.label }}</span>
      <span class="summary-value" :class="item.type">{{ item.value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SummaryItem {
  label: string;
  value: string;
  type?: "primary" | "tax";
}
defineProps<{
  items: SummaryItem[];
}>();
</script>

<style scoped lang="scss">
.summary-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  background: linear-gradient(135deg, #f0f7ff 0%, #f8fbff 100%);
  border: 1px solid #d6e4ff;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 18px;

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .summary-label {
    font-size: 12px;
    color: #86909c;
  }

  .summary-value {
    font-size: 18px;
    font-weight: 600;
    color: #409eff;
    font-variant-numeric: tabular-nums;

    &.tax {
      color: #e6a23c;
    }
  }
}
</style>
