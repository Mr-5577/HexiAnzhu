<!-- 修改 变更指令 -->
<template>
  <div class="change-order-detail-page">
    <ChangeOrderForm
      mode="detail"
      :conId="conId"
      :projId="projId"
      :changeId="changeId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>
<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import ChangeOrderForm from "./change-order-form.vue";

defineOptions({ name: "change-order-detail" });

const route = useRoute();
const router = useRouter();

const projId = Number(route.query.projId); // 项目ID
const conId = Number(route.query.conId); // 合同ID
const changeId = Number(route.query.changeId); // 变更ID

const handleSuccess = () => {
  //router.back();
};

const handleCancel = () => {
  //router.back();
};
</script>

<style scoped lang="scss">
.change-order-adetail-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
