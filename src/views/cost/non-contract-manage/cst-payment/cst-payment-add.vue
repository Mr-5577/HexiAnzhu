<!-- 新增 建安支付 -->
<template>
  <div class="cst-payment-add-page">
    <CstPaymentForm
      mode="add"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import CstPaymentForm from "./cst-payment-form.vue";

const route = useRoute();
const router = useRouter();

defineOptions({ name: "cst-payment-add" });

const handleSuccess = () => {
  // router.back();
};

const handleCancel = () => {
  // router.back();
};
</script>

<style scoped lang="scss">
.cst-payment-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
