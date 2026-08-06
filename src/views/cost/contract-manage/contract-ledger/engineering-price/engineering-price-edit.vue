<!-- 编辑 工程核价 -->
<template>
  <div class="engineering-price-edit-page">
    <EngineeringPriceForm
      mode="edit"
      :conId="conId"
      :auditPriceId="auditPriceId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import EngineeringPriceForm from "./engineering-price-form.vue";

defineOptions({ name: "engineering-price-edit" });

const route = useRoute();
const router = useRouter();

const conId = Number(route.query.conId); // 合同ID
const auditPriceId = Number(route.query.auditPriceId); // 工程核价ID

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.engineering-price-edit-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
