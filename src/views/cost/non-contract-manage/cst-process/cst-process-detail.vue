<!-- 建安立项 详情 -->
<template>
  <div class="cst-process-detail-page">
    <CstProcessForm
      mode="detail"
      :cstProcessId="cstProcessId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import CstProcessForm from "./cst-process-form.vue";

const route = useRoute();
const router = useRouter();

defineOptions({ name: "cst-process-detail" });

const cstProcessId = Number(route.query.cstProcessId); // 建安立项ID

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.cst-process-detail-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
