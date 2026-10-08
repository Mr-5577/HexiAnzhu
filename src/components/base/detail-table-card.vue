<!-- ============ DetailTableCard 明细表格卡 ============ -->
<!-- 统一封装明细表格的标题栏 + 新增按钮 + editable-table -->
<template>
  <div class="detail-table">
    <div class="header-content">
      <span class="header-title">
        {{ title }}
        <span class="count">{{ count }}</span>
      </span>
      
      <div class="header-actions">
        <el-button v-if="showAdd" type="primary" size="small" @click="$emit('add')">
          + {{ addText }}
        </el-button>
        <slot name="header-extra" />
      </div>
    </div>
    <editable-table
      :row-key="'uuid'"
      :height="height"
      :model-value="modelValue"
      :columns="columns"
      :pagination="false"
      :highlight-current-row="false"
      :show-summary="showSummary" 
      :compact-empty="true"
      :editable="true"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template #actions="{ row }">
        <slot name="actions" :row="row" />
      </template>
    </editable-table>
  </div>
</template>

<script setup lang="ts">
import type { EditableColumn } from "@/components/base/editable-table.vue";
import EditableTable from "@/components/base/editable-table.vue";

interface Props {
  modelValue: any[];
  columns: EditableColumn[];
  title?: string;
  count?: number;
  addText?: string;
  height?: string;
  showSummary?: boolean; 
  showAdd?: boolean;
}
withDefaults(defineProps<Props>(), {
  title: "",
  count: 0,
  addText: "新增",
  height: "160px",
  showSummary: false,
  showAdd:true,
});
defineEmits<{
  (e: "update:modelValue", val: any[]): void;
  (e: "add"): void;
}>();
</script>

<style scoped lang="scss">
.detail-table {
  margin-top: 8px;

  .header-content {
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;

    .header-title {
      font-size: 14px;
      color: #4e5969;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 8px;

      .count {
        background: #ecf5ff;
        color: #409eff;
        padding: 1px 8px;
        border-radius: 10px;
        font-size: 12px;
      }
    }

    /* 按钮容器：统一靠右 */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;   /* 关键：推到最右边 */
    }
  }

}
</style>
