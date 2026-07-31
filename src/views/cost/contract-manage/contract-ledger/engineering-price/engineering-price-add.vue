<!-- 新增 工程核价 -->
<template>
  <div class="engineering-price-add-page">
    <EngineeringPriceForm
      mode="add"
      :conId="conId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import EngineeringPriceForm from "./engineering-price-form.vue";

defineOptions({ name: "engineering-price-add" });

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
.engineering-price-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
