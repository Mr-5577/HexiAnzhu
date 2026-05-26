<!-- 版本列表 -->
<template>
  <div class="version-list-page">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="版本类型" prop="versionType">
        <el-input
          v-model="queryParams.versionType"
          placeholder="请输入版本类型"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">
          搜索
        </el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <base-table
      :columns="columns"
      :tableData="tableData"
      :loading="loading"
      :total="total"
      :rowKey="'id'"
      :current-page="currentPage"
      :page-size="pageSize"
      :pagination="false"
      @pagination-change="handlePaginationChange"
    >
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </base-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";

defineOptions({ name: "version-list" });

// 查询参数
const queryParams = ref({
  versionType: "",
});

// 表格相关
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref([]);

// 弹窗相关
const dialogVisible = ref(false);
const currentEditData = ref(null);

// 表格列配置
const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: "60" },
  { prop: "conTypeName", label: "项目名称" },
  { prop: "conTypeCode", label: "版本类型" },
  { prop: "remark", label: "版本号" },
  { prop: "remark", label: "目标成本总额" },
  { prop: "remark", label: "审批流程" },
  { prop: "remark", label: "审批状态" },
  { prop: "remark", label: "当前使用" },
  { prop: "remark", label: "说明" },
  { prop: "remark", label: "填制人" },
  { prop: "remark", label: "填制日期" },
  { label: "操作", width: 200, slot: "actions", fixed: "right" },
];

// 获取数据列表
const getDataList = async () => {
  try {
    loading.value = true;
    tableData.value = [];
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  getDataList();
};

// 重置
const handleReset = () => {
  queryParams.value = { versionType: "" };
  handleSearch();
};

// 编辑
const handleEdit = (row: any) => {
  currentEditData.value = row;
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (row: any) => {
  ElMessageBox.confirm(`确定删除版本"${row.conTypeName}"吗？`, "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    // 这里调用删除接口
    ElMessage.success("删除成功");
    getDataList();
  });
};

// 分页变化
const handlePaginationChange = (params: {
  currentPage: number;
  pageSize: number;
}) => {
  currentPage.value = params.currentPage;
  pageSize.value = params.pageSize;
  getDataList();
};

onMounted(() => {
  getDataList();
});
</script>

<style lang="scss" scoped>
.version-list-page {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
