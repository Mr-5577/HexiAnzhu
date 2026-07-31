<!-- 新增 付款申请 -->
<template>
  <div class="payment-application-add-page">
    <PaymentApplicationForm
      mode="add"
      :projId="projId"
      :conId="conId"
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

defineOptions({ name: "payment-application-add" });

const projId = Number(route.query.projId); // 项目ID
const conId = Number(route.query.conId); // 合同ID

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.payment-application-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
