<!-- 新增 款项调整 -->
<template>
  <div class="payment-adjust-add-page">
    <PaymentAdjustForm
      mode="add"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import PaymentAdjustForm from "./payment-adjust-form.vue";

defineOptions({ name: "payment-adjust-add" });

const route = useRoute();
const router = useRouter();

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.payment-adjust-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
