<!-- 编辑产值申报 -->
<template>
  <div class="output-declaration-edit-page">
    <OutputValueForm
      mode="edit"
      :con-id="conId"
      :output-id="outputId"
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

defineOptions({ name: "output-declaration-edit" });

const conId = Number(route.query.conId); // 合同ID
const outputId = Number(route.query.outputId); // 产值ID

const handleSuccess = () => {
  // router.back();
};

const handleCancel = () => {
  // router.back();
};
</script>

<style scoped lang="scss">
.output-declaration-edit-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
