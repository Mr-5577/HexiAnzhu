<!-- 新增 招标需求 -->
<template>
  <div class="bidding-demand-add-page">
    <BiddingDemandForm
      mode="add"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import BiddingDemandForm from "./bidding-demand-form.vue";

defineOptions({ name: "bidding-demand-add" });

const route = useRoute();
const router = useRouter();

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.bidding-demand-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
