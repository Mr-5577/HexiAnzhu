<!-- 合同预结算 列表 -->
<template>
  <div class="contract-pre-settle-wrapper">
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
          <el-button type="primary" @click="handleAdd"> 新增 </el-button>
        </div>
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

    <!-- 新增/编辑 合同预结算弹窗 -->
    <add-edit-pre-settle-dialog
      v-model="dialogVisible"
      :conId="props.conId"
      :editData="editData"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import AddEditPreSettleDialog from "./add-edit-pre-settle-dialog.vue";
import { contractPreSettleApi } from "@/api/cost/contract-manage/contract-preSettlement-api.ts";
import { ContractPreSettle } from "@/types/cost/contract-manage/contract-preSettle-type.ts";

defineOptions({ name: "contract-pre-settle" });

const props = defineProps<{
  conId: number | null;
}>();

const dialogVisible = ref(false);
const editData = ref(null);
const tableLoading = ref(false);
const tableData = ref([]);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "signAmt", label: "合同签约金额" },
  { prop: "addAmt", label: "补充合同金额" },
  { prop: "sumChangeAmt", label: "累计变更签证" },
  { prop: "preSettleAmt", label: "预估合同金额" },
  { prop: "preSettleDesc", label: "结算说明", minWidth: 200 },
  { prop: "statusName", label: "状态" },
  {
    label: "操作",
    width: 150,
    slot: "actions",
    fixed: "right",
  },
];

// 状态映射
const statusMap: Record<number, string> = {
  0: "草稿",
  5: "审批中",
  10: "已审批",
  30: "已作废",
};

// 获取列表数据
const getDataList = async () => {
  if (!props.conId) {
    return;
  }
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await contractPreSettleApi.getPreSettleList({
      conId: props.conId,
    });
    if (res.code === 200) {
      tableData.value = (res.data || []).map((item: any) => ({
        ...item,
        statusName: statusMap[item.status] ?? item.status,
      }));
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
const handleAdd = () => {
  editData.value = null;
  dialogVisible.value = true;
};

// 编辑
const handleEdit = async (row: ContractPreSettle) => {
  editData.value = row;
  dialogVisible.value = true;
};

// 删除
const handleDelete = ({ id }: { id: number }) => {
  ElMessageBox.confirm("确定删除该数据吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        const res = await contractPreSettleApi.delPreSettle({ id });
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

onMounted(() => {
  getDataList();
});
</script>

<style lang="scss" scoped>
.contract-pre-settle-wrapper {
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
