<!-- 招标需求 详情 -->
<template>
  <div class="bidding-demand-detail-page">
    <BiddingDemandForm
      mode="detail"
      :billId="billId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import BiddingDemandForm from "./bidding-demand-form.vue";

defineOptions({ name: "bidding-demand-detail" });

const route = useRoute();
const router = useRouter();

const billId = Number(route.query.billId); // 招标需求单据ID

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.bidding-demand-detail-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
