<!-- 合同结算 详情 -->
<template>
  <div class="contract-settle-detail-page">
    <ContractSettleForm
      mode="detail"
      :con-id="conId"
      :settle-id="settleId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import ContractSettleForm from "./contract-settle-form.vue";

const route = useRoute();
const router = useRouter();

defineOptions({ name: "contract-settle-detail" });

const conId = Number(route.query.conId); // 合同id
const settleId = Number(route.query.settleId); // 结算id

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.contract-settle-detail-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
