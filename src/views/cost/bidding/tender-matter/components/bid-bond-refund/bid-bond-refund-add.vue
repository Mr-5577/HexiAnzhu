<!-- 新增 投标保证金退还 -->
<template>
  <div class="bid-bond-refund-add-page">
    <BondRefundForm
      mode="add"
      :tender-id="tenderId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import BondRefundForm from "./bond-refund-form.vue";

const route = useRoute();
const router = useRouter();

defineOptions({ name: "bid-bond-refund-add" });

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
.bid-bond-refund-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
