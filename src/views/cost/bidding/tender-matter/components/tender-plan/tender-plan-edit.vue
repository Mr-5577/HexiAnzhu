<!-- 编辑招标计划 -->
<template>
  <div class="tender-plan-edit-page">
    <TenderPlanForm
      mode="edit"
      :tender-id="tenderId"
      :plan-id="planId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import TenderPlanForm from "./tender-plan-form.vue";

const route = useRoute();
const router = useRouter();

defineOptions({ name: "tender-plan-edit" });

// 从路由参数获取 tenderId  planId
const tenderId = Number(route.query.tenderId); // 事项ID
const planId = Number(route.query.planId); // 计划ID

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.tender-plan-edit-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
