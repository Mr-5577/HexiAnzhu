<!-- 编辑 招标需求 -->
<template>
  <div class="bidding-demand-edit-page">
    <BiddingDemandForm
      mode="edit"
      :billId="billId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import BiddingDemandForm from "./bidding-demand-form.vue";

defineOptions({ name: "bidding-demand-edit" });

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
.bidding-demand-edit-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
