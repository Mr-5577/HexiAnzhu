<!-- 收款账号 列表 -->
<template>
  <div class="payment-account-wrapper">
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
      <!-- 是否启用列 -->
      <template #isEnabled="{ row }">
        <el-tag :type="row.isEnabled ? 'success' : 'danger'" size="small">
          {{ row.isEnabled ? "启用" : "禁用" }}
        </el-tag>
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
    <!-- 新增/编辑 收款账户弹窗 -->
    <add-edit-account-dialog
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
import { ContractBankAccount } from "@/types/cost/contract-manage/payment-account-type";
import { paymentAccountApi } from "@/api/cost/contract-manage/payment-account-api";
import AddEditAccountDialog from "./add-edit-account-dialog.vue";

defineOptions({ name: "payment-account" });

const props = defineProps<{
  conId: number | null;
}>();

const dialogVisible = ref(false);
const editData = ref(null);
const tableLoading = ref(false);
const tableData = ref<ContractBankAccount[]>([]);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "bankName", label: "开户银行" },
  { prop: "accountName", label: "银行户名" },
  { prop: "bankAccount", label: "银行账号" },
  { slot: "isEnabled", label: "是否启用" },
  { label: "操作", width: 200, slot: "actions", fixed: "right" },
];
// 获取列表数据
const getDataList = async () => {
  if (!props.conId) {
    return;
  }
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await paymentAccountApi.getSupBankList({ conId: props.conId });
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

// 新增
const handleAdd = () => {
  editData.value = null;
  dialogVisible.value = true;
};
// 编辑
const handleEdit = async (row: ContractBankAccount) => {
  editData.value = row;
  dialogVisible.value = true;
};
// 删除
const handleDelete = (row: ContractBankAccount) => {
  ElMessageBox.confirm(`确定删除“${row.bankName}”账户吗？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await paymentAccountApi.delSupBank({ id: row.id });
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
.payment-account-wrapper {
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
