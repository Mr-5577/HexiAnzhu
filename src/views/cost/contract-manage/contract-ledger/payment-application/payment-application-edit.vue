<!-- 编辑 付款申请 -->
<template>
  <div class="payment-application-edit-page">
    <PaymentApplicationForm
      mode="edit"
      :projId="projId"
      :conId="conId"
      :paymentId="paymentId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import PaymentApplicationForm from "./payment-application-form.vue";

const route = useRoute();
const router = useRouter();

defineOptions({ name: "payment-application-edit" });

const projId = Number(route.query.projId); // 项目ID
const conId = Number(route.query.conId); // 合同ID
const paymentId = Number(route.query.paymentId); // 付款申请ID

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.payment-application-edit-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
