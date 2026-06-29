<!-- 履约保证金 退还列表 -->
<template>
  <div class="bond-refund-wrapper">
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
    <!-- 新增/编辑 退还弹窗 -->
    <add-edit-refund-dialog
      v-model="dialogVisible"
      :conId="props.conId"
      :editData="editData"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { perfBondApi } from "@/api/cost/contract-manage/performance-bond-api";
import addEditRefundDialog from "./add-edit-refund-dialog.vue";
import { PerformanceBondReturnList } from "@/types/cost/contract-manage/performance-bond-type.ts";

defineOptions({ name: "bond-refund" });

const props = defineProps<{
  conId: number | null;
}>();

const dialogVisible = ref(false);
const editData = ref(null);
const tableLoading = ref(false);
const tableData = ref<PerformanceBondReturnList[]>([]);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "refundTypeId", label: "业务类型" },
  { prop: "refundAmt", label: "金额" },
  { prop: "refundDate", label: "发生日期" },
  { prop: "annexId", label: "相关单据" },
  {
    label: "操作",
    width: 150,
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
    const res = await perfBondApi.getLvRefuvList({ conId: props.conId });
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
const handleEdit = async (row) => {
  editData.value = row;
  dialogVisible.value = true;
};
// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("确定删除该数据吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        ElMessage.success("删除成功");
        getDataList();
      } catch (error) {
        console.error("删除失败:", error);
      }
    })
    .catch(() => {});
};

// 监听合同ID变化，自动刷新列表
// watch(
//   () => props.conId,
//   async (val) => {
//     if (val) {
//       getDataList();
//     } else {
//       tableData.value = [];
//     }
//   },
//   { immediate: true },
// );
onMounted(() => {
  getDataList();
});
</script>

<style lang="scss" scoped>
.bond-refund-wrapper {
  width: 100%;
  height: 100%;
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
