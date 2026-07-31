<!-- 合同台账列表 -->
<template>
  <div class="payment-apply-table">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="业务板块" prop="segId">
        <el-select
          v-model="queryParams.segId"
          placeholder="请选择业务板块"
          clearable
          style="width: 180px"
        >
          <el-option
            v-for="item in segOptions"
            :key="item.id"
            :label="item.segName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="合同名称" prop="conName">
        <el-input
          v-model="queryParams.conName"
          placeholder="请输入合同名称"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item label="合同编号" prop="conSysNo">
        <el-input
          v-model="queryParams.conSysNo"
          placeholder="请输入合同编号"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>

    <base-table
      :columns="columns"
      :tableData="tableData"
      :loading="tableLoading"
      :rowKey="'id'"
      :pagination="false"
    >
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          删除
        </el-button>
        <el-button type="primary" link @click="handleDetail(row)">
          详情
        </el-button>
      </template>
    </base-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { useRouter } from "vue-router";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";

defineOptions({ name: "payment-apply-table" });

const props = defineProps<{
  projectId: number | null;
}>();

const router = useRouter();

const tableLoading = ref(false);
const tableData = ref([{ id: 1 }]);
const segOptions = ref([]);

const queryParams = ref({
  segId: "",
  conName: "",
  conSysNo: "",
  projectId: props.projectId,
});

const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "segName", label: "业务板块", width: 150 },
  { prop: "projName", label: "项目名称", width: 200 },
  { prop: "conName", label: "合同名称", width: 200 },
  { prop: "conSysNo", label: "合同编号", width: 150 },
  { prop: "supName", label: "供应商名称", width: 150 },
  { prop: "payNo", label: "付款单号", width: 150 },
  { prop: "payDesc", label: "付款申请说明", width: 200 },
  { prop: "payType", label: "款项类型", width: 150 },
  { prop: "applyAmount", label: "请款金额", width: 120 },
  { prop: "actualAmount", label: "实付金额", width: 120 },
  { prop: "approveStatus", label: "审批状态", width: 120 },
  { prop: "applicant", label: "申请人", width: 120 },
  { prop: "applyDate", label: "申请日期", width: 120 },
  {
    label: "操作",
    prop: "actions",
    width: 180,
    slot: "actions",
    fixed: "right",
  },
];

// 获取列表数据
const getDataList = async () => {
  if (!props.projectId) return;
  try {
    tableLoading.value = true;
  } catch (error) {
    console.error("获取列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

// 获取业务板块
const getSegOptions = async () => {
  try {
    const res = await dictionaryApi.getsegmentList();
    if (res.code === 200) {
      segOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取业务板块失败:", error);
  }
};

// 搜索
const handleSearch = () => {
  getDataList();
};

// 重置
const handleReset = () => {
  queryParams.value = {
    segId: "",
    conName: "",
    conSysNo: "",
    projectId: props.projectId,
  };
  getDataList();
};

// 新增
const handleAdd = () => {
  router.push({
    path: "/payment/payment-apply/add",
    query: { t: Date.now() },
  });
};

// 编辑
const handleEdit = (row: any) => {
  router.push({
    path: "/payment/payment-apply/edit",
    query: { conId: row.id },
  });
};

// 详情
const handleDetail = (row: any) => {
  router.push({
    path: "/payment/payment-apply/detail",
    query: {
      conId: row.id,
      projId: props.projectId,
      tab: "basic",
    },
  });
};

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认对这条数据进行删除操作吗？`, "删除", {
    confirmButtonText: "确认删除",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        ElMessage.success("删除成功！");
        getDataList(); // 刷新列表
      } catch (error) {
        ElMessage.error("操作失败，请重试");
      }
    })
    .catch(() => {});
};

// 监听项目ID变化
watch(
  () => props.projectId,
  (val) => {
    if (val) {
      queryParams.value.projectId = val;
      getSegOptions();
      getDataList();
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.payment-apply-table {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  :deep(.el-form) {
    flex-shrink: 0;
    padding-bottom: 16px;
  }
}
</style>
