<!-- 编辑 建安立项 -->
<template>
  <div class="cst-process-edit-page">
    <CstProcessForm
      mode="edit"
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

defineOptions({ name: "cst-process-edit" });

const cstProcessId = Number(route.query.cstProcessId); // 建安立项ID

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.cst-process-edit-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
