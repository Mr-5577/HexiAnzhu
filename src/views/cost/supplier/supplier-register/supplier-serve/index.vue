<!-- 供应商服务 -->
<template>
  <div class="supplier-service-page">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="服务类别" prop="supTypeId">
        <el-cascader
          v-model="queryParams.supTypeId"
          :options="segmentOptions"
          :show-all-levels="false"
          :props="{
            expandTrigger: 'hover',
            emitPath: false,
            checkStrictly: false,
            value: 'id',
            label: 'supTypeName',
            children: 'children',
          }"
          placeholder="请选择供应商类别"
          style="width: 200px"
          clearable
        />
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
          新增服务类别
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
import { supTypeApi } from "@/api/cost/master-data/supplier-category-api.ts";
import { buildTree } from "@/utils/tree.ts";

defineOptions({ name: "supplier-service" });

// Props
const props = defineProps<{
  supplierId: number; // 供应商ID
  mode?: "add" | "edit" | "view";
}>();

const isView = computed(() => props.mode === "view"); // 是否为查看模式

const modalVisible = ref(false);
const editServiceData = ref<SupplierSegment | null>(null);

// 服务类别选项
const segmentOptions = ref([]);

// 查询参数
const queryParams = ref({
  supTypeId: undefined as number | undefined,
});
const tableLoading = ref(false);
const tableData = ref<SupplierSegment[]>([]);
// 表格列配置
const tableColumns = ref([
  { type: "index", label: "序号", width: 60 },
  { label: "服务类别", prop: "supTypeName", minWidth: 150 },
  {
    label: "是否主类别",
    prop: "isPrimary",
    minWidth: 160,
    formatter: (row) => (row.isPrimary ? "是" : "否"),
  },
  { label: "备注", prop: "remark", minWidth: 200 },
  { label: "操作", slot: "actions", width: 200, fixed: "right" },
]);

// 加载数据
const getSupplierServeData = async () => {
  if (!props.supplierId) return;
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await supplierApi.getSegList({
      supId: props.supplierId,
      supTypeId: queryParams.value.supTypeId,
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
  queryParams.value.supTypeId = undefined;
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
  ElMessageBox.confirm(`确定要删除该服务类别吗？`, "提示", {
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
/**
 * 获取服务类别列表
 */
const getSegList = async () => {
  try {
    const res = await supTypeApi.getSupTypeList({});
    if (res.code === 200) {
      segmentOptions.value = buildTree(res.data || []);
    }
  } catch (error) {}
};

watch(
  () => props.supplierId,
  (newVal) => {
    if (newVal) {
      getSegList();
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
