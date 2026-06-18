<!-- 合同台账 -->
<template>
  <div class="contract-ledger-page">
    <!-- 城市-项目 -->
    <urban-project-tree
      ref="urbanProjectTreeRef"
      @select="handleProjectSelect"
    />

    <div class="right-content" v-if="selectedProjectId">
      <ledger-table :project-id="selectedProjectId" />
    </div>

    <div class="right-content empty" v-else>
      <el-empty description="请从左侧选择项目" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import UrbanProjectTree from "@/components/business/urban-project-tree.vue";
import LedgerTable from "./ledger-table.vue";
import { ProjectTreeNode } from "@/types/cost/master-data/project-area-type.ts";

defineOptions({ name: "contract-ledger" });

const urbanProjectTreeRef = ref();
const selectedProjectId = ref<number | null>(null);

// 处理选中的项目
const handleProjectSelect = (project: ProjectTreeNode) => {
  // console.log("选中的项目数据:", project);
  console.log("选中项目ID:", urbanProjectTreeRef.value?.selectedProjectId);
  if (project) {
    selectedProjectId.value = project.orgId;
  } else {
    // console.log("已清空选中项目");
    selectedProjectId.value = null;
  }
};

onMounted(() => {});
</script>

<style lang="scss" scoped>
.contract-ledger-page {
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
