<!-- 新增合同台账 -->
<template>
  <div class="contract-ledger-add-page">
    <ContractLedgerForm
      mode="add"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import ContractLedgerForm from "./components/contract-ledger-form.vue";

const router = useRouter();

defineOptions({ name: "contract-ledger-add" });

const handleSuccess = () => {
  //router.back();
};

const handleCancel = () => {
  //router.back();
};
</script>

<style scoped lang="scss">
.contract-ledger-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
