<!-- 编辑 签证 -->
<template>
  <div class="visa-manage-page">
    <VisaManageForm
      mode="detail"
      :conId="conId"
      :visaId="visaId"
      :projId="projId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>
<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import VisaManageForm from "./visa-manage-form.vue";

defineOptions({ name: "visa-manage-detail" });

const route = useRoute();
const router = useRouter();

const conId = Number(route.query.conId); // 合同ID
const visaId = Number(route.query.visaId); // 签证ID
const projId = Number(route.query.projId); // 项目ID

const handleSuccess = () => {
  //router.back();
};

const handleCancel = () => {
  //router.back();
};
</script>

<style scoped lang="scss">
.visa-manage-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
