<!-- 合同台账 -->
<template>
  <div class="contract-ledger-page">
    <!-- 板块-公司-项目 -->
    <sector-company-project-treet
      ref="sectorCompanyProjectTreetRef"
      @select="handleProjectSelect"
    />

    <div class="right-content" v-if="selectedData">
      <conTable :selectedData="selectedData" />
    </div>

    <div class="right-content empty" v-else>
      <el-empty description="请从左侧选择项目" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import SectorCompanyProjectTreet from "@/components/business/sector-company-project-treet.vue.vue";
import conTable from "./ledger-table.vue"
import type { ProjectTreeNode } from "@/types/cost/master-data/project-area-type.ts";

defineOptions({ name: "contract-ledger" });

const selectedData = ref(null);

// 处理选中的项目
const handleProjectSelect = (data: ProjectTreeNode) => {
  console.log("选中的板块-公司、项目数据:", data);
  if (data) {
    selectedData.value = data;
  } else {
    // console.log("已清空选中");
    selectedData.value = null;
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
