<!-- 编辑 特殊事项 -->
<template>
  <div class="special-matter-edit-page">
    <SpecialMatterForm mode="edit" :specialId="specialId" :conId="conId" />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import SpecialMatterForm from "./special-matter-form.vue";

defineOptions({ name: "special-matter-edit" });

const route = useRoute();
const router = useRouter();

const specialId = Number(route.query.specialId); // 特殊事项ID
const conId = Number(route.query.conId); // 合同ID

</script>

<style scoped lang="scss">
.special-matter-edit-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
