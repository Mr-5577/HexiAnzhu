<!-- 编辑补充合同 -->
<template>
  <div class="supplement-contract-detail-page">
    <SupplementContractForm
      mode="detail"
      :con-id="conId"
      :add-id="addId"
      :proj-id="projId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import SupplementContractForm from "./supplement-contract-form.vue";

const route = useRoute();
const router = useRouter();

defineOptions({ name: "supplement-contract-detail" });

const conId = Number(route.query.conId);
const addId = Number(route.query.addId);
const projId = Number(route.query.projId);

const handleSuccess = () => {
  //router.back();
};

const handleCancel = () => {
  //router.back();
};
</script>

<style scoped lang="scss">
.supplement-contract-detail-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
