<!-- 编辑 合同解除 -->
<template>
  <div class="contract-void-edit-page">
    <ContractVoidForm
      mode="edit"
      :conId="conId"
      :conVoidId="conVoidId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import ContractVoidForm from "./contract-void-form.vue";

defineOptions({ name: "contract-void-edit" });

const route = useRoute();
const router = useRouter();

const conId = Number(route.query.conId); // 合同ID
const conVoidId = Number(route.query.conVoidId); // 合同解除ID

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.contract-void-edit-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
