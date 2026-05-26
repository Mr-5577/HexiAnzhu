<!-- 供应商项目业绩 -->
<template>
  <div class="project-performance-page">
    <el-form :inline="true">
      <el-form-item>
        <el-button type="primary" @click="handleAdd" v-if="!isView">
          新增业绩
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
      <!-- 合同金额格式化 -->
      <template #conAmount="{ row }">
        <span>{{ row.conAmount ? row.conAmount.toFixed(2) : "-" }}</span>
      </template>

      <!-- 日期格式化 -->
      <template #startDate="{ row }">
        <span>{{ row.startDate || "-" }}</span>
      </template>

      <template #endDate="{ row }">
        <span>{{ row.endDate || "-" }}</span>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }" v-if="!isView">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        <el-button link type="danger" @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </base-table>

    <!-- 新增/编辑 业绩弹窗 -->
    <add-edit-performance-dialog
      v-model="modalVisible"
      :edit-data="editPerfData"
      :sup-id="props.supplierId"
      @success="handleModalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { SupplierPerf } from "@/types/cost/supplier-ledger-type";
import AddEditPerformanceDialog from "./add-edit-performance-dialog.vue";
import { supplierApi } from "@/api/cost/supplier-ledger-api";

defineOptions({ name: "project-performance" });

// Props
const props = defineProps<{
  supplierId: number; // 供应商ID
  mode?: "add" | "edit" | "view";
}>();

const isView = computed(() => props.mode === "view"); // 是否为查看模式

const tableLoading = ref(false);
const modalVisible = ref(false);
const editPerfData = ref<SupplierPerf | null>(null);

// 列表数据
const tableData = ref<SupplierPerf[]>([]);
// 表格列配置
const tableColumns = ref([
  { type: "index", label: "序号", width: 60 },
  { label: "项目名称", prop: "projName", minWidth: 200 },
  { label: "合作单位", prop: "companyName", minWidth: 150 },
  { label: "合同金额(元)", slot: "conAmount", width: 150 },
  { label: "合同概述", prop: "conDesc", minWidth: 200 },
  { label: "开始日期", slot: "startDate", width: 120 },
  { label: "结束日期", slot: "endDate", width: 120 },
  { label: "操作", slot: "actions", width: 180, fixed: "right" },
]);

// 加载数据
const getPerfList = async () => {
  if (!props.supplierId) return;
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await supplierApi.getPerfList({
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
  getPerfList();
};

// 新增
const handleAdd = () => {
  editPerfData.value = null;
  modalVisible.value = true;
};

// 编辑
const handleEdit = (row: SupplierPerf) => {
  editPerfData.value = row;
  modalVisible.value = true;
};

// 弹窗提交成功回调
const handleModalSuccess = () => {
  handleRefresh();
};

// 删除
const handleDelete = (row: SupplierPerf) => {
  ElMessageBox.confirm(
    `确定要删除项目"${row.projName}"的业绩记录吗？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(async () => {
      try {
        const res = await supplierApi.delPerf({ id: row.id });
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
      getPerfList();
    } else {
      tableData.value = [];
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.project-performance-page {
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
