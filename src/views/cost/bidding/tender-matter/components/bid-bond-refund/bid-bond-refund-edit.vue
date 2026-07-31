<!-- 编辑 投标保证金退还 -->
<template>
  <div class="bid-bond-refund-edit-page">
    <BondRefundForm
      mode="edit"
      :billId="billId"
      :tenderId="tenderId"
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

// 从路由参数获取 
const billId = Number(route.query.billId); // 单据ID
const tenderId = Number(route.query.tenderId); // 招标事项id

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
