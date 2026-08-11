<!-- components/WarningPanel.vue -->
<template>
  <el-card class="warning-card" shadow="never">
    <div class="card-header">
      <span>
        <el-icon><WarningFilled /></el-icon>成本分摊预警
      </span>
      <el-button type="primary" :disabled="!hasData" @click="onView">
        查看分摊预警
      </el-button>
    </div>

    <div style="height: 330px">
      <template v-if="warningVisible && hasData">
        <!-- 预警图例 -->
        <div class="warning-stats">
          <span><span class="dot dot0"></span>红色预警</span>
          <span><span class="dot dot1"></span>黄色预警</span>
          <span><span class="dot dot2"></span>绿色预警</span>
        </div>

        <base-table
          ref="warningTableRef"
          :columns="warningColumns"
          :table-data="warningData"
          row-key="id"
          :pagination="false"
          :show-toolbar="false"
          :show-action-bar="false"
          :border="true"
          :stripe="false"
          height="300px"
          :compact-empty="true"
          :default-expand-level="1"
        >
          <template #allocWarn="{ row }">
            <span class="dot" :class="`dot${row.allocWarn}`"></span>
          </template>
        </base-table>
      </template>
      <template v-else>
        <el-empty :image-size="60" description="暂无数据" />
      </template>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { WarningFilled } from "@element-plus/icons-vue";

defineProps<{
  warningData: any[];
  hasData: boolean;
  warningVisible: boolean;
}>();

const emit = defineEmits<{
  view: [];
  "update:warningVisible": [value: boolean];
}>();

const warningColumns = [
  {
    prop: "subName",
    label: "成本科目",
    align: "left",
    width: 200,
    fixed: "left",
  },
  { slot: "allocWarn", label: "预警状态", width: 100, fixed: "left" },
  {
    label: "分摊后余额",
    children: [
      { prop: "balanceExclAmt", label: "金额(不含税)" },
      { prop: "balanceAmt", label: "金额(含税)" },
    ],
  },
  {
    label: "目标成本可用额",
    children: [
      { prop: "availExclAmt", label: "金额(不含税)" },
      { prop: "availAmt", label: "金额(含税)" },
    ],
  },
  {
    label: "当前分摊额",
    children: [
      { prop: "allocExclAmt", label: "金额(不含税)" },
      { prop: "allocAmt", label: "金额(含税)" },
    ],
  },
];

const onView = () => emit("view");
</script>

<style scoped>
.warning-card {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 15px;
}

.card-header .el-icon {
  color: #2563eb;
  margin-right: 6px;
}

.warning-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
}

.warning-stats span {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.dot0 {
  background: #ef4444;
}
.dot.dot1 {
  background: #f59e0b;
}
.dot.dot2 {
  background: #10b981;
}
</style>
