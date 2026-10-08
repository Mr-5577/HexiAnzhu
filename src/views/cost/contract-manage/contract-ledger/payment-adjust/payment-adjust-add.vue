<!-- 新增 款项调整 -->
<template>
  <div class="payment-adjust-add-page">
    <PaymentAdjustForm mode="add" :conId="conId" />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import PaymentAdjustForm from "./payment-adjust-form.vue";

defineOptions({ name: "payment-adjust-add" });

const route = useRoute();
const router = useRouter();
const conId = Number(route.query.conId); // 合同ID

</script>

<style scoped lang="scss">
.payment-adjust-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
