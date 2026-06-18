<!-- 工程核价 列表 -->
<template>
  <div class="engineering-price-wrapper">
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
          <el-button type="primary" @click="handleAdd"> 发起流程 </el-button>
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

    <!-- 新增/编辑 工程核价弹窗 -->
    <add-edit-price-dialog
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
import { ContractAuditPrice } from "@/types/cost/contract-manage/engineering-price-type.ts";
import { engineeringPriceApi } from "@/api/cost/contract-manage/engineering-price-api.ts";
import AddEditPriceDialog from "./add-edit-price-dialog.vue";

defineOptions({ name: "engineering-price" });

const props = defineProps<{
  conId: number | null;
}>();

const dialogVisible = ref(false);
const editData = ref<ContractAuditPrice | null>(null);
const tableLoading = ref(false);
const tableData = ref<ContractAuditPrice[]>([]);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "status", label: "状态", width: 100 },
  { prop: "signAmt", label: "合同签约金额", width: 120 },
  { prop: "applyDesc", label: "申报事项说明", width: 120 },
  { prop: "applyAmt", label: "申报金额", width: 120 },
  { prop: "costingReviewAmt", label: "成本审核金额", width: 120 },
  { prop: "costingCutAmt", label: "成本审减金额", width: 120 },
  { prop: "costingOpinion", label: "成本审核意见", width: 200 },
  { prop: "auditReviewAmt", label: "审计审核金额", width: 120 },
  { prop: "auditCutAmt", label: "审计审减金额", width: 120 },
  { prop: "auditOpinion", label: "审计审核意见", width: 200 },
  {
    label: "操作",
    width: 200,
    slot: "actions",
    fixed: "right",
  },
];
// 获取列表数据
const getDataList = async () => {
  if (!props.conId) {
    return;
  }
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await engineeringPriceApi.getAuditPriceList({
      conId: props.conId,
    });
    if (res.code === 200) {
      tableData.value = res.data;
    }
  } catch (error) {
    console.error("获取工程核价列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

const handleDelete = (row) => {
  ElMessageBox.confirm("确定删除该数据吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        const res = await engineeringPriceApi.delAuditPrice({ id: row.id });
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
// 刷新按钮
const handleRefresh = () => {
  getDataList();
};

// 新增
const handleAdd = () => {
  editData.value = null;
  dialogVisible.value = true;
};

// 编辑
const handleEdit = async (row: ContractAuditPrice) => {
  editData.value = row;
  dialogVisible.value = true;
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
.engineering-price-wrapper {
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
