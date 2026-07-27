<!-- 投标保证金缴纳 详情 -->
<template>
  <div class="bid-bond-pay-detail-page">
    <BondPayForm
      mode="detail"
      :billId="billId"
      :tenderId="tenderId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import BondPayForm from "./bond-pay-form.vue";

const route = useRoute();
const router = useRouter();

defineOptions({ name: "bid-bond-pay-detail" });

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
.bid-bond-pay-detail-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
