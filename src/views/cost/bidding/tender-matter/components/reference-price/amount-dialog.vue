<!-- 组价明细弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="组价明细配置"
    width="1000px"
    :close-on-click-modal="false"
    :confirm-loading="submitLoading"
    @close="handleClose"
    @cancel="handleClose"
    @confirm="handleConfirm"
  >
    <div class="amount-table">
      <div class="table-header">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          添加
        </el-button>
      </div>

      <editable-table
        ref="detailtableRef"
        :row-key="'uuid'"
        :height="'400px'"
        :table-data="tableData"
        :columns="dynamicColumns"
        :loading="tableLoading"
        :pagination="false"
        :highlight-current-row="false"
        :show-summary="false"
        :on-save="handleSave"
        @data-change="handleDataChange"
        @update:table-data="handleDataUpdate"
      >
        <template #actions="{ row }">
          <el-button link type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </editable-table>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import { Plus } from "@element-plus/icons-vue";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import type { AmountItem } from "@/types/cost/bidding/bidding-management-type";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api";
import { ElMessage } from "element-plus";

// Props
interface Props {
  modelValue: boolean;
  currentRowData?: any; // 当前行数据
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  currentRowData: null,
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [amounts: AmountItem[]];
}>();

// 响应式数据
const dialogVisible = ref(props.modelValue);
const submitLoading = ref(false);
const tableLoading = ref(false);
const tableData = ref<AmountItem[]>([]);
const subjectOptions = ref([]);

// 表格列配置
const dynamicColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "subId",
    label: "目标成本科目",
    editable: true,
    editType: "select",
    optionLabelField: "subName",
    optionValueField: "id",
    showOverflowTooltip: false,
    options: subjectOptions.value,
  },
  {
    prop: "subAmount",
    label: "不含税参考价金额",
    editable: true,
    editType: "number",
    placeholder: "请输入金额",
    showOverflowTooltip: false,
  },
  {
    prop: "amountRemark",
    label: "参考价说明",
    editable: true,
    editType: "input",
    placeholder: "请输入说明",
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);

// 添加行
const handleAdd = () => {
  const newRow = {
    uuid: uuidv4(),
    referId: null, // 定标参考价表ID
    subId: null, // 目标成本科目ID
    subName: "", // 目标成本科目名称
    subAmount: 0, // 不含税参考价金额
    amountRemark: "", // 参考价说明
    costExclAmt: 0, // 目标成本总额(不含税)
  };
  tableData.value = [...tableData.value, newRow];
};

// 删除行
const handleDelete = (row) => {
  tableData.value = tableData.value.filter((item) => item.uuid !== row.uuid);
};
const handleSave = async ({
  row,
  column,
  newValue,
  oldValue,
  rowIndex,
}: any) => {
  console.log("保存行数据:", { row, column, newValue, oldValue, rowIndex });
};
// 数据变化处理
const handleDataChange = async ({ row, column, newValue }: any) => {
  if (column === "subId") {
    const selected = subjectOptions.value.find((opt) => opt.id === newValue);
    if (selected) {
      row.subName = selected.subName;
    }
    row.costExclAmt = 0; // 切换科目时重置目标成本总额
    // 通过选中的目标成本科目获取目标成本总额
    try {
      const params = {
        projId: props.currentRowData?.projId,
        subId: row.subId,
      };
      const res = await goalCostApi.getProjectCostDList(params);
      if (res.code === 200) {
        const list = res.data || [];
        const totalCost = list.reduce(
          (sum: number, item: any) => sum + (item.costExclAmt || 0),
          0,
        );
        row.costExclAmt = totalCost;
      }
    } catch (error) {
      console.error("获取目标成本总额失败:", error);
    }
  }
};

// 表格数据更新
const handleDataUpdate = (newData: AmountItem[]) => {
  tableData.value = newData;
};
/**
 * 获取目标成本科目列表
 */
const getCostSubjectProjList = async () => {
  if (!props.currentRowData?.projId) {
    ElMessage.warning("请先选择项目");
    return;
  }
  try {
    const res = await costCategoryApi.getCostSubjectProjList({
      projId: props.currentRowData?.projId,
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
/**
 * 初始化页面数据
 */
const initPage = () => {
  const defaultAmounts = props.currentRowData?.amounts || [];
  tableData.value = defaultAmounts?.map((item) => ({
    ...item,
    uuid: uuidv4(), // 为每行数据添加唯一标识
  }));
};

// 确认提交
const handleConfirm = async () => {
  console.log("tableData", tableData.value);
  if (tableData.value.some((item) => !item.subId)) {
    ElMessage.error("请选择列表中的目标成本科目");
    return;
  }
  if (tableData.value.some((item) => !item.subAmount)) {
    ElMessage.error("请填写列表中的不含税参考价金额");
    return;
  }
  emit("confirm", tableData.value);
  handleClose();
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
};

// 监听弹窗显示
watch(
  () => props.modelValue,
  async (val) => {
    dialogVisible.value = val;
    if (val) {
      // 打开弹窗时加载数据
      await getCostSubjectProjList();
      initPage();
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});
</script>

<style lang="scss" scoped>
.amount-table {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .total-amount {
      font-size: 14px;
      font-weight: 600;
      color: #f56c6c;
    }
  }
}
</style>
