<!-- 供应商选择弹窗组件 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="选择材料合同到货记录"
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
        <el-form-item label="合同编号" prop="conNo">
          <el-input
            v-model="queryParams.conNo"
            placeholder="请输入合同编号"
            clearable
            style="width: 300px"
            :disabled = "!onlyNo"
          />
        </el-form-item>
        <el-form-item label="申请日期" prop="recvDate">
        <el-date-picker
          v-model="queryParams.recvDate"
          type="daterange"
          range-separator="至"
          value-format="YYYY-MM-DD"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 220px"
        />
      </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <base-table
        ref="tableRef"
        :row-key="'keyid'"
        :columns="tableColumns"
        :table-data="tableData"
        :loading="tableLoading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :height="'400px'"
        :pagination = "false"
        :highlight-current-row="true"
        :selectionMode="props.selectionMode"
        @selection-change="handleSelectionChange"
        @pagination-change="handlePaginationChange"
      >
      </base-table>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { dayjs, ElMessage } from "element-plus";
import { outputDeclarationApi } from "@/api/cost/contract-manage/output-declaration-api";

// Props
interface Props {
  modelValue: boolean;
  selectionMode?: "single" | "multiple"; // 选择模式，单选或多选
  conId?: number;
  conNo : string 
  cgType? : 1 | 2,
  isUesd?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  selectionMode: "single",
  conId : null,
  conNo: "" ,
  cgType :null,
  isUesd: null,
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
  conId:props.conId,
  conNo: props.conNo ,
  cllb : props.cgType ,
  isUesd: props.isUesd,
  recvDate :[],
});

const onlyNo = computed(
    () => !props.conNo,
  );

// 表格列配置
const tableColumns = [
  { type: "selection", width: 50, fixed: "left" },
  { type: "index", label: "序号", width: 60, fixed: "left" },
  {
    label: "接收单号",
    prop: "requestmark",
    width: 160,
    showOverflowTooltip: true,
  },
  {
    label: "到货日期",
    prop: "recvDate",
    width: 100,
    editType:"date",
    showOverflowTooltip: true,
    formatter: (row, column, cellValue) => {
        if (!cellValue) return '';
        // 使用 dayjs
        return dayjs(cellValue).format('YYYY-MM-DD');
        // 或使用 moment
        // return moment(cellValue).format('YYYY-MM-DD');
    }
  },
  {
    label: "合同编号",
    prop: "conNo",
    width: 120,
    showOverflowTooltip: true,
  },
  {
    label: "合同名称",
    prop: "conName",
    width: 250,
    showOverflowTooltip: true,
  },

  // 2. 供应商信息
  {
    label: "供应商名称",
    prop: "supName",
    width: 200,
    showOverflowTooltip: true,
  },

  // 3. 材料分类与名称
  {
    label: "材料类型",
    prop: "mtTypeName",
    width: 120,
    showOverflowTooltip: true,
  },
  {
    label: "材料名称",
    prop: "mtName",
    width: 120,
    showOverflowTooltip: true,
  },

  // 4. 规格型号（关键属性单独展示）
  {
    label: "规格",
    prop: "mtGg",
    width: 100,
    showOverflowTooltip: false,
  },
  {
    label: "品牌",
    prop: "mtPp",
    width: 90,
    showOverflowTooltip: false,
  },
  {
    label: "材质",
    prop: "mtCz",
    width: 90,
    showOverflowTooltip: false,
  },

  // 5. 数量与金额（财务核心数据，右对齐，格式化）
  {
    label: "单位",
    prop: "mtUnit",
    width: 80,
    align: "center",
    showOverflowTooltip: false,
  },
  {
    label: "收货数量",
    prop: "recvNum",
    width: 100,
    align: "right",
    thousandSeparator: true, // 启用千分位
    formatType: "#,##0.000", // 数量通常保留3位小数（钢材行业特性）
    showOverflowTooltip: false,
  },
  {
    label: "收货单价(元)",
    prop: "recvPrice",
    width: 120,
    align: "right",
    thousandSeparator: true,
    formatType: "#,##0.00", // 金额保留2位小数
    showOverflowTooltip: false,
  },
  {
    label: "收货金额(元)",
    prop: "recvVal",
    width: 120,
    align: "right",
    thousandSeparator: true,
    formatType: "#,##0.00",
    showOverflowTooltip: false,
  },

  // 6. 状态及其他字段
  {
    label: "材料类别",
    prop: "cllb",
    width: 100,
    align: "center",
    formatter: (row) => (row.cllb === 1 ? "主材" : "零星"), // 字典转换示例
    showOverflowTooltip: false,
  },
  {
    label: "是否使用",
    prop: "isUesd",
    width: 90,
    align: "center",
    formatter: (row) => (row.isUesd ? "是" : "否"), // 布尔值转文字
    showOverflowTooltip: false,
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
    conId:props.conId,
    cllb : props.cgType ,
    conNo: props.conNo ,
    isUesd: props.isUesd,
    recvDate:[],
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
    const { recvDate, ...rest } = queryParams.value;
    const params = {
      ...rest,
      recvDateStart: queryParams.value.recvDate?.[0],
      recvDateEnd: queryParams.value.recvDate?.[1],
    };
    const res = await outputDeclarationApi.getMaterialProdVal({ ...queryParams.value });
    if (res.code === 200) {
      tableData.value = res.data || [];
      total.value = tableData.value.length;
    } else {
      ElMessage.error(res.message || "加载明细列表失败");
    }
  } catch (error) {
    console.error("加载明细列表失败:", error);
    ElMessage.error("加载明细列表失败");
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
    conId:props.conId,
    cllb : props.cgType ,
    conNo: props.conNo ,
    isUesd: props.isUesd,
    recvDate :[],
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
    ElMessage.warning("请先选择一条明细数据");
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
