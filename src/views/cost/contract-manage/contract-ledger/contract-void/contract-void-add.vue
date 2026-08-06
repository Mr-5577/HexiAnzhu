<!-- 新增 合同解除 -->
<template>
  <div class="contract-void-add-page">
    <ContractVoidForm
      mode="add"
      :conId="conId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import ContractVoidForm from "./contract-void-form.vue";

defineOptions({ name: "contract-void-add" });

const route = useRoute();
const router = useRouter();

const conId = Number(route.query.conId); // 合同ID

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.contract-void-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
