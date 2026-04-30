<!-- 联系方式 -->
<template>
  <div class="contact-way-page">
    <div class="header-actions">
      <el-button type="primary" @click="handleAdd"> 新增联系方式 </el-button>
    </div>
    <base-table
      ref="tableRef"
      :columns="tableColumns"
      :tableData="listData"
      rowKey="id"
      :border="true"
      :loading="loading"
      :pagination="false"
    >
      <!-- 操作列 -->
      <template #actions="{ row }">
        <el-button
          v-if="row.isEnable === '是'"
          link
          type="warning"
          @click="handleDisable(row)"
        >
          禁用
        </el-button>
        <el-button v-else link type="success" @click="handleEnable(row)">
          启用
        </el-button>
        <el-button link type="danger" @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </base-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

defineOptions({ name: "contact-way" });

const loading = ref(false);
let nextId = 4; // 用于生成新ID

const listData = ref([
  {
    id: 1,
    accountName: "张三",
    bankName: "项目经理",
    bankAccount: "138****1234",
    IDCard: "110101199003071234",
    isDefault: "是",
    isEnable: "是",
    remark: "主要联系人",
  },
  {
    id: 2,
    accountName: "李四",
    bankName: "技术负责人",
    bankAccount: "139****5678",
    IDCard: "110101199003071234",
    isDefault: "否",
    isEnable: "否",
    remark: "",
  },
]);

const tableColumns = ref([
  { type: "index", label: "序号", width: 60 },
  { label: "联系人", prop: "accountName" },
  { label: "职务", prop: "bankName" },
  { label: "电话", prop: "bankAccount" },
  { label: "身份证", prop: "IDCard" },
  { label: "是否主要联系人", prop: "isDefault", width: 130 },
  { label: "是否启用", prop: "isEnable", width: 120 },
  { label: "备注", prop: "remark" },
  { label: "操作", slot: "actions", width: 180, fixed: "right" },
]);

// 启用
const handleEnable = (row: any) => {
  ElMessageBox.confirm(`确定要启用联系人"${row.accountName}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      row.isEnable = "是";
      ElMessage.success("启用成功");
    })
    .catch(() => {});
};

// 禁用
const handleDisable = (row: any) => {
  if (row.isDefault === "是") {
    ElMessage.warning("默认联系人不能禁用");
    return;
  }
  ElMessageBox.confirm(`确定要禁用联系人"${row.accountName}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      row.isEnable = "否";
      ElMessage.success("禁用成功");
    })
    .catch(() => {});
};

// 删除
const handleDelete = (row: any) => {
  if (row.isDefault === "是") {
    ElMessage.warning("默认联系人不能删除");
    return;
  }
  ElMessageBox.confirm(`确定要删除联系人"${row.accountName}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const index = listData.value.findIndex((item) => item.id === row.id);
      if (index !== -1) {
        listData.value.splice(index, 1);
        ElMessage.success("删除成功");
      }
    })
    .catch(() => {});
};

// 新增
const handleAdd = () => {
  const newAccount = {
    id: nextId++,
    accountName: `新联系人${nextId - 1}`,
    bankName: "",
    bankAccount: "",
    IDCard: "",
    isDefault: "否",
    isEnable: "是",
    remark: "",
  };
  listData.value.push(newAccount);
  ElMessage.success("新增成功，请完善账户信息");
};
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
  padding: 20px;

  .header-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
    flex-shrink: 0;
  }

  // 表格区域自适应
  :deep(.base-table) {
    flex: 1;
    overflow: auto;
  }
}
</style>
