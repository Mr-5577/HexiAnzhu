<!-- 新增 特殊事项 -->
<template>
  <div class="special-matter-add-page">
    <SpecialMatterForm
      mode="add"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import SpecialMatterForm from "./special-matter-form.vue";

const route = useRoute();
const router = useRouter();

defineOptions({ name: "special-matter-add" });

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.special-matter-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
