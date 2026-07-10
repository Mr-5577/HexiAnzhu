<!-- 编辑合同台账 -->
<template>
  <div class="contract-ledger-edit-page">
    <ContractLedgerForm
      mode="edit"
      :con-id="conId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import ContractLedgerForm from "./components/contract-ledger-form.vue";

const route = useRoute();
const router = useRouter();

defineOptions({ name: "contract-ledger-edit" });

const conId = Number(route.query.conId);

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.contract-ledger-edit-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
