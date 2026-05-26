<!-- 供应商资质 -->
<template>
  <div class="relate-qualification-page">
    <el-form :inline="true">
      <el-form-item>
        <el-button type="primary" @click="handleAdd" v-if="!isView">
          新增资质
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
      <!-- 操作列 -->
      <template #actions="{ row }" v-if="!isView">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        <el-button link type="danger" @click="handleDelete(row)"
          >删除</el-button
        >
      </template>
    </base-table>

    <!-- 新增/编辑 资质弹窗 -->
    <add-edit-annex-dialog
      v-model="modalVisible"
      :edit-data="editAnnexData"
      :sup-id="props.supplierId"
      @success="handleModalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { SupplierAnnex } from "@/types/cost/supplier-ledger-type";
import AddEditAnnexDialog from "./add-edit-annex-dialog.vue";
import { supplierApi } from "@/api/cost/supplier-ledger-api";

defineOptions({ name: "relate-qualification" });

// Props
const props = defineProps<{
  supplierId: number; // 供应商ID
  mode?: "add" | "edit" | "view";
}>();

const isView = computed(() => props.mode === "view"); // 是否为查看模式

const tableLoading = ref(false);
const modalVisible = ref(false);
const editAnnexData = ref<SupplierAnnex | null>(null);

// 列表数据
const tableData = ref<SupplierAnnex[]>([]);
// 表格列配置
const tableColumns = ref([
  { type: "index", label: "序号", width: 60 },
  { label: "附件类型", prop: "annexType", minWidth: 150 },
  { label: "附件名称", prop: "annexName", minWidth: 200 },
  { label: "备注", prop: "remark", minWidth: 200 },
  { label: "操作", slot: "actions", width: 180, fixed: "right" },
]);

// 加载数据
const getAnnexList = async () => {
  if (!props.supplierId) return;
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await supplierApi.getAnnexList({
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
  getAnnexList();
};

// 新增
const handleAdd = () => {
  editAnnexData.value = null;
  modalVisible.value = true;
};

// 编辑
const handleEdit = (row: SupplierAnnex) => {
  editAnnexData.value = row;
  modalVisible.value = true;
};

// 弹窗提交成功回调
const handleModalSuccess = () => {
  handleRefresh();
};

// 删除
const handleDelete = (row: SupplierAnnex) => {
  ElMessageBox.confirm(`确定要删除资质"${row.annexName}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await supplierApi.delAnnex({ id: row.id });
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
      getAnnexList();
    } else {
      tableData.value = [];
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.relate-qualification-page {
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
