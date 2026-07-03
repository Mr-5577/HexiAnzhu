<!-- 成本分摊弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="'成本分摊'"
    width="900px"
    :showConfirmButton="false"
    :showCancelButton="false"
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
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleAutoAllocate"
          >
            分摊
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
import { costAllocationApi } from "@/api/cost/contract-manage/cost-allocation-api";

defineOptions({ name: "allocation-detail-dialog" });

interface Props {
  modelValue: boolean;
  projId: number | null;
  conId: number | null;
  allocWarnOptions: any[];
  currentRowData?: any | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  projId: null,
  conId: null,
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
    disabled: true,
  },
  // {
  //   prop: "subName",
  //   label: "科目名称",
  //   editable: false,
  //   editType: "input",
  // },
  {
    prop: "allocAmt",
    label: "分摊金额(含税)",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    precision: 2,
    min: 0,
  },
  {
    prop: "allocExclAmt",
    label: "分摊金额(不含税)",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    precision: 2,
    min: 0,
  },
]);

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

const handleAutoAllocate = async () => {
  console.log("当前分摊数据:", props.currentRowData);
  try {
    submitLoading.value = true;
    const params = {
      conId: props.conId,
      subList: detailTable.value.map((item) => ({
        subId: item.subId,
        allocAmt: item.allocAmt,
        allocExclAmt: item.allocExclAmt,
      })),
    };
    const res = await costAllocationApi.autoAllocateCost(params);
    /**
     * {
    "code": 200,
    "message": "success",
    "data": {
        "allocAmtNeed": 999, // 需要分摊总额(含税)
        "allocExclAmtNeed": 1332, // 需要分摊总额(不含税)
        "allocAmt": 111.00, // 已分摊总额(含税)
        "allocExclAmt": 222.00, // 已分摊总额(不含税)
        "allocStatus": 2, // 分摊状态
        "allocWarn": 2, // 分摊预警
        "allocList": [
            {
                "subId": 6, // 科目ID
                "prodId": 3016, // 产品ID
                "costAmt": 99999.0000, // 成本金额(含税)
                "costExclAmt": 911111.0000, // 成本金额(不含税)
                "allocAmt": 111.00, // 分摊金额(含税)
                "allocExclAmt": 222.00, // 分摊金额(不含税)
                "allocWarn": 2 // 分摊预警
            },
            {
                "subId": 7,
                "prodId": 3016,
                "costAmt": 777777.0000,
                "costExclAmt": 7111111.0000,
                "allocAmt": 0,
                "allocExclAmt": 0,
                "allocWarn": 2
            },
            {
                "subId": 9,
                "prodId": 3016,
                "costAmt": 666666.0000,
                "costExclAmt": 6111111.0000,
                "allocAmt": 0,
                "allocExclAmt": 0,
                "allocWarn": 2
            }
        ]
    }
}
     */
    if (res.code === 200) {
      ElMessage.success("分摊成功");
      emit("success");
      handleClose();
    }
  } catch (error) {
    console.error("分摊失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

const handleClose = () => {
  dialogVisible.value = false;
};

// 根据科目渲染列表
const renderSubjectOptions = () => {
  detailTable.value = subjectOptions.value.map((subject) => ({
    uuid: uuidv4(),
    subId: subject.id,
    subName: subject.subName,
    allocAmt: 0,
    allocExclAmt: 0,
  }));
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
      renderSubjectOptions();
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
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      getCostSubjectProjList();
      // getProductList();
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
