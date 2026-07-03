<!-- 成本分摊弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="'成本分摊'"
    width="900px"
    :confirm-loading="submitLoading"
    @confirm="saveAlloc"
    @cancel="handleClose"
    @close="handleClose"
  >
    <div style="padding-right: 8px; box-sizing: border-box">
      <!-- 业务信息 -->
      <el-descriptions :column="4" class="biz-info">
        <el-descriptions-item label="项目：">
          {{ currentRowData?.projName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="业务类型：">
          {{ currentRowData?.bizTypeName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="分摊总额(含税)：">
          {{ currentRowData?.allocAmt || 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="分摊总额(不含税)：">
          {{ currentRowData?.allocExclAmt || 0 }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 分摊明细表格 -->
      <div class="detail-table">
        <div class="header-content">
          <span class="header-title">分摊明细</span>
          <el-button type="primary" size="small" @click="addRow">
            新增分摊明细
          </el-button>
        </div>

        <editable-table
          :row-key="'uuid'"
          :height="'280px'"
          :table-data="detailTable"
          :columns="dynamicColumns"
          :loading="tableLoading"
          :pagination="false"
          :highlight-current-row="false"
          :show-summary="false"
          :compactEmpty="true"
          :on-save="handleSave"
        >
          <template #actions="{ row, $index }">
            <el-button
              link
              type="danger"
              :disabled="detailTable.length <= 1"
              @click="removeRow($index)"
            >
              删除
            </el-button>
          </template>
        </editable-table>
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";
import { productTypeApi } from "@/api/cost/master-data/product-type-api";

interface Props {
  modelValue: boolean;
  projId: number | null;
  allocWarnOptions: any[];
  currentRowData?: any | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  projId: null,
  allocWarnOptions: () => [],
  currentRowData: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);
const submitLoading = ref(false);
const tableLoading = ref(false);
const detailTable = ref([]);
const subjectOptions = ref([]); // 科目列表
const productOptions = ref([]); // 业态列表

const dynamicColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "subId",
    label: "科目名称",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    optionLabelField: "subName",
    optionValueField: "id",
    options: subjectOptions.value,
  },
  {
    prop: "prodId",
    label: "业态名称",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    optionLabelField: "prodName",
    optionValueField: "id",
    options: productOptions.value,
  },
  {
    prop: "costAmt",
    label: "分摊金额(含税)",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    precision: 2,
    min: 0,
  },
  {
    prop: "costExclAmt",
    label: "分摊金额(不含税)",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    precision: 2,
    min: 0,
  },
  {
    prop: "allocWarn",
    label: "分摊预警",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    optionLabelField: "label",
    optionValueField: "value",
    options: props.allocWarnOptions || [],
  },
  {
    label: "操作",
    width: 80,
    slot: "actions",
    fixed: "right",
  },
]);

const addRow = () => {
  const newRow: any = {
    uuid: uuidv4(),
    allocMid: props.currentRowData?.id || null,
    subId: null,
    subName: "",
    prodId: null,
    prodName: "",
    costAmt: null,
    costExclAmt: null,
    allocWarn: "",
  };
  detailTable.value = [...detailTable.value, newRow];
};

const removeRow = (index: number) => {
  if (detailTable.value.length <= 1) {
    ElMessage.warning("至少保留一条分摊明细");
    return;
  }
  detailTable.value = detailTable.value.filter((_, i) => i !== index);
};

const updateRow = (rowIndex: number, data: any) => {
  // 直接修改对象属性，避免创建新对象
  Object.assign(detailTable.value[rowIndex], data);
  // 触发响应式更新
  detailTable.value = [...detailTable.value];
};
const handleSave = async (data: any) => {
  const { row, column, newValue, oldValue, rowIndex } = data;
  // 避免重复更新
  if (newValue === oldValue) return;
  if (column === "subId") {
    const subSelected = subjectOptions.value.find((opt) => opt.id === newValue);
    const subName = subSelected?.subName || "";
    updateRow(rowIndex, { subId: newValue, subName });
    return;
  }
  if (column === "prodId") {
    const prodSelected = productOptions.value.find(
      (opt) => opt.id === newValue,
    );
    const prodName = prodSelected?.prodName || "";
    updateRow(rowIndex, { prodId: newValue, prodName });
    return;
  }
  updateRow(rowIndex, { [column]: newValue });
};

const handleClose = () => {
  dialogVisible.value = false;
};

/**
 * 获取目标成本科目列表
 */
const getCostSubjectProjList = async () => {
  if (!props.projId) {
    ElMessage.warning("请先选择项目");
    return;
  }
  try {
    const res = await costCategoryApi.getCostSubjectProjList({
      projId: props.projId,
      withDetail: true,
    });
    if (res.code === 200) {
      subjectOptions.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取数据失败");
    }
  } catch (error) {
    console.error("获取数据失败:", error);
  }
};
// 获取项目产品类型
const getProductList = async () => {
  if (!props.projId) return;
  try {
    const res = await productTypeApi.getProductProjList({
      projId: props.projId,
      withDetail: true,
    });
    if (res.code === 200) {
      productOptions.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取数据失败");
    }
  } catch (error) {
    console.error("获取业态列表失败:", error);
  }
};
const saveAlloc = async () => {
  console.log("保存分摊", detailTable.value);
  // 校验
  if (!detailTable.value.length) {
    ElMessage.error("请添加分摊明细");
    return;
  }

  // 检查是否所有行都填写完整
  const hasEmpty = detailTable.value.some(
    (row) => !row.subId || !row.prodId || !row.costAmt || row.costAmt <= 0,
  );
  if (hasEmpty) {
    ElMessage.error("请完整填写所有分摊明细（科目、业态、分摊金额）");
    return;
  }

  submitLoading.value = true;
  try {
    // 调用保存接口
    // const res = await allocApi.saveAlloc(submitData);
    // if (res.code === 200) {
    //   ElMessage.success("保存成功");
    //   emit("success", res.data);
    //   handleClose();
    // }
    // ElMessage.success("保存成功");
    // emit("success");
    // handleClose();
  } catch (error) {
    console.error("保存失败:", error);
  } finally {
    submitLoading.value = false;
  }
};
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      getProductList();
      getCostSubjectProjList();
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});
</script>

<style lang="scss" scoped>
.biz-info {
  margin-bottom: 16px;
  :deep(.el-descriptions__label) {
    margin-right: 0;
  }
  :deep(.el-descriptions__body) {
    .el-descriptions__table {
      table-layout: fixed;
    }
    .el-descriptions__table td {
      width: 25%; /* 4列就是25% */
    }
  }
  /* 让所有列等宽 */
  .el-descriptions__body .el-descriptions__table {
    table-layout: fixed;
  }
  /* 每列平均分配宽度 */
  .el-descriptions__body .el-descriptions__table td {
    width: 25%; /* 4列就是25% */
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;
  }
}

.detail-table {
  .header-content {
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      font-size: 15px;
      color: #333;
      font-weight: 600;
    }
  }
}
</style>
