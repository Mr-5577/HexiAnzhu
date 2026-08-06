<!-- 新增 付款申请 -->
<template>
  <div class="payment-apply-add-page">
    <PaymentApplyForm
      mode="add"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import PaymentApplyForm from "./payment-apply-form.vue";

const route = useRoute();
const router = useRouter();

defineOptions({ name: "payment-apply-add" });

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.payment-apply-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
