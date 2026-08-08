<!-- 新增 变更指令 -->
<template>
  <div class="change-order-add-page">
    <ChangeOrderForm
      mode="add"
      :conId="conId"
      :projId="projId"
      :conName="conName"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>
<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import ChangeOrderForm from "./change-order-form.vue";

defineOptions({ name: "change-order-add" });

const route = useRoute();
const router = useRouter();

const projId = Number(route.query.projId); // 项目ID
const conId = Number(route.query.conId); // 合同ID
const conName = String(route.query.conName); // 合同名称

const handleSuccess = () => {
  router.back();
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.change-order-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
