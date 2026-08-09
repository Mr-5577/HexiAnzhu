<!-- 成本分摊-主表 -->
<template>
  <div class="allocation-main-wrapper">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="业务类型" prop="bizType">
        <el-select
          v-model="queryParams.bizType"
          placeholder="请选择业务类型"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="item in bizTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd"> 新增 </el-button>
      </el-form-item>
    </el-form>
    <base-table
      :columns="tableColumns"
      :tableData="tableData"
      :loading="tableLoading"
      :rowKey="'id'"
      :pagination="false"
    >
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          删除
        </el-button>
        <el-button type="primary" link @click="handleDetail(row)">
          明细
        </el-button>
      </template>
    </base-table>
    <!-- 新增/编辑 合同分摊主表弹窗 -->
    <AddEditApportionMDialog
      v-model="apportionDialog"
      :projId="props.projId"
      :editData="editData"
      :bizTypeOptions="bizTypeOptions"
      :allocStatusOptions="allocStatusOptions"
      :allocWarnOptions="allocWarnOptions"
      @success="handleSearch"
    />
    <!-- 分摊明细 -->
    <allocation-detail-dialog
      v-model="visibleDialog"
      :projId="props.projId"
      :conId="props.conId"
      :allocWarnOptions="allocWarnOptions"
      :allocStatusOptions="allocStatusOptions"
      :currentRowData="editData"
      @success="handleSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { costAllocationApi } from "@/api/cost/contract-manage/cost-allocation-api";
import { TableColumnItem } from "@/components/base/base-table.vue";
import AddEditApportionMDialog from "./add-edit-apportionM-dialog.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import AllocationDetailDialog from "./allocation-detail-dialog.vue";
import { CostAllocationMain } from "@/types/cost/contract-manage/cost-allocation-type.ts";

defineOptions({ name: "allocation-main" });

const props = defineProps<{
  conId: number | null;
  projId: number | null;
}>();

const emit = defineEmits<{
  viewDetail: [id: number];
}>();

// 业务类型选项
const bizTypeOptions = ref([
  { label: "合同", value: "CON_MAIN" },
  { label: "补充合同", value: "CON_ADD" },
  { label: "订单合同", value: "CON_ORD" },
  { label: "采购订单", value: "CON_BILL" },
  { label: "合同变更", value: "CON_BG" },
  { label: "合同签证", value: "CON_QZ" },
  { label: "合同产值", value: "CON_PROD" },
  { label: "合同预结算", value: "CON_PRE_SETTLE" },
  { label: "合同结算", value: "CON_SETTLE" },
  { label: "非合同", value: "NCON" },
]);
// 分摊状态选项
const allocStatusOptions = ref([
  { label: "未分摊", value: 0, type: "info" },
  { label: "已分摊", value: 1, type: "success" },
  { label: "部分分摊", value: 2, type: "warning" },
]);
// 分摊预警选项
const allocWarnOptions = ref([
  { label: "红色预警", value: 0, type: "danger" },
  { label: "黄色预警", value: 1, type: "warning" }, // 超95%
  { label: "绿色预警", value: 2, type: "success" },
]);

const queryParams = ref({
  bizType: undefined,
});
const visibleDialog = ref(false);
const apportionDialog = ref(false);
const editData = ref(null);
const tableLoading = ref(false);
const tableData = ref([]);
const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "项目名称", width: 150 },
  { prop: "bizTypeName", label: "业务类型名称", width: 150 },
  // { prop: "bizBillId", label: "业务单据", width: 150 },
  { prop: "allocAmt", label: "分摊总额(含税)", width: 150 },
  { prop: "allocExclAmt", label: "分摊总额(不含税)", width: 150 },
  { prop: "allocStatusName", label: "分摊状态", width: 150 },
  { prop: "allocWarnName", label: "分摊预警", width: 150 },
  { prop: "remark", label: "分摊说明", minWidth: 200 },
  {
    label: "操作",
    width: 150,
    slot: "actions",
    fixed: "right",
  },
];

// 获取业务类型名称
const getBizTypeLabel = (bizType: string) => {
  const option = bizTypeOptions.value.find((item) => item.value === bizType);
  return option ? option.label : "";
};

// 获取分摊状态名称
const getAllocStatusLabel = (allocStatus: number) => {
  const option = allocStatusOptions.value.find(
    (item) => item.value === allocStatus,
  );
  return option ? option.label : "";
};

// 获取分摊预警名称
const getAllocWarnLabel = (allocWarn: number) => {
  const option = allocWarnOptions.value.find(
    (item) => item.value === allocWarn,
  );
  return option ? option.label : "";
};

// 处理数据，添加名称字段
const processTableData = (data: any[]) => {
  return data.map((item) => ({
    ...item,
    bizTypeName: getBizTypeLabel(item.bizType), // 业务类型名称
    allocStatusName: getAllocStatusLabel(item.allocStatus), // 分摊状态名称
    allocWarnName: getAllocWarnLabel(item.allocWarn), // 分摊预警名称
  }));
};
// 获取列表数据
const getDataList = async () => {
  if (!props.projId) return;
  try {
    tableLoading.value = true;
    tableData.value = [];
    const params = {
      ...queryParams.value,
      projId: props.projId,
    };
    // const res = await costAllocationApi.getProjectAllocMList(params);
    // if (res.code === 200) {
    //   // 处理数据，添加名称字段
    //   tableData.value = processTableData(res.data || []);
    // }
  } catch (error) {
  } finally {
    tableLoading.value = false;
  }
};

const handleReset = () => {
  queryParams.value = {
    bizType: undefined,
  };
  getDataList();
};

const handleSearch = () => {
  getDataList();
};

const handleAdd = () => {
  editData.value = null;
  apportionDialog.value = true;
};

const handleEdit = (row: CostAllocationMain) => {
  editData.value = row;
  apportionDialog.value = true;
};

const handleDelete = async (row: CostAllocationMain) => {
  ElMessageBox.confirm("确定删除该数据吗？", "提示", { type: "warning" })
    .then(async () => {
      // try {
      //   const res = await costAllocationApi.delProjectAllocM({ id: row.id });
      //   if (res.code === 200) {
      //     ElMessage.success("删除成功");
      //     getDataList();
      //   }
      // } catch (error) {
      //   console.error("删除失败:", error);
      // }
    })
    .catch(() => {});
};

const handleDetail = (row: CostAllocationMain) => {
  //   emit("viewDetail", row.id);
  editData.value = row;
  visibleDialog.value = true;
};

onMounted(() => {
  getDataList();
});
</script>

<style lang="scss" scoped>
.allocation-main-wrapper {
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
