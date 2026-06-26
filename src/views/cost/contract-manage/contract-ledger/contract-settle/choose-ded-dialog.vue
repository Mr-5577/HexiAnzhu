<!-- 奖罚单选择弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="选择奖罚单"
    width="1000px"
    :confirm-loading="confirmLoading"
    :confirm-text="'确定'"
    @confirm="handleConfirm"
    @close="handleClose"
  >
    <div class="choose-ded-wrapper">
      <!-- 筛选区域 -->
      <el-form
        :model="queryParams"
        ref="queryRef"
        :inline="true"
        size="default"
      >
        <el-form-item label="扣款事项" prop="dedName">
          <el-input
            v-model="queryParams.dedName"
            placeholder="请输入扣款事项名称"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="扣款类型" prop="dedTypeId">
          <el-select
            v-model="queryParams.dedTypeId"
            placeholder="请选择扣款类型"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in dedTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <base-table
        ref="tableRef"
        :row-key="'id'"
        :columns="tableColumns"
        :table-data="tableData"
        :loading="tableLoading"
        :height="'450px'"
        :highlight-current-row="true"
        :pagination="false"
        :selection-mode="'single'"
        @selection-change="handleSelectionChange"
      >
        <template #dedTypeId="{ row }">
          {{ getDedTypeName(row.dedTypeId) }}
        </template>
        <template #status="{ row }">
          {{ getStatusName(row.status) }}
        </template>
        <template #dedLastAmt="{ row }">
          <span
            :style="{ color: row.dedLastAmt === 0 ? '#f56c6c' : '#67c23a' }"
          >
            {{ row.dedLastAmt || 0 }}
          </span>
          <el-tag
            v-if="row.dedLastAmt === 0"
            type="danger"
            size="small"
            style="margin-left: 8px"
          >
            已扣完
          </el-tag>
        </template>
      </base-table>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ElMessage } from "element-plus";
import { paymentAdjustApi } from "@/api/cost/contract-manage/payment-adjust-api";
import { dedTypeEnum } from "@/constants/contract-manage/enums";
import { ContractDed } from "@/types/cost/contract-manage/payment-adjust-type";

// Props
interface Props {
  modelValue: boolean;
  conId?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  conId: null,
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  select: [row: ContractDed];
}>();

// 弹窗显示状态
const dialogVisible = ref(props.modelValue);
// 确认按钮loading
const confirmLoading = ref(false);
// 表格loading
const tableLoading = ref(false);
// 表格数据
const tableData = ref<ContractDed[]>([]);
// 选中行数据
const selectedRow = ref<ContractDed | null>(null);
// 表格ref
const tableRef = ref();

// 扣款类型选项
const dedTypeOptions = dedTypeEnum;

// 查询参数
const queryParams = ref({
  conId: props.conId,
  dedName: "",
  dedTypeId: null as number | null,
  // status: 10, // 只查询已审批的
});

// 表格列配置
const tableColumns = [
  { type: "selection", width: 50, fixed: "left" },
  { type: "index", label: "序号", width: 60, fixed: "left" },
  {
    label: "扣款事项",
    prop: "dedName",
    width: 120,
  },
  {
    label: "扣款类型",
    slot: "dedTypeId",
    width: 120,
  },
  {
    label: "奖罚金额",
    prop: "dedAmt",
    width: 120,
  },
  {
    label: "已扣金额",
    prop: "dedAlreadyAmt",
    width: 120,
  },
  {
    label: "可扣金额",
    slot: "dedLastAmt",
    width: 120,
  },
  {
    label: "状态",
    slot: "status",
    width: 100,
  },
  {
    label: "说明",
    prop: "dedDesc",
  },
];

// 获取扣款类型名称
const getDedTypeName = (dedTypeId: number) => {
  const dedType = dedTypeOptions.find((item) => item.value === dedTypeId);
  return dedType?.label || "";
};

// 获取状态名称
const getStatusName = (status: number) => {
  switch (status) {
    case 0:
      return "草稿";
    case 5:
      return "审批中";
    case 10:
      return "已审批";
    case 30:
      return "已作废";
    default:
      return "-";
  }
};

// 重置状态
const resetState = () => {
  selectedRow.value = null;
  queryParams.value = {
    conId: props.conId,
    dedName: "",
    dedTypeId: null,
    // status: 10,
  };
  // 清除表格高亮
  setTimeout(() => {
    if (tableRef.value) {
      tableRef.value.clearCurrentRow();
    }
  }, 0);
};

// 查询列表
const getDedList = async () => {
  if (!props.conId) {
    ElMessage.warning("请先选择合同");
    return;
  }
  try {
    tableLoading.value = true;
    const params = {
      ...queryParams.value,
    };
    const res = await paymentAdjustApi.getDedList(params);
    if (res.code === 200) {
      tableData.value = res.data || [];
    } else {
      ElMessage.error(res.message || "加载奖罚单列表失败");
    }
  } catch (error) {
    console.error("加载奖罚单列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

// 查询
const handleQuery = () => {
  getDedList();
};

// 重置
const handleReset = () => {
  queryParams.value = {
    conId: props.conId,
    dedName: "",
    dedTypeId: null,
    // status: 10,
  };
  handleQuery();
};

// 选择改变
const handleSelectionChange = (rows: ContractDed[]) => {
  selectedRow.value = rows.length > 0 ? rows[0] : null;
};

// 确认选择
const handleConfirm = () => {
  if (!selectedRow.value) {
    ElMessage.warning("请先选择奖罚单");
    return;
  }
  //   if (selectedRow.value.dedLastAmt === 0) {
  //     ElMessage.warning("该奖罚单已扣完，不可选择");
  //     return;
  //   }
  confirmLoading.value = true;
  emit("select", selectedRow.value);
  handleClose();
  confirmLoading.value = false;
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  selectedRow.value = null;
};

// 监听modelValue
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      resetState();
      getDedList();
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});

// 暴露方法供父组件调用
defineExpose({
  open: () => {
    dialogVisible.value = true;
  },
  close: () => {
    handleClose();
  },
});
</script>

<style lang="scss" scoped>
.choose-ded-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;

  :deep(.base-table) {
    .el-table__row {
      cursor: pointer;
    }

    .current-row {
      background-color: #ecf5ff;
    }
  }
}
</style>
