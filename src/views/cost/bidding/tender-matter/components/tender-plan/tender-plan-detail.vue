<!-- 招标计划 详情 -->
<template>
  <div class="tender-plan-detail-page">
    <TenderPlanForm
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
import TenderPlanForm from "./tender-plan-form.vue";

const route = useRoute();
const router = useRouter();

defineOptions({ name: "tender-plan-detail" });

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
.tender-plan-detail-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
