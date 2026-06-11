<!-- 供应商服务 -->
<template>
  <div class="supplier-service-page">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="服务板块" prop="segId">
        <el-select
          v-model="queryParams.segId"
          placeholder="请选择服务板块"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="item in segmentOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">
          搜索
        </el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button
          type="primary"
          @click="handleAdd"
          :disabled="!props.supplierId"
          v-if="!isView"
        >
          新增服务板块
        </el-button>
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
      <template #segId="{ row }">
        {{ getSegName(row.segId) }}
      </template>
      <!-- 操作列 -->
      <template #actions="{ row }" v-if="!isView">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        <el-button link type="danger" @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </base-table>

    <!-- 供应商服务弹窗 -->
    <add-edit-service-dialog
      v-model="modalVisible"
      :edit-data="editServiceData"
      :sup-id="props.supplierId"
      :segment-options="segmentOptions"
      @success="handleModalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { SupplierSegment } from "@/types/cost/supplier/supplier-ledger-type.ts";
import AddEditServiceDialog from "./add-edit-service-dialog.vue";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api.ts";

defineOptions({ name: "supplier-service" });

// Props
const props = defineProps<{
  supplierId: number; // 供应商ID
  mode?: "add" | "edit" | "view";
}>();

const isView = computed(() => props.mode === "view"); // 是否为查看模式

const modalVisible = ref(false);
const editServiceData = ref<SupplierSegment | null>(null);

// 服务板块选项（当前写死枚举值）
const segmentOptions = ref([
  { value: 2, label: "地产" },
  { value: 3, label: "商业" },
  { value: 4, label: "物业" },
  { value: 6, label: "咨询" },
  { value: 7, label: "建筑" },
]);

// 查询参数
const queryParams = ref({
  segId: undefined as number | undefined,
});
const tableLoading = ref(false);
const tableData = ref<SupplierSegment[]>([]);
// 表格列配置
const tableColumns = ref([
  { type: "index", label: "序号", width: 60 },
  { label: "服务板块", slot: "segId", minWidth: 150 },
  { label: "备注", prop: "remark", minWidth: 200 },
  { label: "创建时间", prop: "createDate", minWidth: 160 },
  { label: "操作", slot: "actions", width: 150, fixed: "right" },
]);

// 加载数据
const getSupplierServeData = async () => {
  if (!props.supplierId) return;
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await supplierApi.getSegList({
      supId: props.supplierId,
      segId: queryParams.value.segId,
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

// 搜索
const handleSearch = () => {
  getSupplierServeData();
};

// 重置
const handleReset = () => {
  queryParams.value.segId = undefined;
  getSupplierServeData();
};

// 新增
const handleAdd = () => {
  editServiceData.value = null;
  modalVisible.value = true;
};

// 编辑
const handleEdit = (row: SupplierSegment) => {
  editServiceData.value = row;
  modalVisible.value = true;
};

// 弹窗提交成功回调
const handleModalSuccess = async () => {
  handleReset();
};

// 删除
const handleDelete = (row: SupplierSegment) => {
  ElMessageBox.confirm(`确定要删除该服务板块吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await supplierApi.delSeg({ id: row.id });
        if (res.code === 200) {
          ElMessage.success("删除成功");
          getSupplierServeData();
        }
      } catch (error) {
        console.error("删除失败", error);
      }
    })
    .catch(() => {});
};

const getSegName = (segId: number) => {
  const seg = segmentOptions.value.find((s) => s.value == segId);
  return seg ? seg.label : "未知";
};

watch(
  () => props.supplierId,
  (newVal) => {
    if (newVal) {
      getSupplierServeData();
    } else {
      tableData.value = [];
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.supplier-service-page {
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
