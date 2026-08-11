<!-- 编辑 费用支付 -->
<template>
  <div class="fee-payment-edit-page">
    <FeePaymentForm
      mode="edit"
      :feePaymentId="feePaymentId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import FeePaymentForm from "./fee-payment-form.vue";

const route = useRoute();
const router = useRouter();

defineOptions({ name: "fee-payment-edit" });

const feePaymentId = Number(route.query.feePaymentId); // 费用支付ID

const handleSuccess = () => {
  // router.back();
};

const handleCancel = () => {
  // router.back();
};
</script>

<style scoped lang="scss">
.fee-payment-edit-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
