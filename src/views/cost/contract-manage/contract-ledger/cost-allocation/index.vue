<!-- 成本分摊 -->
<template>
  <div class="allocation-main-wrapper">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="业务类型" prop="bizType">
        <el-select v-model="queryParams.bizType" placeholder="请选择业务类型" clearable style="width: 200px">
          <el-option label="合同" value="CON_MAIN" />
          <el-option label="非合同请款" value="NCON_CST" />
          <el-option label="非合同立项" value="NCON_PROC" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd"> 新增 </el-button>
      </el-form-item>
    </el-form>
    <base-table :columns="tableColumns" :tableData="tableData" :loading="tableLoading" :rowKey="'id'"
      :pagination="false">
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

defineOptions({ name: "cost-allocation" });

const props = defineProps<{
  conId: number | null;
  projId: number | null;
}>();

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
};

const handleEdit = (row: CostAllocationMain) => {
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
    .catch(() => { });
};

const handleDetail = (row: CostAllocationMain) => {
};

onMounted(() => {
});
</script>

<style lang="scss" scoped>
.allocation-main-wrapper {
  width: 100%;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  overflow: hidden;
}
</style>
