<!-- 新增 招标参考价 -->
<template>
  <div class="reference-price-add-page">
    <ReferencePriceForm
      mode="add"
      :tender-id="tenderId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import ReferencePriceForm from "./reference-price-form.vue";

const route = useRoute();
const router = useRouter();

defineOptions({ name: "reference-price-add" });

// 从路由参数获取 tenderId
const tenderId = Number(route.query.tenderId); // 招标事项id

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.reference-price-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
