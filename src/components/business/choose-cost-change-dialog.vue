<!-- 供应商选择弹窗组件 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="选择合同变更"
    width="1400px"
    :confirm-loading="confirmLoading"
    :confirm-text="'确定'"
    @confirm="handleConfirm"
    @close="handleClose"
  >
    <div class="supplier-select-wrapper">
      <!-- 筛选区域 -->
      <el-form
        :model="queryParams"
        ref="queryRef"
        :inline="true"
        size="default"
      >
        <el-form-item label="变更事项名称" prop="changeName">
          <el-input
            v-model="queryParams.changeName"
            placeholder="请输入变更事项名称"
            clearable
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item label="变更类型" prop="changeType">
          <el-select
            v-model="queryParams.changeType"
            placeholder="请选择变更类型"
            style="width: 100px"
            clearable
          >
            <el-option
              v-for="item in ChangeTypeEnum"
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
        :row-key="'changeConId'"
        :columns="tableColumns"
        :table-data="tableData"
        :loading="tableLoading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :height="'400px'"
        :highlight-current-row="true"
        :selectionMode="props.selectionMode"
        @selection-change="handleSelectionChange"
        @pagination-change="handlePaginationChange"
      >
        <template #changeType="{ row }">
          <el-tag
            size="small"
            :type="getEnumType(ChangeTypeEnum, row?.changeType || 0)"
          >
            {{ getEnumLabel(ChangeTypeEnum, row?.changeType || 0) }}
          </el-tag>
        </template>
      </base-table>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { ChangeTypeEnum } from "@/constants/contract-manage/enums";
import { changeOrderApi } from "@/api/cost/contract-manage/change-order-api";
import { getEnumLabel, getEnumType } from "@/utils/enum";

// Props
interface Props {
  modelValue: boolean;
  selectionMode?: "single" | "multiple"; // 选择模式，单选或多选
  conId: number;
  isToAdd? : boolean ,//是否已转补充合同
  isToVisa?:boolean,//是否已转签证
  needVisa?:boolean,//是否需签证
  status?:number, //审批状态
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  selectionMode: "single",
  conId : null, //合同ID
  isToAdd: null ,//是否已转补充合同
  isToVisa:null,//是否已转签证
  needVisa:null,//是否需签证
  status: null, //审批状态
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  select: [row:any];
}>();

// 弹窗显示状态
const dialogVisible = ref(props.modelValue);
// 确认按钮loading
const confirmLoading = ref(false);
// 表格loading
const tableLoading = ref(false);
// 表格数据
const tableData = ref([]);
// 总条数
const total = ref(0);
// 当前页码
const currentPage = ref(1);
// 每页条数
const pageSize = ref(20);
// 选中行数据
const selectedRows = ref([]);
// 表格ref
const tableRef = ref();

// 查询参数
const queryParams = ref({
  changeName: "",
  changeType: null,
  conId : props.conId, //合同ID
  isToAdd : props.isToAdd ,//是否已转补充合同
  isToVisa:props.isToVisa,//是否已转签证
  needVisa:props.needVisa,//是否需签证
  status:props.status, //审批状态
});

// 表格列配置
const tableColumns = [
  { type: "selection", width: 50, fixed: "left" },
  { type: "index", label: "序号", width: 60, fixed: "left" },
  {
    label: "合同名称",
    prop: "conName",
    width: 250,
    showOverflowTooltip: true,
  },
  {
    label: "变更类型",
    slot: "changeType",
    width: 90,
  },
  {
    label: "变更名称",
    prop: "changeName",
    width: 250,
    showOverflowTooltip: true,
  },
  {
    label: "预估变更金额",
    prop: "estChangeAmt",
    width: 150,
    formatType:"#,##0.00",
    showOverflowTooltip: true,
  },
  {
    label: "创建人",
    prop: "createName",
    width: 180,
    showOverflowTooltip: true,
  },
  {
    label: "创建日期",
    prop: "createDate",
    width: 120,
    showOverflowTooltip: true,
  },
  {
    label: "变更内容",
    prop: "changeConent",
    width: 300,
    showOverflowTooltip: true,
  },
];

// 监听modelValue
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      // 打开弹窗时重置状态并加载数据
      resetState();
      queryParams.value.conId=props.conId;
      handleQuery();
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});

// 重置状态
const resetState = () => {
  selectedRows.value = [];
  currentPage.value = 1;
  pageSize.value = 20;
  queryParams.value = {
    changeName: "",
    changeType:null,
    conId : props.conId, //合同ID
    isToAdd : props.isToAdd ,//是否已转补充合同
    isToVisa:props.isToVisa,//是否已转签证
    needVisa:props.needVisa,//是否需签证
    status:props.status, //审批状态
  };
  // 清除表格高亮
  setTimeout(() => {
    if (tableRef.value) {
      tableRef.value.clearCurrentRow();
    }
  }, 0);
};

// 查询数据列表
const getDataList = async () => {
  try {
    tableLoading.value = true;
    const res = await changeOrderApi.getChangeConList({ ...queryParams.value });
    if (res.code === 200) {
      tableData.value = res.data || [];
      total.value = tableData.value.length;
    } else {
      ElMessage.error(res.message || "加载定标明细列表失败");
    }
  } catch (error) {
    console.error("加载定标明细列表失败:", error);
    ElMessage.error("加载定标明细列表失败");
  } finally {
    tableLoading.value = false;
  }
};

// 查询
const handleQuery = () => {
  currentPage.value = 1;
  getDataList();
};

// 重置
const handleReset = () => {
  queryParams.value = {
    changeName: "",
    changeType:null,
    conId : props.conId, //合同ID
    isToAdd : props.isToAdd ,//是否已转补充合同
    isToVisa:props.isToVisa,//是否已转签证
    needVisa:props.needVisa,//是否需签证
    status:props.status, //审批状态
  };
  handleQuery();
};

// 分页改变
const handlePaginationChange = (page: number, size: number) => {
  currentPage.value = page;
  pageSize.value = size;
  getDataList();
};

const handleSelectionChange = (row:any) => {
  selectedRows.value = row;
};

// 确认选择
const handleConfirm = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage.warning("请先选择一条定标明细数据");
    return;
  }
  confirmLoading.value = true;
  emit("select", selectedRows.value);
  handleClose();
  confirmLoading.value = false;
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  selectedRows.value = [];
};

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
.supplier-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 500px;

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
