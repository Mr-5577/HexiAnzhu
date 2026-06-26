<!-- 编辑 招标参考价 -->
<template>
  <div class="reference-price-edit-page">
    <ReferencePriceForm
      mode="edit"
      :tender-id="tenderId"
      :refer-id="referId"
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

defineOptions({ name: "reference-price-edit" });

// 从路由参数获取 tenderId  referId
const tenderId = Number(route.query.tenderId); // 事项ID
const referId = Number(route.query.referId); // 招标参考价ID

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.reference-price-edit-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
