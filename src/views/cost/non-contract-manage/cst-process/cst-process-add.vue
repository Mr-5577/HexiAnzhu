<!-- 新增 建安立项 -->
<template>
  <div class="cst-process-add-page">
    <CstProcessForm
      mode="add"
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

defineOptions({ name: "cst-process-add" });

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.cst-process-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
