<!-- 付款申请 -->
<template>
  <div class="payment-apply-page">
    <!-- 组织-合同 -->
    <org-contract-tree ref="orgContractTreeRef" @select="handleSelect" />
    <!-- 付款申请列表 -->
    <div class="right-content" v-if="selectedId">
      <payment-apply-table :project-id="selectedId" />
    </div>

    <div class="right-content empty" v-else>
      <el-empty description="请从左侧选择合同" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import OrgContractTree from "./components/org-contract-tree.vue";
import PaymentApplyTable from "./payment-apply-table.vue";
import { ProjectTreeNode } from "@/types/cost/master-data/project-area-type.ts";

defineOptions({ name: "payment-apply" });

const orgContractTreeRef = ref();
const selectedId = ref<number | null>(null);

// 处理选中的数据
const handleSelect = (project: ProjectTreeNode) => {
  // console.log("选中的数据:", project);
  console.log("选中ID:", orgContractTreeRef.value?.selectedId);
  if (project) {
    selectedId.value = project.orgId;
  } else {
    selectedId.value = null;
  }
};

onMounted(() => {});
</script>

<style lang="scss" scoped>
.payment-apply-page {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  background: #f0f2f6;

  .right-content {
    flex: 1;
    padding: 15px;
    box-sizing: border-box;
    background: #fff;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &.empty {
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
