<!-- components/AllocationHeader.vue -->
<template>
  <header class="header-card">
    <div class="header-top" v-if="!isDialogMode">
      <h2>成本分摊</h2>
    </div>

    <el-row :gutter="16" class="summary-cards">
      <el-col :span="6">
        <div class="summary-item">
          <div class="label">单据类型</div>
          <div class="value small">
            {{ getEnumLabel(bizTypeEnum, bizType) }}
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="summary-item bg-gray">
          <div class="label">成本金额</div>
          <div class="value large">{{ allocAmt || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="summary-item bg-green">
          <div class="label">已分摊金额</div>
          <div class="value large green">{{ allocatedAmount }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="summary-item bg-gray-light">
          <div class="label">待分摊金额</div>
          <div class="value large gray">{{ pendingAmount }}</div>
        </div>
      </el-col>
    </el-row>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getEnumLabel } from '@/utils/enum';
import { bizTypeEnum } from '@/constants/contract-manage/enums';

const props = defineProps<{
  bizType: string;
  allocAmt: number;
  allocatedAmount: number;
  pendingAmount: number;
  isDialogMode?: boolean;
}>();

const { bizTypeEnum: enumObj } = { bizTypeEnum };
</script>

<style scoped>
.header-card {
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.header-top h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.summary-item {
  height: 82px;
  background: #f0f7ff;
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid #dbeafe;
}

.summary-item .label {
  font-size: 14px;
  color: #6b7280;
}

.summary-item .value.small {
  font-size: 20px;
  font-weight: 700;
  margin-top: 4px;
}
.summary-item .value.large {
  font-size: 24px;
  font-weight: 700;
  margin-top: 4px;
}

.summary-item.bg-gray {
  background: #f9fafb;
  border-color: #e5e7eb;
}

.summary-item.bg-green {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.summary-item.bg-green .value {
  color: #10b981;
}

.summary-item.bg-gray-light {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.summary-item.bg-gray-light .value {
  color: #9ca3af;
}
</style>