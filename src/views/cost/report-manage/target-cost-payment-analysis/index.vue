<!-- 财务目标成本支付分析 -->
<template>
    <div class="target-cost-payment-analysis-wrapper">
        财务目标成本支付分析
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

defineOptions({ name: "target-cost-payment-analysis" });

onMounted(() => {

});
</script>

<style lang="scss" scoped>
.target-cost-payment-analysis-wrapper {
    height: 100%;
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 15px 16px;
    box-sizing: border-box;
    background: #f5f7fa;
    overflow-y: auto;

}
</style>