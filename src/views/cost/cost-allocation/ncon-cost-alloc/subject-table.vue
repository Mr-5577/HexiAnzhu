<!-- components/SubjectTable.vue -->
<template>
  <el-card class="subject-card" shadow="never">
    <div class="card-header">
      <span>
        <el-icon><List /></el-icon>成本分摊明细
      </span>
      <div v-if="!isView">
        <el-button plain type="primary" @click="onChoose">
          选择分摊科目
        </el-button>
        <el-button
          type="primary"
          :loading="confirmLoading"
          :disabled="!hasData"
          @click="onAutoAlloc"
        >
          自动分摊
        </el-button>
      </div>
    </div>

    <!-- 项目、楼栋基本信息 -->
    <div class="card-info">
      <div class="info-item">
        <span class="info-label">项目名称：</span>
        <span class="info-value">{{ pageParams.projName || "" }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">事项名称：</span>
        <span class="info-value">{{ pageParams.displayName || "" }}</span>
      </div>
      <div class="info-row">
        <div class="info-item half">
          <span class="info-label">楼栋：</span>
          <el-select
            :model-value="selectedBuildings"
            multiple
            placeholder="请选择楼栋"
            class="building-select"
            filterable
            clearable
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="2"
            @change="onBuildingChange"
            :disabled="isView"
          >
            <el-option
              v-for="item in buildingOptions"
              :key="item.id"
              :label="item.bldName"
              :value="item.id"
            />
          </el-select>
        </div>
        <div class="info-item half">
          <span class="info-label">业态：</span>
          <span class="info-value">{{ businessTypeNames }}</span>
        </div>
      </div>
    </div>

    <!-- 可编辑表格 -->
    <editable-table
      ref="editableTableRef"
      row-key="id"
      height="350px"
      :model-value="treeData"
      @update:model-value="onTreeUpdate"
      :columns="columns"
      :pagination="false"
      :highlight-current-row="false"
      :show-summary="false"
      :compact-empty="true"
      :editable="!isView"
      :default-expand-level="1"
      :on-save="onSave"
      :key="tableKey"
    >
      <template #actions="{ row }" v-if="!isView">
        <el-button v-if="row.isLeaf" type="danger" link @click="onDelete(row)">
          删除
        </el-button>
      </template>
    </editable-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { List } from "@element-plus/icons-vue";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { allocRuleEnum } from "@/constants/master-data/enums";

const props = defineProps<{
  treeData: any[];
  products: any[];
  pageParams: any;
  buildingOptions: any[];
  selectedBuildings: number[];
  isView: boolean;
  hasData: boolean;
  confirmLoading: boolean;
  businessTypeNames: string;
  busiSegOptions: any[];
}>();

const emit = defineEmits<{
  "update:treeData": [data: any[]];
  "update:selectedBuildings": [data: number[]];
  choose: [];
  autoAlloc: [];
  delete: [node: any];
  save: [data: any];
}>();

const editableTableRef = ref(null);
const tableKey = ref(0);

/**
 * 判断节点是否为叶子节点（可编辑）
 * 叶子节点：没有 children 或 children 为空数组
 */
const isLeafNode = (row: any): boolean => {
  if (!row) return false;
  if (row.isLeaf !== undefined) return !!row.isLeaf;
  return !row.children || row.children.length === 0;
};

// 生成动态列配置
const columns = computed<EditableColumn[]>(() => {
  const isViewMode = props.isView;

  const baseColumns: EditableColumn[] = [
    { type: "index", label: "序号", width: 60, editable: false, fixed: "left" },
    {
      prop: "subName",
      label: "成本科目",
      align: "left",
      width: 180,
      editable: false,
      showOverflowTooltip: true,
      fixed: "left",
    },
    {
      prop: "busiSegId",
      label: "业务归属",
      width: 80,
      editable: true,
      editType: "select",
      optionLabelField: "segName",
      optionValueField: "id",
      options: props.busiSegOptions,
      placeholder: " ",
      showOverflowTooltip: false,
      disabled: true,
    },
    {
      prop: "allocRule",
      label: "分摊规则",
      width: 120,
      editable: true,
      editType: "select",
      optionLabelField: "label",
      optionValueField: "value",
      options: allocRuleEnum as any,
      placeholder: " ",
      showOverflowTooltip: false,
      disabled: true,
    },
    {
      prop: "subjectAmt",
      label: "科目金额(含税)",
      width: 120,
      editable: !isViewMode,
      editType: "number",
      placeholder: " ",
      showOverflowTooltip: false,
      disabled: (row: any) => !isLeafNode(row),
    },
    {
      prop: "subjectAmtExcl",
      label: "科目金额(不含税)",
      width: 120,
      editable: !isViewMode,
      editType: "number",
      placeholder: " ",
      showOverflowTooltip: false,
      disabled: (row: any) => !isLeafNode(row),
    },
  ];

  // 业态列
  if (props.products && props.products.length > 0) {
    const productColumns: any = props.products.map((product) => ({
      prop: `prod_${product.prodId}`,
      label: product.prodName || `业态${product.prodId}`,
      children: [
        {
          prop: `allocAmt_${product.prodId}`,
          label: "金额(含税)",
          width: 100,
          editable: !isViewMode,
          editType: "number",
          placeholder: " ",
          showOverflowTooltip: false,
          disabled: (row: any) => !isLeafNode(row),
        },
        {
          prop: `allocExclAmt_${product.prodId}`,
          label: "金额(不含税)",
          width: 100,
          editable: !isViewMode,
          editType: "number",
          placeholder: " ",
          showOverflowTooltip: false,
          disabled: (row: any) => !isLeafNode(row),
        },
      ],
    }));

    baseColumns.push({
      label: "业态分摊明细",
      align: "center",
      children: productColumns,
    });
  }

  baseColumns.push({
    prop: "actions",
    label: "操作",
    width: 80,
    editable: false,
    fixed: "right",
    slot: "actions",
  });

  return baseColumns;
});

const onChoose = () => emit("choose");
const onAutoAlloc = () => emit("autoAlloc");
const onDelete = (row: any) => emit("delete", row);
const onSave = (data: any) => {
  if (data.column && typeof data.column === "object" && data.column.prop) {
    data.column = data.column.prop;
  }
  emit("save", data);
};
const onTreeUpdate = (data: any[]) => emit("update:treeData", data);
const onBuildingChange = (val: number[]) =>
  emit("update:selectedBuildings", val);

// ========== 监听树数据变化，只刷新不重建（保持展开状态） ==========
watch(
  () => props.treeData,
  () => {
    nextTick(() => {
      editableTableRef.value?.refresh();
    });
  },
  { deep: true },
);

// ========== 监听产品变化，只有产品列表真正变化时才重建 ==========
watch(
  () => props.products,
  (newVal, oldVal) => {
    const newStr = JSON.stringify(newVal);
    const oldStr = JSON.stringify(oldVal);
    if (newStr !== oldStr) {
      nextTick(() => {
        editableTableRef.value?.refresh();
        tableKey.value++;
      });
    }
  },
  { deep: true },
);

// ========== 监听列配置变化（产品数量变化时需要重建） ==========
watch(
  () => props.products.length,
  (newLen, oldLen) => {
    if (newLen !== oldLen) {
      nextTick(() => {
        tableKey.value++;
      });
    }
  },
);
</script>

<style scoped>
.subject-card {
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

.card-info {
  background: #ffffff;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  border: 1px solid #e8edf4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  min-width: 0;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: nowrap;
  width: 100%;
  min-width: 0;
}

.info-item {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 0.3rem;
}

.info-item:not(:nth-child(3)) {
  min-width: 260px;
}

.info-item:nth-child(3) {
  flex: 1 1 auto;
  min-width: 120px;
  max-width: 100%;
}

.info-label {
  flex-shrink: 0;
  font-size: 0.8rem;
  font-weight: 500;
  color: #5a6e82;
  white-space: nowrap;
}

.info-value {
  font-weight: 500;
  color: #1a2634;
  font-size: 0.88rem;
  min-width: 0;
  flex: 1;
}

.building-select {
  width: 300px;
  min-width: 80px;
  flex: 1;
}
</style>