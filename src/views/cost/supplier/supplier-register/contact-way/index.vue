<!-- 联系方式 -->
<template>
  <div class="contact-way-page">
    <el-form :inline="true">
      <el-form-item>
        <el-button type="primary" @click="handleAdd" v-if="!isView">
          新增联系方式
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
      <template #isEnable="{ row }">
        <el-tag :type="row.isEnable ? 'success' : 'warning'" v-if="isView">
          {{ row.isEnable ? "启用" : "禁用" }}
        </el-tag>
        <el-switch
          v-else
          v-model="row.isEnable"
          :active-value="true"
          :inactive-value="false"
          size="small"
          :loading="enabledLoading"
          @change="handleEnabledChange(row)"
        />
      </template>
      <!-- 操作列 -->
      <template #actions="{ row }" v-if="!isView">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        <el-button link type="danger" @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </base-table>

    <!-- 新增/编辑 联系方式弹窗 -->
    <add-edit-way-dialog
      v-model="modalVisible"
      :edit-data="editData"
      :sup-id="props.supplierId"
      @success="handleModalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import AddEditWayDialog from "./add-edit-way-dialog.vue";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api.ts";
import { SupplierContact } from "@/types/cost/supplier/supplier-ledger-type.ts";

defineOptions({ name: "contact-way" });

// Props
const props = defineProps<{
  supplierId: number; // 供应商ID
  mode?: "add" | "edit" | "view";
}>();

const isView = computed(() => props.mode === "view"); // 是否为查看模式

const tableLoading = ref(false);
const modalVisible = ref(false);
const editData = ref(null);
const enabledLoading = ref(false);

const tableData = ref();

const tableColumns = ref([
  { type: "index", label: "序号", width: 60 },
  { label: "联系人", prop: "contactPerson" },
  { label: "职务", prop: "jobTitle" },
  { label: "电话", prop: "contactPhone" },
  { label: "身份证", prop: "contactCardNo" },
  {
    label: "是否主要联系人",
    prop: "isMain",
    width: 130,
    formatter: (row: SupplierContact) => (row.isMain ? "是" : "否"),
  },
  { label: "是否启用", slot: "isEnable", width: 120 },
  { label: "备注", prop: "remark" },
  { label: "操作", slot: "actions", width: 180, fixed: "right" },
]);

// 启用/禁用
const handleEnabledChange = async (row: SupplierContact) => {
  try {
    enabledLoading.value = true;
    const res = await supplierApi.editContact({
      id: row.id,
      supId: row.supId,
      contactPerson: row.contactPerson,
      contactPhone: row.contactPhone,
      contactCardNo: row.contactCardNo,
      jobTitle: row.jobTitle,
      isMain: row.isMain,
      isEnable: row.isEnable,
      remark: row.remark,
    });
    if (res.code === 200) {
      ElMessage.success(`已${row.isEnable ? "启用" : "禁用"}成功`);
      await getDataList();
    } else {
      // 失败时回滚状态
      row.isEnable = !row.isEnable;
      ElMessage.error(res.message || "操作失败");
    }
  } catch (error) {
    // 出错时回滚状态
    row.isEnable = !row.isEnable;
    ElMessage.error("操作失败");
  } finally {
    enabledLoading.value = false;
  }
};

// 删除
const handleDelete = (row: SupplierContact) => {
  ElMessageBox.confirm(`确定要删除联系人"${row.contactPerson}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await supplierApi.delContact({ id: row.id });
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

// 新增
const handleAdd = () => {
  editData.value = null;
  modalVisible.value = true;
};
// 编辑
const handleEdit = (row: SupplierContact) => {
  editData.value = row;
  modalVisible.value = true;
};
// 刷新
const handleRefresh = () => {
  getDataList();
};
// 弹窗提交成功回调
const handleModalSuccess = () => {
  handleRefresh();
};

// 获取列表
const getDataList = async () => {
  if (!props.supplierId) return;
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await supplierApi.getContactList({
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
watch(
  () => props.supplierId,
  (newVal) => {
    if (newVal) {
      getDataList();
    } else {
      tableData.value = [];
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.contact-way-page {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  padding: 15px;
  box-sizing: border-box;

  // 表格区域自适应
  :deep(.base-table) {
    flex: 1;
    overflow: auto;
  }
}
</style>
