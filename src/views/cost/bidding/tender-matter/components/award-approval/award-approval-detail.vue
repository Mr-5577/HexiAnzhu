<!-- 定标审批 详情 -->
<template>
  <div class="award-approval-detail-page">
    <AwardApprovalForm
      mode="detail"
      :tender-id="tenderId"
      :award-id="awardId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import AwardApprovalForm from "./award-approval-form.vue";

const route = useRoute();
const router = useRouter();

defineOptions({ name: "award-approval-detail" });

// 从路由参数获取 tenderId  awardId
const tenderId = Number(route.query.tenderId); // 事项ID
const awardId = Number(route.query.awardId); // 定标审批ID

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.award-approval-detail-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
