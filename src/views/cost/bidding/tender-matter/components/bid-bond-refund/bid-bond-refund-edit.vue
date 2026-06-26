<!-- 编辑 投标保证金退还 -->
<template>
  <div class="bid-bond-refund-edit-page">
    <BondRefundForm
      mode="edit"
      :tender-id="tenderId"
      :bondRefundId="bondRefundId"
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

defineOptions({ name: "bid-bond-refund-edit" });

// 从路由参数获取 tenderId  bondRefundId
const tenderId = Number(route.query.tenderId); // 事项ID
const bondRefundId = Number(route.query.bondRefundId); // 投标保证金退还ID

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.bid-bond-refund-edit-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
