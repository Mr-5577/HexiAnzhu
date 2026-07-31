<!-- 成本分摊-主表 -->
<template>
  <div class="cost-allocation-wrapper">
    <!-- 成本分摊-主表 -->
    <allocation-main
      v-if="viewMode === 'list'"
      :conId="props.conId"
      :projId="props.projId"
      @view-detail="handleViewDetail"
    />
    <!-- 成本分摊-明细 -->
    <allocation-detail
      v-if="viewMode === 'detail'"
      :conId="props.conId"
      :projId="props.projId"
      :allocMid="allocMid"
      @back="handleBack"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import AllocationMain from "./allocation-main/index.vue";
import AllocationDetail from "./allocation-detail/index.vue";

defineOptions({ name: "cost-allocation" });

const props = defineProps<{
  conId: number | null;
  projId: number | null;
}>();

const viewMode = ref<"list" | "detail">("list");
const allocMid = ref<number | null>(null);

const handleViewDetail = (id: number) => {
  allocMid.value = id;
  viewMode.value = "detail";
};

const handleBack = () => {
  viewMode.value = "list";
  allocMid.value = null;
};

onMounted(() => {});
</script>

<style lang="scss" scoped>
.cost-allocation-wrapper {
  width: 100%;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
