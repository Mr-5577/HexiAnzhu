<!-- 投标保证金缴纳 详情 -->
<template>
  <div class="bid-bond-pay-detail-page">
    <BondPayForm
      mode="detail"
      :tender-id="tenderId"
      :bondRecvId="bondRecvId"
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

// 从路由参数获取 tenderId  bondRecvId
const tenderId = Number(route.query.tenderId); // 事项ID
const bondRecvId = Number(route.query.bondRecvId); // 投标保证金缴纳ID

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
