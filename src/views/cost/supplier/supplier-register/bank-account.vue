<!-- 银行账户 -->
<template>
  <div class="bank-account-page">
    <el-form :inline="true">
      <el-form-item>
        <el-button type="primary" @click="handleAdd" v-if="!isView">
          新增银行账户
        </el-button>
        <el-button icon="Refresh" @click="handleRefresh">刷新列表</el-button>
      </el-form-item>
    </el-form>

    <base-table
      ref="tableRef"
      :columns="tableColumns"
      :tableData="tableData"
      rowKey="id"
      :border="true"
      :loading="tableLoading"
      :pagination="false"
    >
      <!-- 是否默认 -->
      <template #isDefault="{ row }">
        <el-tag :type="row.isDefault ? 'success' : 'info'" size="small">
          {{ row.isDefault ? "是" : "否" }}
        </el-tag>
      </template>

      <!-- 是否启用 -->
      <template #isEnabled="{ row }">
        <el-tag :type="row.isEnabled ? 'success' : 'danger'" size="small">
          {{ row.isEnabled ? "启用" : "禁用" }}
        </el-tag>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }" v-if="!isView">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        <el-button link type="danger" @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </base-table>

    <!-- 新增/编辑 银行账户弹窗 -->
    <add-edit-bank-dialog
      v-model="modalVisible"
      :edit-data="editBankData"
      :sup-id="props.supplierId"
      @success="handleModalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { SupplierBank } from "@/types/cost/supplier/supplier-ledger-type.ts";
import AddEditBankDialog from "./add-edit-bank-dialog.vue";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api.ts";

defineOptions({ name: "bank-account" });

// Props
const props = defineProps<{
  supplierId: number; // 供应商ID
  mode?: "add" | "edit" | "view"; // 模式
}>();

const isView = computed(() => props.mode === "view"); // 是否为查看模式

const tableLoading = ref(false);
const modalVisible = ref(false);
const editBankData = ref<SupplierBank | null>(null);

// 列表数据
const tableData = ref<SupplierBank[]>([]);
// 表格列配置
const tableColumns = ref([
  { type: "index", label: "序号", width: 60 },
  { label: "银行户名", prop: "accountName", minWidth: 120 },
  { label: "开户银行", prop: "bankName", minWidth: 150 },
  { label: "银行账号", prop: "bankAccount", minWidth: 150 },
  { label: "是否默认", slot: "isDefault", width: 120 },
  { label: "是否启用", slot: "isEnabled", width: 120 },
  { label: "备注", prop: "remark", minWidth: 150 },
  { label: "操作", slot: "actions", width: 180, fixed: "right" },
]);

// 加载数据
const getBankAccountList = async () => {
  if (!props.supplierId) return;
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await supplierApi.getBankList({
      supId: props.supplierId,
    });
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("加载数据失败", error);
  } finally {
    tableLoading.value = false;
  }
};
// 刷新
const handleRefresh = () => {
  getBankAccountList();
};

// 新增
const handleAdd = () => {
  editBankData.value = null;
  modalVisible.value = true;
};

// 编辑
const handleEdit = (row: SupplierBank) => {
  editBankData.value = row;
  modalVisible.value = true;
};

// 弹窗提交成功回调
const handleModalSuccess = () => {
  handleRefresh();
};

// 删除
const handleDelete = (row: SupplierBank) => {
  ElMessageBox.confirm(`确定要删除账户"${row.accountName}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await supplierApi.delBank({ id: row.id });
        if (res.code === 200) {
          ElMessage.success("删除成功");
          handleRefresh();
        }
      } catch (error) {
        console.error("删除失败", error);
      }
    })
    .catch(() => {});
};

watch(
  () => props.supplierId,
  (newVal) => {
    if (newVal) {
      getBankAccountList();
    } else {
      tableData.value = [];
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.bank-account-page {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  padding: 15px;
  box-sizing: border-box;

  :deep(.base-table) {
    flex: 1;
    overflow: auto;
  }
}
</style>
