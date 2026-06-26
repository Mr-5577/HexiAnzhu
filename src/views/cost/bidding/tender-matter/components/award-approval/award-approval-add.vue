<!-- 新增 定标审批 -->
<template>
  <div class="award-approval-add-page">
    <AwardApprovalForm
      mode="add"
      :tender-id="tenderId"
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

defineOptions({ name: "award-approval-add" });

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
.award-approval-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
