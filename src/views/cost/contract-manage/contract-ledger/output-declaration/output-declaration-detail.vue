<!-- 产值申报 详情 -->
<template>
  <div class="output-declaration-detail-page">
    <OutputValueForm
      mode="detail"
      :con-id="conId"
      :prod-id="prodId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import OutputValueForm from "./output-value-form.vue";

const route = useRoute();
const router = useRouter();

defineOptions({ name: "output-declaration-detail" });

const conId = Number(route.query.conId); // 合同ID
const prodId = Number(route.query.prodId); // 产值ID

const handleSuccess = () => {
  // router.back();
};

const handleCancel = () => {
  // router.back();
};
</script>

<style scoped lang="scss">
.output-declaration-detail-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
