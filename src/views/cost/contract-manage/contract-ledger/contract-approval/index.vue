<!-- 合同审批 列表 -->
<template>
  <div class="contract-approval-table">
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
          <el-button type="primary" icon="Refresh"> 刷新列表 </el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";

defineOptions({ name: "contract-approval" });

const props = defineProps<{
  conId: number | null;
}>();

const emit = defineEmits<{
  (e: "select-project"): void;
}>();

const tableLoading = ref(false);
const tableData = ref([]);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "segName", label: "审批单编号" },
  { prop: "segName", label: "审批流程" },
  { prop: "segName", label: "审批状态" },
  { prop: "segName", label: "申请人" },
  { prop: "segName", label: "申请时间" },
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
    // 请求接口获取数据
  } catch (error) {
    console.error("获取招标需求列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

const handleEdit = (row) => {};

const handleDetail = (row) => {};

const handleDelete = (row) => {
  ElMessageBox.confirm("确定删除该数据吗？", "提示", { type: "warning" })
    .then(async () => {
      ElMessage.success("删除成功");
      getDataList();
    })
    .catch(() => {});
};
watch(
  () => props.conId,
  (val) => {
    if (val) {
      console.log(val);
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.contract-approval-table {
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
