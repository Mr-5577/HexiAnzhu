<!-- 编辑合同台账 -->
<template>
  <div class="contract-ledger-detail-page">
    <ContractLedgerForm
      mode="detail"
      :con-id="conId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import ContractLedgerForm from "./components/contract-ledger-form.vue";
import type { FormMode } from "@/types/form/form-types.ts"; // 导入类型

const route = useRoute();
const router = useRouter();

defineOptions({ name: "contract-ledger-detail" });

const modeParam = route.query.mode as string;
const mode = (["add", "edit", "detail"].includes(modeParam)
  ? modeParam
  : "detail") as FormMode;
const conId = Number(route.query.conId);

const handleSuccess = () => {
  //router.back();
};

const handleCancel = () => {
  //router.back();
};
</script>

<style scoped lang="scss">
.contract-ledger-detail-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
