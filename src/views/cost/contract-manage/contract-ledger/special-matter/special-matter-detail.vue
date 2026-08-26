<!-- 特殊事项 详情 -->
<template>
  <div class="special-matter-detail-page">
    <SpecialMatterForm mode="detail" :specialId="specialId" :conId="conId" />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import SpecialMatterForm from "./special-matter-form.vue";

defineOptions({ name: "special-matter-detail" });

const route = useRoute();
const router = useRouter();

const specialId = Number(route.query.specialId); // 特殊事项ID
const conId = Number(route.query.conId); // 合同ID

</script>

<style scoped lang="scss">
.special-matter-detail-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
