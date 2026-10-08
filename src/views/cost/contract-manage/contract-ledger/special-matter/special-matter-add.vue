<!-- 新增 特殊事项 -->
<template>
  <div class="special-matter-add-page">
    <SpecialMatterForm mode="add" :conId="conId" />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import SpecialMatterForm from "./special-matter-form.vue";

defineOptions({ name: "special-matter-add" });

const route = useRoute();
const router = useRouter();

const conId = Number(route.query.conId); // 合同ID

</script>

<style scoped lang="scss">
.special-matter-add-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
