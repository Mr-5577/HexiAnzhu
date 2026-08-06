<!-- 编辑 款项调整 -->
<template>
  <div class="payment-adjust-edit-page">
    <PaymentAdjustForm
      mode="edit"
      :dedId="dedId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import PaymentAdjustForm from "./payment-adjust-form.vue";

defineOptions({ name: "payment-adjust-edit" });

const route = useRoute();
const router = useRouter();

const dedId = Number(route.query.dedId); // 奖罚/款项调整ID

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.payment-adjust-edit-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
