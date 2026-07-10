<template>
  <div>
    <div class="section-title">价款及税率</div>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="合同总价(含税)" prop="totalPriceTax">
          <el-input
            v-model="priceTaxData.totalPriceTax"
            readonly
            placeholder="自动计算"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="合同总价(不含税)" prop="totalPrice">
          <el-input
            v-model="priceTaxData.totalPrice"
            readonly
            placeholder="自动计算"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="税额" prop="taxAmount">
          <el-input
            v-model="priceTaxData.taxAmount"
            readonly
            placeholder="自动计算"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="税率" prop="taxRate">
          <el-input
            v-model="priceTaxData.taxRate"
            readonly
            placeholder="自动计算"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-row>
    <!-- 价税明细表格区域 -->
    <div class="detail-table">
      <div class="header-content">
        <span class="header-title">价税明细</span>
        <el-button type="primary" size="small" @click="addRow">
          新增价税明细
        </el-button>
      </div>
      <editable-table
        ref="pricesRef"
        :row-key="'uuid'"
        :height="'160px'"
        v-model="localPriceTable"
        :columns="priceColumns"
        :pagination="false"
        :highlight-current-row="false"
        :show-summary="false"
        :compactEmpty="true"
        :editable="true"
      >
        <template #actions="{ row }">
          <el-button link type="danger" @click="deleteRow(row)">
            删除
          </el-button>
        </template>
      </editable-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";

const props = defineProps<{
  modelValue: any[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: any[]): void;
}>();

const localPriceTable = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit("update:modelValue", val);
  },
});

// 计算价款数据
const priceTaxData = computed(() => {
  const totalPriceTax = localPriceTable.value.reduce((sum, item) => {
    const amt = Number(item.itemAmt) || 0;
    return sum + amt;
  }, 0);

  const totalPrice = localPriceTable.value.reduce((sum, item) => {
    const exclAmt = Number(item.itemExclAmt) || 0;
    return sum + exclAmt;
  }, 0);

  const taxAmount = localPriceTable.value.reduce((sum, item) => {
    const tax = Number(item.itemTaxAmt) || 0;
    return sum + tax;
  }, 0);

  let taxRate = 0;
  if (totalPrice > 0) {
    taxRate = (taxAmount / totalPrice) * 100;
    taxRate = Math.round(taxRate * 100) / 100;
  }

  return {
    totalPriceTax,
    totalPrice,
    taxAmount,
    taxRate,
  };
});

// 新增行
const addRow = () => {
  const newRow = {
    uuid: uuidv4(),
    id: null,
    conBillId: null,
    itemName: "",
    itemAmt: 0,
    itemTaxRate: 0,
    itemExclAmt: 0,
    itemTaxAmt: 0,
    remark: "",
  };
  localPriceTable.value = [...localPriceTable.value, newRow];
};

// 删除行
const deleteRow = (row: any) => {
  localPriceTable.value = localPriceTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};

const priceColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "itemName",
    label: "分项名称",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    prop: "itemAmt",
    label: "分项含税总额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "itemTaxRate",
    label: "税率",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "itemExclAmt",
    label: "分项不含税额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "itemTaxAmt",
    label: "分项税额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "remark",
    label: "备注",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);
</script>

<style scoped lang="scss">
.detail-table {
  .header-content {
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .header-title {
      font-size: 15px;
      color: #5d5d5f;
      font-weight: 600;
    }
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
  padding-left: 10px;
  position: relative;
  &::before {
    content: "";
    width: 4px;
    height: 16px;
    background: #409eff;
    border-radius: 2px;
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
