<!-- 款项调整/合同奖罚 列表 -->
<template>
  <div class="payment-adjust-wrapper">
    <base-table
      :columns="tableColumns"
      :tableData="tableData"
      :loading="tableLoading"
      :rowKey="'id'"
      :pagination="false"
    >
      <!-- 列表外操作栏 -->
      <template #actionBar>
        <div class="actionBar-buttons">
          <el-button type="primary" icon="Refresh" @click="handleRefresh">
            刷新列表
          </el-button>
          <el-button type="primary" @click="handleInitiate">
            发起流程
          </el-button>
        </div>
      </template>

      <template #dedTypeId="{ row }">
        {{ getDedTypeName(row.dedTypeId) }}
      </template>

      <template #status="{ row }">
        {{ getStatusName(row.status) }}
      </template>

      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </base-table>

    <!-- 新增/编辑 款项调整/合同奖惩弹窗 -->
    <add-edit-ded-dialog
      v-model="dialogVisible"
      :conId="props.conId"
      :editData="editData"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import AddEditDedDialog from "./add-edit-ded-dialog.vue";
import { paymentAdjustApi } from "@/api/cost/contract-manage/payment-adjust-api.ts";
import { dedTypeEnum } from "@/constants/contract-manage/enums";
import { ContractDed } from "@/types/cost/contract-manage/payment-adjust-type.ts";

defineOptions({ name: "payment-adjust" });

const props = defineProps<{
  conId: number | null;
}>();

const dialogVisible = ref(false);
const editData = ref(null);
const tableLoading = ref(false);
const tableData = ref<any[]>([]);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { slot: "dedTypeId", label: "调整类型" },
  { prop: "dedAmt", label: "调整金额" },
  { prop: "dedDesc", label: "说明" },
  { slot: "status", label: "状态" },
  {
    label: "操作",
    width: 150,
    slot: "actions",
    fixed: "right",
  },
];
const getDedTypeName = (dedTypeId: number) => {
  const dedType = dedTypeEnum.find((item) => item.value == dedTypeId);
  return dedType?.label || "";
};
/** 状态：0-草稿，5-审批中，10-已审批，30-已作废 */
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
// 获取列表数据
const getDataList = async () => {
  if (!props.conId) {
    return;
  }
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await paymentAdjustApi.getDedList({ conId: props.conId });
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("获取列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

// 刷新
const handleRefresh = () => {
  getDataList();
};

// 发起流程
const handleInitiate = () => {
  editData.value = null;
  dialogVisible.value = true;
};
// 编辑
const handleEdit = async (row: ContractDed) => {
  editData.value = row;
  dialogVisible.value = true;
};
// 删除
const handleDelete = (row: ContractDed) => {
  ElMessageBox.confirm("确定删除该数据吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        const res = await paymentAdjustApi.delDed({ id: row.id });
        if (res.code === 200) {
          ElMessage.success("删除成功");
          getDataList();
        }
      } catch (error) {
        console.error("删除失败:", error);
      }
    })
    .catch(() => {});
};

// 监听合同ID变化，自动刷新列表
watch(
  () => props.conId,
  async (val) => {
    if (val) {
      getDataList();
    } else {
      tableData.value = [];
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.payment-adjust-wrapper {
  width: 100%;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .actionBar-buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
