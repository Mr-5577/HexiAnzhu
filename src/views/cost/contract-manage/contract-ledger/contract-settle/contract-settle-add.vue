<!-- 新增合同结算 -->
<template>
  <div class="contract-settle-add-page">
    <ContractSettleForm
      mode="add"
      :con-id="conId"
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

defineOptions({ name: "contract-settle-add" });

// 从路由参数获取合同ID conId
const conId = Number(route.query.conId);

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.supplement-contract-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
