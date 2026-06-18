<!-- 招标总览 -->
<template>
  <div class="overview-form-page">
    <!-- 基本信息 -->
    <basic-info
      :data="props.detailData"
      :project-options="props.projectOptions"
    ></basic-info>

    <div class="form-section">
      <h3 class="section-title">事项明细</h3>
      <base-table
        :columns="columns"
        :tableData="tableData"
        :rowKey="'id'"
        :pagination="false"
        :show-toolbar="false"
        :height="'100%'"
      ></base-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import BasicInfo from "../basic-info.vue";
import { BidTenderFormParams } from "@/types/cost/bidding/bidding-management-type.ts";

defineOptions({ name: "overview" });

interface Props {
  tenderId?: number;
  detailData?: {
    tender: BidTenderFormParams;
    items: any[];
    projIds: number[];
  };
  projectOptions: any[];
}
const props = withDefaults(defineProps<Props>(), {
  tenderId: null,
  detailData: null,
  projectOptions: () => [],
});

const columns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projId", label: "项目" },
  { prop: "tenderItemName", label: "招标明细" },
  { prop: "bldNames", label: "楼栋" },
  { prop: "bidBondAmount", label: "应交投标保证金" },
  { prop: "perfBondAmount", label: "应交履约保证金" },
  { prop: "referAmount", label: "不含税参考价" },
];

// 明细表
const tableData = ref([]);

watch(
  () => props.detailData,
  (newVal) => {
    if (newVal) {
      tableData.value = newVal.items || [];
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.overview-form-page {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  padding: 20px 20px;
  box-sizing: border-box;
  overflow: hidden;

  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }
}
</style>
