<!-- 新增产值申报 -->
<template>
  <div class="output-declaration-add-page">
    <OutputValueForm
      mode="add"
      :con-id="conId"
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

defineOptions({ name: "output-declaration-add" });

const conId = Number(route.query.conId); // 合同ID

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.output-declaration-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
