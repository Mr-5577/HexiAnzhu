<!-- 款项调整 详情 -->
<template>
    <div class="payment-adjust-detail-page">
        <PaymentAdjustForm mode="detail" :dedId="dedId" :conId="conId" />
    </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import PaymentAdjustForm from "./payment-adjust-form.vue";

defineOptions({ name: "payment-adjust-detail" });

const route = useRoute();
const router = useRouter();

const dedId = Number(route.query.dedId); // 奖罚/
const conId = Number(route.query.conId); // 合同ID

</script>

<style scoped lang="scss">
.payment-adjust-detail-page {
    width: 100%;
    height: 100%;
    background-color: #fff;
}
</style>
